class AdminModal {
  constructor() {
    this.modal = null;
    this.clubeAtual = null;
    this.estadioImagens = [];
    this.isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    this.API_URL = "http://localhost:3000/api";
  }

  isAdminMode() {
    return this.isLocal;
  }

  addAdminButtons() {
    if (!this.isAdminMode()) return;

    const navbar = document.querySelector(".navbar .container");
    const btnAdmin = document.createElement("button");
    btnAdmin.className = "btn btn-warning btn-sm ms-2";
    btnAdmin.innerHTML = '<i class="bi bi-gear-fill"></i> Admin';
    btnAdmin.onclick = () => this.openModal();
    navbar.appendChild(btnAdmin);

    document.addEventListener("click", (e) => {
      if (e.target.closest(".btn-editar-clube")) {
        const slug = e.target.closest(".btn-editar-clube").dataset.slug;
        this.openModal(slug);
      }
    });
  }

  addEditButtonsToCards() {
    if (!this.isAdminMode()) return;

    document.querySelectorAll(".clube-card").forEach((card) => {
      const body = card.querySelector(".card-body");
      const btnEditar = document.createElement("button");
      btnEditar.className =
        "btn btn-warning btn-sm btn-editar-clube position-absolute";
      btnEditar.style.cssText = "top: 10px; left: 10px; z-index: 10;";
      btnEditar.innerHTML = '<i class="bi bi-pencil-fill"></i>';
      btnEditar.title = "Editar clube";

      const titulo = card.querySelector(".card-title")?.textContent;
      const clube = app.clubes.find((c) => c.full_name === titulo);
      if (clube) {
        btnEditar.dataset.slug = clube.slug;
        card.style.position = "relative";
        card.appendChild(btnEditar);
      }
    });
  }

  async openModal(slug = null) {
    this.clubeAtual = slug ? app.clubes.find((c) => c.slug === slug) : null;
    this.estadioImagens = this.clubeAtual?.estadioImagens || [];

    this.createModalElement();
    this.fillForm();
    this.setupEventListeners();

    const modalEl = document.getElementById("adminModal");
    this.modal = new bootstrap.Modal(modalEl);
    this.modal.show();
  }

  createModalElement() {
    const existing = document.getElementById("adminModal");
    if (existing) existing.remove();

    const modalHTML = `
            <div class="modal fade" id="adminModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">
                                <i class="bi bi-${this.clubeAtual ? "pencil" : "plus-circle"} me-2"></i>
                                ${this.clubeAtual ? "Editar" : "Novo"} Clube
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="formClube">
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
                                            ${Object.entries(app.estadosNomes)
                                              .map(
                                                ([sigla, nome]) =>
                                                  `<option value="${sigla}">${sigla} - ${nome}</option>`,
                                              )
                                              .join("")}
                                        </select>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label">Ano de Fundação *</label>
                                        <input type="number" class="form-control" name="founded" min="1800" max="2024" required>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Slug * (identificador único)</label>
                                        <input type="text" class="form-control" name="slug" 
                                               ${this.clubeAtual ? "readonly" : ""} required
                                               pattern="[a-z0-9-]+" title="Apenas letras minúsculas, números e hífen">
                                        <div class="form-text">Ex: flamengo, palmeiras, sao-paulo-fc</div>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Site</label>
                                        <input type="text" class="form-control" name="site" placeholder="www.exemplo.com.br">
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Extensão do Escudo</label>
                                        <select class="form-select" name="typeSlug">
                                            <option value=".png">.png</option>
                                            <option value=".jpg">.jpg</option>
                                            <option value=".jpeg">.jpeg</option>
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
                                    <label class="form-label">Hino - URL da Letra</label>
                                    <input type="url" class="form-control" name="anthem_lyrics_url">
                                </div>

                                <hr class="my-4">

                                <div class="mb-3">
                                    <label class="form-label">
                                        <i class="bi bi-images me-1"></i>
                                        Fotos do Estádio (serão usadas como background no grid)
                                    </label>
                                    <div class="estadio-upload-area border rounded p-3 text-center" 
                                         onclick="document.getElementById('inputEstadio').click()"
                                         style="cursor: pointer; border-style: dashed !important;">
                                        <i class="bi bi-cloud-upload fs-1 text-muted"></i>
                                        <p class="mb-0 text-muted">Clique para adicionar fotos do estádio</p>
                                        <small class="text-muted">Pode selecionar múltiplas imagens</small>
                                    </div>
                                    <input type="file" id="inputEstadio" class="d-none" 
                                           accept="image/*" multiple onchange="adminModal.handleEstadioUpload(this)">
                                    
                                    <div id="previewEstadios" class="row g-2 mt-2">
                                        <!-- Previews serão inseridos aqui -->
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            ${
                              this.clubeAtual
                                ? `
                                <button type="button" class="btn btn-danger me-auto" onclick="adminModal.excluirClube()">
                                    <i class="bi bi-trash me-1"></i>Excluir
                                </button>
                            `
                                : ""
                            }
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-success" onclick="adminModal.salvar()">
                                <i class="bi bi-save me-1"></i>Salvar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }

  fillForm() {
    if (!this.clubeAtual) return;

    const form = document.getElementById("formClube");
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

    this.renderEstadioPreviews();
  }

  handleEstadioUpload(input) {
    const files = Array.from(input.files);
    const previewContainer = document.getElementById("previewEstadios");

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.estadioImagens.push(e.target.result);
        this.renderEstadioPreviews();
      };
      reader.readAsDataURL(file);
    });
  }

  renderEstadioPreviews() {
    const container = document.getElementById("previewEstadios");
    if (!container) return;

    container.innerHTML = this.estadioImagens
      .map(
        (img, index) => `
            <div class="col-4 col-md-3">
                <div class="position-relative">
                    <img src="${img}" class="img-fluid rounded" style="height: 100px; object-fit: cover; width: 100%;">
                    <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1" 
                            onclick="adminModal.removerEstadioImage(${index})">
                        <i class="bi bi-x"></i>
                    </button>
                    ${index === 0 ? '<span class="badge bg-success position-absolute bottom-0 start-0 m-1">Principal</span>' : ""}
                </div>
            </div>
        `,
      )
      .join("");
  }

  removerEstadioImage(index) {
    this.estadioImagens.splice(index, 1);
    this.renderEstadioPreviews();
  }

  async salvar() {
    const form = document.getElementById("formClube");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const dados = {
      short_name: formData.get("short_name"),
      full_name: formData.get("full_name"),
      city: formData.get("city"),
      state: formData.get("state"),
      founded: parseInt(formData.get("founded")),
      slug: formData.get("slug"),
      site: formData.get("site"),
      typeSlug: formData.get("typeSlug"),
      status: formData.get("status"),
      uniforme: formData.get("slug"),
      anthem: {
        title:
          formData.get("anthem_title") ||
          "Hino do " + formData.get("short_name"),
        lyrics_url: formData.get("anthem_lyrics_url") || null,
        audio_url: null,
      },
    };

    const imagensExistentes = this.estadioImagens.filter(
      (img) => !img.startsWith("data:"),
    );
    const novasImagens = this.estadioImagens.filter((img) =>
      img.startsWith("data:"),
    );

    dados.estadioImagens = imagensExistentes;
    if (novasImagens.length > 0) {
      dados.novasEstadioImagens = novasImagens;
    }

    try {
      const url = this.clubeAtual
        ? `${this.API_URL}/clubes/${this.clubeAtual.slug}`
        : `${this.API_URL}/clubes`;

      const method = this.clubeAtual ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      const mensagemCommit = this.clubeAtual
        ? `✏️ Atualiza ${dados.full_name}`
        : `➕ Adiciona ${dados.full_name}`;

      await this.gitCommit(mensagemCommit);

      this.modal.hide();
      alert("✅ Clube salvo e commit realizado com sucesso!");
      location.reload();
    } catch (error) {
      alert("❌ Erro: " + error.message);
      console.error(error);
    }
  }

  async excluirClube() {
    if (!confirm("Tem certeza que deseja excluir este clube?")) return;

    try {
      const response = await fetch(
        `${this.API_URL}/clubes/${this.clubeAtual.slug}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      await this.gitCommit(`🗑️ Remove ${this.clubeAtual.full_name}`);

      this.modal.hide();
      alert("✅ Clube excluído com sucesso!");
      location.reload();
    } catch (error) {
      alert("❌ Erro: " + error.message);
    }
  }

  async gitCommit(mensagem) {
    try {
      const response = await fetch(`${this.API_URL}/git-commit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: mensagem }),
      });

      const result = await response.json();

      if (!result.success) {
        console.warn("Git commit falhou:", result.error);
      } else {
        console.log("✅ Git commit realizado:", mensagem);
      }
    } catch (error) {
      console.warn("Erro no git commit:", error.message);
    }
  }
}

let adminModal;
