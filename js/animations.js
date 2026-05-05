document.addEventListener("DOMContentLoaded", function () {
  // REGISTER GSAP SCROLLTRIGGER PLUGIN
  gsap.registerPlugin(ScrollTrigger);

  // LENIS SMOOTH SCROLL
  const lenis = new Lenis();

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // GSAP ANIMATIONS
  gsap.utils.toArray(".section, .card, .feature-card, .news-card").forEach((el) => {
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
      },
    });
  });
});
