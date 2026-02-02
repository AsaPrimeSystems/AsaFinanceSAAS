/**
 * Ocultar cards vazios no dashboard
 */

(function() {
    'use strict';

    // Função para verificar e ocultar card de lançamentos agendados se vazio
    function hideEmptyLancamentosCard() {
        const container = document.getElementById('lancamentos-agendados-container');
        const lista = document.getElementById('lancamentos-agendados-lista');

        if (container && lista) {
            // Verificar se está vazio (sem conteúdo ou só com whitespace)
            const isEmpty = !lista.innerHTML.trim() || lista.children.length === 0;

            if (isEmpty) {
                container.style.display = 'none';
            } else {
                container.style.display = '';
            }
        }
    }

    // Executar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hideEmptyLancamentosCard);
    } else {
        hideEmptyLancamentosCard();
    }

    // Observar mudanças no conteúdo da lista
    const lista = document.getElementById('lancamentos-agendados-lista');
    if (lista) {
        // Criar um MutationObserver para detectar mudanças
        const observer = new MutationObserver(hideEmptyLancamentosCard);

        // Observar mudanças no conteúdo
        observer.observe(lista, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    // Executar novamente após um pequeno delay (para garantir que AJAX carregou)
    setTimeout(hideEmptyLancamentosCard, 500);
    setTimeout(hideEmptyLancamentosCard, 1000);
    setTimeout(hideEmptyLancamentosCard, 2000);

})();
