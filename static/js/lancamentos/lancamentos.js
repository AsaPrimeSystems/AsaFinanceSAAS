/**
 * Lançamentos JavaScript Module
 * Gerencia funcionalidades específicas da página de lançamentos
 */

class LancamentosManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFilters();
        this.setupDateMasks();
    }

    setupEventListeners() {
        // Filtros de busca
        const filtroBusca = document.getElementById('filtro-busca');
        if (filtroBusca) {
            filtroBusca.addEventListener('input', (e) => {
                this.filtrarTabela(e.target.value);
            });
        }

        // Filtros de período
        const filtroPeriodo = document.getElementById('filtro-periodo');
        if (filtroPeriodo) {
            filtroPeriodo.addEventListener('change', () => {
                this.aplicarFiltros();
            });
        }

        // NOTA: Event listeners para checkboxes e ações em lote estão no template HTML
        // para evitar conflitos com o código inline que gerencia display:none/flex
    }

    setupFilters() {
        // Configurar filtros de data
        const dataInicio = document.getElementById('data-inicio');
        const dataFim = document.getElementById('data-fim');
        
        if (dataInicio) {
            dataInicio.addEventListener('change', () => {
                this.aplicarFiltros();
            });
        }
        
        if (dataFim) {
            dataFim.addEventListener('change', () => {
                this.aplicarFiltros();
            });
        }
    }

    setupDateMasks() {
        // Aplicar máscaras de data aos campos de filtro
        const aplicarMascaraData = (input) => {
            input.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
                
                // Aplica a máscara DD/MM/AAAA dinamicamente
                if (value.length > 0) {
                    if (value.length <= 2) {
                        value = value;
                    } else if (value.length <= 4) {
                        value = value.substring(0, 2) + '/' + value.substring(2);
                    } else {
                        value = value.substring(0, 2) + '/' + value.substring(2, 4) + '/' + value.substring(4, 8);
                    }
                }
                
                e.target.value = value;
            });
            
            // Permitir backspace e delete
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Backspace' || e.key === 'Delete') {
                    const cursorPosition = e.target.selectionStart;
                    if (cursorPosition > 0 && e.target.value[cursorPosition - 1] === '/') {
                        // Se o cursor está antes de uma barra, mover para antes da barra
                        e.preventDefault();
                        e.target.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
                    }
                }
            });
            
            // Validação ao perder o foco
            input.addEventListener('blur', function(e) {
                const value = e.target.value;
                if (value && value.length === 10) {
                    const partes = value.split('/');
                    if (partes.length === 3) {
                        const dia = parseInt(partes[0]);
                        const mes = parseInt(partes[1]);
                        const ano = parseInt(partes[2]);
                        
                        // Validações básicas
                        if (dia < 1 || dia > 31 || mes < 1 || mes > 12 || ano < 1900 || ano > 2100) {
                            input.classList.add('is-invalid');
                        } else {
                            input.classList.remove('is-invalid');
                        }
                    }
                } else if (value && value.length > 0 && value.length < 10) {
                    input.classList.add('is-invalid');
                } else {
                    input.classList.remove('is-invalid');
                }
            });
        };
        
        // Aplicar máscara nos campos de data de filtro
        const filtroDataInicio = document.getElementById('filtro-data-inicio');
        const filtroDataFim = document.getElementById('filtro-data-fim');
        
        if (filtroDataInicio) {
            aplicarMascaraData(filtroDataInicio);
        }
        
        if (filtroDataFim) {
            aplicarMascaraData(filtroDataFim);
        }
        
        // Também aplicar em todos os campos com data-mask="date" ou que contenham "data" no name
        const dateInputs = document.querySelectorAll('input[data-mask="date"], input[name*="data"]:not([type="date"])');
        dateInputs.forEach(input => {
            if (input !== filtroDataInicio && input !== filtroDataFim) {
                aplicarMascaraData(input);
            }
        });
    }

    filtrarTabela(termo) {
        const termoLower = termo.toLowerCase();
        const linhas = document.querySelectorAll('.modern-table tbody tr[data-lancamento-id]');

        linhas.forEach(linha => {
            const descricao = linha.querySelector('td:nth-child(4)')?.textContent.toLowerCase() || '';
            const categoria = linha.querySelector('td:nth-child(6)')?.textContent.toLowerCase() || '';
            const cliente = linha.querySelector('td:nth-child(9)')?.textContent.toLowerCase() || '';

            if (descricao.includes(termoLower) || categoria.includes(termoLower) || cliente.includes(termoLower)) {
                linha.style.display = '';
            } else {
                linha.style.display = 'none';
            }
        });

        // Recalcular totais com base nas linhas visíveis
        this.recalcularTotaisVisiveis();
    }

    // NOTA: Métodos de seleção e ações em lote foram movidos para o template HTML
    // para evitar conflitos com o código inline que já gerencia essas funcionalidades

    removerLinhasSelecionadas(ids) {
        // Remover cada linha selecionada com animação
        ids.forEach((id, index) => {
            const linha = document.querySelector(`tr[data-lancamento-id="${id}"]`);
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

    editarLancamento(id) {
        window.location.href = `/lancamentos/${id}/editar`;
    }

    excluirLancamento(id) {
        CommonUtils.showConfirmModal(
            'Confirmar Exclusão',
            'Tem certeza que deseja excluir este lançamento?',
            () => {
                fetch(`/lancamentos/${id}/deletar`, {
                    method: 'POST',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        CommonUtils.showAlert('Lançamento excluído com sucesso!', 'success');
                        // Remover a linha da tabela sem recarregar a página
                        this.removerLinhaDaTabela(id);
                    } else {
                        CommonUtils.showAlert('Erro ao excluir lançamento: ' + data.message, 'danger');
                    }
                })
                .catch(error => {
                    console.error('Erro ao excluir lançamento:', error);
                    CommonUtils.showAlert('Erro ao excluir lançamento', 'danger');
                });
            }
        );
    }

    removerLinhaDaTabela(id) {
        // Encontrar a linha da tabela pelo ID
        const linha = document.querySelector(`tr[data-lancamento-id="${id}"]`);
        if (!linha) return;

        // Adicionar animação de fade out
        linha.style.transition = 'opacity 0.3s ease-out';
        linha.style.opacity = '0';

        // Remover a linha após a animação
        setTimeout(() => {
            linha.remove();
            this.atualizarContadores();
            this.recalcularTotaisVisiveis();
        }, 300);
    }

    atualizarContadores() {
        // Atualizar contador de lançamentos se existir
        const totalLinhas = document.querySelectorAll('.modern-table tbody tr').length;
        const contador = document.getElementById('total-lancamentos');
        if (contador) {
            contador.textContent = totalLinhas;
        }

        // Atualizar contador de selecionados
        const selecionados = document.querySelectorAll('.lancamento-checkbox:checked');
        const selectedCount = document.getElementById('selected-count');
        if (selectedCount) {
            selectedCount.textContent = selecionados.length;
        }

        // Esconder ações em lote se não há selecionados (usando display inline style)
        if (selecionados.length === 0) {
            const batchActions = document.getElementById('batch-actions');
            if (batchActions) {
                batchActions.style.display = 'none';
            }
        }
    }

    toggleStatus(id, novoStatus = null) {
        // Salvar posição atual do scroll antes de fazer a requisição
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        
        // Preparar dados para envio
        const dados = {};
        if (novoStatus !== null) {
            dados.novo_status = novoStatus === true || novoStatus === 'true';
        }
        
        fetch(`/lancamentos/${id}/toggle-status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Atualizar a linha da tabela sem recarregar a página
                this.atualizarStatusNaTabela(id, data);
                // Atualizar totais se retornados pelo backend
                if (data.totais) {
                    this.atualizarTotais(data.totais);
                } else {
                    // Caso contrário, recalcular baseado nas linhas visíveis
                    this.recalcularTotaisVisiveis();
                }
                // Restaurar posição do scroll após atualização
                window.scrollTo(0, scrollPosition);
            } else {
                CommonUtils.showAlert('Erro ao atualizar status: ' + (data.message || 'Erro desconhecido'), 'danger');
            }
        })
        .catch(error => {
            console.error('Erro ao atualizar status:', error);
            CommonUtils.showAlert('Erro ao atualizar status', 'danger');
        });
    }

    atualizarStatusNaTabela(id, data) {
        // Encontrar a linha da tabela pelo ID
        const linha = document.querySelector(`tr[data-lancamento-id="${id}"]`);
        if (!linha) return;

        const novoStatus = data.realizado || data.novo_status === 'realizado';
        const statusDetalhado = data.status_detalhado;

        // Atualizar o ícone do botão de status
        const botaoStatus = linha.querySelector('button[onclick*="toggleStatus"]');
        if (botaoStatus) {
            const icone = botaoStatus.querySelector('i');
            
            if (novoStatus) {
                // Marcar como realizado
                botaoStatus.className = 'modern-action-btn times';
                icone.className = 'fas fa-times';
                botaoStatus.setAttribute('title', 'Marcar como Pendente');
                botaoStatus.setAttribute('onclick', `toggleStatus(${id}, false)`);
            } else {
                // Marcar como pendente
                botaoStatus.className = 'modern-action-btn check';
                icone.className = 'fas fa-check';
                botaoStatus.setAttribute('title', 'Marcar como Realizado');
                botaoStatus.setAttribute('onclick', `toggleStatus(${id}, true)`);
            }
        }

        // Atualizar a coluna de data realizada (coluna 3 - Data Realizada)
        const colunaDataRealizada = linha.querySelector('td:nth-child(3)');
        if (colunaDataRealizada) {
            if (data.data_realizada) {
                colunaDataRealizada.textContent = data.data_realizada;
            } else {
                colunaDataRealizada.textContent = '-';
            }
        }

        // Atualizar a coluna de status na tabela
        const colunaStatus = linha.querySelector('.modern-status-badge');
        if (colunaStatus) {
            if (novoStatus) {
                colunaStatus.className = 'modern-status-badge completed';
                colunaStatus.textContent = 'Realizado';
            } else {
                // Determinar o status detalhado baseado na resposta do backend
                switch(statusDetalhado) {
                    case 'agendado':
                        colunaStatus.className = 'modern-status-badge scheduled';
                        colunaStatus.textContent = 'Agendado';
                        break;
                    case 'vencido':
                        colunaStatus.className = 'modern-status-badge overdue';
                        colunaStatus.textContent = 'Vencido';
                        break;
                    case 'pendente':
                    default:
                        colunaStatus.className = 'modern-status-badge pending';
                        colunaStatus.textContent = 'A vencer';
                        break;
                }
            }
        }
    }

    atualizarTotais(totais) {
        // Função para formatar valor como moeda brasileira
        const formatarMoeda = (valor) => {
            const num = parseFloat(valor) || 0;
            return 'R$ ' + Math.abs(num).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        };

        // Atualizar entradas (novos seletores)
        const updateElement = (selector, value) => {
            const el = document.querySelector(selector);
            if (el) {
                el.textContent = formatarMoeda(value);
            }
        };

        // Entradas
        if (totais.entrada_total !== undefined) updateElement('.entrada-total', totais.entrada_total);
        if (totais.entrada_realizada !== undefined) updateElement('.entrada-realizada', totais.entrada_realizada);
        if (totais.entrada_a_vencer !== undefined) updateElement('.entrada-vencer', totais.entrada_a_vencer);
        if (totais.entrada_vencida !== undefined) updateElement('.entrada-vencida', totais.entrada_vencida);
        if (totais.entrada_agendada !== undefined) updateElement('.entrada-agendada', totais.entrada_agendada);

        // Saídas
        if (totais.saida_total !== undefined) updateElement('.saida-total', totais.saida_total);
        if (totais.saida_realizada !== undefined) updateElement('.saida-realizada', totais.saida_realizada);
        if (totais.saida_a_vencer !== undefined) updateElement('.saida-vencer', totais.saida_a_vencer);
        if (totais.saida_vencida !== undefined) updateElement('.saida-vencida', totais.saida_vencida);
        if (totais.saida_agendada !== undefined) updateElement('.saida-agendada', totais.saida_agendada);

        // Atualizar entradas totais (seletores legados)
        const entradasElement = document.querySelector('.totals-section .total-value.positive');
        if (entradasElement && totais.total_entradas !== undefined) {
            entradasElement.textContent = formatarMoeda(totais.total_entradas);
        }

        // Atualizar saidas totais (seletores legados)
        const saidasElement = document.querySelector('.totals-section .total-value.negative');
        if (saidasElement && totais.total_saidas !== undefined) {
            saidasElement.textContent = formatarMoeda(totais.total_saidas);
        }

        // Atualizar saldo atual (seletores legados)
        const saldoElements = document.querySelectorAll('.totals-section strong');
        saldoElements.forEach((el) => {
            if (el.textContent.trim() === 'Saldo:') {
                const saldoValue = el.nextElementSibling;
                if (saldoValue && totais.saldo_atual !== undefined) {
                    saldoValue.textContent = formatarMoeda(totais.saldo_atual);
                    // Atualizar classe baseada no valor
                    saldoValue.className = totais.saldo_atual >= 0 ? 'total-value positive' : 'total-value negative';
                }
            } else if (el.textContent.trim() === 'Realizado:') {
                const realizadoValue = el.nextElementSibling;
                if (realizadoValue && totais.saldo_realizado !== undefined) {
                    realizadoValue.textContent = formatarMoeda(totais.saldo_realizado);
                    realizadoValue.className = totais.saldo_realizado >= 0 ? 'status-value positive' : 'status-value negative';
                }
            } else if (el.textContent.trim() === 'A vencer:') {
                const aVencerValue = el.nextElementSibling;
                if (aVencerValue && totais.saldo_a_vencer !== undefined) {
                    aVencerValue.textContent = formatarMoeda(totais.saldo_a_vencer);
                }
            } else if (el.textContent.trim() === 'Vencidos:') {
                const vencidosValue = el.nextElementSibling;
                if (vencidosValue && totais.saldo_vencido !== undefined) {
                    vencidosValue.textContent = formatarMoeda(totais.saldo_vencido);
                }
            } else if (el.textContent.trim() === 'Agendado:') {
                const agendadoValue = el.nextElementSibling;
                if (agendadoValue && totais.saldo_agendado !== undefined) {
                    agendadoValue.textContent = formatarMoeda(totais.saldo_agendado);
                }
            }
        });
    }

    // Recalcular totais baseado nas linhas visíveis da tabela
    recalcularTotaisVisiveis() {
        const linhasVisiveis = Array.from(document.querySelectorAll('.modern-table tbody tr[data-lancamento-id]'))
            .filter(linha => linha.style.display !== 'none' && !linha.classList.contains('modern-totals-row'));

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        // Inicializar contadores
        let entrada_total = 0, entrada_realizada = 0, entrada_vencer = 0, entrada_vencida = 0, entrada_agendada = 0;
        let saida_total = 0, saida_realizada = 0, saida_vencer = 0, saida_vencida = 0, saida_agendada = 0;

        linhasVisiveis.forEach(linha => {
            const tipoBadge = linha.querySelector('.badge');
            const tipo = tipoBadge ? tipoBadge.textContent.toLowerCase().trim() : '';
            const valorText = linha.querySelector('.modern-value-col')?.textContent.replace('R$', '').replace(/\./g, '').replace(',', '.').trim() || '0';
            const valor = parseFloat(valorText) || 0;

            const statusBadge = linha.querySelector('.modern-status-badge');
            const status = statusBadge ? statusBadge.textContent.toLowerCase().trim() : '';

            const dataRealizadaText = linha.querySelector('.modern-date-col:nth-child(3)')?.textContent.trim() || '';
            const dataPrevistaText = linha.querySelector('.modern-date-col:nth-child(2)')?.textContent.trim() || '';

            // Determinar status detalhado
            let statusDetalhado = '';
            if (status === 'realizado') {
                statusDetalhado = 'realizado';
            } else if (status === 'agendado') {
                statusDetalhado = 'agendado';
            } else if (status === 'vencido') {
                statusDetalhado = 'vencido';
            } else {
                statusDetalhado = 'pendente'; // A vencer
            }

            // Contabilizar por tipo
            if (tipo === 'entrada') {
                entrada_total += valor;
                if (statusDetalhado === 'realizado') entrada_realizada += valor;
                else if (statusDetalhado === 'agendado') entrada_agendada += valor;
                else if (statusDetalhado === 'vencido') entrada_vencida += valor;
                else entrada_vencer += valor;
            } else if (tipo === 'saida') {
                saida_total += valor;
                if (statusDetalhado === 'realizado') saida_realizada += valor;
                else if (statusDetalhado === 'agendado') saida_agendada += valor;
                else if (statusDetalhado === 'vencido') saida_vencida += valor;
                else saida_vencer += valor;
            }
        });

        // Atualizar totais na interface
        this.atualizarTotais({
            entrada_total,
            entrada_realizada,
            entrada_a_vencer: entrada_vencer,
            entrada_vencida,
            entrada_agendada,
            saida_total,
            saida_realizada,
            saida_a_vencer: saida_vencer,
            saida_vencida,
            saida_agendada,
            // Valores legados
            total_entradas: entrada_total,
            total_saidas: saida_total,
            saldo_atual: entrada_realizada - saida_realizada,
            saldo_realizado: entrada_realizada - saida_realizada,
            saldo_a_vencer: Math.abs(entrada_vencer - saida_vencer),
            saldo_vencido: Math.abs(entrada_vencida - saida_vencida),
            saldo_agendado: Math.abs(entrada_agendada - saida_agendada)
        });

        // Atualizar contador de lançamentos
        const totalsTitle = document.querySelector('.totals-title');
        if (totalsTitle) {
            totalsTitle.textContent = `TOTAIS (${linhasVisiveis.length} lançamentos)`;
        }
    }

    aplicarFiltros() {
        const periodo = document.getElementById('filtro-periodo')?.value || '';
        const tipo = document.getElementById('filtro-tipo')?.value || '';
        const categoria = document.getElementById('filtro-categoria')?.value || '';
        const status = document.getElementById('filtro-status')?.value || '';
        const contaCaixa = document.getElementById('filtro-conta-caixa')?.value || '';
        const dataInicio = document.getElementById('filtro-data-inicio')?.value || '';
        const dataFim = document.getElementById('filtro-data-fim')?.value || '';

        const params = new URLSearchParams();
        if (periodo) params.append('periodo', periodo);
        if (tipo) params.append('tipo', tipo);
        if (categoria) params.append('categoria', categoria);
        if (status) params.append('status', status);
        if (contaCaixa) params.append('conta_caixa_id', contaCaixa);
        if (dataInicio) params.append('data_inicio', dataInicio);
        if (dataFim) params.append('data_fim', dataFim);

        window.location.href = window.location.pathname + '?' + params.toString();
    }

    limparFiltros() {
        const filters = ['filtro-periodo', 'filtro-tipo', 'filtro-categoria', 'filtro-status', 'filtro-conta-caixa', 'filtro-data-inicio', 'filtro-data-fim'];
        filters.forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) filter.value = '';
        });

        window.location.href = window.location.pathname;
    }

    validateDate(input) {
        const value = input.value;
        if (value && !CommonUtils.isValidDate(value)) {
            CommonUtils.showAlert('Data inválida', 'warning');
            input.value = '';
        }
    }

    exportarLancamentos() {
        const params = new URLSearchParams(window.location.search);
        params.append('exportar', 'excel');
        
        window.location.href = window.location.pathname + '?' + params.toString();
    }

    importarLancamentos() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls,.csv';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append('arquivo', file);
                
                fetch('/lancamentos/importar', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        CommonUtils.showAlert(`${data.importados} lançamentos importados com sucesso!`, 'success');
                        // Recarregar a página para mostrar os novos lançamentos importados
                        location.reload();
                    } else {
                        CommonUtils.showAlert('Erro ao importar lançamentos: ' + data.message, 'danger');
                    }
                })
                .catch(error => {
                    console.error('Erro ao importar lançamentos:', error);
                    CommonUtils.showAlert('Erro ao importar lançamentos', 'danger');
                });
            }
        });
        
        input.click();
    }

    buscarLancamentos() {
        const termoBusca = document.getElementById('search-input')?.value?.trim() || '';
        
        if (termoBusca) {
            // Salvar posição atual do scroll
            const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            
            // Adicionar parâmetro de busca à URL
            const url = new URL(window.location);
            url.searchParams.set('busca', termoBusca);
            
            // Recarregar mantendo a posição do scroll
            this.recarregarMantendoScroll(scrollPosition, url.toString());
        } else {
            CommonUtils.showAlert('Digite um termo para buscar', 'warning');
        }
    }

    limparBusca() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Salvar posição atual do scroll
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        
        // Remover parâmetro de busca da URL
        const url = new URL(window.location);
        url.searchParams.delete('busca');
        
        // Recarregar mantendo a posição do scroll
        this.recarregarMantendoScroll(scrollPosition, url.toString());
    }

    recarregarMantendoScroll(scrollPosition, url = null) {
        // Salvar a posição do scroll no sessionStorage
        sessionStorage.setItem('scrollPosition', scrollPosition.toString());
        
        // Recarregar a página
        if (url) {
            window.location.href = url;
        } else {
            location.reload();
        }
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
    if (window.lancamentosManager) {
        window.lancamentosManager.aplicarFiltros();
    }
}

function limparFiltros() {
    if (window.lancamentosManager) {
        window.lancamentosManager.limparFiltros();
    }
}

function editarLancamento(id) {
    if (window.lancamentosManager) {
        window.lancamentosManager.editarLancamento(id);
    }
}

function excluirLancamento(id) {
    if (window.lancamentosManager) {
        window.lancamentosManager.excluirLancamento(id);
    }
}

function toggleStatus(id, novoStatus = null) {
    if (window.lancamentosManager) {
        window.lancamentosManager.toggleStatus(id, novoStatus);
    }
}

function exportarLancamentos() {
    if (window.lancamentosManager) {
        window.lancamentosManager.exportarLancamentos();
    }
}

function importarLancamentos() {
    if (window.lancamentosManager) {
        window.lancamentosManager.importarLancamentos();
    }
}

function buscarLancamentos() {
    if (window.lancamentosManager) {
        window.lancamentosManager.buscarLancamentos();
    }
}

function limparBusca() {
    if (window.lancamentosManager) {
        window.lancamentosManager.limparBusca();
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página de lançamentos antes de inicializar
    // NOTA: A página de lançamentos tem seu próprio código inline no template
    // Este manager é para funcionalidades complementares
    const isLancamentosPage = window.location.pathname.includes('/lancamentos') ||
                              window.location.pathname.includes('/novo_lancamento') ||
                              window.location.pathname.includes('/editar_lancamento') ||
                              document.querySelector('.lancamento-checkbox') !== null;

    if (isLancamentosPage) {
        window.lancamentosManager = new LancamentosManager();
        // Restaurar posição do scroll se existir
        window.lancamentosManager.restaurarPosicaoScroll();
    }
});
