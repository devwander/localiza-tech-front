# Documento de Arquitetura - LocalizaTech Front-End

> Versão: 1.0  
> Data: 2025-10-08  
> Stack Principal: React 19 + TypeScript + Vite + Zustand + TanStack Query + Axios + TailwindCSS

---

## 1. Visão Geral

Aplicação frontend SPA responsável por autenticação de usuários e edição/visualização de mapas de uma feira/evento. Inclui um módulo de mapeamento interativo ("Fair Mapper") baseado em `<canvas>` para criação e manipulação de camadas (background, submapas/setores e locais), com possibilidade de exportar/importar estrutura em JSON e sobrepor uma planta de referência (imagem) como guia.

## 2. Objetivos e Escopo

- Construir interface rápida e responsiva para criar e gerir mapas estruturados.
- Permitir CRUD de mapas e elementos internos via API REST.
- Facilitar visualização pública de mapas sem autenticação (rota pública planejada / parcial).
- Fornecer UX intuitiva para desenho e edição (ferramentas: select, move, resize, paint, draw).
- Persistir sessão de autenticação de forma segura em `sessionStorage` (token Bearer + header Authorization).
- Suportar evolução modular (novos tipos de camadas, snapping, grid, permissões avançadas).

Escopo fora (por ora): colaboração em tempo real, versionamento histórico granular de mapas, controle de acesso por papel, auditoria detalhada.

## 3. Requisitos

### 3.1 Funcionais

1. Autenticar usuário (signup/signin) e manter sessão.
2. Listar, criar, editar e excluir mapas (MapService).
3. Adicionar, editar, remover elementos do mapa (elementos locais, submapas, background lógico).
4. Pesquisar elementos por nome/atributos (searchElements).
5. Exportar/importar mapas em JSON para backup/manual.
6. Carregar e ajustar imagem de referência (opacidade, posição, tamanho, remoção).
7. Alterar cor de elementos (modo paint) cíclica conforme paleta utilitária.
8. Alternar modo debug para visualização de metadados e hit tests.

### 3.2 Não-Funcionais

- Performance: renderização incremental no canvas; evitar re-render React custoso.
- Responsividade: layout flex e Tailwind para escalabilidade.
- Observabilidade: logs de debug (console) para inspeção; futura evolução para sistema de telemetria.
- Segurança: uso de Bearer Token + `withCredentials` para cookies (se backend setar refresh), cabeçalhos anti-cache para requests.
- Manutenibilidade: separação em camadas (hooks, services, models, utils, store) e tipagem forte.
- Extensibilidade: utilitários modulares (LayerUtils, ElementUtils, SelectionUtils) facilitam novos comportamentos.
- Internacionalização: texto estático em PT-BR (refatoração futura para i18n centralizado).

## 4. Arquitetura de Alto Nível

```
+------------------+        +------------------------------+
|   React Router    | ----> |   Páginas / Layouts          |
+------------------+        +------------------------------+
           |                          |
           v                          v
+------------------+        +------------------------------+
|   Hooks (use*)   | <----> |   Componentes de UI          |
+------------------+        +------------------------------+
           |                          |
           v                          v
+------------------+        +------------------------------+
|  Estado (Zustand)|        |  Canvas Renderer (imperativo)|
+------------------+        +------------------------------+
           |                           \
           v                            v
+------------------+        +------------------------------+
|  Services (API)  | -----> |  Backend REST (externo)      |
+------------------+        +------------------------------+
```

## 5. Módulos e Camadas

| Módulo            | Pasta                         | Responsabilidade                                          |
| ----------------- | ----------------------------- | --------------------------------------------------------- |
| Páginas / Rotas   | `src/pages`, `src/routes`     | Orquestra navegação (privado/público).                    |
| Layout            | `src/layout`                  | Estruturas de layout do dashboard / container.            |
| Componentes       | `src/components`              | UI reutilizável e módulos (FairMapper).                   |
| Hooks             | `src/hooks`                   | Lógica de estado e interação (ex: `useFairMapper`).       |
| Store             | `src/store`                   | Estado global (auth).                                     |
| Services          | `src/services`                | Acesso a API REST (Auth, Map).                            |
| Models            | `src/models`                  | Tipos de domínio alinhados ao backend.                    |
| Queries/Mutations | `src/queries`, `src/mutation` | Integração react-query (abstração de fetch/cache).        |
| Utils             | `src/utils`                   | Funções puras para canvas, layers, conversões.            |
| Lib               | `src/lib`                     | Instâncias de infraestrutura (axios, react-query config). |

## 6. Fluxos Principais

### 6.1 Autenticação

1. Usuário envia credenciais (`AuthService.signin`).
2. Backend retorna token -> `authStore.authenticate` guarda em sessionStorage e injeta `Authorization` no axios.
3. Rotas privadas consultam `authStore.load()` para gate.

### 6.2 Cadastro de Usuário

Fluxo similar ao login com `signup` -> autentica na sequência.

### 6.3 CRUD de Mapas

1. Listagem via `MapService.findAll` (paginado).
2. Seleção abre editor (rota /maps/editor/:id) (assumido pela estrutura de rotas).
3. Edição cria/atualiza features localmente dentro do FairMapper (camadas internas) — futura sincronização com backend converte para `Map.features`.
4. Salvar: (atual) exporta JSON local. Extensão planejada: enviar `update` para API.

### 6.4 Edição de Elementos (Canvas)

1. Eventos de mouse traduzidos em coordenadas (`getCanvasCoordinates`).
2. Seleção / hit test via `SelectionUtils`.
3. Criação (`draw`): estado de arrasto define retângulo e ao soltar gera elemento com `ElementUtils` + `LayerUtils.addElement`.
4. Move / Resize atualiza atributos e re-renderiza.
5. Paint altera cor seguindo paleta `ColorUtils`.

### 6.5 Upload de Planta (Imagem)

- FileReader -> Image -> meta armazenada em estado do hook, binário não persistido em JSON de mapa; renderer aplica opacidade e transform.

### 6.6 Exportar / Importar

- Export: serializa `MapData` (layers + nextId + timestamp + versão) em Blob JSON.
- Import: valida JSON, repopula camadas e contador.

## 7. Modelos de Dados (Domínio Backend)

`Map` contém: `_id`, `name`, `type`, `metadata`, `features[]`, `userId`, timestamps.  
`MapFeature` segue estrutura Geo-like: `geometry` + `properties` (dinâmico).  
Local categories e element types definidos como const enums string.

## 8. Estrutura Interna do FairMapper

- Camadas: `background`, `submaps`, `locations` (ordem/zIndex em `LAYER_CONFIG`).
- Elemento base: retângulo com `{ id, x, y, width, height, color, borderColor, layer, type }`.
- Estados auxiliares: ferramenta ativa (`ToolType`), layer em desenho, seleção, `mouseState`, `debugMode`.
- Operações críticas: `updateElement`, `createNewElement`, `deleteElement`, `resizeElement` (via utils), `loadLayers`, `uploadBackgroundImage`.
- Renderização: `useCanvasRenderer` fornece funções de desenho e atualização de cursor; re-render disparado em mudanças de dependência ou preview de desenho.

## 9. Gerenciamento de Estado

- Global: `authStore` (Zustand persist com `sessionStorage`).
- Local (FairMapper): hook isolado, evita poluição do estado global; potencial futura integração com react-query para sincronizar com backend.
- Cache de rede: TanStack Query (config em `lib/tanstack.ts`, não exibido aqui mas presumido pela dependência).

## 10. Integração com API

- Axios `api` com `baseURL` de `VITE_API_BASE_URL` e `withCredentials`.
- Interceptor injeta cabeçalhos de controle de cache e JSON Content-Type.
- Serviços tipados, retornam Promises de modelos fortes -> facilita integração com query/mutation wrappers.

## 11. UI & UX

- Tailwind para composição rápida.
- Componentização modular (Toolbar, Sidebar, Panels) para extensões.
- Acessibilidade básica: foco e labels em inputs; melhorias futuras: roles ARIA nos elementos do canvas e keyboard shortcuts.

## 12. Decisões Arquiteturais (ADR Resumido)

| ID     | Decisão                  | Status            | Justificativa                                   | Trade-offs                         |
| ------ | ------------------------ | ----------------- | ----------------------------------------------- | ---------------------------------- |
| ADR-01 | Vite + React 19          | Aceita            | Build rápido, HMR eficiente                     | Lock-in a ecossistema ESM/Vite     |
| ADR-02 | TypeScript               | Aceita            | Tipagem e robustez                              | Overhead inicial                   |
| ADR-03 | Zustand p/ Auth          | Aceita            | API mínima, simples persistência                | Menos ecosistema que Redux Toolkit |
| ADR-04 | Canvas Imperativo + Hook | Aceita            | Performance e controle fino                     | Complexidade debug                 |
| ADR-05 | Export/Import JSON local | Temporária        | Rápida entrega sem backend completo de features | Falta sincronização multi-device   |
| ADR-06 | TanStack Query           | Planejada/Parcial | Cache e invalidação automática                  | Curva de aprendizado               |
| ADR-07 | TailwindCSS              | Aceita            | Produtividade e consistência                    | Classes utilitárias densas         |

## 13. Segurança

- Armazenamento de token em sessionStorage (reduz risco persistente comparado a localStorage).
- Header Authorization configurado dinamicamente; limpeza em logout.
- Requisições com `withCredentials` permitem estratégia futura de refresh token httpOnly.
- Riscos atuais: ausência de refresh, ausência de proteção CSRF (se cookies forem relevantes). Mitigação futura: CSR token + rotas de refresh segregadas.

## 14. Performance & Escalabilidade

- Canvas evita DOM inflation para múltiplos elementos.
- Re-render seletivo: dependências controladas no hook; preview desenhado manualmente.
- Potenciais otimizações: spatial indexing (quadtree) para seleção; debounce em resize/move; offscreen canvas / WebWorker.
- Limitação atual: tudo em memória; para mapas muito grandes, necessário fatiamento ou stream.

## 15. Observabilidade & Logging (Planejado)

- Hoje: console.debug/console.log.
- Futuro: wrapper de logger com níveis + envio opcional a endpoint (SaaS ou backend). Medição de FPS em modo debug.

## 16. Roadmap / Backlog Técnico (Prioridade Desc.)

1. Sincronizar salvar/atualizar mapa com backend (`update` real de features).
2. Converter camadas internas -> formato `MapFeature` genérico (padronização `geometry`).
3. Implementar undo/redo stack.
4. Grid snapping e alinhamento.
5. Autorização por roles (owner/colaborador viewer).
6. Testes unitários (utils, hook) e de integração (fluxo auth + editor).
7. i18n infra (react-intl ou lingui) + externalização de strings.
8. Observabilidade (logger + métricas básicas performance canvas).
9. A11y: navegação teclado sobre seleção de elementos.
10. Tema escuro.

## 17. Riscos & Mitigações

| Risco                                         | Impacto | Mitigação                                                        |
| --------------------------------------------- | ------- | ---------------------------------------------------------------- |
| Crescimento de elementos degrada seleção O(n) | Alto    | Introduzir índice espacial (quadtree)                            |
| Vazamento de token em XSS                     | Médio   | Harden CSP + sanitização, migração para cookies httpOnly refresh |
| Divergência de modelo interno vs backend      | Médio   | Módulo de conversão unificado (`map-converter.ts`) e testes      |
| Falta de testes causa regressões              | Médio   | Introduzir pipeline CI com lint + unit tests                     |
| Falta de sincronização real-time              | Baixo   | WebSocket modular futuro                                         |

## 18. Extensões Futuras

- Colaboração simultânea (CRDT ou OT + WebSocket).
- Versionamento e diff visual de mapas.
- Permissões por elemento (lock de edição).
- Anotações e comentários contextuais.
- Exportar como imagem/SVG.
- Integração com motor de busca espacial (geometria complexa).

## 19. Glossário

| Termo               | Definição                                                            |
| ------------------- | -------------------------------------------------------------------- |
| Layer               | Conjunto lógico de elementos agrupados por função e ordenação visual |
| Submapa             | Setor/área agrupadora de locais                                      |
| Location            | Elemento individual (ex: estande)                                    |
| Background (lógico) | Área de composição do layout (corredores, áreas comuns)              |
| Planta (imagem)     | Referência visual não persistida no JSON exportado                   |

## 20. Referências

- React 19 Docs
- TanStack Query Docs
- Axios Docs
- TailwindCSS Docs

---

Gerado automaticamente. Atualize este documento conforme evoluções relevantes ocorram.
