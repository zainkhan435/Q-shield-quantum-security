/**
 * Q-SHIELD Common Utilities, Theme Management & Toast Notifications
 */

// Theme Management
function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
        localStorage.setItem('qshield_theme', theme);
    } catch (e) {
        console.warn('Could not save theme to localStorage:', e);
    }
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}

function toggleTheme() {
    const current = getCurrentTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
}

// Listen for system theme changes if user has no saved preference
try {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
        try {
            if (!localStorage.getItem('qshield_theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        } catch (err) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
} catch (e) {}

// Global Exposure
window.toggleTheme = toggleTheme;
window.setTheme = setTheme;
window.getCurrentTheme = getCurrentTheme;

// Toast Notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
        iconSvg = '<svg viewBox="0 0 24 24" width="18" height="18" stroke="var(--success, #22D3EE)" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'error') {
        iconSvg = '<svg viewBox="0 0 24 24" width="18" height="18" stroke="var(--danger, #F43F5E)" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    } else {
        iconSvg = '<svg viewBox="0 0 24 24" width="18" height="18" stroke="var(--accent, #3B82F6)" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }
    
    toast.innerHTML = `
        ${iconSvg}
        <span class="toast-msg">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

async function handleLogout() {
    try {
        const res = await fetch('/api/logout', { method: 'POST' });
        const data = await res.json();
        window.location.href = data.redirect || '/login';
    } catch (e) {
        window.location.href = '/login';
    }
}

