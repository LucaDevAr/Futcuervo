// analyze-use-client.js
// Ejecutar con: node analyze-use-client.js
const fs = require("fs");
const path = require("path");

/**
 * Detecta si un archivo necesita "use client".
 * Regla: si usa React hooks, eventos de UI, refs o efectos => CLIENT COMPONENT
 */
function requiresUseClient(code) {
  const clientPatterns = [
    "useState(",
    "useEffect(",
    "useRef(",
    "useContext(",
    "useReducer(",
    "useCallback(",
    "useMemo(",
    "useTransition(",
    "useOptimistic(",
    ".addEventListener(",
    "onClick=",
    "onChange=",
    "onSubmit=",
    "window.",
    "document.",
    "navigator.",
  ];

  return clientPatterns.some((pattern) => code.includes(pattern));
}

/**
 * Recorre la carpeta recursivamente buscando archivos JS/TS/JSX/TSX
 */
function scanDir(dir, results = []) {
  const items = fs.readdirSync(dir);

  items.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    // Ignorar carpeta .next, node_modules y public
    if (stat.isDirectory()) {
      if (
        file === "node_modules" ||
        file === ".next" ||
        file === "public" ||
        file === ".git"
      ) {
        return;
      }
      scanDir(filePath, results);
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      results.push(filePath);
    }
  });

  return results;
}

console.log("\n🔍 Analizando archivos con 'use client'...\n");

const allFiles = scanDir("./");
const filesWithUseClient = allFiles.filter((f) => {
  const content = fs.readFileSync(f, "utf-8");
  return (
    content.startsWith('"use client"') || content.startsWith("'use client'")
  );
});

let safeToRemove = [];
let mustStayClient = [];
let needsReview = [];

filesWithUseClient.forEach((file) => {
  const content = fs.readFileSync(file, "utf-8");
  const isRequired = requiresUseClient(content);

  if (isRequired) {
    mustStayClient.push(file);
  } else {
    safeToRemove.push(file);
  }
});

// Archivos que deben seguir como cliente pero están en lugares sospechosos
mustStayClient.forEach((file) => {
  if (file.includes("/app/") && file.endsWith("page.js")) {
    needsReview.push(file);
  }
});

console.log('🟢 Archivos donde podés borrar "use client" sin romper nada:\n');
safeToRemove.forEach((file) => console.log("   ✔ " + file));

console.log(
  "\n🟡 Archivos que requieren ser Client Components (usan hooks o eventos):\n"
);
mustStayClient.forEach((file) => console.log("   ⚠️ " + file));

console.log(
  "\n🔴 Archivos que NO deberían ser Client Components pero usan lógica cliente (revisalos):\n"
);
needsReview.forEach((file) => console.log("   ❗ " + file));

console.log("\n✨ Listo. Ajustá los archivos seguros y revisá los dudosos.");
