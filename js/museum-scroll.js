class MuseumGallery {
  constructor() {
    this.cards = document.querySelectorAll('.museum-card');
    this.gallerySection = document.querySelector('.museum-gallery-section');
    
    if (this.cards.length > 0) {
      this.init();
    }
  }

  init() {
    this.setupScrollTrigger();
    this.setupHoverEffects();
  }

  setupScrollTrigger() {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
      threshold: [0, 0.25, 0.5, 0.75, 1]
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const card = entry.target;
        const progress = entry.intersectionRatio;
        
        if (entry.isIntersecting) {
          card.classList.add('in-view');
          this.animateCardReveal(card, progress);
        } else {
          card.classList.remove('in-view');
        }
      });
    }, observerOptions);

    this.cards.forEach(card => observer.observe(card));
  }

  setupHoverEffects() {
    this.cards.forEach(card => {
      card.addEventListener('mouseenter', () => this.handleCardHover(card, true));
      card.addEventListener('mouseleave', () => this.handleCardHover(card, false));
      card.addEventListener('mousemove', (e) => this.handleMouseMove(e, card));
    });
  }

  handleCardHover(card, isHovering) {
    if (isHovering) {
      card.style.transform = 'translateY(-5px) translateZ(20px) scale(1.02)';
    } else {
      card.style.transform = 'translateY(0) translateZ(0) scale(1)';
    }
  }

  handleMouseMove(e, card) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const rotateX = (y / rect.height) * 10;
    const rotateY = (x / rect.width) * -10;
    
    card.style.transform = `translateY(-5px) translateZ(20px) scale(1.02) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  animateCardReveal(card, progress) {
    const delay = Array.from(this.cards).indexOf(card) * 0.2;
    
    // Animate number
    const number = card.querySelector('.museum-card-number');
    if (number) {
      setTimeout(() => {
        number.style.opacity = '1';
        number.style.transform = 'translateY(0)';
      }, delay * 100);
    }

    // Animate title
    const title = card.querySelector('.museum-card-title');
    if (title) {
      setTimeout(() => {
        title.style.opacity = '1';
        title.style.transform = 'translateY(0)';
      }, (delay * 100 + 200));
    }

    // Animate description
    const description = card.querySelector('.museum-card-description');
    if (description) {
      setTimeout(() => {
        description.style.opacity = '1';
        description.style.transform = 'translateY(0)';
      }, (delay * 100 + 400));
    }

    // Animate features
    const features = card.querySelector('.museum-card-features');
    if (features) {
      setTimeout(() => {
        features.style.opacity = '1';
        features.style.transform = 'translateY(0)';
      }, (delay * 100 + 600));
    }

    // Final card animation
    setTimeout(() => {
      card.style.transform = 'translateY(0) translateZ(0) scale(1)';
    }, delay * 100 + 800);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new MuseumGallery();
});
