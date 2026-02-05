/**
 * Lançamentos Page Initialization
 * Scripts específicos para inicialização da página de lançamentos
 */

class LancamentosPageInit {
    constructor() {
        this.init();
    }

    init() {
        // Scripts específicos de lançamentos são carregados via lancamentos.js
        console.log('Lançamentos page initialized');
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    window.lancamentosPageInit = new LancamentosPageInit();
});
