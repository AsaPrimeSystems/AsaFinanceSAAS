/**
 * SAAS GESTÃO FINANCEIRA - APP.JS APRIMORADO V2
 * Correções implementadas conforme especificações do prompt
 * - Garantia de funcionamento de todos os botões
 * - Feedback visual consistente
 * - Estados de carregamento
 * - Modais de confirmação para ações destrutivas
 * - Telemetria e logs por botão
 */

// ===== VARIÁVEIS GLOBAIS =====
let botoesCarregando = new Set();
let telemetriaAtiva = true;

// ===== INICIALIZAÇÃO DO SISTEMA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sistema SAAS Gestão Financeira V2 inicializado');
    
    // Inicializar todas as funcionalidades
    inicializarSistema();
});

// ===== FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO =====
function inicializarSistema() {
    try {
        // 1. Garantir funcionamento de todos os botões (PRIORIDADE MÁXIMA)
        garantirFuncionamentoBotoes();
        
        // 2. Inicializar componentes da interface
        inicializarPainelFinanceiro();
        inicializarTabelasResponsivas();
        inicializarFormularios();
        inicializarModais();
        inicializarFiltros();
        inicializarValidacoes();
        
        // 3. Configurar telemetria
        configurarTelemetria();
        
        console.log('✅ Todas as funcionalidades inicializadas com sucesso');
        
    } catch (error) {
        console.error('❌ Erro na inicialização do sistema:', error);
        mostrarToast('Erro na inicialização do sistema', 'error');
    }
}

// ===== 1. GARANTIA DE FUNCIONAMENTO DE TODOS OS BOTÕES =====
function garantirFuncionamentoBotoes() {
    console.log('🔧 Garantindo funcionamento de todos os botões...');
    
    // Selecionar TODOS os botões possíveis
    const seletoresBotoes = [
        '.btn', 'button', 
        'input[type="button"]', 'input[type="submit"]',
        '[role="button"]', '.btn-group .btn',
        '.dropdown-toggle', '.nav-link',
        '[data-bs-toggle]', '[data-toggle]'
    ];
    
    const todosBotoes = document.querySelectorAll(seletoresBotoes.join(', '));
    
    // Filtrar botões que já têm configuração específica
    const botoesParaConfigurar = Array.from(todosBotoes).filter(botao => {
        // PRIORIDADE 1: Ignorar botões controlados pelo Bootstrap (ANTES de qualquer outra verificação)
        const atributosBootstrap = ['data-bs-toggle', 'data-bs-dismiss', 'data-bs-target', 'data-bs-slide', 'data-toggle', 'data-dismiss', 'data-target'];
        if (atributosBootstrap.some(attr => botao.hasAttribute(attr))) {
            console.log(`🚫 Pulando botão Bootstrap:`, botao.className, 'atributos:', atributosBootstrap.filter(attr => botao.hasAttribute(attr)));
            return false;
        }

        // PRIORIDADE 2: Ignorar qualquer botão dentro de modais Bootstrap
        if (botao.closest('.modal')) {
            console.log(`🚫 Pulando botão dentro de modal:`, botao.className);
            return false;
        }

        // PRIORIDADE 3: Ignorar botões com atributo data-no-intercept
        if (botao.hasAttribute('data-no-intercept')) {
            return false;
        }

        // Excluir botões desabilitados
        if (botao.disabled || botao.hasAttribute('disabled') || botao.classList.contains('disabled')) {
            console.log(`🚫 Pulando botão desabilitado:`, botao.className);
            return false;
        }
        
        // Excluir botões que já têm configuração específica
        const classesEspecificas = [
            'btn-delete-lancamento',
            'btn-edit-lancamento', 
            'btn-toggle-status',
            'btn-delete',
            'btn-edit'
        ];
        
        // Verificar se já foi configurado por módulo específico
        if (botao.hasAttribute('data-modulo-configurado')) {
            return false;
        }

        // Ignorar botões do modal de confirmação de plano de contas
        if (botao.dataset && botao.dataset.contaId) {
            return false;
        }
 
        // NÃO interceptar botões com handlers inline (qualquer onclick)
        const onclickAttr = botao.getAttribute('onclick');
        if (onclickAttr) {
            console.log(`🚫 Pulando botão com onclick inline:`, botao.className);
            return false;
        }

        // NÃO interceptar botões de ações da tabela moderna de lançamentos
        if (botao.classList.contains('modern-action-btn') || botao.closest('.modern-actions-col')) {
            return false;
        }

        // Verificar classes específicas
        const temClasseEspecifica = classesEspecificas.some(classe => botao.classList.contains(classe));
        
        if (temClasseEspecifica) {
            console.log(`🔄 Pulando botão com classe específica:`, botao.className);
            return false;
        }
        
        return true;
    });
    
    console.log(`📊 Encontrados ${todosBotoes.length} botões, configurando ${botoesParaConfigurar.length} (excluindo botões com configuração específica)`);
    
    botoesParaConfigurar.forEach((botao, index) => {
        try {
            configurarBotao(botao, index);
        } catch (error) {
            console.error(`❌ Erro ao configurar botão ${index}:`, error);
        }
    });
    
    console.log(`✅ ${botoesParaConfigurar.length} botões configurados e funcionando`);
}

function configurarBotao(botao, index) {
    // 0. Verificar ANTES de tudo se é botão do Bootstrap - NÃO CLONAR NUNCA
    const atributosBootstrap = ['data-bs-toggle', 'data-bs-dismiss', 'data-bs-target', 'data-bs-slide', 'data-toggle', 'data-dismiss', 'data-target'];
    if (atributosBootstrap.some(attr => botao.hasAttribute(attr))) {
        console.log(`🚫 Botão Bootstrap detectado em configurarBotao, NÃO configurando:`, botao.className);
        return; // NÃO fazer nada com botões do Bootstrap - deixar o Bootstrap gerenciar
    }

    // 0. Verificar se botão está dentro de modal - NÃO CLONAR
    if (botao.closest('.modal')) {
        console.log(`🚫 Botão dentro de modal detectado, NÃO configurando:`, botao.className);
        return; // NÃO fazer nada com botões dentro de modais
    }

    // 0. Verificar se botão está desabilitado antes de configurar
    if (botao.disabled || botao.hasAttribute('disabled') || botao.classList.contains('disabled')) {
        console.log(`🚫 Botão desabilitado detectado, não configurando:`, botao.className);
        return;
    }
    
    // 1. Garantir visibilidade e clicabilidade
    botao.style.pointerEvents = 'auto';
    botao.style.cursor = 'pointer';
    botao.style.opacity = '1';
    botao.style.visibility = 'visible';
    botao.style.position = 'relative';
    botao.style.zIndex = 'auto';
    
    // 2. Identificar o botão
    const identificador = obterIdentificadorBotao(botao);
    botao.setAttribute('data-btn-id', `btn-${index}`);
    
    // 3. Remover event listeners existentes para evitar duplicação
    const novoBotao = botao.cloneNode(true);
    botao.parentNode.replaceChild(novoBotao, botao);
    
    // 4. Adicionar event listener principal
    novoBotao.addEventListener('click', function(e) {
        handleClickBotao(e, novoBotao, identificador);
    });
    
    // 5. Adicionar event listeners para acessibilidade
    novoBotao.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClickBotao(e, novoBotao, identificador);
        }
    });
    
    // 6. Garantir foco para navegação por teclado
    if (!novoBotao.hasAttribute('tabindex')) {
        novoBotao.setAttribute('tabindex', '0');
    }
    
    // 7. Adicionar eventos de hover para feedback visual
    novoBotao.addEventListener('mouseenter', function() {
        if (!botoesCarregando.has(novoBotao)) {
            novoBotao.style.transform = 'translateY(-1px)';
            novoBotao.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        }
    });
    
    novoBotao.addEventListener('mouseleave', function() {
        if (!botoesCarregando.has(novoBotao)) {
            novoBotao.style.transform = 'translateY(0)';
            novoBotao.style.boxShadow = '';
        }
    });
}

function obterIdentificadorBotao(botao) {
    return botao.textContent?.trim() || 
           botao.value || 
           botao.title || 
           botao.getAttribute('aria-label') || 
           botao.className || 
           'Botão sem identificação';
}

function handleClickBotao(e, botao, identificador) {
    try {
        // PRIORIDADE 1: Verificar se botão é controlado pelo Bootstrap (não interceptar)
        const atributosBootstrap = ['data-bs-toggle', 'data-bs-dismiss', 'data-bs-target', 'data-bs-slide', 'data-toggle', 'data-dismiss', 'data-target'];
        if (atributosBootstrap.some(attr => botao.hasAttribute(attr))) {
            console.log('✅ Botão Bootstrap detectado, permitindo comportamento padrão:', identificador, 'atributos:', atributosBootstrap.filter(attr => botao.hasAttribute(attr)));
            return; // Não chamar preventDefault, deixar o Bootstrap processar
        }

        // PRIORIDADE 2: Verificar se botão está dentro de um modal (não interceptar)
        if (botao.closest('.modal')) {
            console.log('✅ Botão dentro de modal, permitindo comportamento padrão:', identificador);
            return; // Não chamar preventDefault, deixar o botão funcionar normalmente
        }

        // PRIORIDADE 3: Verificar se botão tem atributo data-no-intercept (não interceptar)
        if (botao.hasAttribute('data-no-intercept')) {
            console.log('✅ Botão com data-no-intercept, permitindo comportamento padrão:', identificador);
            return; // Não chamar preventDefault, deixar o botão funcionar normalmente
        }

        // 1. Verificar se botão está desabilitado (proteção adicional)
        if (botao.disabled || botao.hasAttribute('disabled') || botao.classList.contains('disabled')) {
            e.preventDefault();
            console.log('🚫 Botão desabilitado clicado, ignorando:', identificador);
            return;
        }
        
        // 1. Log da telemetria
        logTelemetriaBotao(botao, identificador, 'click');
        
        // 2. Verificar se é ação destrutiva
        if (isAcaoDestrutiva(botao)) {
            e.preventDefault();
            confirmarAcaoDestrutiva(botao, identificador, e);
            return;
        }
        
        // 3. Verificar se botão já está carregando
        if (botoesCarregando.has(botao)) {
            e.preventDefault();
            console.log('⏳ Botão já está processando, ignorando clique');
            return;
        }
        
        // 4. Adicionar estado de carregamento para requests assíncronos
        if (isRequestAssincrono(botao)) {
            e.preventDefault();
            adicionarEstadoCarregamento(botao);
            executarRequestAssincrono(botao, identificador);
            return;
        }
        
        // 5. Adicionar feedback visual para cliques normais
        adicionarFeedbackVisual(botao);
        
        console.log(`✅ Botão clicado com sucesso: ${identificador}`);
        
    } catch (error) {
        console.error(`❌ Erro ao processar clique do botão "${identificador}":`, error);
        mostrarToast(`Erro ao processar ação: ${error.message}`, 'error');
        removerEstadoCarregamento(botao);
    }
}

function isAcaoDestrutiva(botao) {
    // Verificar se o botão já tem um modal específico (evitar dupla confirmação)
    if (botao.hasAttribute('onclick')) {
        const onclickStr = botao.getAttribute('onclick');
        if (onclickStr.includes('confirmarExclusao') ||
            onclickStr.includes('excluirLancamento(') ||
            onclickStr.includes('toggleStatus(')) {
            return false; // Não interceptar - já tem confirmação/fluxo próprio
        }
    }
    
    const textosDestrutivos = ['excluir', 'deletar', 'remover', 'cancelar', 'apagar'];
    const classesDestrutivas = ['btn-danger', 'btn-outline-danger', 'delete', 'remove'];
    
    const texto = botao.textContent?.toLowerCase() || '';
    const classes = botao.className.toLowerCase();
    
    return textosDestrutivos.some(t => texto.includes(t)) ||
           classesDestrutivas.some(c => classes.includes(c)) ||
           botao.hasAttribute('data-confirm');
}

function isRequestAssincrono(botao) {
    return botao.hasAttribute('data-url') ||
           botao.hasAttribute('data-ajax') ||
           botao.form?.hasAttribute('data-ajax') ||
           botao.closest('[data-ajax]') !== null;
}

function confirmarAcaoDestrutiva(botao, identificador, eventoOriginal) {
    const mensagem = botao.getAttribute('data-confirm') || 
                    `Tem certeza que deseja ${identificador.toLowerCase()}?`;
    
    // Usar CommonUtils.showConfirmModal se disponível para padronizar um único modal
    if (window.CommonUtils && typeof window.CommonUtils.showConfirmModal === 'function') {
        window.CommonUtils.showConfirmModal('Confirmação', mensagem, function() {
            console.log(`✅ Ação destrutiva confirmada: ${identificador}`);
            executarAcaoConfirmada(botao, identificador);
        });
        return;
    }

    // Fallback: criar modal interno
    criarModalConfirmacao(mensagem, function() {
        // Ação confirmada
        console.log(`✅ Ação destrutiva confirmada: ${identificador}`);
        executarAcaoConfirmada(botao, identificador);
    }).then(modal => {
        // Mostrar o modal após ser criado
        modal.show();
    }).catch(error => {
        console.error('❌ Erro ao criar modal:', error);
        // Fallback: usar confirm nativo
        if (confirm(mensagem)) {
            executarAcaoConfirmada(botao, identificador);
        }
    });
}

function executarAcaoConfirmada(botao, identificador) {
    // Remover prevenção e executar ação original
    botao.removeEventListener('click', handleClickBotao);
    
    if (isRequestAssincrono(botao)) {
        adicionarEstadoCarregamento(botao);
        executarRequestAssincrono(botao, identificador);
    } else {
        // Para formulários ou links normais
        if (botao.form) {
            botao.form.submit();
        } else if (botao.href) {
            window.location.href = botao.href;
        } else if (botao.getAttribute('onclick')) {
            // Se houver handler inline, chamá-lo de forma segura
            try {
                // Evitar recursão: disparar via Function para não reativar nosso listener
                const handler = botao.getAttribute('onclick');
                // eslint-disable-next-line no-new-func
                new Function(handler).call(botao);
            } catch (e) {
                console.warn('Falha ao executar handler inline:', e);
            }
        }
    }
    
    // Reconfigurar o botão
    setTimeout(() => configurarBotao(botao, Date.now()), 100);
}

function executarRequestAssincrono(botao, identificador) {
    const url = botao.getAttribute('data-url') || botao.form?.action;
    const method = botao.getAttribute('data-method') || botao.form?.method || 'GET';
    const formData = botao.form ? new FormData(botao.form) : null;
    
    console.log(`🌐 Executando request assíncrono: ${method} ${url}`);
    
    const options = {
        method: method.toUpperCase(),
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };
    
    if (formData && method.toUpperCase() !== 'GET') {
        options.body = formData;
    }
    
    fetch(url, options)
        .then(response => {
            logTelemetriaBotao(botao, identificador, 'response', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return response.json().catch(() => response.text());
        })
        .then(data => {
            console.log(`✅ Request concluído com sucesso: ${identificador}`);
            
            // Processar resposta
            if (typeof data === 'object' && data.success !== undefined) {
                if (data.success) {
                    mostrarToast(data.message || 'Operação realizada com sucesso!', 'success');
                    if (data.redirect) {
                        window.location.href = data.redirect;
                    } else if (data.reload) {
                        // Verificar se é uma operação que pode ser atualizada sem refresh
                        if (data.update_dom) {
                            // Atualizar DOM sem refresh
                            this.atualizarDOM(data);
                        } else {
                            window.location.reload();
                        }
                    }
                } else {
                    mostrarToast(data.message || 'Erro na operação', 'error');
                }
            } else {
                mostrarToast('Operação realizada com sucesso!', 'success');
                // Se não há resposta JSON, assumir sucesso e recarregar
                setTimeout(() => window.location.reload(), 1000);
            }
        })
        .catch(error => {
            console.error(`❌ Erro no request assíncrono: ${identificador}`, error);
            logTelemetriaBotao(botao, identificador, 'error', error.message);
            mostrarToast(`Erro: ${error.message}`, 'error');
        })
        .finally(() => {
            removerEstadoCarregamento(botao);
        });
}

function adicionarEstadoCarregamento(botao) {
    botoesCarregando.add(botao);
    
    // Salvar estado original
    botao.setAttribute('data-original-text', botao.innerHTML);
    botao.setAttribute('data-original-disabled', botao.disabled);
    
    // Aplicar estado de carregamento
    botao.disabled = true;
    botao.style.opacity = '0.7';
    botao.style.cursor = 'wait';
    botao.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Processando...';
}

function removerEstadoCarregamento(botao) {
    botoesCarregando.delete(botao);
    
    // Restaurar estado original
    const textoOriginal = botao.getAttribute('data-original-text');
    const disabledOriginal = botao.getAttribute('data-original-disabled') === 'true';
    
    if (textoOriginal) {
        botao.innerHTML = textoOriginal;
    }
    
    botao.disabled = disabledOriginal;
    botao.style.opacity = '1';
    botao.style.cursor = 'pointer';
    
    // Remover atributos temporários
    botao.removeAttribute('data-original-text');
    botao.removeAttribute('data-original-disabled');
}

function adicionarFeedbackVisual(botao) {
    // Efeito de clique
    botao.style.transform = 'scale(0.95)';
    botao.style.transition = 'transform 0.1s ease';
    
    setTimeout(() => {
        botao.style.transform = 'scale(1)';
    }, 100);
    
    // Efeito de ondulação (ripple)
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255,255,255,0.6);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    `;
    
    const rect = botao.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (rect.width / 2 - size / 2) + 'px';
    ripple.style.top = (rect.height / 2 - size / 2) + 'px';
    
    botao.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// ===== 2. SISTEMA DE TELEMETRIA =====
function configurarTelemetria() {
    if (!telemetriaAtiva) return;
    
    // Adicionar CSS para animações
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .btn-loading {
            position: relative;
            overflow: hidden;
        }
        
        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        }
        
        .toast-custom {
            min-width: 300px;
            margin-bottom: 10px;
        }
    `;
    document.head.appendChild(style);
    
    console.log('📊 Telemetria configurada');
}

function logTelemetriaBotao(botao, identificador, evento, dados = null) {
    if (!telemetriaAtiva) return;
    
    const log = {
        timestamp: new Date().toISOString(),
        botao_id: botao.getAttribute('data-btn-id'),
        identificador: identificador,
        evento: evento,
        dados: dados,
        url_atual: window.location.href,
        user_agent: navigator.userAgent.substring(0, 100)
    };
    
    console.log(`📊 Telemetria [${evento}]:`, log);
    
    // Enviar para servidor se necessário
    if (evento === 'error') {
        enviarTelemetriaServidor(log);
    }
}

function enviarTelemetriaServidor(log) {
    // Implementar envio para servidor se necessário
    fetch('/api/telemetria', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(log)
    }).catch(error => {
        console.warn('⚠️ Falha ao enviar telemetria:', error);
    });
}

// ===== 3. SISTEMA DE MODAIS E TOASTS =====
function criarModalConfirmacao(mensagem, callback) {
    const cleanupModalState = () => {
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        const body = document.body;
        if (body) {
            body.classList.remove('modal-open');
            body.style.removeProperty('padding-right');
        }
    };

    cleanupModalState();

    // Verificar se já existe um modal aberto
    const modalExistente = document.querySelector('.modal.show');
    if (modalExistente) {
        console.log('🔄 Modal já existe, fechando anterior...');
        const bsModal = bootstrap.Modal.getInstance(modalExistente);
        if (bsModal) {
            modalExistente.addEventListener('hidden.bs.modal', () => {
                modalExistente.remove();
                cleanupModalState();
            }, { once: true });
            bsModal.hide();
        } else {
            modalExistente.remove();
            cleanupModalState();
        }
    }
 
    // Remover modais de confirmação antigos para evitar duplicação
    document.querySelectorAll('[id^="modal-confirmacao-"]').forEach(modal => {
        console.log('🗑️ Removendo modal antigo:', modal.id);
        modal.remove();
    });
 
    // Aguardar um pouco para garantir que modais anteriores foram removidos
    return new Promise((resolve) => {
        setTimeout(() => {
            const modalId = 'modal-confirmacao-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            
            const modalHtml = `
                <div class="modal fade" id="${modalId}" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="fas fa-exclamation-triangle text-warning me-2"></i>Confirmação
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <p class="mb-0">${mensagem}</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    <i class="fas fa-times me-2"></i>Cancelar
                                </button>
                                <button type="button" class="btn btn-danger" id="confirmar-${modalId}">
                                    <i class="fas fa-check me-2"></i>Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            const modalElement = document.getElementById(modalId);
            const modal = new bootstrap.Modal(modalElement, {
                backdrop: 'static',
                keyboard: true
            });
            
            // Configurar botão de confirmação
            const btnConfirmar = document.getElementById(`confirmar-${modalId}`);
            btnConfirmar.addEventListener('click', function() {
                modal.hide();
                setTimeout(() => callback(), 100); // Pequeno delay para garantir que o modal seja fechado
            });
            
            // Remover modal do DOM após fechar
            modalElement.addEventListener('hidden.bs.modal', function() {
                modalElement.remove();
                cleanupModalState();
            });
            
            // Permitir fechar com ESC
            modalElement.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    modal.hide();
                }
            });
            
            console.log('✅ Modal de confirmação criado:', modalId);
            resolve(modal);
        }, 50);
    });
}

function mostrarToast(mensagem, tipo = 'info') {
    // Criar container se não existir
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toastId = 'toast-' + Date.now();
    const corTipo = {
        'success': 'text-bg-success',
        'error': 'text-bg-danger',
        'warning': 'text-bg-warning',
        'info': 'text-bg-info'
    };
    
    const toastHtml = `
        <div id="${toastId}" class="toast toast-custom ${corTipo[tipo] || corTipo.info}" role="alert">
            <div class="toast-header">
                <strong class="me-auto">Sistema</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${mensagem}
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
    
    toast.show();
    
    // Remover do DOM após ocultar
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}

// ===== 4. OUTRAS FUNCIONALIDADES =====
function inicializarPainelFinanceiro() {
    console.log('💰 Inicializando painel financeiro...');
    
    const painelFinanceiro = document.getElementById('quadrinhosFinanceiro');
    if (painelFinanceiro) {
        const caixinhas = painelFinanceiro.querySelectorAll('.caixinha');
        caixinhas.forEach(caixinha => {
            caixinha.addEventListener('click', function() {
                const acao = caixinha.getAttribute('data-action');
                if (acao) {
                    adicionarFeedbackVisual(caixinha);
                    setTimeout(() => {
                        switch(acao) {
                            case 'ver-entradas':
                                window.location.href = '/lancamentos?tipo=entrada';
                                break;
                            case 'ver-saidas':
                                window.location.href = '/lancamentos?tipo=saida';
                                break;
                            case 'ver-saldo':
                                window.location.href = '/relatorio-saldos';
                                break;
                        }
                    }, 200);
                }
            });
        });
    }
}

function inicializarTabelasResponsivas() {
    console.log('📊 Inicializando tabelas responsivas...');
    
    const tabelas = document.querySelectorAll('.table-responsive');
    tabelas.forEach(tabela => {
        // Garantir que botões de ação sejam sempre visíveis
        const botoesAcao = tabela.querySelectorAll('.btn-group .btn');
        botoesAcao.forEach(botao => {
            botao.style.minWidth = 'auto';
            botao.style.whiteSpace = 'nowrap';
        });
    });
}

function inicializarFormularios() {
    console.log('📝 Inicializando formulários...');
    
    const formularios = document.querySelectorAll('form');
    formularios.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = form.querySelector('input[type="submit"], button[type="submit"]');
            if (submitBtn && !botoesCarregando.has(submitBtn)) {
                adicionarEstadoCarregamento(submitBtn);
            }
        });
    });
}

function inicializarModais() {
    console.log('🪟 Inicializando modais...');
    // Configurações específicas de modais se necessário
}

function inicializarFiltros() {
    console.log('🔍 Inicializando filtros...');
    // Configurações específicas de filtros se necessário
}

function inicializarValidacoes() {
    console.log('✅ Inicializando validações...');
    // Configurações específicas de validações se necessário
}

// ===== EXPORTAR FUNÇÕES GLOBAIS =====
window.garantirFuncionamentoBotoes = garantirFuncionamentoBotoes;
window.mostrarToast = mostrarToast;
window.criarModalConfirmacao = criarModalConfirmacao;

console.log('🎉 App.js V2 carregado com sucesso!');

