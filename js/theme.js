// js/main.js – Site Interactivity for TechInsight

// Theme Toggle Module
const themeToggle = {
  init() {
    this.loadTheme();
    this.updateThemeIcon(document.body.classList.contains('dark-theme'));

    document
      .getElementById('theme-button')
      .addEventListener('click', () => this.toggleTheme());

    // Highlight active nav link
    document.querySelectorAll('.main-header nav ul li a').forEach(link => {
      if (link.href === window.location.href) {
        link.classList.add('active');
      }
    });

    // Setup contact form validation
    setupContactValidation();

    // Respect reduced motion setting
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.style.animation = 'none';
    }
  },

  loadTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-theme', saved === 'dark');
  },

  toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    this.updateThemeIcon(isDark);
  },

  updateThemeIcon(isDark) {
    const icon = document.querySelector('#theme-button i');
    icon.classList.toggle('fa-sun', isDark);
    icon.classList.toggle('fa-moon', !isDark);
  }
};

// Contact Form Validation Stub
function setupContactValidation() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    const email = form.email.value;
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      e.preventDefault();
      alert('Please enter a valid email address.');
    }
  });
}

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  themeToggle.init();

  const nav = document.querySelector('.main-header nav');
  const hamburger = document.querySelector('.main-header .hamburger');

  // Hamburger menu toggle
  hamburger.addEventListener('click', () => {
    const expanded = nav.classList.toggle('responsive');
    // Update aria-expanded on both nav and button for accessibility
    nav.setAttribute('aria-expanded', expanded);
    hamburger.setAttribute('aria-expanded', expanded);
  });

  // Mobile submenu toggle for "Articles"
  document.querySelectorAll('.nav li.dropdown > a').forEach(link => {
    link.addEventListener('click', e => {
      // Only intercept clicks when mobile menu is open
      if (!nav.classList.contains('responsive')) return;
      e.preventDefault();
      const submenu = link.nextElementSibling;
      const isOpen = submenu.classList.toggle('open');
      link.setAttribute('aria-expanded', isOpen);
    });
  });
});
