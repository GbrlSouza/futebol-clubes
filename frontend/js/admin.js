class AdminModal {
  constructor() {
    this.modal = null;
    this.clubeAtual = null;
    this.estadioImagens = [];
    this.isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    this.JSON_PATH = "data/clubes.json";
    this.clubes = [];
  }

  isAdminMode() {
    return this.isLocal;
  }

  async loadClubes() {
    try {
      const response = await fetch(this.JSON_PATH + "?t=" + Date.now());
      this.clubes = await response.json();
      return this.clubes;
    } catch (error) {
      console.error("Erro ao carregar clubes:", error);
      this.clubes = window.app?.clubes || [];
      return this.clubes;
    }
  }

  addAdminButtons() {
    if (!this.isAdminMode()) {
      console.log("Modo admin desabilitado (não é localhost)");
      return;
    }

    console.log("Modo admin ativado!");

    const navbar = document.querySelector(".navbar .container");
    const btnAdmin = document.createElement("button");

    btnAdmin.className = "btn btn-warning btn-sm ms-2";
    btnAdmin.innerHTML = '<i class="bi bi-gear-fill"></i> Admin';
    btnAdmin.onclick = () => this.openModal();
    navbar.appendChild(btnAdmin);

    document.addEventListener("click", (e) => {
      const btnEditar = e.target.closest(".btn-editar-clube");
      if (btnEditar) {
        const slug = btnEditar.dataset.slug;
        this.openModal(slug);
      }
    });

    setTimeout(() => this.addEditButtonsToCards(), 1000);
  }

  addEditButtonsToCards() {
    if (!this.isAdminMode()) return;

    document.querySelectorAll(".clube-card").forEach((card) => {
      if (card.querySelector(".btn-editar-clube")) return;

      const titulo = card.querySelector(".card-title")?.textContent;
      const clube =
        this.clubes.find((c) => c.full_name === titulo) ||
        window.app?.clubes?.find((c) => c.full_name === titito);

      if (clube) {
        const btnEditar = document.createElement("button");
        btnEditar.className =
          "btn btn-warning btn-sm btn-editar-clube position-absolute";
        btnEditar.style.cssText =
          "top: 10px; left: 10px; z-index: 10; opacity: 0; transition: opacity 0.2s;";
        btnEditar.innerHTML = '<i class="bi bi-pencil-fill"></i>';
        btnEditar.title = "Editar clube";
        btnEditar.dataset.slug = clube.slug;

        card.style.position = "relative";
        card.appendChild(btnEditar);
        card.addEventListener(
          "mouseenter",
          () => (btnEditar.style.opacity = "1"),
        );
        card.addEventListener(
          "mouseleave",
          () => (btnEditar.style.opacity = "0"),
        );
      }
    });
  }

  async openModal(slug = null) {
    await this.loadClubes();

    this.clubeAtual = slug ? this.clubes.find((c) => c.slug === slug) : null;
    this.estadioImagens = this.clubeAtual?.estadioImagens || [];

    this.createModalElement();
    this.fillForm();

    const modalEl = document.getElementById("adminModal");
    this.modal = new bootstrap.Modal(modalEl);
    this.modal.show();
  }

  createModalElement() {
    const existing = document.getElementById("adminModal");
    if (existing) existing.remove();

    const estadosOptions = window.app?.estadosNomes
      ? Object.entries(window.app.estadosNomes)
          .map(
            ([sigla, nome]) =>
              `<option value="${sigla}">${sigla} - ${nome}</option>`,
          )
          .join("")
      : `<option value="AC">AC - Acre</option>
               <option value="AL">AL - Alagoas</option>
               <option value="AP">AP - Amapá</option>
               <option value="AM">AM - Amazonas</option>
               <option value="BA">BA - Bahia</option>
               <option value="CE">CE - Ceará</option>
               <option value="DF">DF - Distrito Federal</option>
               <option value="ES">ES - Espírito Santo</option>
               <option value="GO">GO - Goiás</option>
               <option value="MA">MA - Maranhão</option>
               <option value="MT">MT - Mato Grosso</option>
               <option value="MS">MS - Mato Grosso do Sul</option>
               <option value="MG">MG - Minas Gerais</option>
               <option value="PA">PA - Pará</option>
               <option value="PB">PB - Paraíba</option>
               <option value="PR">PR - Paraná</option>
               <option value="PE">PE - Pernambuco</option>
               <option value="PI">PI - Piauí</option>
               <option value="RJ">RJ - Rio de Janeiro</option>
               <option value="RN">RN - Rio Grande do Norte</option>
               <option value="RS">RS - Rio Grande do Sul</option>
               <option value="RO">RO - Rondônia</option>
               <option value="RR">RR - Roraima</option>
               <option value="SC">SC - Santa Catarina</option>
               <option value="SP">SP - São Paulo</option>
               <option value="SE">SE - Sergipe</option>
               <option value="TO">TO - Tocantins</option>`;

    const modalHTML = `
            <div class="modal fade" id="adminModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">
                                <i class="bi bi-${this.clubeAtual ? "pencil" : "plus-circle"} me-2"></i>
                                ${this.clubeAtual ? "Editar" : "Novo"} Clube
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fechar"></button>
                        </div>
                        <div class="modal-body">
                            <form id="formClube" onsubmit="event.preventDefault(); adminModal.salvar();">
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
                                            ${estadosOptions}
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
                                        URLs das Fotos do Estádio (uma por linha)
                                    </label>
                                    <textarea class="form-control" id="estadioUrls" rows="3" 
                                              placeholder="https://exemplo.com/estadio1.jpg&#10;https://exemplo.com/estadio2.jpg"
                                              onchange="adminModal.parseEstadioUrls(this.value)"></textarea>
                                    <div class="form-text">Cole as URLs das imagens, uma por linha. Serão usadas como background no grid.</div>
                                    
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

  parseEstadioUrls(urlsText) {
    this.estadioImagens = urlsText
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);
    this.renderEstadioPreviews();
  }

  fillForm() {
    if (!this.clubeAtual) {
      document.getElementById("estadioUrls").value = "";
      this.renderEstadioPreviews();
      return;
    }

    const form = document.getElementById("formClube");
    if (!form) return;

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
    this.renderEstadioPreviews();
  }

  renderEstadioPreviews() {
    const container = document.getElementById("previewEstadios");
    if (!container) return;

    if (this.estadioImagens.length === 0) {
      container.innerHTML =
        '<div class="col-12 text-muted small">Nenhuma imagem adicionada</div>';
      return;
    }

    container.innerHTML = this.estadioImagens
      .map(
        (url, index) => `
            <div class="col-4 col-md-3">
                <div class="position-relative">
                    <img src="${url}" class="img-fluid rounded" 
                         style="height: 100px; object-fit: cover; width: 100%;"
                         onerror="this.src='https://via.placeholder.com/150?text=Erro'">
                    ${index === 0 ? '<span class="badge bg-success position-absolute bottom-0 start-0 m-1">Principal</span>' : ""}
                </div>
            </div>
        `,
      )
      .join("");
  }

  async salvar() {
    const form = document.getElementById("formClube");
    if (!form || !form.checkValidity()) {
      form?.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const novoClube = {
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
      wikipedia_page: formData.get("full_name"),
      anthem: {
        title:
          formData.get("anthem_title") ||
          "Hino do " + formData.get("short_name"),
        lyrics_url: formData.get("anthem_lyrics_url") || null,
        audio_url: null,
      },
      estadioImagens: this.estadioImagens.filter((url) => url.length > 0),
    };

    if (this.clubeAtual) {
      const index = this.clubes.findIndex(
        (c) => c.slug === this.clubeAtual.slug,
      );
      if (index !== -1) {
        this.clubes[index] = { ...this.clubes[index], ...novoClube };
      }
    } else {
      if (this.clubes.find((c) => c.slug === novoClube.slug)) {
        alert("❌ Erro: Já existe um clube com este slug!");
        return;
      }
      this.clubes.push(novoClube);
    }

    this.downloadJSON();
    this.modal?.hide();
    alert(
      "✅ Clube salvo! O arquivo JSON foi baixado. Substitua o arquivo data/clubes.json e faça commit.",
    );
  }

  excluirClube() {
    if (!this.clubeAtual) return;

    if (
      !confirm(`Tem certeza que deseja excluir "${this.clubeAtual.full_name}"?`)
    )
      return;

    const index = this.clubes.findIndex((c) => c.slug === this.clubeAtual.slug);
    if (index !== -1) {
      this.clubes.splice(index, 1);
      this.downloadJSON();
      this.modal?.hide();
      alert(
        "✅ Clube excluído! O arquivo JSON foi baixado. Substitua o arquivo data/clubes.json e faça commit.",
      );
    }
  }

  downloadJSON() {
    const dataStr = JSON.stringify(this.clubes, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(dataBlob);
    link.download = "clubes.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("📥 JSON baixado:", this.clubes.length, "clubes");
  }
}

let adminModal;
