export default {
    testEnvironment: "node", // Usar entorno de Node.js
    transform: {},           // Babel u otras herramientas si usas ECMAScript moderno
    moduleFileExtensions: ["js", "mjs"], // Extensiones permitidas
    collectCoverageFrom: ["src/**/*.{js,mjs}"], // Archivos para el informe de cobertura
    coverageDirectory: "./coverage", // Directorio donde guardar el informe de cobertura
    testMatch: [
      "**/__tests__/unit/**/*.test.js", // Tests unitarios
      "**/__tests__/integration/**/*.test.js", // Tests de integración
      "**/__tests__/e2e/**/*.test.js" // Tests E2E
    ],
    setupFilesAfterEnv: ["./jest.setup.js"], // Archivo de configuración adicional si es necesario
  };
  