/**
 * Clientes JavaScript Module
 * Gerencia funcionalidades específicas da página de clientes
 */

class ClientesManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupCheckboxes();
    }

    setupEventListeners() {
        // Busca em tempo real
        const filtroBusca = document.getElementById('filtro-busca');
        if (filtroBusca) {
            filtroBusca.addEventListener('input', (e) => {
                this.filtrarTabela(e.target.value);
            });
        }

        // Checkbox "Selecionar Todos"
        const selectAll = document.getElementById('select-all');
        if (selectAll) {
            selectAll.addEventListener('change', () => {
                this.toggleSelectAll();
            });
        }

        // Botões de ação em lote
        const btnExcluirLote = document.getElementById('btn-excluir-lote');
        if (btnExcluirLote) {
            btnExcluirLote.addEventListener('click', () => {
                this.excluirSelecionados();
            });
        }

        const btnDeselecionarTodos = document.getElementById('btn-deselecionar-todos');
        if (btnDeselecionarTodos) {
            btnDeselecionarTodos.addEventListener('click', () => {
                this.deselecionarTodos();
            });
        }
    }

    setupCheckboxes() {
        const checkboxes = document.querySelectorAll('.cliente-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.atualizarAcoesLote();
            });
        });
    }

    filtrarTabela(termo) {
        const termoLower = termo.toLowerCase();
        const linhas = document.querySelectorAll('.modern-table tbody tr');
        
        linhas.forEach(linha => {
            const nome = linha.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
            const email = linha.querySelector('td:nth-child(3)')?.textContent.toLowerCase() || '';
            const telefone = linha.querySelector('td:nth-child(4)')?.textContent.toLowerCase() || '';
            
            if (nome.includes(termoLower) || email.includes(termoLower) || telefone.includes(termoLower)) {
                linha.style.display = '';
            } else {
                linha.style.display = 'none';
            }
        });
    }

    toggleSelectAll() {
        const selectAll = document.getElementById('select-all');
        const checkboxes = document.querySelectorAll('.cliente-checkbox');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAll.checked;
        });
        
        this.atualizarAcoesLote();
    }

    atualizarAcoesLote() {
        const selecionados = document.querySelectorAll('.cliente-checkbox:checked');
        const batchActions = document.getElementById('batch-actions');
        const selectedCount = document.getElementById('selected-count');
        
        if (selecionados.length > 0) {
            batchActions.classList.add('active');
            if (batchActions.style) batchActions.style.display = 'flex';
            selectedCount.textContent = selecionados.length;
        } else {
            batchActions.classList.remove('active');
            if (batchActions.style) batchActions.style.display = 'none';
        }
    }

    deselecionarTodos() {
        const selectAll = document.getElementById('select-all');
        const checkboxes = document.querySelectorAll('.cliente-checkbox');
        
        selectAll.checked = false;
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        this.atualizarAcoesLote();
    }

    excluirSelecionados() {
        const selecionados = document.querySelectorAll('.cliente-checkbox:checked');
        
        if (selecionados.length === 0) {
            this.showAlert('Selecione pelo menos um cliente para excluir.', 'warning');
            return;
        }

        if (confirm(`Tem certeza que deseja excluir ${selecionados.length} cliente(s) selecionado(s)?`)) {
            const ids = Array.from(selecionados).map(checkbox => checkbox.value);
            
            fetch('/api/clientes/excluir-lote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cliente_ids: ids })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.showAlert(`${data.count || ids.length} cliente(s) excluído(s) com sucesso!`, 'success');
                    // Salvar posição do scroll e recarregar
                    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
                    this.recarregarMantendoScroll(scrollPosition);
                } else {
                    this.showAlert('Erro ao excluir clientes: ' + data.message, 'danger');
                }
            })
            .catch(error => {
                console.error('Erro ao excluir clientes:', error);
                this.showAlert('Erro ao excluir clientes', 'danger');
            });
        }
    }

    editarCliente(id) {
        window.location.href = `/clientes/${id}/editar`;
    }

    excluirCliente(id) {
        if (confirm('Tem certeza que deseja excluir este cliente?')) {
            fetch(`/clientes/${id}/deletar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.showAlert('Cliente excluído com sucesso!', 'success');
                    // Salvar posição do scroll e recarregar
                    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
                    this.recarregarMantendoScroll(scrollPosition);
                } else {
                    this.showAlert('Erro ao excluir cliente: ' + data.message, 'danger');
                }
            })
            .catch(error => {
                console.error('Erro ao excluir cliente:', error);
                this.showAlert('Erro ao excluir cliente', 'danger');
            });
        }
    }

    aplicarFiltros() {
        const status = document.getElementById('filtro-status')?.value || '';
        const busca = document.getElementById('filtro-busca')?.value || '';
        const saldo = document.getElementById('filtro-saldo')?.value || '';
        
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (busca) params.append('busca', busca);
        if (saldo) params.append('saldo', saldo);
        
        window.location.href = window.location.pathname + '?' + params.toString();
    }

    limparFiltros() {
        const statusFilter = document.getElementById('filtro-status');
        const buscaFilter = document.getElementById('filtro-busca');
        const saldoFilter = document.getElementById('filtro-saldo');
        
        if (statusFilter) statusFilter.value = '';
        if (buscaFilter) buscaFilter.value = '';
        if (saldoFilter) saldoFilter.value = '';
        
        window.location.href = window.location.pathname;
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

    removerLinhaDaTabela(id) {
        // Encontrar a linha da tabela pelo ID
        const linha = document.querySelector(`tr[data-cliente-id="${id}"]`);
        if (!linha) return;

        // Adicionar animação de fade out
        linha.style.transition = 'opacity 0.3s ease-out';
        linha.style.opacity = '0';
        
        // Remover a linha após a animação
        setTimeout(() => {
            linha.remove();
            this.atualizarContadores();
        }, 300);
    }

    removerLinhasSelecionadas(ids) {
        // Remover cada linha selecionada com animação
        ids.forEach((id, index) => {
            const linha = document.querySelector(`tr[data-cliente-id="${id}"]`);
            if (linha) {
                // Adicionar delay escalonado para animação suave
                setTimeout(() => {
                    linha.style.transition = 'opacity 0.3s ease-out';
                    linha.style.opacity = '0';
                    
                    setTimeout(() => {
                        linha.remove();
                        // Atualizar contadores após remover todas as linhas
                        if (index === ids.length - 1) {
                            this.atualizarContadores();
                            this.deselecionarTodos();
                        }
                    }, 300);
                }, index * 50); // Delay de 50ms entre cada remoção
            }
        });
    }

    atualizarContadores() {
        // Atualizar contador de clientes se existir
        const totalLinhas = document.querySelectorAll('.modern-table tbody tr').length;
        const contador = document.getElementById('total-clientes');
        if (contador) {
            contador.textContent = totalLinhas;
        }

        // Atualizar contador de selecionados
        const selecionados = document.querySelectorAll('.cliente-checkbox:checked');
        const selectedCount = document.getElementById('selected-count');
        if (selectedCount) {
            selectedCount.textContent = selecionados.length;
        }

        // Esconder ações em lote se não há selecionados
        if (selecionados.length === 0) {
            const batchActions = document.getElementById('batch-actions');
            if (batchActions) {
                batchActions.classList.remove('active');
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

// Funções globais para compatibilidade
function aplicarFiltros() {
    if (window.clientesManager) {
        window.clientesManager.aplicarFiltros();
    }
}

function limparFiltros() {
    if (window.clientesManager) {
        window.clientesManager.limparFiltros();
    }
}

function editarCliente(id) {
    if (window.clientesManager) {
        window.clientesManager.editarCliente(id);
    }
}

function excluirCliente(id) {
    if (window.clientesManager) {
        window.clientesManager.excluirCliente(id);
    }
}

function paginaAnterior() {
    // Implementar paginação se necessário
    console.log('Página anterior');
}

function proximaPagina() {
    // Implementar paginação se necessário
    console.log('Próxima página');
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página de clientes antes de inicializar
    // Procurar por elementos específicos da página de clientes
    const clienteTable = document.querySelector('.cliente-checkbox');
    const isClientesPage = clienteTable !== null || window.location.pathname.includes('/clientes');

    if (isClientesPage) {
        window.clientesManager = new ClientesManager();
        // Restaurar posição do scroll se existir
        window.clientesManager.restaurarPosicaoScroll();
    }
});
