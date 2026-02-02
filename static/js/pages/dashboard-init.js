/**
 * Dashboard Page Initialization
 * Scripts específicos para inicialização da página do dashboard
 */

// Prevenir múltiplas declarações
if (typeof DashboardPageInit === 'undefined') {
    class DashboardPageInit {
        constructor() {
            this.init();
        }

        init() {
            // Scripts específicos do dashboard são carregados via dashboard.js
            console.log('Dashboard page initialized');
        }
    }

    // Inicializar quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', function() {
        if (!window.dashboardPageInit) {
            window.dashboardPageInit = new DashboardPageInit();
        }
    });
}
