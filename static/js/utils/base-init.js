/**
 * Base Initialization JavaScript
 * Gerencia a inicialização base do sistema e carregamento de dados da sessão
 */

class BaseInitializer {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSessionData();
    }

    setupEventListeners() {
        // Aguardar o DOM estar pronto
        document.addEventListener('DOMContentLoaded', () => {
            this.loadSessionData();
        });
    }

    loadSessionData() {
        fetch('/api/session-data')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.updateHeaderInfo(data.data);
                }
            })
            .catch(error => {
                console.error('Erro ao carregar dados da sessão:', error);
            });
    }

    updateHeaderInfo(data) {
        const companyType = document.getElementById('company-type');
        const companyDoc = document.getElementById('company-doc');
        const companySector = document.getElementById('company-sector');
        const companySectorText = document.getElementById('company-sector-text');
        const userRole = document.getElementById('user-role');
        
        if (companyType && data.empresa_tipo_pessoa) {
            companyType.textContent = data.empresa_tipo_pessoa === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica';
        }
        
        if (companyDoc && data.empresa_documento) {
            companyDoc.textContent = data.empresa_documento;
        }
        
        if (companySector && data.empresa_tipo) {
            companySector.style.display = 'block';
            const sectorText = data.empresa_tipo === 'servicos' ? 'Serviços' : 
                             data.empresa_tipo === 'comercio' ? 'Comércio' : 
                             data.empresa_tipo === 'industria' ? 'Indústria' : '';
            companySectorText.textContent = sectorText;
        }
        
        if (userRole && data.usuario_tipo) {
            const roleConfig = {
                'admin': { icon: 'fa-crown', text: 'Administrador' },
                'usuario_principal': { icon: 'fa-user-shield', text: 'Usuário Principal' },
                'usuario': { icon: 'fa-user', text: 'Usuário' }
            };
            
            const config = roleConfig[data.usuario_tipo] || roleConfig['usuario'];
            userRole.innerHTML = `<i class="fas ${config.icon}"></i> ${config.text}`;
        }
    }
}

// Funções globais para compatibilidade
function loadSessionData() {
    if (window.baseInitializer) {
        window.baseInitializer.loadSessionData();
    }
}

function updateHeaderInfo(data) {
    if (window.baseInitializer) {
        window.baseInitializer.updateHeaderInfo(data);
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    window.baseInitializer = new BaseInitializer();
});
