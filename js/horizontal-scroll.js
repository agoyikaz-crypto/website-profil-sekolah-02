class MuseumTourHorizontalScroll {
  constructor() {
    this.galleryContainer = document.querySelector('.horizontal-gallery-container');
    this.scrollWrapper = document.getElementById('horizontalScrollGallery');
    this.scrollContent = this.scrollWrapper?.querySelector('.horizontal-scroll-content');
    this.sections = this.scrollContent?.querySelectorAll('.gallery-section');
    this.dots = document.querySelectorAll('.dot');
    
    // Performance and animation properties
    this.isScrolling = false;
    this.animationId = null;
    this.lastScrollY = 0;
    this.currentTranslateX = 0;
    this.targetTranslateX = 0;
    
    // Gallery dimensions
    this.galleryHeight = 0;
    this.viewportHeight = 0;
    this.contentWidth = 0;
    this.maxScroll = 0;
    
    if (this.galleryContainer && this.scrollWrapper && this.scrollContent && this.sections.length > 0) {
      this.init();
    }
  }

  init() {
    this.setupDimensions();
    this.setupEventListeners();
    this.startAnimationLoop();
    this.updateActiveDot(0);
    
    // Initial position
    this.updateScrollPosition();
  }

  setupDimensions() {
    this.viewportHeight = window.innerHeight;
    this.galleryHeight = this.galleryContainer.offsetHeight;
    this.contentWidth = Array.from(this.sections).reduce((total, section) => total + section.offsetWidth, 0);
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
      dot.addEventListener('click', () => this.scrollToSection(index));
    });
    
    // Touch events for mobile
    this.setupTouchEvents();
  }

  setupTouchEvents() {
    let touchStartY = 0;
    let touchEndY = 0;
    
    this.scrollWrapper.addEventListener('touchstart', (e) => {
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    this.scrollWrapper.addEventListener('touchend', (e) => {
      touchEndY = e.changedTouches[0].screenY;
      this.handleTouchSwipe(touchStartY, touchEndY);
    }, { passive: true });
  }

  handleScroll() {
    const scrollY = window.scrollY;
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
    
    this.lastScrollY = scrollY;
  }

  handleTouchSwipe(startY, endY) {
    const swipeThreshold = 50;
    const diff = startY - endY;
    
    if (Math.abs(diff) > swipeThreshold) {
      const direction = diff > 0 ? 1 : -1; // Swipe up = next, Swipe down = prev
      const currentSection = this.getCurrentSectionIndex();
      const nextSection = Math.max(0, Math.min(this.sections.length - 1, currentSection + direction));
      
      this.scrollToSection(nextSection);
    }
  }

  getCurrentSectionIndex() {
    const containerRect = this.galleryContainer.getBoundingClientRect();
    if (containerRect.top <= 0 && containerRect.bottom >= 0) {
      const galleryScrollTop = Math.max(0, -containerRect.top);
      const scrollProgress = Math.min(1, galleryScrollTop / this.maxScroll);
      return Math.round(scrollProgress * (this.sections.length - 1));
    }
    return 0;
  }

  startAnimationLoop() {
    const animate = () => {
      // Smooth interpolation for fluid movement
      const easing = 0.08; // Adjust for smoother/less smooth animation
      const diff = this.targetTranslateX - this.currentTranslateX;
      this.currentTranslateX += diff * easing;
      
      // Apply transform
      this.scrollContent.style.transform = `translateX(${this.currentTranslateX}px)`;
      
      // Continue animation loop
      this.animationId = requestAnimationFrame(animate);
    };
    
    animate();
  }

  scrollToSection(index) {
    if (index < 0 || index >= this.sections.length) return;
    
    // Calculate the scroll position needed to center this section
    const sectionProgress = index / (this.sections.length - 1);
    const targetScrollTop = sectionProgress * this.maxScroll;
    
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
    const sectionIndex = Math.round(progress * (this.sections.length - 1));
    this.updateActiveDot(sectionIndex);
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
  new MuseumTourHorizontalScroll();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new MuseumTourHorizontalScroll();
  });
} else {
  new MuseumTourHorizontalScroll();
}
