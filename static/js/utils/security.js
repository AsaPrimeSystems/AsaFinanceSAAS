/**
 * Security Utilities
 * Funções de segurança para proteger dados sensíveis
 */

class SecurityManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupContentSecurityPolicy();
        this.setupXSSProtection();
        this.setupClickjackingProtection();
        this.setupSecureHeaders();
    }

    setupContentSecurityPolicy() {
        // Adicionar meta tag para Content Security Policy
        const csp = document.createElement('meta');
        csp.httpEquiv = 'Content-Security-Policy';
        csp.content = `
            default-src 'self';
            script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
            style-src  'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
            img-src    'self' data: https:;
            font-src   'self' https://cdnjs.cloudflare.com;
            connect-src 'self' https://cdnjs.cloudflare.com;
            frame-ancestors 'none';
        `.replace(/\s+/g, ' ').trim();
        
        document.head.appendChild(csp);
    }

    setupXSSProtection() {
        // Adicionar meta tag para XSS Protection
        const xss = document.createElement('meta');
        xss.httpEquiv = 'X-XSS-Protection';
        xss.content = '1; mode=block';
        document.head.appendChild(xss);
    }

    setupClickjackingProtection() {
        // Adicionar meta tag para Clickjacking Protection
        const frameOptions = document.createElement('meta');
        frameOptions.httpEquiv = 'X-Frame-Options';
        frameOptions.content = 'DENY';
        document.head.appendChild(frameOptions);
    }

    setupSecureHeaders() {
        // Adicionar meta tag para Referrer Policy
        const referrer = document.createElement('meta');
        referrer.name = 'referrer';
        referrer.content = 'strict-origin-when-cross-origin';
        document.head.appendChild(referrer);
    }

    static sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        
        // Remover tags HTML perigosas
        const dangerousTags = /<script[^>]*>.*?<\/script>/gi;
        const dangerousAttributes = /on\w+\s*=\s*["'][^"']*["']/gi;
        
        return input
            .replace(dangerousTags, '')
            .replace(dangerousAttributes, '')
            .replace(/[<>]/g, '')
            .trim();
    }

    static validateCSRFToken(token) {
        // Validar token CSRF se necessário
        return token && token.length > 10;
    }

    static escapeHtml(text) {
        if (typeof text !== 'string') return '';
        
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, function(m) {
            return map[m];
        });
    }

    static validateUrl(url) {
        try {
            const urlObj = new URL(url);
            return ['http:', 'https:'].includes(urlObj.protocol);
        } catch (e) {
            return false;
        }
    }

    static sanitizeUrl(url) {
        if (!this.validateUrl(url)) {
            return '';
        }
        
        const urlObj = new URL(url);
        
        // Remover parâmetros perigosos
        const dangerousParams = ['javascript:', 'data:', 'vbscript:'];
        for (const param of dangerousParams) {
            if (urlObj.href.toLowerCase().includes(param)) {
                return '';
            }
        }
        
        return urlObj.href;
    }

    static generateSecureId() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    static hashData(data) {
        // Função simples de hash para dados não sensíveis
        let hash = 0;
        const str = JSON.stringify(data);
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        return hash.toString();
    }

    static detectSuspiciousActivity() {
        // Detectar atividade suspeita
        const suspiciousPatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /eval\s*\(/i,
            /document\.cookie/i,
            /window\.location/i
        ];
        
        const inputs = document.querySelectorAll('input, textarea');
        for (const input of inputs) {
            const value = input.value;
            for (const pattern of suspiciousPatterns) {
                if (pattern.test(value)) {
                    console.warn('Atividade suspeita detectada:', value);
                    return true;
                }
            }
        }
        
        return false;
    }

    static setupFormValidation() {
        // Configurar validação de formulários
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (this.detectSuspiciousActivity()) {
                    e.preventDefault();
                    CommonUtils.showAlert('Atividade suspeita detectada. Formulário bloqueado.', 'danger');
                    return false;
                }
                
                // Sanitizar todos os inputs
                const inputs = form.querySelectorAll('input, textarea');
                inputs.forEach(input => {
                    if (input.type !== 'password') {
                        input.value = this.sanitizeInput(input.value);
                    }
                });
            });
        });
    }

    static logSecurityEvent(event, details) {
        // Log de eventos de segurança
        const logData = {
            timestamp: new Date().toISOString(),
            event: event,
            details: details,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // Enviar para o servidor se necessário
        fetch('/api/security-log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(logData)
        }).catch(error => {
            console.error('Erro ao enviar log de segurança:', error);
        });
    }

    static setupSessionTimeout() {
        // Configurar timeout de sessão
        let lastActivity = Date.now();
        const timeout = 30 * 60 * 1000; // 30 minutos
        
        const updateActivity = () => {
            lastActivity = Date.now();
        };
        
        const checkTimeout = () => {
            if (Date.now() - lastActivity > timeout) {
                this.logSecurityEvent('session_timeout', { timeout: timeout });
                CommonUtils.showAlert('Sessão expirada. Redirecionando para login...', 'warning');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            }
        };
        
        // Atualizar atividade em eventos do usuário
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, updateActivity, true);
        });
        
        // Verificar timeout a cada minuto
        setInterval(checkTimeout, 60000);
    }
}

// Inicializar segurança quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    window.securityManager = new SecurityManager();
    SecurityManager.setupFormValidation();
    SecurityManager.setupSessionTimeout();
});

// Exportar para uso global
window.SecurityManager = SecurityManager;
