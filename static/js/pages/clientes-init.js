/**
 * Clientes Page Initialization
 * Scripts específicos para inicialização da página de clientes
 */

class ClientesPageInit {
    constructor() {
        this.init();
    }

    init() {
        // Scripts específicos de clientes são carregados via clientes.js
        console.log('Clientes page initialized');
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    window.clientesPageInit = new ClientesPageInit();
});
