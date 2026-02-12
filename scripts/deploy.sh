#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}🚀 Deploy para GitHub Pages${NC}"
echo "============================"

if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Erro: Não é um repositório Git${NC}"
    echo "   Execute primeiro: git init"
    exit 1
fi

if ! git remote -v > /dev/null 2>&1; then
    echo -e "${RED}❌ Erro: Nenhum remote configurado${NC}"
    echo "   Adicione o remote do GitHub:"
    echo "   git remote add origin https://github.com/GbrlSouza/futebol-clubes.git"
    exit 1
fi

echo -e "${YELLOW}🔄 Sincronizando dados...${NC}"
mkdir -p frontend/data
cp backend/data/clubes.json backend/data/clubes.json

echo -e "${YELLOW}💾 Fazendo commit...${NC}"
git add .
git commit -m "🚀 Deploy: $(date '+%Y-%m-%d %H:%M:%S')" || echo "Nada para commitar"

echo -e "${BLUE}⬆️  Enviando para GitHub...${NC}"
git push origin main

echo -e "${GREEN}✅ Código enviado!${NC}"
echo ""
echo -e "${YELLOW}⏳ Aguarde 1-2 minutos para o GitHub Pages atualizar${NC}"
echo -e "   Verifique em: ${BLUE}https://GbrlSouza.github.io/futebol-clubes${NC}"
echo ""
echo -e "${YELLOW}💡 Dica: O deploy automático via GitHub Actions já deve estar rodando${NC}"
