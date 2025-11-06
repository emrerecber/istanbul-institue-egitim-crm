/**
 * Enhanced Navigation System for Education CRM
 * Handles sidebar navigation, collapsible menus, and active state management
 */

// Namespace to avoid conflicts
window.CRMNavigation = window.CRMNavigation || {};

(function() {
    'use strict';
    
    let isInitialized = false;
    
    // Configuration
    const config = {
        selectors: {
            sidebar: '#sidebar',
            sidebarToggle: '#sidebarToggle',
            sidebarBackdrop: '#sidebarBackdrop',
            navCollapsible: '.nav-collapsible',
            chevron: '.chev',
            submenu: '.submenu'
        },
        classes: {
            open: 'open',
            show: 'show',
            active: 'active',
            rotated: 'fa-rotate-180'
        },
        storage: {
            menuState: 'crm_menu_state'
        }
    };
    
    // Utility functions
    const utils = {
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        saveMenuState: function(menuId, isOpen) {
            try {
                const state = JSON.parse(localStorage.getItem(config.storage.menuState) || '{}');
                state[menuId] = isOpen;
                localStorage.setItem(config.storage.menuState, JSON.stringify(state));
            } catch (e) {
                console.warn('Could not save menu state:', e);
            }
        },
        
        getMenuState: function(menuId) {
            try {
                const state = JSON.parse(localStorage.getItem(config.storage.menuState) || '{}');
                return state[menuId] || false;
            } catch (e) {
                return false;
            }
        }
    };
    
    // Sidebar management
    const sidebar = {
        elements: {},
        
        init: function() {
            this.elements = {
                sidebar: document.querySelector(config.selectors.sidebar),
                toggle: document.querySelector(config.selectors.sidebarToggle),
                backdrop: document.querySelector(config.selectors.sidebarBackdrop)
            };
            
            this.bindEvents();
        },
        
        bindEvents: function() {
            // Toggle button
            if (this.elements.toggle && this.elements.sidebar) {
                this.elements.toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggle();
                });
            }
            
            // Backdrop click
            if (this.elements.backdrop) {
                this.elements.backdrop.addEventListener('click', () => {
                    this.close();
                });
            }
            
            // ESC key to close
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen()) {
                    this.close();
                }
            });
            
            // Close on window resize if mobile
            window.addEventListener('resize', utils.debounce(() => {
                if (window.innerWidth > 992 && this.isOpen()) {
                    this.close();
                }
            }, 250));
        },
        
        toggle: function() {
            if (this.isOpen()) {
                this.close();
            } else {
                this.open();
            }
        },
        
        open: function() {
            if (this.elements.sidebar) {
                this.elements.sidebar.classList.add(config.classes.open);
            }
            if (this.elements.backdrop) {
                this.elements.backdrop.classList.add(config.classes.show);
            }
            document.body.style.overflow = 'hidden'; // Prevent body scroll
        },
        
        close: function() {
            if (this.elements.sidebar) {
                this.elements.sidebar.classList.remove(config.classes.open);
            }
            if (this.elements.backdrop) {
                this.elements.backdrop.classList.remove(config.classes.show);
            }
            document.body.style.overflow = ''; // Restore body scroll
        },
        
        isOpen: function() {
            return this.elements.sidebar && this.elements.sidebar.classList.contains(config.classes.open);
        }
    };
    
    // Collapsible menus management
    const menus = {
        init: function() {
            this.bindEvents();
            this.restoreMenuStates();
        },
        
        bindEvents: function() {
            document.querySelectorAll(config.selectors.navCollapsible).forEach(element => {
                element.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleMenu(element);
                });
            });
        },
        
        toggleMenu: function(element) {
            const target = element.getAttribute('data-target');
            const submenu = document.querySelector(target);
            const chevron = element.querySelector(config.selectors.chevron);
            
            if (!submenu) return;
            
            const isOpen = submenu.classList.contains(config.classes.open);
            const menuId = target.replace('#', '');
            
            if (isOpen) {
                this.closeMenu(submenu, chevron, menuId);
            } else {
                this.openMenu(submenu, chevron, menuId);
            }
        },
        
        openMenu: function(submenu, chevron, menuId) {
            submenu.classList.add(config.classes.open);
            if (chevron) {
                chevron.classList.add(config.classes.rotated);
            }
            utils.saveMenuState(menuId, true);
        },
        
        closeMenu: function(submenu, chevron, menuId) {
            submenu.classList.remove(config.classes.open);
            if (chevron) {
                chevron.classList.remove(config.classes.rotated);
            }
            utils.saveMenuState(menuId, false);
        },
        
        restoreMenuStates: function() {
            document.querySelectorAll(config.selectors.navCollapsible).forEach(element => {
                const target = element.getAttribute('data-target');
                const menuId = target ? target.replace('#', '') : null;
                
                if (menuId && utils.getMenuState(menuId)) {
                    const submenu = document.querySelector(target);
                    const chevron = element.querySelector(config.selectors.chevron);
                    
                    if (submenu) {
                        this.openMenu(submenu, chevron, menuId);
                    }
                }
            });
        }
    };
    
    // Active page highlighting
    const activeStates = {
        init: function() {
            this.highlightCurrentPage();
            this.expandActiveMenu();
        },
        
        highlightCurrentPage: function() {
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            
            // Remove existing active states
            document.querySelectorAll('.nav-link.active, .submenu a.active').forEach(link => {
                link.classList.remove(config.classes.active);
            });
            
            // Find and highlight current page
            const activeLink = document.querySelector(`a[href="${currentPage}"]`);
            if (activeLink) {
                activeLink.classList.add(config.classes.active);
                
                // Add visual styles for active state
                if (!activeLink.style.backgroundColor) {
                    activeLink.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                    activeLink.style.borderRadius = '0.375rem';
                    activeLink.style.color = '#2563eb';
                }
            }
        },
        
        expandActiveMenu: function() {
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            const activeLink = document.querySelector(`a[href="${currentPage}"]`);
            
            if (activeLink) {
                // Find parent submenu
                const parentSubmenu = activeLink.closest(config.selectors.submenu);
                if (parentSubmenu) {
                    const menuId = parentSubmenu.id;
                    const trigger = document.querySelector(`[data-target="#${menuId}"]`);
                    
                    if (trigger) {
                        const chevron = trigger.querySelector(config.selectors.chevron);
                        menus.openMenu(parentSubmenu, chevron, menuId);
                    }
                }
            }
        }
    };
    
    // Main initialization
    function init() {
        if (isInitialized) {
            console.warn('CRM Navigation already initialized');
            return;
        }
        
        try {
            sidebar.init();
            menus.init();
            activeStates.init();
            
            isInitialized = true;
            console.log('CRM Navigation system initialized successfully');
            
        } catch (error) {
            console.error('Error initializing CRM Navigation:', error);
        }
    }
    
    // Public API
    window.CRMNavigation = {
        init: init,
        sidebar: {
            open: () => sidebar.open(),
            close: () => sidebar.close(),
            toggle: () => sidebar.toggle(),
            isOpen: () => sidebar.isOpen()
        },
        menus: {
            openMenu: (menuId) => {
                const submenu = document.getElementById(menuId);
                const trigger = document.querySelector(`[data-target="#${menuId}"]`);
                if (submenu && trigger) {
                    const chevron = trigger.querySelector(config.selectors.chevron);
                    menus.openMenu(submenu, chevron, menuId);
                }
            },
            closeMenu: (menuId) => {
                const submenu = document.getElementById(menuId);
                const trigger = document.querySelector(`[data-target="#${menuId}"]`);
                if (submenu && trigger) {
                    const chevron = trigger.querySelector(config.selectors.chevron);
                    menus.closeMenu(submenu, chevron, menuId);
                }
            }
        }
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();

// Legacy compatibility - prevent conflicts with inline scripts
if (typeof initLegacyNavigation === 'undefined') {
    window.initLegacyNavigation = function() {
        console.log('Legacy navigation initialization skipped - using enhanced navigation');
    };
}
