const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs").promises;
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "../frontend")));

const DATA_PATH = path.join(__dirname, "data", "clubes.json");
const FRONTEND_DATA_PATH = path.join(__dirname, "../frontend/data/clubes.json");
const ESTADOS_PATH = path.join(__dirname, "../frontend/data/estados.json");
const ESTADIOS_PATH = path.join(__dirname, "data/estadios");

async function loadData() {
  const data = await fs.readFile(DATA_PATH, "utf8");
  return JSON.parse(data);
}

async function saveData(clubes) {
  await fs.writeFile(DATA_PATH, JSON.stringify(clubes, null, 2), "utf8");
  await fs.writeFile(
    FRONTEND_DATA_PATH,
    JSON.stringify(clubes, null, 2),
    "utf8",
  );
  return true;
}

async function saveEstadioImage(slug, index, base64Data) {
  const estadioDir = path.join(ESTADIOS_PATH, slug);

  await fs.mkdir(estadioDir, { recursive: true });

  const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Clean, "base64");
  const ext = base64Data.match(/\/(\w+);/)?.[1] || "jpg";
  const fileName = `${index}.${ext}`;
  const filePath = path.join(estadioDir, fileName);

  await fs.writeFile(filePath, buffer);

  const frontendDir = path.join(__dirname, "../frontend/images/estadios", slug);

  await fs.mkdir(frontendDir, { recursive: true });
  await fs.writeFile(path.join(frontendDir, fileName), buffer);

  return `images/estadios/${slug}/${fileName}`;
}

app.get("/api/clubes", async (req, res) => {
  try {
    const clubes = await loadData();
    res.json({ success: true, data: clubes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/clubes/:slug", async (req, res) => {
  try {
    const clubes = await loadData();
    const clube = clubes.find((c) => c.slug === req.params.slug);
    if (!clube) {
      return res
        .status(404)
        .json({ success: false, error: "Clube não encontrado" });
    }
    res.json({ success: true, data: clube });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/clubes", async (req, res) => {
  try {
    const clubes = await loadData();
    const novoClube = req.body;

    if (!novoClube.slug || !novoClube.full_name) {
      return res
        .status(400)
        .json({ success: false, error: "Slug e nome são obrigatórios" });
    }

    if (clubes.find((c) => c.slug === novoClube.slug)) {
      return res.status(400).json({ success: false, error: "Slug já existe" });
    }

    if (novoClube.estadioImagens && novoClube.estadioImagens.length > 0) {
      const imagensSalvas = [];
      for (let i = 0; i < novoClube.estadioImagens.length; i++) {
        const url = await saveEstadioImage(
          novoClube.slug,
          i + 1,
          novoClube.estadioImagens[i],
        );
        imagensSalvas.push(url);
      }
      novoClube.estadioImagens = imagensSalvas;
    }

    clubes.push(novoClube);
    await saveData(clubes);

    res.json({
      success: true,
      data: novoClube,
      message: "Clube criado com sucesso",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put("/api/clubes/:slug", async (req, res) => {
  try {
    const clubes = await loadData();
    const index = clubes.findIndex((c) => c.slug === req.params.slug);

    if (index === -1) {
      return res
        .status(404)
        .json({ success: false, error: "Clube não encontrado" });
    }

    const dadosAtualizados = req.body;
    const clubeAntigo = clubes[index];

    if (dadosAtualizados.slug && dadosAtualizados.slug !== clubeAntigo.slug) {
      const oldDir = path.join(ESTADIOS_PATH, clubeAntigo.slug);
      const newDir = path.join(ESTADIOS_PATH, dadosAtualizados.slug);

      try {
        await fs.rename(oldDir, newDir);

        if (dadosAtualizados.estadioImagens) {
          dadosAtualizados.estadioImagens = dadosAtualizados.estadioImagens.map(
            (url) => url.replace(clubeAntigo.slug, dadosAtualizados.slug),
          );
        }
      } catch (e) {
        console.log("Diretório de estádio não existe ou erro ao renomear");
      }
    }

    if (
      dadosAtualizados.novasEstadioImagens &&
      dadosAtualizados.novasEstadioImagens.length > 0
    ) {
      const imagensExistentes = dadosAtualizados.estadioImagens || [];
      const startIndex = imagensExistentes.length;

      for (let i = 0; i < dadosAtualizados.novasEstadioImagens.length; i++) {
        const url = await saveEstadioImage(
          dadosAtualizados.slug || clubeAntigo.slug,
          startIndex + i + 1,
          dadosAtualizados.novasEstadioImagens[i],
        );
        imagensExistentes.push(url);
      }

      dadosAtualizados.estadioImagens = imagensExistentes;
      delete dadosAtualizados.novasEstadioImagens;
    }

    clubes[index] = { ...clubeAntigo, ...dadosAtualizados };
    await saveData(clubes);

    res.json({
      success: true,
      data: clubes[index],
      message: "Clube atualizado com sucesso",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete("/api/clubes/:slug", async (req, res) => {
  try {
    const clubes = await loadData();
    const index = clubes.findIndex((c) => c.slug === req.params.slug);

    if (index === -1) {
      return res
        .status(404)
        .json({ success: false, error: "Clube não encontrado" });
    }

    const clubeRemovido = clubes.splice(index, 1)[0];
    await saveData(clubes);
    const estadioDir = path.join(ESTADIOS_PATH, req.params.slug);

    try {
      await fs.rm(estadioDir, { recursive: true, force: true });
    } catch (e) {
      console.log("Erro ao remover diretório de estádio:", e.message);
    }

    res.json({ success: true, message: "Clube removido com sucesso" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/git-commit", async (req, res) => {
  try {
    const { message } = req.body;

    const commands = [
      "git add backend/data/clubes.json",
      "git add backend/data/estadios/",
      "git add frontend/data/clubes.json",
      "git add frontend/images/estadios/",
      `git commit -m "${message}"`,
      "git push",
    ];

    for (const cmd of commands) {
      const { stdout, stderr } = await execPromise(cmd, {
        cwd: path.join(__dirname, ".."),
      });
      console.log(`Comando: ${cmd}`);
      console.log("stdout:", stdout);
      if (stderr) console.log("stderr:", stderr);
    }

    res.json({
      success: true,
      message: "Git commit e push realizados com sucesso",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
  console.log(`📊 Endpoints disponíveis:`);
  console.log(`   GET    /api/clubes`);
  console.log(`   GET    /api/clubes/:slug`);
  console.log(`   POST   /api/clubes`);
  console.log(`   PUT    /api/clubes/:slug`);
  console.log(`   DELETE /api/clubes/:slug`);
  console.log(`   POST   /api/git-commit`);
});
