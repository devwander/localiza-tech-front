# Fair Mapper - Mapeador de Feira

Um mapeador interativo para feiras e mercados, desenvolvido em React + TypeScript, migrado do projeto feira-mapper original em JavaScript.

## 🚀 Funcionalidades

### 🛠️ Ferramentas Principais

- **👆 Selecionar**: Seleciona elementos no mapa respeitando a prioridade de camadas (Z-index)
- **✋ Mover**: Move elementos selecionados
- **📏 Redimensionar**: Redimensiona elementos com handles visuais
- **🎨 Pintar**: Altera cores dos elementos

### 📋 Sistema de Camadas

- **🗺️ Background (Z-index: 1)**: Corredores, praças, banheiros, entradas
- **🏢 Submapas (Z-index: 2)**: Setores e áreas organizacionais
- **🏪 Locais (Z-index: 3)**: Lojas e pontos comerciais

### 🎯 Hit-Testing Inteligente

O sistema de seleção respeita a prioridade das camadas:

1. **Locais** são selecionados primeiro (prioridade máxima)
2. **Submapas** em seguida
3. **Background** por último

### 💾 Persistência

- **LocalStorage**: Salvamento automático durante o uso
- **Export/Import**: Salvar e carregar mapas como arquivos JSON

## 🏗️ Arquitetura

### 📁 Estrutura de Arquivos

```
src/
├── components/fair-mapper/     # Componentes React
├── hooks/                      # Custom hooks
├── types/                      # Definições TypeScript
├── utils/                      # Utilitários e lógica
└── data/                       # Dados de exemplo
```

### 🧩 Componentes Principais

#### `FairMapper.tsx`

Componente principal que orquestra toda a aplicação.

#### `useFairMapper.ts`

Hook customizado que gerencia:

- Estado das camadas e elementos
- Eventos de mouse e canvas
- Operações CRUD de elementos
- Renderização do canvas

#### `CanvasRenderer.ts`

Classe responsável pela renderização:

- Elementos ordenados por Z-index
- Grid de debug
- Highlights de seleção
- Preview de elementos sendo criados

### 🔧 Utilitários

#### `LayerUtils`

- Manipulação de camadas
- Operações CRUD de elementos
- Ordenação por Z-index

#### `SelectionUtils`

- Hit-testing inteligente
- Detecção de handles de resize
- Verificação de colisões

#### `ElementUtils`

- Criação de elementos tipados
- Redimensionamento
- Operações geométricas

## 🎮 Como Usar

### Criando Elementos

1. Clique em uma ferramenta de desenho (Background, Submapa, ou Local)
2. Clique e arraste no canvas para criar o elemento
3. O elemento será criado automaticamente na camada correta

### Selecionando e Editando

1. Use a ferramenta "Selecionar"
2. Clique em um elemento para selecioná-lo
3. Use o painel lateral para editar propriedades
4. Use as ferramentas de Mover/Redimensionar para ajustes visuais

### Salvando e Carregando

- **Salvar**: Clique no botão "💾 Salvar" para exportar como JSON
- **Carregar**: Use "📂 Carregar" para importar um arquivo JSON

### Debug Mode

Ative o modo debug para ver:

- Coordenadas do mouse
- Informações de hit-testing
- Dados técnicos dos elementos

## 🔍 Recursos Técnicos

### TypeScript Completo

- Tipagem forte para todos os elementos
- Interfaces bem definidas
- Segurança de tipos em tempo de compilação

### Canvas HTML5

- Renderização otimizada
- Eventos de mouse precisos
- Coordenadas relativas ao canvas

### Arquitetura Reativa

- Estado gerenciado com React hooks
- Re-renderização eficiente
- Separação clara de responsabilidades

### Sistema de Eventos

- Event listeners otimizados
- Prevenção de vazamentos de memória
- Handling robusto de edge cases

## 🐛 Debugging

O modo debug fornece:

- **Posição do mouse**: Coordenadas absolutas e relativas
- **Hit-testing**: Log das verificações de seleção
- **Elemento selecionado**: Informações do elemento atual
- **Estado das camadas**: Contadores e estatísticas

## 🏷️ Tipos de Elementos

### Background

- `Corredor`: Passagens principais
- `Praça`: Áreas abertas centrais
- `Área Comum`: Espaços de convivência
- `Entrada`: Pontos de acesso
- `Banheiro`: Instalações sanitárias
- `Customizado`: Elementos personalizados

### Locais

- `Alimentação`: Restaurantes, lanchonetes
- `Vestuário`: Lojas de roupas
- `Artesanato`: Produtos artesanais
- `Serviços`: Prestadores de serviço
- `Outros`: Categoria genérica

## 🎨 Personalização

### Cores por Categoria

Cada tipo de local tem uma cor padrão que pode ser alterada:

- **Alimentação**: Verde (#4CAF50)
- **Vestuário**: Azul (#2196F3)
- **Artesanato**: Laranja (#FF9800)
- **Serviços**: Roxo (#9C27B0)
- **Outros**: Cinza (#607D8B)

### Estilos Visuais

- Bordas tracejadas para submapas
- Cores de contraste automáticas para texto
- Handles visuais para redimensionamento
- Grid opcional no modo debug

## 💡 Dicas de Uso

1. **Ordem de Criação**: Crie primeiro elementos de background, depois submapas, e por último os locais
2. **Organização**: Use submapas para agrupar locais relacionados
3. **Seleção**: Em caso de sobreposição, elementos em camadas superiores têm prioridade
4. **Performance**: O sistema é otimizado para mapas com centenas de elementos
5. **Backup**: Salve frequentemente usando a função de export

## 🚨 Limitações

- Canvas fixo de 800x600 pixels
- Elementos mínimos de 10x10 pixels
- Sem zoom ou pan (pode ser implementado no futuro)
- Limitado a navegadores com suporte a HTML5 Canvas

## 🔮 Próximos Passos

Possíveis melhorias futuras:

- Sistema de zoom e pan
- Múltiplos mapas/níveis
- Colaboração em tempo real
- Integração com APIs externas
- Versão mobile responsiva
- Undo/redo de operações
