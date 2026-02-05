// Máscara automática para campos de data
document.addEventListener('DOMContentLoaded', function() {
    // Função para aplicar máscara de data
    function aplicarMascaraData(input) {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
            
            // Aplica a máscara DD/MM/AAAA
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2);
            }
            if (value.length >= 5) {
                value = value.substring(0, 5) + '/' + value.substring(5, 9);
            }
            
            e.target.value = value;
        });
        
        // Validação em tempo real
        input.addEventListener('blur', function(e) {
            const value = e.target.value;
            if (value && value.length === 10) {
                // Validar se a data é válida
                const partes = value.split('/');
                if (partes.length === 3) {
                    const dia = parseInt(partes[0]);
                    const mes = parseInt(partes[1]);
                    const ano = parseInt(partes[2]);
                    
                    // Validações básicas
                    if (dia < 1 || dia > 31 || mes < 1 || mes > 12 || ano < 1900 || ano > 2100) {
                        input.classList.add('is-invalid');
                        mostrarErroCampo(input, 'Data inválida');
                    } else {
                        input.classList.remove('is-invalid');
                        removerErroCampo(input);
                    }
                }
            }
        });
    }
    
    // Função para mostrar erro em campo específico
    function mostrarErroCampo(campo, mensagem) {
        // Remove erro anterior se existir
        removerErroCampo(campo);
        
        // Adiciona classe de erro
        campo.classList.add('is-invalid');
        
        // Cria elemento de erro
        const erroDiv = document.createElement('div');
        erroDiv.className = 'invalid-feedback';
        erroDiv.textContent = mensagem;
        erroDiv.id = 'erro-' + campo.id;
        
        // Insere após o campo
        campo.parentNode.appendChild(erroDiv);
        
        // Destaca o campo
        campo.focus();
        campo.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Função para remover erro de campo
    function removerErroCampo(campo) {
        campo.classList.remove('is-invalid');
        const erroExistente = document.getElementById('erro-' + campo.id);
        if (erroExistente) {
            erroExistente.remove();
        }
    }
    
    // Aplicar máscara em todos os campos de data
    const camposData = document.querySelectorAll('input[placeholder*="dd/mm/aaaa"], input[placeholder*="__/__/____"], input[pattern*="\\d{2}/\\d{2}/\\d{4}"], input[name*="data"]');
    camposData.forEach(campo => {
        aplicarMascaraData(campo);
    });
    
    // Função para controlar campos de data personalizada
    function controlarCamposDataPersonalizada() {
        const selectsPeriodo = document.querySelectorAll('select[name="periodo"]');
        
        selectsPeriodo.forEach(select => {
            const dataInicioContainer = document.getElementById('data_inicio_container');
            const dataFimContainer = document.getElementById('data_fim_container');
            const dataInicioInput = document.getElementById('data_inicio');
            const dataFimInput = document.getElementById('data_fim');
            
            if (dataInicioContainer && dataFimContainer && dataInicioInput && dataFimInput) {
                function toggleCamposData() {
                    if (select.value === 'personalizado') {
                        dataInicioContainer.style.display = 'block';
                        dataFimContainer.style.display = 'block';
                    } else {
                        dataInicioContainer.style.display = 'none';
                        dataFimContainer.style.display = 'none';
                        dataInicioInput.value = '';
                        dataFimInput.value = '';
                    }
                }
                
                // Mostrar campos se já estiver selecionado
                toggleCamposData();
                
                // Event listener para mudança no select
                select.addEventListener('change', toggleCamposData);
            }
        });
    }
    
    // Aplicar controle de campos personalizados
    controlarCamposDataPersonalizada();
    
    // Debug: verificar se os elementos existem
    console.log('Máscara de data carregada');
    console.log('Selects de período encontrados:', document.querySelectorAll('select[name="periodo"]').length);
    console.log('Container data início:', document.getElementById('data_inicio_container'));
    console.log('Container data fim:', document.getElementById('data_fim_container'));
    
    // Interceptar alertas de erro para destacar campos
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.classList && node.classList.contains('alert-danger')) {
                        // Encontrou um alerta de erro
                        const textoAlerta = node.textContent.toLowerCase();
                        
                        // Mapear tipos de erro para campos
                        if (textoAlerta.includes('data prevista')) {
                            const campo = document.querySelector('input[name="data_prevista"]');
                            if (campo) {
                                mostrarErroCampo(campo, 'Data prevista inválida');
                            }
                        } else if (textoAlerta.includes('data realizada')) {
                            const campo = document.querySelector('input[name="data_realizada"]');
                            if (campo) {
                                mostrarErroCampo(campo, 'Data realizada inválida');
                            }
                        } else if (textoAlerta.includes('primeira parcela')) {
                            const campo = document.querySelector('input[name="primeira_parcela"]');
                            if (campo) {
                                mostrarErroCampo(campo, 'Data da primeira parcela inválida');
                            }
                        } else if (textoAlerta.includes('data início')) {
                            const campo = document.querySelector('input[name="data_inicio"]');
                            if (campo) {
                                mostrarErroCampo(campo, 'Data de início inválida');
                            }
                        } else if (textoAlerta.includes('data fim')) {
                            const campo = document.querySelector('input[name="data_fim"]');
                            if (campo) {
                                mostrarErroCampo(campo, 'Data de fim inválida');
                            }
                        }
                    }
                });
            }
        });
    });
    
    // Observar mudanças no DOM para detectar alertas
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// Função global para validar data
function validarData(dataStr) {
    if (!dataStr || dataStr.length !== 10) return false;
    
    const partes = dataStr.split('/');
    if (partes.length !== 3) return false;
    
    const dia = parseInt(partes[0]);
    const mes = parseInt(partes[1]);
    const ano = parseInt(partes[2]);
    
    // Validações básicas
    if (dia < 1 || dia > 31 || mes < 1 || mes > 12 || ano < 1900 || ano > 2100) {
        return false;
    }
    
    // Validar se a data existe (ex: 31/02 não existe)
    const data = new Date(ano, mes - 1, dia);
    return data.getDate() === dia && data.getMonth() === mes - 1 && data.getFullYear() === ano;
}

// Função para converter data DD/MM/AAAA para AAAA-MM-DD
function converterDataParaBanco(dataStr) {
    if (!dataStr || dataStr.length !== 10) return null;
    
    const partes = dataStr.split('/');
    if (partes.length !== 3) return null;
    
    const dia = partes[0].padStart(2, '0');
    const mes = partes[1].padStart(2, '0');
    const ano = partes[2];
    
    return `${ano}-${mes}-${dia}`;
}

// Função para converter data AAAA-MM-DD para DD/MM/AAAA
function converterDataParaExibicao(dataStr) {
    if (!dataStr) return '';
    
    const partes = dataStr.split('-');
    if (partes.length !== 3) return dataStr;
    
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

