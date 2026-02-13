class AbecedarioNav {
  constructor(containerId, onLetterClick) {
    this.container = document.getElementById(containerId);
    this.onLetterClick = onLetterClick;
    this.letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    this.init();
  }

  init() {
    this.render();
    this.setupScrollSpy();
    this.setupStickyBehavior();
  }

  render() {
    const html = `
            <div class="abecedario-nav">
                <div class="abecedario-scroll">
                    ${this.letras
                      .map(
                        (letra) => `
                        <button class="abecedario-letra" 
                                data-letra="${letra}" 
                                onclick="abecedarioNav.scrollToLetter('${letra}')"
                                aria-label="Ir para clubes com ${letra}">
                            ${letra}
                        </button>
                    `,
                      )
                      .join("")}
                </div>
                <button class="abecedario-top" 
                        onclick="window.scrollTo({top: 0, behavior: 'smooth'})"
                        title="Voltar ao topo"
                        aria-label="Voltar ao topo">
                    <i class="bi bi-arrow-up"></i>
                </button>
            </div>
        `;

    this.container.innerHTML = html;
  }

  scrollToLetter(letra) {
    const cards = document.querySelectorAll(".clube-card");
    let encontrado = false;

    for (const card of cards) {
      const titulo = card.querySelector(".card-title")?.textContent || "";
      const primeiraLetra = titulo.charAt(0).toUpperCase();

      if (primeiraLetra === letra) {
        card.scrollIntoView({ behavior: "smooth", block: "start" });
        card.style.transition = "all 0.3s ease";
        card.style.transform = "scale(1.02)";
        card.style.boxShadow = "0 0 20px rgba(25, 135, 84, 0.5)";

        setTimeout(() => {
          card.style.transform = "";
          card.style.boxShadow = "";
        }, 1500);

        encontrado = true;
        break;
      }
    }

    const btn = this.container.querySelector(`[data-letra="${letra}"]`);
    if (btn) {
      btn.classList.add("clicado");
      setTimeout(() => btn.classList.remove("clicado"), 300);
    }

    if (this.onLetterClick) {
      this.onLetterClick(letra, encontrado);
    }
  }

  setupScrollSpy() {
    let ticking = false;

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            this.updateActiveLetter();
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true },
    );
  }

  updateActiveLetter() {
    const cards = document.querySelectorAll(".clube-card");
    const scrollPos = window.scrollY + 200;

    let letraAtiva = null;

    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      const cardTop = rect.top + window.scrollY;

      if (cardTop <= scrollPos) {
        const titulo = card.querySelector(".card-title")?.textContent || "";
        letraAtiva = titulo.charAt(0).toUpperCase();
      }
    }

    if (letraAtiva) {
      this.container.querySelectorAll(".abecedario-letra").forEach((btn) => {
        btn.classList.toggle("ativa", btn.dataset.letra === letraAtiva);
      });
    }
  }

  setupStickyBehavior() {
    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY > 100) {
          this.container.classList.add("sticky");
        } else {
          this.container.classList.remove("sticky");
        }
      },
      { passive: true },
    );
  }

  updateAvailableLetters(clubes) {
    const letrasComClubes = new Set(
      clubes.map((c) => c.full_name.charAt(0).toUpperCase()),
    );

    this.container.querySelectorAll(".abecedario-letra").forEach((btn) => {
      const temClube = letrasComClubes.has(btn.dataset.letra);
      btn.disabled = !temClube;
      btn.classList.toggle("vazio", !temClube);
    });
  }
}

let abecedarioNav;
