class AdminModal {
  constructor() {
    this.modal = null;
    this.clubeAtual = null;
    this.estadioImagens = [];
    this.isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    this.clubes = [];
    this.inicializado = false;

    console.log("AdminModal criado. isLocal:", this.isLocal);
  }

  isAdminMode() {
    return this.isLocal;
  }

  init() {
    if (!this.isAdminMode()) {
      console.log("Admin desabilitado - não é localhost");
      return;
    }

    if (this.inicializado) {
      console.log("Admin já inicializado");
      return;
    }

    console.log("Admin ativado!");
    this.inicializado = true;

    // Botão "Novo" na navbar
    this.addNovoButton();

    // Escuta evento de clubes carregados
    window.addEventListener("clubesCarregados", () => {
      console.log("Evento clubesCarregados recebido");
      this.clubes = window.app?.clubes || [];
      this.addEditButtons();
    });

    // Se já estiver carregado, adiciona agora
    if (window.app?.clubes?.length > 0) {
      console.log("Clubes já carregados, adicionando botões");
      this.clubes = window.app.clubes;
      this.addEditButtons();
    }

    // Observa mudanças no DOM
    this.observeDOM();
  }

  addNovoButton() {
    const navbar = document.querySelector(".navbar .container");
    if (!navbar || document.getElementById("btn-novo-clube")) return;

    const btn = document.createElement("button");
    btn.id = "btn-novo-clube";
    btn.className = "btn btn-warning btn-sm ms-2";
    btn.innerHTML = '<i class="bi bi-plus-lg"></i> Novo';
    btn.onclick = () => this.openModal();

    navbar.appendChild(btn);
    console.log("Botão Novo adicionado");
  }

  async addEditButtons() {
    if (await this.clubes.length === 0) {
      console.log("Sem clubes para adicionar botões");
      return;
    }

    const cards = document.querySelectorAll("#grid-alfabetico .clube-card");
    console.log(
      "Adicionando botões:",
      cards.length,
      "cards,",
      this.clubes.length,
      "clubes",
    );

    cards.forEach((card) => {
      if (card.querySelector(".btn-editar")) return;

      const titulo = card.querySelector(".card-title")?.textContent;
      if (!titulo) return;

      // Busca pelo full_name
      const clube = this.clubes.find((c) => c.full_name === titulo);

      if (!clube) {
        console.log("Não encontrado:", titulo);
        return;
      }

      const btn = document.createElement("button");
      btn.className = "btn btn-warning btn-sm btn-editar";
      btn.innerHTML = '<i class="bi bi-pencil"></i>';
      btn.title = "Editar " + clube.short_name;
      btn.style.cssText = `
                position: absolute;
                top: 10px;
                left: 10px;
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.2s;
            `;

      btn.onclick = (e) => {
        e.stopPropagation();
        this.openModal(clube.slug);
      };

      card.style.position = "relative";
      card.appendChild(btn);

      card.addEventListener("mouseenter", () => (btn.style.opacity = "1"));
      card.addEventListener("mouseleave", () => (btn.style.opacity = "0"));
    });
  }

  observeDOM() {
    const observer = new MutationObserver(() => {
      if (this.clubes.length > 0) {
        setTimeout(() => this.addEditButtons(), 100);
      }
    });

    const grid = document.getElementById("grid-alfabetico");
    if (grid) {
      observer.observe(grid, { childList: true, subtree: true });
    }
  }

  openModal(slug = null) {
    console.log("Abrindo modal, slug:", slug);

    this.clubeAtual = slug ? this.clubes.find((c) => c.slug === slug) : null;
    this.estadioImagens = this.clubeAtual?.estadioImagens || [];

    this.createModal();
    this.fillForm();

    const modalEl = document.getElementById("adminModal");
    this.modal = new bootstrap.Modal(modalEl);
    this.modal.show();
  }

  createModal() {
    const existing = document.getElementById("adminModal");
    if (existing) existing.remove();

    const estadosOptions = window.app?.estadosNomes
      ? Object.entries(window.app.estadosNomes)
          .map(
            ([sigla, nome]) =>
              `<option value="${sigla}">${sigla} - ${nome}</option>`,
          )
          .join("")
      : "";

    const html = `
            <div class="modal fade" id="adminModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">
                                ${this.clubeAtual ? "✏️ Editar" : "➕ Novo"} Clube
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="formClube">
                                ${
                                  this.clubeAtual
                                    ? `
                                    <div class="alert alert-info mb-3">
                                        Editando: <strong>${this.clubeAtual.full_name}</strong>
                                    </div>
                                `
                                    : ""
                                }
                                
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Nome Curto *</label>
                                        <input type="text" class="form-control" name="short_name" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Nome Completo *</label>
                                        <input type="text" class="form-control" name="full_name" required>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label">Cidade *</label>
                                        <input type="text" class="form-control" name="city" required>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label">Estado *</label>
                                        <select class="form-select" name="state" required>
                                            <option value="">Selecione...</option>
                                            ${estadosOptions}
                                        </select>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label">Ano *</label>
                                        <input type="number" class="form-control" name="founded" required>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Slug *</label>
                                        <input type="text" class="form-control ${this.clubeAtual ? "bg-light" : ""}" 
                                               name="slug" ${this.clubeAtual ? "readonly" : ""} required>
                                        ${this.clubeAtual ? '<small class="text-muted">Não pode ser alterado</small>' : ""}
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Site</label>
                                        <input type="text" class="form-control" name="site">
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Extensão do Escudo</label>
                                        <select class="form-select" name="typeSlug">
                                            <option value=".png">.png</option>
                                            <option value=".jpg">.jpg</option>
                                            <option value=".svg">.svg</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Status</label>
                                        <select class="form-select" name="status">
                                            <option value="active">Ativo</option>
                                            <option value="inactive">Inativo</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Hino - Título</label>
                                    <input type="text" class="form-control" name="anthem_title">
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Hino - URL</label>
                                    <input type="url" class="form-control" name="anthem_lyrics_url">
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Fotos do Estádio (URLs, uma por linha)</label>
                                    <textarea class="form-control" id="estadioUrls" rows="3" 
                                              onchange="adminModal.parseEstadioUrls(this.value)"></textarea>
                                    <div id="previewEstadios" class="row g-2 mt-2"></div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            ${
                              this.clubeAtual
                                ? `
                                <button type="button" class="btn btn-danger me-auto" onclick="adminModal.excluir()">
                                    🗑️ Excluir
                                </button>
                            `
                                : ""
                            }
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-success" onclick="adminModal.salvar()">
                                💾 ${this.clubeAtual ? "Salvar" : "Criar"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

    document.body.insertAdjacentHTML("beforeend", html);
  }

  parseEstadioUrls(texto) {
    this.estadioImagens = texto
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u);
    this.renderPreviews();
  }

  fillForm() {
    const form = document.getElementById("formClube");
    if (!form) return;

    if (!this.clubeAtual) {
      form.reset();
      document.getElementById("estadioUrls").value = "";
      this.estadioImagens = [];
      this.renderPreviews();
      return;
    }

    const c = this.clubeAtual;
    form.short_name.value = c.short_name || "";
    form.full_name.value = c.full_name || "";
    form.city.value = c.city || "";
    form.state.value = c.state || "";
    form.founded.value = c.founded || "";
    form.slug.value = c.slug || "";
    form.site.value = c.site || "";
    form.typeSlug.value = c.typeSlug || ".png";
    form.status.value = c.status || "active";
    form.anthem_title.value = c.anthem?.title || "";
    form.anthem_lyrics_url.value = c.anthem?.lyrics_url || "";

    this.estadioImagens = c.estadioImagens || [];
    document.getElementById("estadioUrls").value =
      this.estadioImagens.join("\n");
    this.renderPreviews();
  }

  renderPreviews() {
    const container = document.getElementById("previewEstadios");
    if (!container) return;

    if (this.estadioImagens.length === 0) {
      container.innerHTML =
        '<div class="col-12 text-muted">Nenhuma imagem</div>';
      return;
    }

    container.innerHTML = this.estadioImagens
      .map(
        (url, i) => `
            <div class="col-3">
                <img src="${url}" class="img-fluid rounded" style="height: 60px; object-fit: cover; width: 100%;"
                     onerror="this.src='https://via.placeholder.com/60?text=X'">
                ${i === 0 ? '<span class="badge bg-success" style="font-size: 0.5rem;">1º</span>' : ""}
            </div>
        `,
      )
      .join("");
  }

  async salvar() {
    const form = document.getElementById("formClube");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const fd = new FormData(form);
    const clube = {
      short_name: fd.get("short_name"),
      full_name: fd.get("full_name"),
      city: fd.get("city"),
      state: fd.get("state"),
      founded: parseInt(fd.get("founded")),
      slug: fd.get("slug"),
      site: fd.get("site"),
      typeSlug: fd.get("typeSlug"),
      status: fd.get("status"),
      uniforme: fd.get("slug"),
      wikipedia_page: fd.get("full_name"),
      anthem: {
        title: fd.get("anthem_title") || "Hino do " + fd.get("short_name"),
        lyrics_url: fd.get("anthem_lyrics_url") || null,
        audio_url: null,
      },
      estadioImagens: this.estadioImagens,
    };

    const response = await fetch("data/clubes.json");
    let clubes = await response.json();

    if (this.clubeAtual) {
      const idx = clubes.findIndex((c) => c.slug === this.clubeAtual.slug);
      if (idx !== -1) {
        clubes[idx] = { ...clubes[idx], ...clube, slug: this.clubeAtual.slug };
      }
    } else {
      if (clubes.find((c) => c.slug === clube.slug)) {
        alert("Slug já existe!");
        return;
      }
      clubes.push(clube);
    }

    const blob = new Blob([JSON.stringify(clubes, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "clubes.json";
    a.click();

    this.modal?.hide();
    alert(
      this.clubeAtual
        ? "✅ Atualizado! Substitua o JSON."
        : "✅ Criado! Substitua o JSON.",
    );
  }

  excluir() {
    if (
      !this.clubeAtual ||
      !confirm('Excluir "' + this.clubeAtual.full_name + '"?')
    )
      return;

    fetch("data/clubes.json")
      .then((r) => r.json())
      .then((clubes) => {
        const idx = clubes.findIndex((c) => c.slug === this.clubeAtual.slug);
        if (idx !== -1) clubes.splice(idx, 1);

        const blob = new Blob([JSON.stringify(clubes, null, 2)], {
          type: "application/json",
        });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "clubes.json";
        a.click();

        this.modal?.hide();
        alert("🗑️ Excluído! Substitua o JSON.");
      });
  }
}

// Instância global
let adminModal;

// Cria instância imediatamente
adminModal = new AdminModal();

// Inicializa quando DOM estiver pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => adminModal.init());
} else {
  adminModal.init();
}
