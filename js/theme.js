/**
 * js/theme.js – Site Interactivity for TechInsight
 * Organized using module pattern for better maintainability
 */

// App namespace to avoid polluting global scope
const TechInsight = {
  /**
   * Theme Toggle Module
   * Handles dark/light theme switching and persistence
   */
  themeManager: {
    toggleButton: null,
    
    init() {
      this.toggleButton = document.getElementById('theme-button');
      if (!this.toggleButton) return;
      
      this.loadTheme();
      this.updateThemeIcon(document.body.classList.contains('dark-theme'));
      
      this.toggleButton.addEventListener('click', () => this.toggleTheme());
      
      // Add system preference detection
      this.setupSystemPreferenceListener();
    },
    
    loadTheme() {
      // Check local storage first, then system preference
      const savedTheme = localStorage.getItem('theme');
      
      if (savedTheme) {
        document.body.classList.toggle('dark-theme', savedTheme === 'dark');
      } else {
        // Use system preference as default if no saved preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle('dark-theme', prefersDark);
        localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
      }
    },
    
    toggleTheme() {
      const isDark = document.body.classList.toggle('dark-theme');
      
      // Add a transition class for smoother theme transitions
      document.body.classList.add('theme-transition');
      setTimeout(() => document.body.classList.remove('theme-transition'), 300);
      
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      this.updateThemeIcon(isDark);
      
      // Dispatch custom event for other components to react to theme change
      window.dispatchEvent(new CustomEvent('themechange', { detail: { isDark } }));
    },
    
    updateThemeIcon(isDark) {
      if (!this.toggleButton) return;
      
      const icon = this.toggleButton.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-sun', isDark);
        icon.classList.toggle('fa-moon', !isDark);
        
        // Update aria-label for accessibility
        this.toggleButton.setAttribute('aria-label', 
          isDark ? 'Switch to light theme' : 'Switch to dark theme'
        );
      }
    },
    
    setupSystemPreferenceListener() {
      // Listen for system preference changes
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      if (darkModeMediaQuery.addEventListener) {
        darkModeMediaQuery.addEventListener('change', e => {
          // Only update if user hasn't set a preference
          if (!localStorage.getItem('theme')) {
            document.body.classList.toggle('dark-theme', e.matches);
            this.updateThemeIcon(e.matches);
          }
        });
      }
    }
  },
  
  /**
   * Navigation Module
   * Handles responsive navigation, active links, dropdowns
   */
  navigation: {
    nav: null,
    hamburger: null,
    
    init() {
      this.nav = document.querySelector('.main-header nav');
      this.hamburger = document.querySelector('.main-header .hamburger');
      
      if (!this.nav || !this.hamburger) return;
      
      this.setupMobileMenu();
      this.setupDropdowns();
      this.highlightActiveLink();
      this.handleKeyboardNavigation();
    },
    
    setupMobileMenu() {
      this.hamburger.addEventListener('click', () => {
        const expanded = this.nav.classList.toggle('responsive');
        
        // Update aria-expanded for accessibility
        this.nav.setAttribute('aria-expanded', expanded);
        this.hamburger.setAttribute('aria-expanded', expanded);
        
        // Add proper aria labels
        this.hamburger.setAttribute('aria-label', 
          expanded ? 'Close menu' : 'Open menu'
        );
        
        // Prevent body scrolling when menu is open on mobile
        document.body.style.overflow = expanded ? 'hidden' : '';
      });
      
      // Close mobile menu when clicking outside
      document.addEventListener('click', e => {
        if (this.nav.classList.contains('responsive') && 
            !this.nav.contains(e.target) && 
            !this.hamburger.contains(e.target)) {
          this.nav.classList.remove('responsive');
          this.hamburger.setAttribute('aria-expanded', 'false');
          this.nav.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    },
    
    setupDropdowns() {
      // Handle dropdown menus for both mobile and desktop
      document.querySelectorAll('.nav .dropdown > a').forEach(link => {
        // Add aria attributes for accessibility
        const submenu = link.nextElementSibling;
        if (submenu) {
          const id = `dropdown-${Math.random().toString(36).substring(2, 9)}`;
          submenu.id = id;
          link.setAttribute('aria-haspopup', 'true');
          link.setAttribute('aria-expanded', 'false');
          link.setAttribute('aria-controls', id);
          
          // Handle clicks for mobile view
          link.addEventListener('click', e => {
            // Only intercept clicks in mobile view
            if (window.innerWidth < 900) {
              e.preventDefault();
              const isOpen = submenu.classList.toggle('open');
              link.setAttribute('aria-expanded', isOpen);
            }
          });
        }
      });
      
      // Close dropdowns when clicking elsewhere
      document.addEventListener('click', e => {
        const clickedDropdown = e.target.closest('.dropdown');
        document.querySelectorAll('.nav .dropdown').forEach(dropdown => {
          if (dropdown !== clickedDropdown) {
            const link = dropdown.querySelector('a');
            const submenu = dropdown.querySelector('.dropdown__menu');
            if (submenu && submenu.classList.contains('open')) {
              submenu.classList.remove('open');
              link?.setAttribute('aria-expanded', 'false');
            }
          }
        });
      });
    },
    
    highlightActiveLink() {
      // Highlight the current page in navigation
      const currentPath = window.location.pathname;
      
      document.querySelectorAll('.nav__link').forEach(link => {
        // Get just the path portion of the href
        const linkPath = new URL(link.href, window.location.origin).pathname;
        
        // Exact match for current page
        if (linkPath === currentPath) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
          
          // If in a dropdown, also highlight parent
          const parentDropdown = link.closest('.dropdown');
          if (parentDropdown) {
            const parentLink = parentDropdown.querySelector(':scope > a');
            if (parentLink) parentLink.classList.add('active');
          }
        }
      });
    },
    
    handleKeyboardNavigation() {
      // Add keyboard navigation support
      document.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('keydown', e => {
          // Handle dropdown open/close on Enter or Space
          if ((e.key === 'Enter' || e.key === ' ') && 
              link.parentElement.classList.contains('dropdown')) {
            e.preventDefault();
            const submenu = link.nextElementSibling;
            if (submenu) {
              const isOpen = submenu.classList.toggle('open');
              link.setAttribute('aria-expanded', isOpen);
            }
          }
        });
      });
    }
  },
  
  /**
   * Form Validation Module
   * Enhanced form validation and submission handling
   */
  formManager: {
    init() {
      this.setupContactValidation();
    },
    
    setupContactValidation() {
      const form = document.getElementById('contact-form');
      if (!form) return;
      
      // Add validation classes and error messages
      const createErrorElement = (message) => {
        const error = document.createElement('div');
        error.className = 'form-error';
        error.textContent = message;
        return error;
      };
      
      // Validate email format
      const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      };
      
      // Validate non-empty field
      const validateRequired = (value) => {
        return value.trim() !== '';
      };
      
      // Handle validation for a specific input
      const validateInput = (input) => {
        let isValid = true;
        const errorElement = input.nextElementSibling?.classList.contains('form-error') 
          ? input.nextElementSibling 
          : null;
          
        // Remove existing error
        if (errorElement) errorElement.remove();
        input.classList.remove('error');
        
        // Check for required fields
        if (input.hasAttribute('required') && !validateRequired(input.value)) {
          isValid = false;
          input.classList.add('error');
          const error = createErrorElement('This field is required');
          input.insertAdjacentElement('afterend', error);
        } 
        // Check email format
        else if (input.type === 'email' && input.value && !validateEmail(input.value)) {
          isValid = false;
          input.classList.add('error');
          const error = createErrorElement('Please enter a valid email address');
          input.insertAdjacentElement('afterend', error);
        }
        
        return isValid;
      };
      
      // Real-time validation on blur
      form.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('blur', () => {
          validateInput(input);
        });
        
        // Clear errors on focus
        input.addEventListener('focus', () => {
          input.classList.remove('error');
          const errorElement = input.nextElementSibling?.classList.contains('form-error') 
            ? input.nextElementSibling 
            : null;
          if (errorElement) errorElement.remove();
        });
      });
      
      // Form submission handler
      form.addEventListener('submit', e => {
        let isFormValid = true;
        
        // Validate all inputs
        form.querySelectorAll('input, textarea, select').forEach(input => {
          if (!validateInput(input)) {
            isFormValid = false;
          }
        });
        
        if (!isFormValid) {
          e.preventDefault();
          
          // Focus the first invalid field
          const firstInvalid = form.querySelector('.error');
          if (firstInvalid) {
            firstInvalid.focus();
          }
          
          // Scroll to the first error
          const firstError = form.querySelector('.form-error');
          if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          // Optional: Show loading state
          const submitButton = form.querySelector('[type="submit"]');
          if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = 'Sending...';
          }
        }
      });
    }
  },
  
  /**
   * Accessibility Module
   * Handles accessibility enhancements
   */
  a11y: {
    init() {
      this.setupReducedMotion();
      this.enhanceKeyboardAccess();
    },
    
    setupReducedMotion() {
      // Check for reduced motion preference
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduced-motion');
      }
      
      // Listen for changes to the preference
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (reducedMotionQuery.addEventListener) {
        reducedMotionQuery.addEventListener('change', e => {
          document.body.classList.toggle('reduced-motion', e.matches);
        });
      }
    },
    
    enhanceKeyboardAccess() {
      // Add visible focus indicator for keyboard users
      document.addEventListener('keydown', e => {
        if (e.key === 'Tab') {
          document.body.classList.add('using-keyboard');
        }
      });
      
      // Remove visible focus indicator when mouse is used
      document.addEventListener('mousedown', () => {
        document.body.classList.remove('using-keyboard');
      });
    }
  },
  
  /**
   * Lazy Loading Module
   * Handles lazy loading of images for better performance
   */
  lazyLoader: {
    init() {
      // Check if Intersection Observer is supported
      if ('IntersectionObserver' in window) {
        this.setupLazyLoading();
      } else {
        // Fallback for browsers that don't support Intersection Observer
        this.loadAllImages();
      }
    },
    
    setupLazyLoading() {
      const lazyImages = document.querySelectorAll('img[data-src]');
      
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            
            // Optional: load higher resolution for larger screens
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
            }
            
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      });
      
      lazyImages.forEach(img => {
        imageObserver.observe(img);
      });
    },
    
    loadAllImages() {
      // Fallback for older browsers
      const lazyImages = document.querySelectorAll('img[data-src]');
      
      lazyImages.forEach(img => {
        img.src = img.dataset.src;
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
        }
      });
    }
  },
  
  /**
   * Analytics Module (placeholder)
   * Can be expanded to add actual analytics tracking
   */
  analytics: {
    init() {
      this.setupEventListeners();
    },
    
    setupEventListeners() {
      // Track link clicks
      document.addEventListener('click', e => {
        const link = e.target.closest('a');
        if (link && link.href) {
          this.trackEvent('Link Click', {
            href: link.href,
            text: link.textContent.trim(),
            location: 'page'
          });
        }
      });
      
      // Track form submissions
      document.addEventListener('submit', e => {
        if (e.target.tagName === 'FORM') {
          this.trackEvent('Form Submit', {
            id: e.target.id || 'unknown',
            name: e.target.getAttribute('name') || 'unknown'
          });
        }
      });
    },
    
    trackEvent(eventName, data = {}) {
      // This is a placeholder for actual analytics implementation
      // Would normally send data to Google Analytics, Matomo, etc.
      console.log(`[Analytics] ${eventName}`, data);
      
      // Example of how you might integrate with analytics services:
      // if (window.gtag) {
      //   window.gtag('event', eventName, data);
      // }
    }
  },
  
  /**
   * Initialize all modules
   */
  init() {
    // Listen for DOM ready
    document.addEventListener('DOMContentLoaded', () => {
      // Initialize all modules
      this.themeManager.init();
      this.navigation.init();
      this.formManager.init();
      this.a11y.init();
      this.lazyLoader.init();
      
      // Only initialize analytics in production
      if (window.location.hostname !== 'localhost' && 
          window.location.hostname !== '127.0.0.1') {
        this.analytics.init();
      }
      
      // Add page loaded class for transitions
      setTimeout(() => {
        document.body.classList.add('page-loaded');
      }, 100);
    });
    
    // Check for errors
    window.addEventListener('error', e => {
      console.error('[TechInsight Error]', e.message, e);
    });
  }
};

// Initialize the application
TechInsight.init();