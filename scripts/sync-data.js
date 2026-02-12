#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const rootDir = path.resolve(__dirname, "..");

const filesToSync = [
  {
    source: path.join(rootDir, "backend", "data", "clubes.json"),
    target: path.join(rootDir, "frontend", "data", "clubes.json"),
    name: "Clubes",
  },
  {
    source: path.join(rootDir, "frontend", "data", "estados.json"),
    target: path.join(rootDir, "frontend", "data", "estados.json"),
    name: "Estados",
    checkOnly: true,
  },
];

function syncData() {
  let hasError = false;

  filesToSync.forEach((file) => {
    try {
      if (!fs.existsSync(file.source)) {
        console.error(`❌ Erro: ${file.source} não encontrado`);
        hasError = true;
        return;
      }

      if (file.checkOnly) {
        const data = JSON.parse(fs.readFileSync(file.source, "utf8"));
        console.log(`✅ ${file.name}: ${Object.keys(data).length} registros`);
        return;
      }

      const targetDir = path.dirname(file.target);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`📁 Pasta ${targetDir} criada`);
      }

      fs.copyFileSync(file.source, file.target);

      const data = JSON.parse(fs.readFileSync(file.target, "utf8"));
      console.log(
        `✅ ${file.name}: ${data.length || Object.keys(data).length} registros sincronizados`,
      );
    } catch (error) {
      console.error(`❌ Erro em ${file.name}:`, error.message);
      hasError = true;
    }
  });

  if (hasError) {
    process.exit(1);
  }

  console.log("");
  console.log("🎉 SINCRONIZAÇÃO CONCLUÍDA");
}

if (require.main === module) {
  syncData();
}

module.exports = syncData;
