class HorizontalScrollGallery {
  constructor() {
    this.galleryContainer = document.querySelector('.horizontal-gallery-container');
    this.scrollWrapper = document.getElementById('horizontalScrollGallery');
    this.scrollContent = this.scrollWrapper?.querySelector('.horizontal-scroll-content');
    this.panels = this.scrollContent?.querySelectorAll('.gallery-section, .gallery-panel');
    this.dots = document.querySelectorAll('.dot');
    
    // Animation properties
    this.animationId = null;
    this.currentTranslateX = 0;
    this.targetTranslateX = 0;
    
    // Gallery dimensions
    this.galleryHeight = 0;
    this.viewportHeight = 0;
    this.contentWidth = 0;
    this.maxScroll = 0;
    
    if (this.galleryContainer && this.scrollWrapper && this.scrollContent && this.panels.length > 0) {
      this.init();
    }
  }

  init() {
    this.setupDimensions();
    this.setupEventListeners();
    this.startAnimationLoop();
    this.updateActiveDot(0);
    this.updateScrollPosition();
  }

  setupDimensions() {
    this.viewportHeight = window.innerHeight;
    this.galleryHeight = this.galleryContainer.offsetHeight;
    this.contentWidth = Array.from(this.panels).reduce((total, panel) => total + panel.offsetWidth, 0);
    this.maxScroll = this.galleryHeight - this.viewportHeight;
  }

  setupEventListeners() {
    // Scroll event with throttling
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    
    // Window resize
    window.addEventListener('resize', () => {
      this.handleResize();
    });
    
    // Dot navigation
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.scrollToPanel(index));
    });
  }

  handleScroll() {
    const containerRect = this.galleryContainer.getBoundingClientRect();
    
    // Check if gallery is in view
    if (containerRect.top <= 0 && containerRect.bottom >= 0) {
      // Calculate scroll progress within the gallery
      const galleryScrollTop = Math.max(0, -containerRect.top);
      const scrollProgress = Math.min(1, galleryScrollTop / this.maxScroll);
      
      // Map vertical scroll to horizontal translation
      this.targetTranslateX = -scrollProgress * (this.contentWidth - this.viewportWidth);
      
      // Update active dot based on scroll progress
      this.updateActiveDotFromProgress(scrollProgress);
    }
  }

  startAnimationLoop() {
    const animate = () => {
      // Smooth interpolation for fluid movement
      const easing = 0.08;
      const diff = this.targetTranslateX - this.currentTranslateX;
      this.currentTranslateX += diff * easing;
      
      // Apply transform
      this.scrollContent.style.transform = `translateX(${this.currentTranslateX}px)`;
      
      // Continue animation loop
      this.animationId = requestAnimationFrame(animate);
    };
    
    animate();
  }

  scrollToPanel(index) {
    if (index < 0 || index >= this.panels.length) return;
    
    // Calculate the scroll position needed to center this panel
    const panelProgress = index / (this.panels.length - 1);
    const targetScrollTop = panelProgress * this.maxScroll;
    
    // Get current scroll position relative to gallery
    const containerRect = this.galleryContainer.getBoundingClientRect();
    const currentGalleryScrollTop = Math.max(0, -containerRect.top);
    const currentWindowScrollY = window.scrollY;
    
    // Calculate the target window scroll position
    const targetWindowScrollY = currentWindowScrollY + (targetScrollTop - currentGalleryScrollTop);
    
    // Smooth scroll to target position
    window.scrollTo({
      top: targetWindowScrollY,
      behavior: 'smooth'
    });
  }

  updateActiveDotFromProgress(progress) {
    const panelIndex = Math.round(progress * (this.panels.length - 1));
    this.updateActiveDot(panelIndex);
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

  updateScrollPosition() {
    const containerRect = this.galleryContainer.getBoundingClientRect();
    
    if (containerRect.top <= 0 && containerRect.bottom >= 0) {
      const galleryScrollTop = Math.max(0, -containerRect.top);
      const scrollProgress = Math.min(1, galleryScrollTop / this.maxScroll);
      this.targetTranslateX = -scrollProgress * (this.contentWidth - this.viewportWidth);
    }
  }

  handleResize() {
    this.setupDimensions();
    this.updateScrollPosition();
  }

  // Cleanup method
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
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
