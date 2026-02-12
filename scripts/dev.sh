#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Iniciando ambiente de desenvolvimento...${NC}"

if [ ! -f "frontend/data/clubes.json" ]; then
    echo -e "${YELLOW}⚠️  Copiando JSON para frontend...${NC}"
    mkdir -p frontend/data
    cp backend/data/clubes.json frontend/data/clubes.json
fi

echo -e "${GREEN}📡 Iniciando API (Node.js)...${NC}"
cd backend
npm start &
BACKEND_PID=$!
cd ..

sleep 2

if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    open http://localhost:3000
fi

echo -e "${GREEN}✅ Backend rodando em http://localhost:3000${NC}"
echo -e "${YELLOW}⚠️  Pressione Ctrl+C para parar${NC}"

trap "echo -e '${RED}🛑 Parando servidor...${NC}'; kill $BACKEND_PID 2>/dev/null; exit" INT

wait
