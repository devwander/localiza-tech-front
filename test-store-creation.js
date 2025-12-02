// Script de teste para debugging
// Execute no console do navegador

const testStoreData = {
  name: "Loja Teste",
  floor: "1º Andar",
  category: "food",
  openingHours: "Seg-Sex: 9h-18h",
  logo: "",
  description: "Loja de teste para debug",
  mapId: "507f1f77bcf86cd799439011", // Substitua pelo ID real do mapa
  featureId: "feature-test-123",
  location: {
    x: 100,
    y: 200,
    width: 50,
    height: 50,
  },
};

// Testar criação
fetch("http://localhost:3000/stores", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  },
  credentials: "include",
  body: JSON.stringify(testStoreData),
})
  .then((response) => {
    return response.json();
  })
  .then((data) => {})
  .catch((error) => {
    console.error("Erro:", error);
  });
