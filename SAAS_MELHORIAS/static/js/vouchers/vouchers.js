// ============================================================================
// MÓDULO DE GERENCIAMENTO DE VOUCHERS
// Arquivo: static/js/vouchers/vouchers.js
// ============================================================================

const VouchersModule = (() => {
    // Estado privado
    let vouchers = [];
    let modalElement = null;
    let tabelaVouchersElement = null;

    // Elementos do DOM
    const selectors = {
        btnGerenciarVouchers: '#btn-gerenciar-vouchers',
        modalVouchers: '#modalVouchers',
        tabelaVouchers: '#tabelaVouchers',
        formNovoVoucher: '#formNovoVoucher',
        btnNovoVoucher: '#btn-novo-voucher',
        btnFecharFormVoucher: '#btn-fechar-form-voucher',
        inputCodigoVoucher: '#inputCodigoVoucher',
        inputDiasVoucher: '#inputDiasVoucher',
        inputValidadeVoucher: '#inputValidadeVoucher',
        btnSalvarVoucher: '#btn-salvar-voucher',
        btnCancelarVoucher: '#btn-cancelar-voucher',
        inputCodigoAplicar: '#inputCodigoAplicar',
        selectEmpresaAplicar: '#selectEmpresaAplicar',
        btnAplicarVoucher: '#btn-aplicar-voucher'
    };

    /**
     * Inicializa o módulo
     */
    function init() {
        const btnGerenciar = document.querySelector(selectors.btnGerenciarVouchers);
        if (!btnGerenciar) return;

        btnGerenciar.addEventListener('click', abrirModal);
        
        // Inicializar modal se existir
        modalElement = document.querySelector(selectors.modalVouchers);
        if (modalElement) {
            inicializarModal();
        }
    }

    /**
     * Abre o modal de gerenciamento de vouchers
     */
    function abrirModal() {
        carregarVouchers();
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }

    /**
     * Inicializa os event listeners do modal
     */
    function inicializarModal() {
        const btnNovoVoucher = document.querySelector(selectors.btnNovoVoucher);
        const btnSalvar = document.querySelector(selectors.btnSalvarVoucher);
        const btnCancelar = document.querySelector(selectors.btnCancelarVoucher);
        const btnAplicar = document.querySelector(selectors.btnAplicarVoucher);

        if (btnNovoVoucher) {
            btnNovoVoucher.addEventListener('click', mostrarFormNovoVoucher);
        }

        if (btnSalvar) {
            btnSalvar.addEventListener('click', salvarNovoVoucher);
        }

        if (btnCancelar) {
            btnCancelar.addEventListener('click', ocultarFormNovoVoucher);
        }

        if (btnAplicar) {
            btnAplicar.addEventListener('click', aplicarVoucher);
        }
    }

    /**
     * Carrega a lista de vouchers do servidor
     */
    function carregarVouchers() {
        fetch('/admin/vouchers', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                vouchers = data.vouchers;
                renderizarTabela();
            } else {
                mostrarAlerta('Erro ao carregar vouchers: ' + data.erro, 'danger');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            mostrarAlerta('Erro ao carregar vouchers', 'danger');
        });
    }

    /**
     * Renderiza a tabela de vouchers
     */
    function renderizarTabela() {
        tabelaVouchersElement = document.querySelector(selectors.tabelaVouchers);
        if (!tabelaVouchersElement) return;

        if (vouchers.length === 0) {
            tabelaVouchersElement.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        Nenhum voucher cadastrado. Clique em "Criar novo voucher" para começar.
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        vouchers.forEach(voucher => {
            const statusBadge = voucher.ativo 
                ? '<span class="badge bg-success">Ativo</span>'
                : '<span class="badge bg-secondary">Inativo</span>';
            
            const podeUsarBadge = voucher.pode_usar
                ? '<span class="badge bg-info">Disponível</span>'
                : '<span class="badge bg-warning">Indisponível</span>';

            const btnToggle = voucher.ativo
                ? `<button class="btn btn-sm btn-warning" onclick="VouchersModule.toggleVoucher(${voucher.id})">Desativar</button>`
                : `<button class="btn btn-sm btn-success" onclick="VouchersModule.toggleVoucher(${voucher.id})">Ativar</button>`;

            html += `
                <tr>
                    <td><strong>${voucher.codigo}</strong></td>
                    <td>${voucher.dias_assinatura} dias</td>
                    <td>${voucher.validade}</td>
                    <td>${statusBadge} ${podeUsarBadge}</td>
                    <td><small class="text-muted">${voucher.usos} uso(s)</small></td>
                    <td>
                        ${btnToggle}
                        <button class="btn btn-sm btn-danger" onclick="VouchersModule.deletarVoucher(${voucher.id})">Deletar</button>
                    </td>
                </tr>
            `;
        });

        tabelaVouchersElement.innerHTML = html;
    }

    /**
     * Mostra o formulário de novo voucher
     */
    function mostrarFormNovoVoucher() {
        const form = document.querySelector(selectors.formNovoVoucher);
        if (form) {
            form.style.display = 'block';
            document.querySelector(selectors.inputCodigoVoucher).focus();
        }
    }

    /**
     * Oculta o formulário de novo voucher
     */
    function ocultarFormNovoVoucher() {
        const form = document.querySelector(selectors.formNovoVoucher);
        if (form) {
            form.style.display = 'none';
            form.reset();
        }
    }

    /**
     * Salva um novo voucher
     */
    function salvarNovoVoucher() {
        const codigo = document.querySelector(selectors.inputCodigoVoucher).value.trim();
        const dias = document.querySelector(selectors.inputDiasVoucher).value.trim();
        const validade = document.querySelector(selectors.inputValidadeVoucher).value.trim();

        // Validações
        if (!codigo) {
            mostrarAlerta('Código é obrigatório', 'warning');
            return;
        }

        if (!dias || parseInt(dias) <= 0) {
            mostrarAlerta('Dias deve ser maior que 0', 'warning');
            return;
        }

        if (!validade) {
            mostrarAlerta('Validade é obrigatória', 'warning');
            return;
        }

        const dados = {
            codigo: codigo.toUpperCase(),
            dias_assinatura: parseInt(dias),
            validade: validade
        };

        fetch('/admin/vouchers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                mostrarAlerta('Voucher criado com sucesso!', 'success');
                ocultarFormNovoVoucher();
                carregarVouchers();
            } else {
                mostrarAlerta('Erro: ' + data.erro, 'danger');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            mostrarAlerta('Erro ao criar voucher', 'danger');
        });
    }

    /**
     * Ativa ou desativa um voucher
     */
    function toggleVoucher(voucherId) {
        if (!confirm('Tem certeza que deseja alterar o status deste voucher?')) {
            return;
        }

        fetch(`/admin/vouchers/${voucherId}/toggle`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                mostrarAlerta(data.mensagem, 'success');
                carregarVouchers();
            } else {
                mostrarAlerta('Erro: ' + data.erro, 'danger');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            mostrarAlerta('Erro ao atualizar voucher', 'danger');
        });
    }

    /**
     * Deleta um voucher
     */
    function deletarVoucher(voucherId) {
        if (!confirm('Tem certeza que deseja deletar este voucher? Esta ação não pode ser desfeita.')) {
            return;
        }

        fetch(`/admin/vouchers/${voucherId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                mostrarAlerta(data.mensagem, 'success');
                carregarVouchers();
            } else {
                mostrarAlerta('Erro: ' + data.erro, 'danger');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            mostrarAlerta('Erro ao deletar voucher', 'danger');
        });
    }

    /**
     * Aplica um voucher a uma empresa
     */
    function aplicarVoucher() {
        const codigo = document.querySelector(selectors.inputCodigoAplicar).value.trim();
        const empresaId = document.querySelector(selectors.selectEmpresaAplicar).value;

        if (!codigo) {
            mostrarAlerta('Código do voucher é obrigatório', 'warning');
            return;
        }

        if (!empresaId) {
            mostrarAlerta('Selecione uma empresa', 'warning');
            return;
        }

        const dados = {
            codigo: codigo.toUpperCase(),
            empresa_id: parseInt(empresaId)
        };

        fetch('/admin/vouchers/aplicar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                mostrarAlerta(data.mensagem, 'success');
                document.querySelector(selectors.inputCodigoAplicar).value = '';
                document.querySelector(selectors.selectEmpresaAplicar).value = '';
                carregarVouchers();
            } else {
                mostrarAlerta('Erro: ' + data.erro, 'danger');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            mostrarAlerta('Erro ao aplicar voucher', 'danger');
        });
    }

    /**
     * Mostra alerta Bootstrap
     */
    function mostrarAlerta(mensagem, tipo = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `
            ${mensagem}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        const container = modalElement || document.body;
        const firstChild = container.firstChild;
        if (firstChild) {
            container.insertBefore(alertDiv, firstChild);
        } else {
            container.appendChild(alertDiv);
        }

        // Auto-remover após 5 segundos
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    // API pública
    return {
        init,
        toggleVoucher,
        deletarVoucher,
        aplicarVoucher
    };
})();

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    VouchersModule.init();
});
