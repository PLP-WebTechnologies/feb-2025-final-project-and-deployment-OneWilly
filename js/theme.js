// Theme Configuration
const themeToggle = {
    init() {
        this.loadTheme();
        document.getElementById('theme-button').addEventListener('click', () => this.toggleTheme());
    },
    
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.classList.toggle('dark-theme', savedTheme === 'dark');
    },
    
    toggleTheme() {
        const isDark = document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        this.updateThemeIcon(isDark);
    },
    
    updateThemeIcon(isDark) {
        const icon = document.querySelector('#theme-button i');
        icon.classList = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
};

// Initialize
themeToggle.init();
