document.addEventListener("DOMContentLoaded", () => {
  renderSharedLayout();
  enhanceEditorialHeadlines();
  enhanceImageFrames();
  enhanceScrollCues();
  initNavigation();
  initHeroSlider();
  initParallax();
  initStickySectionStack();
  initReveal();
  initPageTransitions();
});

function renderSharedLayout() {
  const body = document.body;
  const root = body.dataset.root || ".";
  const currentPage = body.dataset.page || "home";
  const links = [
    { id: "home", label: "Beranda", href: `${root}/index.html` },
    { id: "profil", label: "Profil Sekolah", href: `${root}/pages/profil-sekolah.html` },
    { id: "kurikulum", label: "Kurikulum", href: `${root}/pages/kurikulum.html` },
    { id: "ekstrakurikuler", label: "Ekstrakurikuler", href: `${root}/pages/ekstrakurikuler.html` },
    { id: "ppdb", label: "PPDB", href: `${root}/pages/ppdb.html` },
    { id: "pembayaran", label: "Pembayaran", href: `${root}/pages/pembayaran.html` },
    { id: "kontak", label: "Kontak", href: `${root}/pages/kontak.html` }
  ];

  const navbarTarget = document.querySelector('[data-include="navbar"]');
  const footerTarget = document.querySelector('[data-include="footer"]');

  if (navbarTarget) {
    const navItems = links
      .map(
        (link) =>
          `<li><a href="${link.href}" class="${link.id === currentPage ? "active" : ""}"><span class="nav-link-text" data-text="${link.label}">${link.label}</span></a></li>`
      )
      .join("");

    navbarTarget.innerHTML = `
      <header class="header">
        <nav class="navbar">
          <a href="${root}/index.html" class="logo" aria-label="PUSBENG">
            <span class="logo-mark">PB</span>
            <span class="logo-text">PUSBENG</span>
          </a>

          <button class="menu-toggle" aria-label="Buka navigasi" aria-expanded="false" type="button">
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div class="nav-utilities" aria-label="Utilitas cepat">
            <div class="language-toggle" aria-label="Pilihan bahasa">
              <a href="#" aria-label="English">EN</a>
              <span aria-hidden="true">/</span>
              <a href="#" aria-label="Nederlands">NL</a>
            </div>
            <a href="https://wa.me/62215551234" class="nav-whatsapp" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91a9.86 9.86 0 0 0-2.91-7.01Zm-7 15.24h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.39c0-4.54 3.69-8.24 8.24-8.24a8.2 8.2 0 0 1 5.82 2.42 8.17 8.17 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.96-.14.16-.29.18-.54.06-.25-.12-1.04-.38-1.98-1.21-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.39 1.01 2.56.12.16 1.75 2.67 4.25 3.75.59.25 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.1-.22-.16-.47-.29Z"></path>
              </svg>
            </a>
          </div>

          <ul class="nav-links">
            ${navItems}
          </ul>

          <div class="nav-actions" aria-label="Aksi cepat">
            <a href="${root}/pages/ppdb.html" class="nav-cta">
              <span>Daftar PPDB</span>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M5 12h12.2l-4.6-4.6L14 6l7 7-7 7-1.4-1.4 4.6-4.6H5v-2Z"></path>
              </svg>
            </a>
          </div>
        </nav>
      </header>
    `;
  }

  if (footerTarget) {
    const footerLinks = links
      .map((link) => `<li><a href="${link.href}">${link.label}</a></li>`)
      .join("");

    footerTarget.innerHTML = `
      <footer class="footer">
        <div class="footer-content">
          <div>
            <h3>PUSBENG</h3>
            <p>Unggul dalam akademik, karakter, dan kebersamaan.</p>
            <p>Website sekolah dengan struktur multi-halaman yang lebih profesional dan mudah diakses.</p>
          </div>
          <div>
            <h4>Navigasi</h4>
            <ul class="footer-links">
              ${footerLinks}
            </ul>
          </div>
          <div>
            <h4>Kontak</h4>
            <p>Email: info@blueridgehs.edu</p>
            <p>Telepon: +62 21 555 1234</p>
            <p>Jl. Aria Putra No.9, Ciputat, Tangerang Selatan</p>
            <div class="footer-social" aria-label="Tautan sosial sekolah">
              <a href="${root}/pages/kontak.html">WhatsApp</a>
              <a href="${root}/pages/kontak.html">Instagram</a>
              <a href="${root}/pages/kontak.html">Email</a>
            </div>
            <p>&copy; 2026 PUSBENG. Hak cipta dilindungi.</p>
          </div>
        </div>
      </footer>
    `;
  }
}

function enhanceEditorialHeadlines() {
  const headlineElements = document.querySelectorAll(".hero h1, .page-hero h1, .section-title");

  headlineElements.forEach((headline) => {
    if (headline.querySelector(".headline-accent")) {
      return;
    }

    const text = headline.textContent.trim();
    const words = text.split(/\s+/);

    if (words.length < 2) {
      return;
    }

    const accentIndex = words.length > 3 ? words.length - 1 : 0;
    headline.textContent = "";

    words.forEach((word, index) => {
      if (index > 0) {
        headline.append(" ");
      }

      if (index === accentIndex) {
        const accent = document.createElement("span");
        accent.className = "headline-accent";
        accent.textContent = word;
        headline.append(accent);
      } else {
        headline.append(word);
      }
    });
  });
}

function enhanceImageFrames() {
  const galleryImages = document.querySelectorAll(".gallery-grid > img");
  const storyImages = document.querySelectorAll(".news-card > img");

  galleryImages.forEach((image) => wrapImage(image, "art-frame"));
  storyImages.forEach((image) => wrapImage(image, "story-frame"));
}

function wrapImage(image, className) {
  if (!image || image.parentElement.classList.contains(className)) {
    return;
  }

  const frame = document.createElement("div");
  frame.className = className;
  image.parentNode.insertBefore(frame, image);
  frame.appendChild(image);
}

function enhanceScrollCues() {
  const cueTargets = document.querySelectorAll(".hero, .page-hero, .section");

  cueTargets.forEach((target) => {
    if (target.querySelector(".scroll-cue")) {
      return;
    }

    const cue = document.createElement("div");
    cue.className = "scroll-cue";
    cue.setAttribute("aria-hidden", "true");
    cue.innerHTML = "<span></span><span></span><span></span>";
    target.appendChild(cue);
  });
}

function initNavigation() {
  const header = document.querySelector(".header");
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const navItems = document.querySelectorAll(".nav-links a");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("active");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navItems.forEach((item) => {
      item.addEventListener("click", () => {
        navLinks.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function updateHeaderState() {
    if (!header) {
      return;
    }

    header.classList.toggle("scrolled", window.scrollY > 24);
  }

  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState);
}

function initHeroSlider() {
  const heroSlides = document.querySelectorAll(".hero-slide");
  const heroDots = document.querySelectorAll(".hero-dot");

  if (!heroSlides.length || !heroDots.length) {
    return;
  }

  let currentSlide = 0;

  function showSlide(index) {
    heroSlides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === index);
    });

    heroDots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === index);
    });

    currentSlide = index;
  }

  heroDots.forEach((dot, index) => {
    dot.addEventListener("click", () => showSlide(index));
  });

  window.setInterval(() => {
    const nextSlide = (currentSlide + 1) % heroSlides.length;
    showSlide(nextSlide);
  }, 5000);
}

function initParallax() {
  const parallaxTargets = document.querySelectorAll(".hero-slide, .page-hero");

  if (!parallaxTargets.length) {
    return;
  }

  function updateParallax() {
    const offset = Math.min(window.scrollY * 0.08, 42);
    document.documentElement.style.setProperty("--parallax-y", `${offset}px`);
  }

  updateParallax();
  window.addEventListener("scroll", updateParallax, { passive: true });
}

function initStickySectionStack() {
  const panels = Array.from(document.querySelectorAll(".sticky-stack-panel"));

  if (!panels.length) {
    return;
  }

  function updateStackState() {
    let activeIndex = -1;

    panels.forEach((panel, index) => {
      const rect = panel.getBoundingClientRect();
      const stickyTop = Number.parseFloat(window.getComputedStyle(panel).top) || 0;

      if (rect.top <= stickyTop + 2) {
        activeIndex = index;
      }
    });

    panels.forEach((panel, index) => {
      panel.classList.toggle("is-active", index === activeIndex);
      panel.classList.toggle("is-covered", index < activeIndex);
    });
  }

  updateStackState();
  window.addEventListener("scroll", updateStackState, { passive: true });
  window.addEventListener("resize", updateStackState);
}

function initReveal() {
  const revealElements = document.querySelectorAll(
    ".section, .section-heading, .hero-panel, .page-hero-panel, .news-card, .art-frame, .story-frame, .feature-card, .timeline-card, .info-panel, .contact-card, .ppdb-side-card, .ppdb-form-card, .sticky-stack-panel, .cta-band, .footer-content > div"
  );

  if (!revealElements.length) {
    return;
  }

  revealElements.forEach((element) => element.classList.add("reveal"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15
    }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function initPageTransitions() {
  const localLinks = document.querySelectorAll('a[href]:not([target="_blank"])');

  localLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      const targetUrl = new URL(href, window.location.href);

      if (targetUrl.origin !== window.location.origin || targetUrl.href === window.location.href) {
        return;
      }

      event.preventDefault();
      document.body.classList.add("is-leaving");
      window.setTimeout(() => {
        window.location.href = targetUrl.href;
      }, 220);
    });
  });
}
