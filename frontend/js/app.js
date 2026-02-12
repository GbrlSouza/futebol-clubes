class FutebolApp {
    constructor() {
        this.isLocal = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
        this.JSON_URL = 'data/clubes.json';
        this.IMAGES_PATH = 'images/escudos/';
        this.currentView = 'alfabetico';
        this.data = {};
        this.clubes = [];
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.renderAlfabetico();
            this.renderTimeline('asc');
            this.renderEstados();
            this.switchView('alfabetico');
            this.hideLoading();
            this.setupImageErrorHandling();
        } catch (error) {
            this.showError('Erro ao inicializar aplicação: ' + error.message);
            console.error('Stack:', error);
        }
    }

    async loadData() {
        try {
            const response = await fetch(this.JSON_URL);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            this.clubes = await response.json();
            this.clubes = this.clubes.map(clube => this.sanitizeClube(clube));
            
            console.log(`✅ ${this.clubes.length} clubes carregados`);
        } catch (error) {
            throw new Error('Não foi possível carregar os dados: ' + error.message);
        }
    }

    sanitizeClube(clube) {
        return {
            short_name: clube.short_name || 'N/A',
            full_name: clube.full_name || clube.short_name || 'Nome não informado',
            city: clube.city || 'Cidade não informada',
            state: clube.state || 'UF',
            founded: clube.founded || 1900,
            status: clube.status || 'active',
            slug: clube.slug || clube.short_name || 'placeholder',
            typeSlug: clube.typeSlug || '.png',
            site: clube.site || '#',
            uniforme: clube.uniforme || clube.slug || 'default',
            anthem: {
                title: clube.anthem?.title || 'Hino não informado',
                lyrics_url: clube.anthem?.lyrics_url || null,
                audio_url: clube.anthem?.audio_url || null
            }
        };
    }

    getAlfabetico() {
        return [...this.clubes].sort((a, b) => 
            a.short_name.localeCompare(b.short_name, 'pt-BR')
        );
    }

    getTimeline(ordem = 'asc') {
        return [...this.clubes].sort((a, b) => {
            return ordem === 'desc' ? b.founded - a.founded : a.founded - b.founded;
        });
    }

    getPorEstado() {
        const porEstado = this.clubes.reduce((acc, clube) => {
            const estado = clube.state;
            if (!acc[estado]) acc[estado] = [];
            acc[estado].push(clube);
            return acc;
        }, {});
        
        const resultado = {};
        Object.keys(porEstado).sort().forEach(estado => {
            resultado[estado] = porEstado[estado].sort((a, b) => 
                a.short_name.localeCompare(b.short_name, 'pt-BR')
            );
        });
        return resultado;
    }

    getEscudoUrl(clube) {
        if (!clube.slug || !clube.typeSlug) {
            return null;
        }
        return `${this.IMAGES_PATH}${clube.slug}${clube.typeSlug}`;
    }

    renderEscudo(clube, size = 'normal') {
        const url = this.getEscudoUrl(clube);
        const alt = `Escudo ${clube.full_name}`;
        
        const sizes = {
            small: { class: 'escudo-small' },
            normal: { class: 'escudo-normal' },
            large: { class: 'escudo-large' }
        };
        
        const sizeConfig = sizes[size] || sizes.normal;
    
        if (!url) {
            return this.renderPlaceholder(clube, size);
        }
        
        return `
            <div class="escudo-container ${sizeConfig.class}" 
                 data-escudo="true"
                 data-clube="${this.escapeHtml(clube.short_name)}" 
                 data-size="${size}">
                <img src="${url}" 
                     alt="${this.escapeHtml(alt)}" 
                     loading="lazy"
                     data-has-fallback="true">
            </div>
        `;
    }

    escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    renderPlaceholder(clube, size = 'normal') {
        const initials = clube.short_name.substring(0, 2).toUpperCase();
        const colors = this.generateColors(clube.short_name);
        
        return `
            <div class="escudo-placeholder ${size}" 
                 style="background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);">
                <span>${initials}</span>
            </div>
        `;
    }

    generateColors(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const hue1 = Math.abs(hash % 360);
        const hue2 = (hue1 + 30) % 360;
        
        return {
            primary: `hsl(${hue1}, 70%, 40%)`,
            secondary: `hsl(${hue2}, 70%, 30%)`
        };
    }

    setupImageErrorHandling() {
        document.addEventListener('error', (e) => {
            const img = e.target;
            if (img.tagName === 'IMG' && img.dataset.hasFallback === 'true') {
                e.preventDefault();
                const container = img.closest('[data-escudo="true"]');
                if (container) {
                    const clubeShort = container.dataset.clube;
                    const size = container.dataset.size || 'normal';
                    const clube = this.clubes.find(c => c.short_name === clubeShort);
                    if (clube) {
                        container.innerHTML = this.renderPlaceholder(clube, size);
                    }
                }
            }
        }, true);
    }

    renderAlfabetico() {
        const clubes = this.getAlfabetico();
        const container = document.getElementById('grid-alfabetico');
        container.innerHTML = clubes.map(clube => this.createCard(clube)).join('');
        document.getElementById('count-alfabetico').textContent = 
            `${clubes.length} clube${clubes.length !== 1 ? 's' : ''}`;
    }

    createCard(clube) {
        const anoAtual = new Date().getFullYear();
        const idade = anoAtual - clube.founded;
        const hasLyrics = clube.anthem.lyrics_url && clube.anthem.lyrics_url !== '#';
        const hasSite = clube.site && clube.site !== '#';
        
        return `
            <div class="col-12 col-md-6 col-lg-4 col-xl-3">
                <div class="card clube-card h-100">
                    <div class="card-img-top escudo-header">
                        ${this.renderEscudo(clube, 'normal')}
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
                            ${hasSite ? `
                                <a href="https://${clube.site}" target="_blank" 
                                   class="btn btn-success btn-sm flex-fill">
                                    <i class="bi bi-globe me-1"></i>Site
                                </a>
                            ` : `
                                <button class="btn btn-secondary btn-sm flex-fill" disabled>
                                    <i class="bi bi-globe me-1"></i>Site
                                </button>
                            `}
                            ${hasLyrics ? `
                                <a href="${clube.anthem.lyrics_url}" target="_blank" 
                                   class="btn btn-outline-secondary btn-sm" title="Hino">
                                    <i class="bi bi-music-note-beamed"></i>
                                </a>
                            ` : `
                                <button class="btn btn-outline-secondary btn-sm" disabled title="Hino não disponível">
                                    <i class="bi bi-music-note-beamed"></i>
                                </button>
                            `}
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

    renderTimeline(ordem = 'asc') {
        const clubes = this.getTimeline(ordem);
        const container = document.getElementById('timeline-content');
        const anoAtual = new Date().getFullYear();
        
        container.innerHTML = clubes.map((clube, index) => {
            const idade = anoAtual - clube.founded;
            const isMaisAntigo = ordem === 'asc' && index === 0;
            const hasSite = clube.site && clube.site !== '#';
            
            return `
                <div class="timeline-item ${isMaisAntigo ? 'mais-antigo' : ''}">
                    <div class="timeline-content">
                        <div class="d-flex align-items-start gap-3">
                            ${this.renderEscudo(clube, 'small')}
                            <div class="flex-grow-1">
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
                                    ${hasSite ? `
                                        <a href="https://${clube.site}" target="_blank" 
                                           class="btn-wikipedia ms-auto">
                                            <i class="bi bi-box-arrow-up-right me-1"></i>Site
                                        </a>
                                    ` : '<span class="text-muted ms-auto small">Site indisponível</span>'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        document.querySelectorAll('#view-timeline .btn-group .btn').forEach((btn, idx) => {
            btn.classList.toggle('active', 
                (ordem === 'asc' && idx === 0) || (ordem === 'desc' && idx === 1)
            );
        });
    }

    renderEstados() {
        const porEstado = this.getPorEstado();
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

        document.getElementById('count-estados').textContent = 
            `${Object.keys(porEstado).length} estado${Object.keys(porEstado).length !== 1 ? 's' : ''}`;
        document.getElementById('total-clubes').textContent = this.clubes.length;
    }

    createMiniCard(clube) {
        const hasSite = clube.site && clube.site !== '#';
        
        return `
            <div class="clube-mini-card">
                ${this.renderEscudo(clube, 'small')}
                <div class="flex-grow-1">
                    <h6 class="mb-1 fw-bold">${clube.full_name}</h6>
                    <small class="text-muted d-block">
                        <i class="bi bi-geo-alt me-1"></i>${clube.city} • 
                        <i class="bi bi-calendar me-1"></i>${clube.founded}
                    </small>
                </div>
                ${hasSite ? `
                    <a href="https://${clube.site}" target="_blank" 
                       class="btn btn-sm btn-outline-success">
                        <i class="bi bi-box-arrow-up-right"></i>
                    </a>
                ` : '<span class="text-muted small">-</span>'}
            </div>
        `;
    }

    switchView(viewName) {
        document.querySelectorAll('.view-section').forEach(el => el.classList.add('d-none'));
        document.getElementById(`view-${viewName}`).classList.remove('d-none');
        document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
        if (event?.target) event.target.classList.add('active');
        this.currentView = viewName;
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
        console.error(message);
    }

    loadTimeline(ordem) {
        this.renderTimeline(ordem);
    }
}

const app = new FutebolApp();
