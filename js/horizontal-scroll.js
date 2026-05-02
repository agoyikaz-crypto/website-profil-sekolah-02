class HorizontalScrollGallery {
  constructor() {
    this.wrapper = document.getElementById('horizontalScrollGallery');
    this.content = this.wrapper?.querySelector('.horizontal-scroll-content');
    this.sections = this.wrapper?.querySelectorAll('.gallery-section');
    this.dots = document.querySelectorAll('.dot');
    this.isScrolling = false;
    this.currentSection = 0;
    this.scrollSpeed = 1.5; // Adjust for scroll speed
    this.parallaxElements = [];
    this.revealElements = [];
    
    if (this.wrapper && this.content && this.sections.length > 0) {
      this.init();
    }
  }

  init() {
    this.setupEventListeners();
    this.setupParallax();
    this.setupRevealAnimations();
    this.updateActiveDot(0);
    this.handleResize();
    
    // Set initial position
    this.scrollToSection(0, false);
    
    // Initialize museum effects
    this.initMuseumEffects();
  }

  setupParallax() {
    // Find parallax elements in each section
    this.sections.forEach((section, index) => {
      const parallaxLayers = section.querySelectorAll('.museum-parallax-layer');
      parallaxLayers.forEach(layer => {
        this.parallaxElements.push({
          element: layer,
          section: index,
          speed: layer.classList.contains('museum-parallax-bg') ? 0.5 : 
                layer.classList.contains('museum-parallax-mid') ? 0.7 : 1
        });
      });
    });
  }

  setupRevealAnimations() {
    // Find reveal elements
    this.revealElements = document.querySelectorAll('.museum-reveal');
  }

  initMuseumEffects() {
    // Add museum classes to sections
    this.sections.forEach((section, index) => {
      section.classList.add('museum-parallax-container');
      
      // Add initial states
      if (index === 0) {
        section.classList.add('active');
      } else {
        section.classList.add(index < this.currentSection ? 'prev' : 'next');
      }
    });

    // Start reveal animations for visible elements
    this.triggerRevealAnimations();
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
    
    // Update museum section states
    this.updateMuseumSectionStates(index);
    
    this.updateActiveDot(index);
    
    // Trigger reveal animations for new section
    if (animate) {
      setTimeout(() => {
        this.triggerRevealAnimations();
        this.isScrolling = false;
      }, 800);
    } else {
      this.triggerRevealAnimations();
      this.isScrolling = false;
    }
  }

  updateMuseumSectionStates(activeIndex) {
    this.sections.forEach((section, index) => {
      section.classList.remove('active', 'prev', 'next');
      
      if (index === activeIndex) {
        section.classList.add('active');
      } else if (index < activeIndex) {
        section.classList.add('prev');
      } else {
        section.classList.add('next');
      }
    });
  }

  triggerRevealAnimations() {
    const currentSection = this.sections[this.currentSection];
    const revealElements = currentSection.querySelectorAll('.museum-reveal');
    
    revealElements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('active');
      }, index * 100);
    });
  }

  updateParallax() {
    const scrollProgress = this.currentSection / (this.sections.length - 1);
    
    this.parallaxElements.forEach(({ element, speed }) => {
      const translateY = scrollProgress * 50 * speed;
      const translateX = scrollProgress * 30 * speed;
      element.style.transform = `translate(${translateX}px, ${translateY}px) translateZ(0)`;
    });
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

// Museum UI for Profile Page
class MuseumProfileUI {
  constructor() {
    this.profileContainer = document.querySelector('.profile-video-scroll');
    this.panels = document.querySelectorAll('.profile-video-panel');
    this.revealElements = document.querySelectorAll('.profile-reveal');
    
    if (this.profileContainer && this.panels.length > 0) {
      this.init();
    }
  }

  init() {
    this.setupScrollEffects();
    this.setupParallax();
    this.triggerInitialReveals();
  }

  setupScrollEffects() {
    let lastScrollY = 0;
    
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const scrollDirection = scrollY > lastScrollY ? 1 : -1;
      lastScrollY = scrollY;
      
      this.updateParallax(scrollY, scrollDirection);
      this.updateReveals(scrollY);
    });
  }

  setupParallax() {
    this.panels.forEach((panel, index) => {
      panel.style.transform = `translateZ(${index * -50}px)`;
    });
  }

  updateParallax(scrollY, direction) {
    const parallaxElements = document.querySelectorAll('.profile-parallax-bg');
    
    parallaxElements.forEach(element => {
      const speed = 0.5;
      const yPos = -(scrollY * speed);
      element.style.transform = `translateY(${yPos}px) translateZ(-100px) scale(1.2)`;
    });
  }

  updateReveals(scrollY) {
    this.revealElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight * 0.8;
      
      if (isVisible) {
        element.classList.add('active');
      }
    });
  }

  triggerInitialReveals() {
    setTimeout(() => {
      this.updateReveals(window.scrollY);
    }, 100);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new HorizontalScrollGallery();
  new MuseumProfileUI();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new HorizontalScrollGallery();
    new MuseumProfileUI();
  });
} else {
  new HorizontalScrollGallery();
  new MuseumProfileUI();
}
