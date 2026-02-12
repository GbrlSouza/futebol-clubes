const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const loadData = () => {
  const rawData = fs.readFileSync(path.join(__dirname, 'data/clubes.json'), 'utf8');
  return JSON.parse(rawData);
};

app.get('/api/clubes', (req, res) => {
  try {
    const clubes = loadData();
    res.json({
      success: true,
      count: clubes.length,
      data: clubes
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/clubes/alfabetico', (req, res) => {
  try {
    const clubes = loadData();
    const ordenados = [...clubes].sort((a, b) => 
      a.short_name.localeCompare(b.short_name, 'pt-BR')
    );
    res.json({
      success: true,
      view: 'alfabetico',
      data: ordenados
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/clubes/timeline', (req, res) => {
  try {
    const { ordem = 'asc' } = req.query;
    const clubes = loadData();
    const ordenados = [...clubes].sort((a, b) => {
      return ordem === 'desc' ? b.founded - a.founded : a.founded - b.founded;
    });
    res.json({
      success: true,
      view: 'timeline',
      ordem: ordem === 'desc' ? 'mais_recente' : 'mais_antigo',
      data: ordenados
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/clubes/estados', (req, res) => {
  try {
    const clubes = loadData();
    const porEstado = clubes.reduce((acc, clube) => {
      const estado = clube.state;
      if (!acc[estado]) {
        acc[estado] = [];
      }
      acc[estado].push(clube);
      return acc;
    }, {});
    
    const estadosOrdenados = Object.keys(porEstado).sort();
    const resultado = {};
    estadosOrdenados.forEach(estado => {
      resultado[estado] = porEstado[estado].sort((a, b) => 
        a.short_name.localeCompare(b.short_name, 'pt-BR')
      );
    });
    
    res.json({
      success: true,
      view: 'estados',
      count: Object.keys(resultado).length,
      data: resultado
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/clubes/:slug', (req, res) => {
  try {
    const clubes = loadData();
    const clube = clubes.find(c => c.slug === req.params.slug);
    if (!clube) {
      return res.status(404).json({ success: false, error: 'Clube não encontrado' });
    }
    res.json({ success: true, data: clube });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
  console.log(`📊 Endpoints disponíveis:`);
  console.log(`   GET /api/clubes`);
  console.log(`   GET /api/clubes/alfabetico`);
  console.log(`   GET /api/clubes/timeline?ordem=asc|desc`);
  console.log(`   GET /api/clubes/estados`);
  console.log(`   GET /api/clubes/:slug`);
});
