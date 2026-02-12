#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}⚽ Futebol Clubes - Setup Inicial${NC}"
echo "=================================="

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado. Instale o Node.js primeiro:${NC}"
    echo "   https://nodejs.org/"
    exit 1
fi

echo -e "${YELLOW}📦 Instalando dependências do backend...${NC}"
cd backend
npm install

echo -e "${YELLOW}📦 Instalando dependências globais (opcional)...${NC}"
cd ..
npm install -g http-server

echo -e "${YELLOW}🔗 Criando link do JSON para frontend...${NC}"
mkdir -p frontend/data
cp backend/data/clubes.json frontend/data/clubes.json

echo -e "${GREEN}✅ Setup completo!${NC}"
echo ""
echo "Comandos disponíveis:"
echo "  npm run dev       - Iniciar backend + frontend local"
echo "  npm run server    - Apenas backend (API)"
echo "  npm run static    - Apenas frontend (GitHub Pages mode)"
echo "  npm run deploy    - Fazer deploy para GitHub Pages"
