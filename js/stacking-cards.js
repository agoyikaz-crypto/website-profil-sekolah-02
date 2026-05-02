class StackingCards {
  constructor() {
    this.cards = document.querySelectorAll('.stacking-card');
    this.gallerySection = document.querySelector('.stacking-gallery-section');
    this.galleryContainer = document.querySelector('.stacking-gallery-container');
    
    if (this.cards.length > 0) {
      this.init();
    }
  }

  init() {
    this.setupScrollAnimation();
    this.setupHoverEffects();
    this.setupResizeHandler();
  }

  setupScrollAnimation() {
    // Calculate scroll progress for each card
    window.addEventListener('scroll', () => {
      this.updateCardPositions();
    });
    
    // Initial update
    this.updateCardPositions();
  }

  updateCardPositions() {
    const scrollY = window.scrollY;
    const sectionTop = this.gallerySection.offsetTop;
    const sectionHeight = this.gallerySection.offsetHeight;
    const viewportHeight = window.innerHeight;
    
    // Calculate scroll progress within the section
    const scrollProgress = Math.max(0, Math.min(1, 
      (scrollY - sectionTop + viewportHeight) / (sectionHeight + viewportHeight)
    ));

    this.cards.forEach((card, index) => {
      const cardNumber = parseInt(card.dataset.card);
      const cardProgress = this.calculateCardProgress(scrollProgress, cardNumber, this.cards.length);
      
      this.animateCard(card, cardProgress, cardNumber);
    });
  }

  calculateCardProgress(scrollProgress, cardNumber, totalCards) {
    // Each card becomes active at different scroll positions
    const cardStart = (cardNumber - 1) / totalCards;
    const cardEnd = cardNumber / totalCards;
    
    if (scrollProgress < cardStart) {
      return 0; // Card hasn't started animating yet
    } else if (scrollProgress > cardEnd) {
      return 1; // Card is fully active
    } else {
      // Card is in transition phase
      return (scrollProgress - cardStart) / (cardEnd - cardStart);
    }
  }

  animateCard(card, progress, cardNumber) {
    // Base position and z-index for stacking
    const baseTop = 8 + (cardNumber - 1) * 4; // 8rem, 12rem, 16rem, etc.
    const baseZIndex = 6 - cardNumber; // 5, 4, 3, 2, 1
    
    // Calculate dynamic position based on scroll progress
    let currentTop = baseTop;
    let currentZIndex = baseZIndex;
    let scale = 1;
    let opacity = 1;
    
    if (progress > 0) {
      // Card is becoming active - move it to the front
      currentTop = 8 + (1 - progress) * (cardNumber - 1) * 4;
      currentZIndex = 5 + progress * 10; // Bring to front when active
      scale = 1 + progress * 0.05; // Slight scale when active
      
      // Reduce opacity of cards behind the active one
      if (progress < 0.5) {
        opacity = 0.3 + progress * 1.4; // Fade in
      } else {
        opacity = 1;
      }
    } else {
      // Card is not active yet - keep it dimmed
      opacity = 0.3;
      scale = 0.95;
    }
    
    // Apply transformations
    card.style.transform = `
      translateY(${currentTop}rem) 
      scale(${scale})
      translateZ(${progress * 20}px)
    `;
    card.style.zIndex = Math.round(currentZIndex);
    card.style.opacity = opacity;
    
    // Add shadow effect for active card
    if (progress > 0.5) {
      card.style.boxShadow = `
        0 25px 50px rgba(214, 181, 109, ${0.15 * progress}),
        0 10px 30px rgba(214, 181, 109, ${0.1 * progress})
      `;
    } else {
      card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
    }
    
    // Add active class for CSS transitions
    if (progress > 0.5) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  }

  setupHoverEffects() {
    this.cards.forEach(card => {
      card.addEventListener('mouseenter', (e) => {
        if (!card.classList.contains('active')) return;
        
        card.style.transform = card.style.transform + ' translateY(-5px) scale(1.02)';
      });
      
      card.addEventListener('mouseleave', (e) => {
        if (!card.classList.contains('active')) return;
        
        // Reset to current scroll-based position
        this.updateCardPositions();
      });
    });
  }

  setupResizeHandler() {
    window.addEventListener('resize', () => {
      this.updateCardPositions();
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new StackingCards();
});
