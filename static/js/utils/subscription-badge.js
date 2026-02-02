/**
 * Gerenciar badge de assinatura no header
 */

(function() {
    'use strict';

    // Executar quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', function() {
        const badge = document.querySelector('.subscription-badge');
        const daysElement = document.querySelector('.subscription-days');

        if (badge && daysElement) {
            const days = parseInt(daysElement.textContent);

            // Aplicar classe baseada nos dias restantes
            if (days <= 0) {
                badge.classList.add('danger');
                daysElement.style.color = '#ffffff';
            } else if (days <= 7) {
                badge.classList.add('warning');
                daysElement.style.color = '#ffffff';
            } else if (days <= 30) {
                badge.style.borderColor = 'rgba(255, 193, 7, 0.6)';
            }

            // Adicionar tooltip
            let tooltipText = `${days} dias restantes de assinatura`;

            if (days <= 0) {
                tooltipText = 'Sua assinatura expirou!';
            } else if (days <= 7) {
                tooltipText = `Atenção! Apenas ${days} dias restantes`;
            } else if (days <= 30) {
                tooltipText = `${days} dias até o vencimento da assinatura`;
            }

            badge.setAttribute('title', tooltipText);
            badge.style.cursor = 'help';
        }
    });

})();
