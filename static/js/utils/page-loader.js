/**
 * Page Loader Utility
 * Gerencia o carregamento de scripts específicos de cada página
 */

class PageLoader {
    constructor() {
        // Mapear apenas scripts existentes para evitar 404
        this.pageScripts = {
            'dashboard': '/static/js/pages/dashboard-init.js',
            'clientes': '/static/js/pages/clientes-init.js',
            'lancamentos': '/static/js/pages/lancamentos-init.js'
        };
    }

    loadPageScript(pageName) {
        const scriptPath = this.pageScripts[pageName];
        if (scriptPath) {
            this.loadScript(scriptPath);
        }
    }

    loadScript(src) {
        // Verificar se o script já foi carregado
        if (document.querySelector(`script[src="${src}"]`)) {
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => {
            console.log(`Script carregado: ${src}`);
        };
        script.onerror = () => {
            console.error(`Erro ao carregar script: ${src}`);
        };
        
        document.head.appendChild(script);
    }

    detectCurrentPage() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(segment => segment);
        
        if (segments.length === 0) return 'dashboard';
        
        const pageName = segments[segments.length - 1];
        return pageName;
    }

    autoLoadPageScript() {
        const currentPage = this.detectCurrentPage();
        console.log(`Página detectada: ${currentPage}`);
        this.loadPageScript(currentPage);
    }
}

// Função global para carregar script de página específica
function loadPageScript(pageName) {
    if (window.pageLoader) {
        window.pageLoader.loadPageScript(pageName);
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    window.pageLoader = new PageLoader();
    window.pageLoader.autoLoadPageScript();
});
