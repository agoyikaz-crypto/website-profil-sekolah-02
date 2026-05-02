class HorizontalScrollGallery {
  constructor() {
    this.wrapper = document.getElementById('horizontalScrollGallery');
    this.content = this.wrapper?.querySelector('.horizontal-scroll-content');
    this.sections = this.wrapper?.querySelectorAll('.gallery-section');
    this.dots = document.querySelectorAll('.dot');
    this.isScrolling = false;
    this.currentSection = 0;
    this.scrollSpeed = 1.5; // Adjust for scroll speed
    
    if (this.wrapper && this.content && this.sections.length > 0) {
      this.init();
    }
  }

  init() {
    this.setupEventListeners();
    this.updateActiveDot(0);
    this.handleResize();
    
    // Set initial position
    this.scrollToSection(0, false);
  }

  setupEventListeners() {
    // Wheel event for vertical to horizontal scroll conversion
    this.wrapper.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
    
    // Touch events for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    this.wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    this.wrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe(touchStartX, touchEndX);
    }, { passive: true });
    
    // Dot navigation
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.scrollToSection(index));
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    
    // Window resize
    window.addEventListener('resize', () => this.handleResize());
    
    // Intersection Observer for auto-scroll indicators
    this.setupIntersectionObserver();
  }

  handleWheel(e) {
    if (this.isScrolling) return;
    
    e.preventDefault();
    
    const delta = e.deltaY;
    const direction = delta > 0 ? 1 : -1;
    
    const nextSection = this.currentSection + direction;
    
    if (nextSection >= 0 && nextSection < this.sections.length) {
      this.scrollToSection(nextSection);
    }
  }

  handleSwipe(startX, endX) {
    const swipeThreshold = 50;
    const diff = startX - endX;
    
    if (Math.abs(diff) > swipeThreshold) {
      const direction = diff > 0 ? 1 : -1;
      const nextSection = this.currentSection + direction;
      
      if (nextSection >= 0 && nextSection < this.sections.length) {
        this.scrollToSection(nextSection);
      }
    }
  }

  handleKeyboard(e) {
    if (e.key === 'ArrowLeft' && this.currentSection > 0) {
      this.scrollToSection(this.currentSection - 1);
    } else if (e.key === 'ArrowRight' && this.currentSection < this.sections.length - 1) {
      this.scrollToSection(this.currentSection + 1);
    }
  }

  scrollToSection(index, animate = true) {
    if (index < 0 || index >= this.sections.length || this.isScrolling) return;
    
    this.isScrolling = true;
    this.currentSection = index;
    
    const sectionWidth = this.sections[0].offsetWidth;
    const offset = -index * sectionWidth;
    
    if (animate) {
      this.content.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    } else {
      this.content.style.transition = 'none';
    }
    
    this.content.style.transform = `translateX(${offset}px)`;
    
    this.updateActiveDot(index);
    
    // Reset scrolling flag after animation
    if (animate) {
      setTimeout(() => {
        this.isScrolling = false;
      }, 800);
    } else {
      this.isScrolling = false;
    }
  }

  updateActiveDot(index) {
    this.dots.forEach((dot, i) => {
      if (i === index) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  handleResize() {
    // Recalculate section widths on resize
    const sectionWidth = this.sections[0]?.offsetWidth || window.innerWidth;
    const offset = -this.currentSection * sectionWidth;
    this.content.style.transform = `translateX(${offset}px)`;
  }

  setupIntersectionObserver() {
    const options = {
      root: this.wrapper,
      rootMargin: '0px',
      threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionIndex = Array.from(this.sections).indexOf(entry.target);
          if (sectionIndex !== -1) {
            this.currentSection = sectionIndex;
            this.updateActiveDot(sectionIndex);
          }
        }
      });
    }, options);
    
    this.sections.forEach(section => observer.observe(section));
  }

  // Public method for external control
  goToSection(sectionName) {
    const section = this.wrapper.querySelector(`[data-section="${sectionName}"]`);
    if (section) {
      const index = Array.from(this.sections).indexOf(section);
      this.scrollToSection(index);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new HorizontalScrollGallery();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new HorizontalScrollGallery();
  });
} else {
  new HorizontalScrollGallery();
}
