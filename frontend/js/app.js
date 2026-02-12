class FutebolApp {
    constructor() {
        this.API_URL = 'http://localhost:3000/api';
        this.currentView = 'alfabetico';
        this.data = {};
        this.init();
    }

    async init() {
        try {
            await this.loadAlfabetico();
            await this.loadTimeline('asc');
            await this.loadEstados();
            this.switchView('alfabetico');
            this.hideLoading();
        } catch (error) {
            this.showError('Erro ao inicializar aplicação: ' + error.message);
        }
    }

    showLoading() {
        document.getElementById('loading').classList.remove('d-none');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('d-none');
    }

    showError(message) {
        document.getElementById('loading').classList.add('d-none');
        document.getElementById('error').classList.remove('d-none');
        document.getElementById('error-message').textContent = message;
    }

    switchView(viewName) {
        document.querySelectorAll('.view-section').forEach(el => {
            el.classList.add('d-none');
        });
        
        document.getElementById(`view-${viewName}`).classList.remove('d-none');
        document.querySelectorAll('.nav-link').forEach(el => {
            el.classList.remove('active');
        });
        event?.target?.classList.add('active');
        
        this.currentView = viewName;
    }

    async fetchData(endpoint) {
        const response = await fetch(`${this.API_URL}${endpoint}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }

    async loadAlfabetico() {
        try {
            const result = await this.fetchData('/clubes/alfabetico');
            this.data.alfabetico = result.data;
            this.renderAlfabetico(result.data);
            document.getElementById('count-alfabetico').textContent = 
                `${result.data.length} clube${result.data.length !== 1 ? 's' : ''}`;
        } catch (error) {
            console.error('Erro ao carregar grid alfabético:', error);
        }
    }

    renderAlfabetico(clubes) {
        const container = document.getElementById('grid-alfabetico');
        container.innerHTML = clubes.map(clube => this.createCard(clube)).join('');
    }

    createCard(clube) {
        const anoAtual = new Date().getFullYear();
        const idade = anoAtual - clube.founded;
        
        return `
            <div class="col-12 col-md-6 col-lg-4 col-xl-3">
                <div class="card clube-card h-100">
                    <div class="card-img-top position-relative">
                        ${clube.short_name}
                        <span class="badge bg-light text-dark badge-estado">
                            <i class="bi bi-geo-alt-fill me-1"></i>${clube.state}
                        </span>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title fw-bold mb-1">${clube.full_name}</h5>
                        <p class="text-muted mb-2">
                            <i class="bi bi-geo-fill me-1"></i>${clube.city}
                        </p>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="badge badge-fundacao">
                                <i class="bi bi-calendar-event me-1"></i>${clube.founded}
                            </span>
                            <small class="text-muted">${idade} anos</small>
                        </div>
                        <div class="d-flex gap-2">
                            <a href="https://${clube.site}" target="_blank" 
                               class="btn btn-success btn-sm flex-fill">
                                <i class="bi bi-globe me-1"></i>Site
                            </a>
                            <a href="${clube.anthem.lyrics_url}" target="_blank" 
                               class="btn btn-outline-secondary btn-sm">
                                <i class="bi bi-music-note-beamed"></i>
                            </a>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent border-0 pt-0">
                        <small class="text-muted">
                            <i class="bi bi-shield-check me-1"></i>${clube.status === 'active' ? 'Ativo' : 'Inativo'}
                        </small>
                    </div>
                </div>
            </div>
        `;
    }

    async loadTimeline(ordem = 'asc') {
        try {
            const result = await this.fetchData(`/clubes/timeline?ordem=${ordem}`);
            this.data.timeline = result.data;
            this.renderTimeline(result.data, ordem);
        } catch (error) {
            console.error('Erro ao carregar timeline:', error);
        }
    }

    renderTimeline(clubes, ordem) {
        const container = document.getElementById('timeline-content');
        const anoAtual = new Date().getFullYear();
        
        container.innerHTML = clubes.map((clube, index) => {
            const idade = anoAtual - clube.founded;
            const isMaisAntigo = ordem === 'asc' && index === 0;
            
            return `
                <div class="timeline-item ${isMaisAntigo ? 'mais-antigo' : ''}">
                    <div class="timeline-content">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div class="timeline-year">${clube.founded}</div>
                            <span class="badge bg-success">${idade} anos</span>
                        </div>
                        <h5 class="fw-bold mb-1">${clube.full_name}</h5>
                        <p class="text-muted mb-2">
                            <i class="bi bi-geo-alt me-1"></i>${clube.city}, ${clube.state}
                        </p>
                        <div class="d-flex gap-2 mt-3">
                            <span class="badge bg-light text-dark border">
                                <i class="bi bi-shield-fill me-1"></i>${clube.short_name}
                            </span>
                            <a href="https://${clube.site}" target="_blank" 
                               class="btn-wikipedia ms-auto">
                                <i class="bi bi-box-arrow-up-right me-1"></i>Site
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        document.querySelectorAll('#view-timeline .btn-group .btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const btnIndex = ordem === 'asc' ? 0 : 1;
        document.querySelectorAll('#view-timeline .btn-group .btn')[btnIndex].classList.add('active');
    }

    async loadEstados() {
        try {
            const result = await this.fetchData('/clubes/estados');
            this.data.estados = result.data;
            this.renderEstados(result.data);
            document.getElementById('count-estados').textContent = 
                `${result.count} estado${result.count !== 1 ? 's' : ''}`;
            
            const total = Object.values(result.data).flat().length;
            document.getElementById('total-clubes').textContent = total;
        } catch (error) {
            console.error('Erro ao carregar estados:', error);
        }
    }

    renderEstados(porEstado) {
        const container = document.getElementById('accordion-estados');
        const estadosNomes = {
            'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas',
            'BA': 'Bahia', 'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo',
            'GO': 'Goiás', 'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul',
            'MG': 'Minas Gerais', 'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná',
            'PE': 'Pernambuco', 'PI': 'Piauí', 'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte',
            'RS': 'Rio Grande do Sul', 'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina',
            'SP': 'São Paulo', 'SE': 'Sergipe', 'TO': 'Tocantins'
        };

        container.innerHTML = Object.entries(porEstado).map(([sigla, clubes], index) => {
            const nomeEstado = estadosNomes[sigla] || sigla;
            return `
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" 
                                type="button" data-bs-toggle="collapse" 
                                data-bs-target="#collapse-${sigla}">
                            <div class="estado-header">
                                <span class="estado-sigla">${sigla}</span>
                                <span class="estado-nome">${nomeEstado}</span>
                                <span class="badge bg-secondary ms-2">${clubes.length}</span>
                            </div>
                        </button>
                    </h2>
                    <div id="collapse-${sigla}" 
                         class="accordion-collapse collapse ${index === 0 ? 'show' : ''}"
                         data-bs-parent="#accordion-estados">
                        <div class="accordion-body p-0">
                            <div class="clubes-list">
                                ${clubes.map(clube => this.createMiniCard(clube)).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    createMiniCard(clube) {
        return `
            <div class="clube-mini-card">
                <div class="clube-avatar">${clube.short_name[0]}</div>
                <div class="flex-grow-1">
                    <h6 class="mb-1 fw-bold">${clube.full_name}</h6>
                    <small class="text-muted d-block">
                        <i class="bi bi-geo-alt me-1"></i>${clube.city} • 
                        <i class="bi bi-calendar me-1"></i>${clube.founded}
                    </small>
                </div>
                <a href="https://${clube.site}" target="_blank" 
                   class="btn btn-sm btn-outline-success">
                    <i class="bi bi-box-arrow-up-right"></i>
                </a>
            </div>
        `;
    }
}

const app = new FutebolApp();
