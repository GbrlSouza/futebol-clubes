# ⚽ Futebol Clubes

[![Deploy](https://github.com/GbrlSouza/futebol-clubes/actions/workflows/deploy-gh-pages.yml/badge.svg)](https://github.com/GbrlSouza/futebol-clubes/actions)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://GbrlSouza.github.io/futebol-clubes)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Sistema completo de visualização de clubes de futebol brasileiros com três modos de exibição: grid alfabético, timeline histórica e agrupamento por estado.

![Preview](https://via.placeholder.com/800x400/198754/ffffff?text=Futebol+Clubes+Preview)

## ✨ Funcionalidades

- **🔤 Grid Alfabético**: Cards responsivos com busca e ordenação A-Z
- **⏱️ Timeline Vertical**: Linha do tempo interativa com filtros (mais antigo/recente)
- **🗺️ Por Estado**: Agrupamento por UF com accordion dinâmico
- **📱 Responsivo**: Mobile-first com Bootstrap 5
- **⚡ Performance**: Dados processados client-side no GitHub Pages
- **🔌 API REST**: Endpoints completos para desenvolvimento local

## 🚀 Deploy Rápido

### Opção 1: GitHub Pages (Recomendado - Gratuito)

1. **Fork este repositório**
2. **Vá em Settings → Pages**
3. **Source**: GitHub Actions
4. **Pronto!** O site estará em `https://seuusuario.github.io/futebol-clubes`

### Opção 2: Local (Desenvolvimento)

```bash
# Clone
git clone https://github.com/GbrlSouza/futebol-clubes.git
cd futebol-clubes

# Setup automático
npm run setup

# Iniciar ambiente
npm run dev
