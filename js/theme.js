// theme.js – Theme & Nav Interactivity

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

    // Setup contact form validation (stubbed for next step)
    setupContactValidation();
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

// Contact form validation (to be expanded next)
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

// Navbar hamburger toggle
const nav = document.querySelector('.main-header nav');
const hamburger = document.querySelector('.main-header .hamburger');
hamburger.addEventListener('click', () => {
  nav.classList.toggle('responsive');
});

// Initialize everything
document.addEventListener('DOMContentLoaded', () => themeToggle.init());
