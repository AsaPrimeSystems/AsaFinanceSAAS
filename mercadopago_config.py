"""
Configurações do Mercado Pago
IMPORTANTE: Após obter suas credenciais, substitua os valores abaixo
"""
import os

# ============================================================================
# CREDENCIAIS DO MERCADO PAGO
# ============================================================================
# Obtenha suas credenciais em: https://www.mercadopago.com.br/developers/panel/credentials
#
# Para TESTES, use as credenciais que começam com TEST-
# Para PRODUÇÃO, use as credenciais que começam com APP_USR-

# SUBSTITUA AQUI COM SEU ACCESS TOKEN
MERCADOPAGO_ACCESS_TOKEN = os.getenv(
    'MERCADOPAGO_ACCESS_TOKEN',
    'APP_USR-5873491564020286-122213-f7c4612e2e77115a75ef884bf11bad70-3085796742'
)

# SUBSTITUA AQUI COM SUA PUBLIC KEY (usada no frontend)
MERCADOPAGO_PUBLIC_KEY = os.getenv(
    'MERCADOPAGO_PUBLIC_KEY',
    'APP_USR-7c667be3-32c5-412d-adc7-0ed91090e124'
)

# ============================================================================
# URLs DE RETORNO
# ============================================================================
# Em produção, altere para seu domínio real
# Exemplo: https://seusite.com.br
BASE_URL = os.getenv('BASE_URL', 'http://localhost:8002')

# URLs para onde o Mercado Pago redireciona o usuário após o pagamento
SUCCESS_URL = f"{BASE_URL}/pagamento/sucesso"
FAILURE_URL = f"{BASE_URL}/pagamento/falha"
PENDING_URL = f"{BASE_URL}/pagamento/pendente"

# URL para receber notificações de pagamento (webhook)
# IMPORTANTE: Em desenvolvimento local, use ngrok para expor esta URL
# Exemplo: ngrok http 8002 → use https://xxxx.ngrok.io/webhook/mercadopago
WEBHOOK_URL = f"{BASE_URL}/webhook/mercadopago"

# ============================================================================
# CONFIGURAÇÕES
# ============================================================================
# True = Modo de teste (use cartões de teste)
# False = Modo de produção (pagamentos reais)
TEST_MODE = False  # PRODUÇÃO - Pagamentos REAIS!

# Nome que aparece na fatura do cartão
STATEMENT_DESCRIPTOR = "ASA FINANCE"

# ============================================================================
# VALIDAÇÃO
# ============================================================================
def validar_configuracao():
    """Valida se as credenciais foram configuradas"""
    if 'SUBSTITUA-AQUI' in MERCADOPAGO_ACCESS_TOKEN:
        return False, "⚠️  ACCESS TOKEN não configurado! Edite o arquivo mercadopago_config.py"

    if 'SUBSTITUA-AQUI' in MERCADOPAGO_PUBLIC_KEY:
        return False, "⚠️  PUBLIC KEY não configurada! Edite o arquivo mercadopago_config.py"

    if not MERCADOPAGO_ACCESS_TOKEN.startswith('TEST-') and not MERCADOPAGO_ACCESS_TOKEN.startswith('APP_USR-'):
        return False, "⚠️  ACCESS TOKEN com formato inválido"

    return True, "✅ Configuração válida"

# ============================================================================
# CARTÕES DE TESTE (apenas para modo TEST)
# ============================================================================
"""
Use estes cartões APENAS quando estiver em modo de teste:

CARTÃO APROVADO:
- Número: 5031 4332 1540 6351
- CVV: 123
- Validade: 11/25
- Titular: APRO
- CPF: 123.456.789-01

CARTÃO RECUSADO:
- Número: 4013 5406 8274 6260
- CVV: 123
- Validade: 11/25
- Titular: OTHE
- CPF: 123.456.789-01

Mais cartões: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/test/cards
"""

# ============================================================================
# COMO CONFIGURAR
# ============================================================================
"""
PASSO A PASSO:

1. Criar conta no Mercado Pago:
   → https://www.mercadopago.com.br

2. Acessar painel de desenvolvedor:
   → https://www.mercadopago.com.br/developers/panel/credentials

3. Copiar as credenciais de TESTE:
   - Access Token (começa com TEST-)
   - Public Key (começa com TEST-)

4. Substituir os valores neste arquivo:
   - MERCADOPAGO_ACCESS_TOKEN = 'TEST-seu-token-aqui'
   - MERCADOPAGO_PUBLIC_KEY = 'TEST-sua-key-aqui'

5. Instalar SDK:
   → pip install mercadopago

6. Popular planos:
   → python3 popular_planos.py

7. Testar integração:
   → Acessar http://localhost:8002/precos
   → Clicar em "Assinar Agora"
   → Usar cartão de teste

8. Configurar webhook (desenvolvimento):
   → Instalar ngrok: https://ngrok.com/download
   → Executar: ngrok http 8002
   → Copiar URL gerada (ex: https://xxxx.ngrok.io)
   → Configurar em: https://www.mercadopago.com.br/developers/panel/notifications/webhooks
   → URL webhook: https://xxxx.ngrok.io/webhook/mercadopago

9. Após testes, trocar para PRODUÇÃO:
   - Copiar credenciais de PRODUÇÃO (começa com APP_USR-)
   - Alterar TEST_MODE = False
   - Configurar webhook com domínio real
"""
