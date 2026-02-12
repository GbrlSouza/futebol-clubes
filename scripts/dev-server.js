const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
const PORT = process.env.PORT || 5500;
const FRONTEND_DIR = path.resolve(__dirname, "..", "frontend");
const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;

  if (pathname === "/") {
    pathname = "/index.html";
  }

  const safePath = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(FRONTEND_DIR, safePath);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end(`
                <!DOCTYPE html>
                <html>
                <head><title>404 - Não encontrado</title></head>
                <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                    <h1>404 😕</h1>
                    <p>Arquivo não encontrado: ${pathname}</p>
                    <p><small>Futebol Clubes Dev Server</small></p>
                </body>
                </html>
            `);
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Erro interno do servidor");
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";

      res.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": "no-cache",
      });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log("");
  console.log("⚽ FUTEBOL CLUBES - DEV SERVER");
  console.log("═══════════════════════════════════════");
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📁 Pasta: ${FRONTEND_DIR}`);
  console.log("═══════════════════════════════════════");
  console.log("Pressione Ctrl+C para parar");
  console.log("");

  const openUrl = `http://localhost:${PORT}`;

  if (process.platform === "win32") {
    require("child_process").exec(`start ${openUrl}`);
  } else if (process.platform === "darwin") {
    require("child_process").exec(`open ${openUrl}`);
  } else {
    require("child_process").exec(
      `xdg-open ${openUrl} || sensible-browser ${openUrl} || x-www-browser ${openUrl}`,
    );
  }
});
