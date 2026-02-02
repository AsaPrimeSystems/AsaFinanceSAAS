// ============================================================================
// MÓDULO DE PAYWALL COM INTEGRAÇÃO PAGAR.ME
// Arquivo: static/js/assinatura/assinatura.js
// ============================================================================

const PaywallAssinatura = (() => {
    let statusAssinatura = null;
    let modalElement = null;
    let uiLocked = false;
    let pollingInterval = null;

    const selectors = {
        modalPaywall: '#modalPaywall',
        tabsPlanos: '.nav-tabs',
        tabsMetodo: '.nav-metodos',
        containerPlanos: '#containerPlanos',
        containerMetodo: '#containerMetodo',
        btnAssinar: '.btn-assinar-plano',
    };

    // ========================================================================
    // INICIALIZAÇÃO
    // ========================================================================

    function init() {
        checkAssinaturaStatus();
    }

    // ========================================================================
    // VERIFICAR STATUS DE ASSINATURA
    // ========================================================================

    function checkAssinaturaStatus() {
        fetch('/api/assinatura/status', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                statusAssinatura = data;
                
                // Se bloqueado, mostrar paywall
                if (data.bloqueado) {
                    renderPaywallModal(data);
                    lockUI();
                    
                    // Se houver intenção pendente, iniciar polling
                    if (data.ultima_intencao && data.ultima_intencao.status === 'pending') {
                        iniciarPolling();
                    }
                }
            } else {
                console.error('Erro ao verificar status:', data.erro);
            }
        })
        .catch(error => {
            console.error('Erro ao verificar assinatura:', error);
        });
    }

    // ========================================================================
    // RENDERIZAR MODAL DE PAYWALL
    // ========================================================================

    function renderPaywallModal(status) {
        // Se modal já existe, remover
        const existente = document.querySelector(selectors.modalPaywall);
        if (existente) {
            existente.remove();
        }

        // Determinar quais planos mostrar
        let conteudoPlanos = '';
        
        if (status.tipo_conta === 'contador_bpo') {
            conteudoPlanos = `
                <div class="col-12">
                    <div class="alert alert-info">
                        <h5><i class="fas fa-calculator me-2"></i>Contador/BPO</h5>
                        <p>Preços personalizados conforme a quantidade de empresas vinculadas.</p>
                        <p>Entre em contato com nosso atendimento para uma proposta customizada.</p>
                        <a href="mailto:contato@financecontrol.com" class="btn btn-primary">
                            <i class="fas fa-envelope me-2"></i>Enviar Email
                        </a>
                    </div>
                </div>
            `;
        } else {
            // Pessoa Física ou Jurídica
            const prefixo = status.tipo_conta === 'pessoa_fisica' ? 'PF' : 'PJ';
            
            conteudoPlanos = `
                <div class="col-md-4">
                    <div class="preco-card">
                        <h5>30 Dias</h5>
                        <div class="preco-valor">R$ 49,90</div>
                        <div class="preco-periodo">por mês</div>
                        <ul class="preco-lista">
                            <li><i class="fas fa-check"></i>Acesso completo</li>
                            <li><i class="fas fa-check"></i>Até 5 usuários</li>
                            <li><i class="fas fa-check"></i>Relatórios básicos</li>
                            <li><i class="fas fa-check"></i>Suporte por email</li>
                        </ul>
                        <button class="btn btn-primary w-100 btn-assinar-plano" data-plano="${prefixo}_30">
                            <i class="fas fa-credit-card me-2"></i>Assinar Agora
                        </button>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="preco-card destaque">
                        <span class="badge bg-success mb-2">Mais Popular</span>
                        <h5>90 Dias</h5>
                        <div class="preco-valor">R$ 99,90</div>
                        <div class="preco-periodo">por trimestre</div>
                        <ul class="preco-lista">
                            <li><i class="fas fa-check"></i>Tudo do plano 30 dias</li>
                            <li><i class="fas fa-check"></i>Até 10 usuários</li>
                            <li><i class="fas fa-check"></i>Relatórios avançados</li>
                            <li><i class="fas fa-check"></i>Suporte prioritário</li>
                        </ul>
                        <button class="btn btn-primary w-100 btn-assinar-plano" data-plano="${prefixo}_90">
                            <i class="fas fa-credit-card me-2"></i>Assinar Agora
                        </button>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="preco-card">
                        <h5>Anual</h5>
                        <div class="preco-valor">R$ 300,00</div>
                        <div class="preco-periodo">por ano</div>
                        <ul class="preco-lista">
                            <li><i class="fas fa-check"></i>Tudo do plano 90 dias</li>
                            <li><i class="fas fa-check"></i>Usuários ilimitados</li>
                            <li><i class="fas fa-check"></i>Relatórios premium</li>
                            <li><i class="fas fa-check"></i>Suporte 24/7</li>
                        </ul>
                        <button class="btn btn-primary w-100 btn-assinar-plano" data-plano="${prefixo}_ANUAL">
                            <i class="fas fa-credit-card me-2"></i>Assinar Agora
                        </button>
                    </div>
                </div>
            `;
        }

        // Criar HTML do modal
        const modalHTML = `
            <div class="modal fade" id="modalPaywall" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false" aria-labelledby="modalPaywallLabel" aria-hidden="true">
                <div class="modal-dialog modal-xl modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white border-0">
                            <h5 class="modal-title" id="modalPaywallLabel">
                                <i class="fas fa-lock me-2"></i>Escolha seu Plano
                            </h5>
                        </div>
                        <div class="modal-body p-5">
                            <div id="alertasContainer"></div>
                            
                            <!-- Seção de Planos -->
                            <div id="secaoPlanos">
                                <div class="text-center mb-5">
                                    <h3>Selecione um Plano</h3>
                                    <p class="text-muted">Escolha o plano que melhor se adequa às suas necessidades.</p>
                                </div>
                                <div class="row g-4" id="containerPlanos">
                                    ${conteudoPlanos}
                                </div>
                            </div>
                            
                            <!-- Seção de Método de Pagamento -->
                            <div id="secaoMetodo" style="display: none;">
                                <div class="text-center mb-4">
                                    <h4>Escolha o Método de Pagamento</h4>
                                    <p class="text-muted" id="planoSelecionado"></p>
                                </div>
                                
                                <!-- Tabs de Métodos -->
                                <ul class="nav nav-tabs nav-metodos mb-4" role="tablist">
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link active" id="tab-pix" data-bs-toggle="tab" data-bs-target="#pix-content" type="button" role="tab">
                                            <i class="fas fa-qrcode me-2"></i>PIX
                                        </button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link" id="tab-boleto" data-bs-toggle="tab" data-bs-target="#boleto-content" type="button" role="tab">
                                            <i class="fas fa-barcode me-2"></i>Boleto
                                        </button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link" id="tab-cartao" data-bs-toggle="tab" data-bs-target="#cartao-content" type="button" role="tab">
                                            <i class="fas fa-credit-card me-2"></i>Cartão
                                        </button>
                                    </li>
                                </ul>
                                
                                <!-- Conteúdo das Abas -->
                                <div class="tab-content">
                                    <!-- PIX -->
                                    <div class="tab-pane fade show active" id="pix-content" role="tabpanel">
                                        <div id="pixContainer"></div>
                                    </div>
                                    
                                    <!-- BOLETO -->
                                    <div class="tab-pane fade" id="boleto-content" role="tabpanel">
                                        <div id="boletoContainer"></div>
                                    </div>
                                    
                                    <!-- CARTÃO -->
                                    <div class="tab-pane fade" id="cartao-content" role="tabpanel">
                                        <div id="cartaoContainer"></div>
                                    </div>
                                </div>
                                
                                <div class="mt-4">
                                    <button class="btn btn-secondary w-100" onclick="PaywallAssinatura.voltarPlanos()">
                                        <i class="fas fa-arrow-left me-2"></i>Voltar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Adicionar modal ao DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Obter referência do modal e abrir
        modalElement = document.querySelector(selectors.modalPaywall);
        const modal = new bootstrap.Modal(modalElement, {
            backdrop: 'static',
            keyboard: false
        });
        modal.show();

        // Impedir fechar ao clicar fora
        modalElement.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
            }
        });

        // Bind eventos dos botões de plano
        bindBotoesPlanos();
    }

    // ========================================================================
    // BIND EVENTOS DOS BOTÕES DE PLANO
    // ========================================================================

    function bindBotoesPlanos() {
        document.querySelectorAll('.btn-assinar-plano').forEach(btn => {
            btn.addEventListener('click', function() {
                const plano = this.dataset.plano;
                selecionarPlano(plano);
            });
        });
    }

    // ========================================================================
    // SELECIONAR PLANO E MOSTRAR MÉTODOS DE PAGAMENTO
    // ========================================================================

    function selecionarPlano(plano) {
        // Esconder seção de planos
        document.getElementById('secaoPlanos').style.display = 'none';
        document.getElementById('secaoMetodo').style.display = 'block';
        
        // Atualizar texto do plano selecionado
        const nomesPlanosMap = {
            'PF_30': '30 Dias - R$ 49,90',
            'PF_90': '90 Dias - R$ 99,90',
            'PF_ANUAL': 'Anual - R$ 300,00',
            'PJ_30': '30 Dias - R$ 49,90',
            'PJ_90': '90 Dias - R$ 99,90',
            'PJ_ANUAL': 'Anual - R$ 300,00',
        };
        
        document.getElementById('planoSelecionado').textContent = `Plano: ${nomesPlanosMap[plano] || plano}`;
        
        // Limpar containers
        document.getElementById('pixContainer').innerHTML = '<div class="spinner-border" role="status"><span class="visually-hidden">Carregando...</span></div>';
        document.getElementById('boletoContainer').innerHTML = '';
        document.getElementById('cartaoContainer').innerHTML = '';
        
        // Gerar pagamentos para PIX
        gerarPagamentoPIX(plano);
        gerarPagamentoBoleto(plano);
        gerarPagamentoCartao(plano);
    }

    // ========================================================================
    // GERAR PAGAMENTO PIX
    // ========================================================================

    function gerarPagamentoPIX(plano) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary w-100 mb-3';
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Gerando QR Code...';
        btn.disabled = true;
        
        document.getElementById('pixContainer').innerHTML = '';
        document.getElementById('pixContainer').appendChild(btn);

        iniciarAssinatura(plano, 'pix', (resposta) => {
            if (resposta.ok) {
                renderizarPIX(resposta);
            } else {
                mostrarErro(resposta.erro || 'Erro ao gerar PIX');
                btn.innerHTML = '<i class="fas fa-redo me-2"></i>Tentar Novamente';
                btn.disabled = false;
                btn.onclick = () => gerarPagamentoPIX(plano);
            }
        });
    }

    function renderizarPIX(resposta) {
        const html = `
            <div class="card border-primary">
                <div class="card-body text-center">
                    <h5 class="card-title mb-4">Escaneie o QR Code</h5>
                    <div class="mb-4">
                        <img src="${resposta.qr_code_url}" alt="QR Code PIX" class="img-fluid" style="max-width: 300px;">
                    </div>
                    <div class="mb-4">
                        <p class="text-muted mb-2">Ou copie a chave PIX:</p>
                        <div class="input-group">
                            <input type="text" class="form-control" id="pixCopyPaste" value="${resposta.copy_paste}" readonly>
                            <button class="btn btn-outline-primary" type="button" onclick="PaywallAssinatura.copiarPIX()">
                                <i class="fas fa-copy me-2"></i>Copiar
                            </button>
                        </div>
                    </div>
                    <p class="text-muted small">Pagamento expira em: ${resposta.expires_at}</p>
                    <button class="btn btn-success w-100 mt-3" onclick="PaywallAssinatura.verificarPagamento()">
                        <i class="fas fa-check me-2"></i>Já Paguei
                    </button>
                </div>
            </div>
        `;
        document.getElementById('pixContainer').innerHTML = html;
    }

    // ========================================================================
    // GERAR PAGAMENTO BOLETO
    // ========================================================================

    function gerarPagamentoBoleto(plano) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary w-100 mb-3';
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Gerando Boleto...';
        btn.disabled = true;
        
        document.getElementById('boletoContainer').appendChild(btn);

        iniciarAssinatura(plano, 'boleto', (resposta) => {
            if (resposta.ok) {
                renderizarBoleto(resposta);
            } else {
                mostrarErro(resposta.erro || 'Erro ao gerar boleto');
                btn.innerHTML = '<i class="fas fa-redo me-2"></i>Tentar Novamente';
                btn.disabled = false;
                btn.onclick = () => gerarPagamentoBoleto(plano);
            }
        });
    }

    function renderizarBoleto(resposta) {
        const html = `
            <div class="card border-success">
                <div class="card-body">
                    <h5 class="card-title mb-4">Dados do Boleto</h5>
                    <div class="mb-4">
                        <p class="text-muted mb-2">Código de Barras:</p>
                        <div class="input-group">
                            <input type="text" class="form-control" id="boletoBarcode" value="${resposta.barcode}" readonly>
                            <button class="btn btn-outline-primary" type="button" onclick="PaywallAssinatura.copiarBoleto()">
                                <i class="fas fa-copy me-2"></i>Copiar
                            </button>
                        </div>
                    </div>
                    <div class="mb-4">
                        <p class="text-muted mb-2">Linha Digitável:</p>
                        <div class="input-group">
                            <input type="text" class="form-control" id="boletoLinha" value="${resposta.line}" readonly>
                            <button class="btn btn-outline-primary" type="button" onclick="PaywallAssinatura.copiarLinhaDigitavel()">
                                <i class="fas fa-copy me-2"></i>Copiar
                            </button>
                        </div>
                    </div>
                    <button class="btn btn-success w-100 mb-2" onclick="window.open('${resposta.pdf_url}', '_blank')">
                        <i class="fas fa-file-pdf me-2"></i>Abrir PDF
                    </button>
                    <button class="btn btn-info w-100" onclick="PaywallAssinatura.verificarPagamento()">
                        <i class="fas fa-check me-2"></i>Já Paguei
                    </button>
                </div>
            </div>
        `;
        document.getElementById('boletoContainer').innerHTML = html;
    }

    // ========================================================================
    // GERAR PAGAMENTO CARTÃO
    // ========================================================================

    function gerarPagamentoCartao(plano) {
        const html = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title mb-4">Dados do Cartão</h5>
                    <form id="formCartao">
                        <div class="mb-3">
                            <label class="form-label">Número do Cartão</label>
                            <input type="text" class="form-control" id="cardNumber" placeholder="0000 0000 0000 0000" maxlength="19" required>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Validade</label>
                                    <input type="text" class="form-control" id="cardExpiry" placeholder="MM/AA" maxlength="5" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">CVV</label>
                                    <input type="text" class="form-control" id="cardCVV" placeholder="123" maxlength="4" required>
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Nome do Titular</label>
                            <input type="text" class="form-control" id="cardHolder" placeholder="Nome Completo" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Endereço de Cobrança</label>
                            <input type="text" class="form-control mb-2" id="cardAddress" placeholder="Rua, número" required>
                            <input type="text" class="form-control mb-2" id="cardCity" placeholder="Cidade" required>
                            <input type="text" class="form-control mb-2" id="cardState" placeholder="UF" maxlength="2" required>
                            <input type="text" class="form-control" id="cardZip" placeholder="CEP" maxlength="8" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Parcelamento</label>
                            <select class="form-select" id="cardInstallments">
                                <option value="1">1x sem juros</option>
                                <option value="2">2x sem juros</option>
                                <option value="3">3x sem juros</option>
                                <option value="6">6x com juros</option>
                                <option value="12">12x com juros</option>
                            </select>
                        </div>
                        <button type="button" class="btn btn-primary w-100" onclick="PaywallAssinatura.processarCartao('${plano}')">
                            <i class="fas fa-credit-card me-2"></i>Processar Pagamento
                        </button>
                    </form>
                </div>
            </div>
        `;
        document.getElementById('cartaoContainer').innerHTML = html;
    }

    // ========================================================================
    // PROCESSAR CARTÃO
    // ========================================================================

    function processarCartao(plano) {
        // TODO: Implementar tokenização com script do Pagar.me
        // Por enquanto, usar placeholder
        
        const cardNumber = document.getElementById('cardNumber').value;
        const cardExpiry = document.getElementById('cardExpiry').value;
        const cardCVV = document.getElementById('cardCVV').value;
        const cardHolder = document.getElementById('cardHolder').value;
        const cardAddress = document.getElementById('cardAddress').value;
        const cardCity = document.getElementById('cardCity').value;
        const cardState = document.getElementById('cardState').value;
        const cardZip = document.getElementById('cardZip').value;
        const installments = document.getElementById('cardInstallments').value;
        
        // Validações básicas
        if (!cardNumber || !cardExpiry || !cardCVV || !cardHolder) {
            mostrarErro('Preencha todos os campos obrigatórios');
            return;
        }
        
        // TODO: Chamar API de tokenização do Pagar.me
        // const cardToken = await tokenizarCartao(...);
        
        const cardToken = 'card_token_placeholder_' + Date.now();
        
        const billingAddress = {
            line_1: cardAddress,
            city: cardCity,
            state: cardState,
            zip_code: cardZip,
            country: 'BR',
        };
        
        iniciarAssinatura(plano, 'credit_card', (resposta) => {
            if (resposta.ok) {
                renderizarCartao(resposta);
            } else {
                mostrarErro(resposta.erro || 'Erro ao processar cartão');
            }
        }, cardToken, billingAddress, installments);
    }

    function renderizarCartao(resposta) {
        const html = `
            <div class="card">
                <div class="card-body text-center">
                    <h5 class="card-title mb-4">Status do Pagamento</h5>
                    <div class="alert alert-info">
                        <p>${resposta.message}</p>
                    </div>
                    <button class="btn btn-success w-100" onclick="PaywallAssinatura.verificarPagamento()">
                        <i class="fas fa-check me-2"></i>Verificar Pagamento
                    </button>
                </div>
            </div>
        `;
        document.getElementById('cartaoContainer').innerHTML = html;
    }

    // ========================================================================
    // INICIAR ASSINATURA (CHAMAR API)
    // ========================================================================

    function iniciarAssinatura(plano, metodo, callback, cardToken=null, billingAddress=null, installments=1) {
        const payload = {
            plano_code: plano,
            payment_method: metodo,
        };
        
        if (cardToken) {
            payload.card_token = cardToken;
        }
        
        if (billingAddress) {
            payload.billing_address = billingAddress;
        }
        
        if (installments > 1) {
            payload.installments = installments;
        }
        
        fetch('/api/assinatura/iniciar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            callback(data);
        })
        .catch(error => {
            console.error('Erro:', error);
            callback({ok: false, erro: 'Erro ao conectar com servidor'});
        });
    }

    // ========================================================================
    // VERIFICAR PAGAMENTO
    // ========================================================================

    function verificarPagamento() {
        const btn = event.target;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Verificando...';
        
        checkAssinaturaStatus();
        
        setTimeout(() => {
            if (statusAssinatura && statusAssinatura.dias_assinatura > 0) {
                // Pagamento confirmado!
                fecharPaywall();
            } else {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-check me-2"></i>Já Paguei';
                mostrarErro('Ainda aguardando confirmação do pagamento. Tente novamente em alguns instantes.');
            }
        }, 2000);
    }

    // ========================================================================
    // INICIAR POLLING
    // ========================================================================

    function iniciarPolling() {
        if (pollingInterval) {
            clearInterval(pollingInterval);
        }
        
        pollingInterval = setInterval(() => {
            checkAssinaturaStatus();
            
            if (statusAssinatura && statusAssinatura.dias_assinatura > 0) {
                clearInterval(pollingInterval);
                fecharPaywall();
            }
        }, 15000);  // A cada 15 segundos
    }

    // ========================================================================
    // FECHAR PAYWALL
    // ========================================================================

    function fecharPaywall() {
        if (pollingInterval) {
            clearInterval(pollingInterval);
        }
        
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
        
        unlockUI();
        
        // Recarregar página
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    // ========================================================================
    // VOLTAR PARA SELEÇÃO DE PLANOS
    // ========================================================================

    function voltarPlanos() {
        document.getElementById('secaoMetodo').style.display = 'none';
        document.getElementById('secaoPlanos').style.display = 'block';
    }

    // ========================================================================
    // COPIAR PARA CLIPBOARD
    // ========================================================================

    function copiarPIX() {
        const input = document.getElementById('pixCopyPaste');
        input.select();
        document.execCommand('copy');
        
        const btn = event.target;
        const textOriginal = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check me-2"></i>Copiado!';
        setTimeout(() => {
            btn.innerHTML = textOriginal;
        }, 2000);
    }

    function copiarBoleto() {
        const input = document.getElementById('boletoBarcode');
        input.select();
        document.execCommand('copy');
        
        const btn = event.target;
        const textOriginal = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check me-2"></i>Copiado!';
        setTimeout(() => {
            btn.innerHTML = textOriginal;
        }, 2000);
    }

    function copiarLinhaDigitavel() {
        const input = document.getElementById('boletoLinha');
        input.select();
        document.execCommand('copy');
        
        const btn = event.target;
        const textOriginal = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check me-2"></i>Copiado!';
        setTimeout(() => {
            btn.innerHTML = textOriginal;
        }, 2000);
    }

    // ========================================================================
    // BLOQUEAR/DESBLOQUEAR UI
    // ========================================================================

    function lockUI() {
        if (uiLocked) return;
        
        uiLocked = true;
        document.body.style.overflow = 'hidden';
        
        document.querySelectorAll('a:not([data-bs-toggle]), button:not([data-bs-toggle])').forEach(el => {
            if (!el.closest('#modalPaywall')) {
                el.style.pointerEvents = 'none';
                el.style.opacity = '0.5';
            }
        });
    }

    function unlockUI() {
        if (!uiLocked) return;
        
        uiLocked = false;
        document.body.style.overflow = 'auto';
        
        document.querySelectorAll('a, button').forEach(el => {
            el.style.pointerEvents = 'auto';
            el.style.opacity = '1';
        });
    }

    // ========================================================================
    // MOSTRAR ERRO
    // ========================================================================

    function mostrarErro(mensagem) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show';
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `
            <i class="fas fa-exclamation-circle me-2"></i>
            ${mensagem}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        const container = document.getElementById('alertasContainer');
        container.insertBefore(alertDiv, container.firstChild);

        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    // ========================================================================
    // ESTILOS CSS
    // ========================================================================

    const paywallStyles = `
        .preco-card {
            background: white;
            border-radius: 10px;
            padding: 30px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: all 0.3s;
            border: 2px solid transparent;
            height: 100%;
            display: flex;
            flex-direction: column;
        }

        .preco-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 16px rgba(0,0,0,0.15);
        }

        .preco-card.destaque {
            border: 2px solid #0d6efd;
            transform: scale(1.05);
        }

        .preco-card h5 {
            font-weight: 600;
            margin-bottom: 15px;
            color: #212529;
        }

        .preco-valor {
            font-size: 2.5rem;
            font-weight: 700;
            color: #0d6efd;
            margin-bottom: 10px;
        }

        .preco-periodo {
            color: #6c757d;
            margin-bottom: 20px;
            font-size: 0.95rem;
        }

        .preco-lista {
            list-style: none;
            padding: 0;
            margin-bottom: 20px;
            text-align: left;
            flex-grow: 1;
        }

        .preco-lista li {
            padding: 10px 0;
            border-bottom: 1px solid #e9ecef;
            color: #495057;
            display: flex;
            align-items: center;
        }

        .preco-lista li:last-child {
            border-bottom: none;
        }

        .preco-lista li i {
            color: #198754;
            margin-right: 10px;
            font-size: 1rem;
        }

        .badge {
            font-size: 0.75rem;
        }

        #modalPaywall .modal-content {
            border: none;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }

        #modalPaywall .modal-header {
            border-bottom: 1px solid #e9ecef;
        }

        .nav-metodos .nav-link {
            color: #495057;
            border: 1px solid #dee2e6;
            border-bottom: none;
        }

        .nav-metodos .nav-link.active {
            background-color: #0d6efd;
            color: white;
            border-color: #0d6efd;
        }
    `;

    // Injetar estilos
    const styleElement = document.createElement('style');
    styleElement.textContent = paywallStyles;
    document.head.appendChild(styleElement);

    // ========================================================================
    // API PÚBLICA
    // ========================================================================

    return {
        init,
        checkAssinaturaStatus,
        verificarPagamento,
        voltarPlanos,
        processarCartao,
        copiarPIX,
        copiarBoleto,
        copiarLinhaDigitavel,
    };
})();

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    PaywallAssinatura.init();
});
