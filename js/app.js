document.addEventListener("DOMContentLoaded", () => {
  renderSharedLayout();
  initNavigation();
  initHeroSlider();
  initReveal();
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
          `<li><a href="${link.href}" class="${link.id === currentPage ? "active" : ""}">${link.label}</a></li>`
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

          <ul class="nav-links">
            ${navItems}
          </ul>
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
            <p>&copy; 2026 PUSBENG. Hak cipta dilindungi.</p>
          </div>
        </div>
      </footer>
    `;
  }
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

function initReveal() {
  const revealElements = document.querySelectorAll(
    ".section, .news-card, .gallery-grid img, .feature-card, .timeline-card, .cta-band"
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
