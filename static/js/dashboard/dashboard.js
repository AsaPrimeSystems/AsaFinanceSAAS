/**
 * Dashboard JavaScript Module
 * Gerencia funcionalidades específicas do dashboard
 */

class DashboardManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        // Garantir que o card esteja oculto inicialmente
        const container = document.getElementById('lancamentos-agendados-container');
        if (container) {
            container.style.display = 'none';
        }
        this.carregarLancamentosAgendados();
    }

    setupEventListeners() {
        const filtroSelect = document.getElementById('filtro');
        const mesContainer = document.getElementById('mes_container');
        
        if (filtroSelect) {
            filtroSelect.addEventListener('change', () => {
                if (filtroSelect.value === 'mes') {
                    mesContainer.style.display = 'block';
                } else {
                    mesContainer.style.display = 'none';
                }
            });
        }
    }

    carregarLancamentosAgendados() {
        fetch('/api/lancamentos/agendados')
            .then(response => {
                if (!response.ok) {
                    // Se não for OK, retornar dados vazios
                    return { success: true, lancamentos: [], count: 0 };
                }
                return response.json();
            })
            .then(data => {
                this.renderizarLancamentosAgendados(data);
            })
            .catch(error => {
                console.error('Erro ao carregar lançamentos agendados:', error);
                // Em caso de erro, renderizar lista vazia
                this.renderizarLancamentosAgendados({ success: true, lancamentos: [], count: 0 });
            });
    }

    renderizarLancamentosAgendados(data) {
        const container = document.getElementById('lancamentos-agendados-container');
        const lista = document.getElementById('lancamentos-agendados-lista');
        
        if (!container || !lista) return;

        // Sempre ocultar o card por padrão
        container.style.display = 'none';

        // Só mostrar se houver lançamentos para confirmar
        if (data.success && data.count > 0 && data.lancamentos && data.lancamentos.length > 0) {
            container.style.display = 'block';
            
            let html = '<div class="row">';
            data.lancamentos.forEach(lancamento => {
                const tipoIcon = lancamento.tipo === 'receita' ? 'fa-arrow-up text-success' : 'fa-arrow-down text-danger';
                const tipoTexto = lancamento.tipo === 'receita' ? 'Receita' : 'Despesa';
                
                html += `
                    <div class="col-md-6 col-lg-4 mb-3">
                        <div class="card border-${lancamento.tipo === 'receita' ? 'success' : 'danger'}">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h6 class="card-title mb-1">${this.escapeHtml(lancamento.descricao)}</h6>
                                        <p class="card-text text-muted mb-1">
                                            <i class="fas ${tipoIcon} me-1"></i>${tipoTexto} - ${this.escapeHtml(lancamento.categoria)}
                                        </p>
                                        <p class="card-text mb-1">
                                            <strong>R$ ${parseFloat(lancamento.valor).toFixed(2)}</strong>
                                        </p>
                                        ${lancamento.conta_caixa ? `<small class="text-muted">Conta: ${this.escapeHtml(lancamento.conta_caixa)}</small>` : ''}
                                    </div>
                                    <div class="text-end">
                                        <button class="btn btn-sm btn-success" onclick="dashboardManager.confirmarLancamento(${lancamento.id})">
                                            <i class="fas fa-check"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            
            lista.innerHTML = html;
        } else {
            // Garantir que está oculto quando não há lançamentos
            container.style.display = 'none';
            lista.innerHTML = '';
        }
    }

    confirmarLancamento(lancamentoId) {
        if (confirm('Deseja confirmar este lançamento agendado como realizado hoje?')) {
            fetch(`/lancamentos/${lancamentoId}/toggle-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ realizado: true })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.showAlert('Lançamento confirmado com sucesso!', 'success');
                    // Salvar posição do scroll e recarregar
                    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
                    this.recarregarMantendoScroll(scrollPosition);
                } else {
                    this.showAlert('Erro ao confirmar lançamento: ' + data.message, 'danger');
                }
            })
            .catch(error => {
                console.error('Erro ao confirmar lançamento:', error);
                this.showAlert('Erro ao confirmar lançamento', 'danger');
            });
        }
    }

    showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${this.escapeHtml(message)}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const content = document.querySelector('.container-fluid');
        if (content) {
            content.insertBefore(alertDiv, content.firstChild);
        }
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    removerLancamentoAgendado(lancamentoId) {
        // Encontrar o card do lançamento agendado
        const card = document.querySelector(`[data-lancamento-id="${lancamentoId}"]`);
        if (!card) {
            // Se não encontrar pelo data attribute, procurar pelo botão
            const botao = document.querySelector(`button[onclick*="confirmarLancamento(${lancamentoId})"]`);
            if (botao) {
                const card = botao.closest('.col-md-6, .col-lg-4');
                if (card) {
                    // Adicionar animação de fade out
                    card.style.transition = 'opacity 0.3s ease-out';
                    card.style.opacity = '0';
                    
                    // Remover o card após a animação
                    setTimeout(() => {
                        card.remove();
                        this.verificarSeListaVazia();
                    }, 300);
                }
            }
        } else {
            // Adicionar animação de fade out
            card.style.transition = 'opacity 0.3s ease-out';
            card.style.opacity = '0';
            
            // Remover o card após a animação
            setTimeout(() => {
                card.remove();
                this.verificarSeListaVazia();
            }, 300);
        }
    }

    verificarSeListaVazia() {
        const container = document.getElementById('lancamentos-agendados-container');
        const lista = document.getElementById('lancamentos-agendados-lista');
        
        if (container && lista) {
            const cardsRestantes = lista.querySelectorAll('.col-md-6, .col-lg-4');
            if (cardsRestantes.length === 0) {
                container.style.display = 'none';
            }
        }
    }

    recarregarMantendoScroll(scrollPosition) {
        // Salvar a posição do scroll no sessionStorage
        sessionStorage.setItem('scrollPosition', scrollPosition.toString());
        
        // Recarregar a página
        location.reload();
    }

    restaurarPosicaoScroll() {
        // Restaurar posição do scroll após carregamento
        const savedPosition = sessionStorage.getItem('scrollPosition');
        if (savedPosition) {
            // Aguardar um pouco para garantir que a página carregou completamente
            setTimeout(() => {
                window.scrollTo(0, parseInt(savedPosition));
                // Limpar a posição salva
                sessionStorage.removeItem('scrollPosition');
            }, 100);
        }
    }
}

// Função global para compatibilidade
function carregarLancamentosAgendados() {
    if (window.dashboardManager) {
        window.dashboardManager.carregarLancamentosAgendados();
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página de dashboard antes de inicializar
    const isDashboardPage = window.location.pathname === '/dashboard' ||
                            window.location.pathname === '/contador/dashboard' ||
                            document.querySelector('.dashboard-container') !== null;

    if (isDashboardPage) {
        window.dashboardManager = new DashboardManager();
        // Restaurar posição do scroll se existir
        window.dashboardManager.restaurarPosicaoScroll();
    }
});
