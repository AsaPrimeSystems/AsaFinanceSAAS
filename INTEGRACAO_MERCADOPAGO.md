# Integração com Mercado Pago - Guia Completo

## Visão Geral

Este documento explica como integrar o Mercado Pago ao sistema de assinaturas Asa Finance. O fluxo funciona da seguinte forma:

1. Usuário visualiza planos em `/precos`
2. Clica em "Assinar Agora" escolhendo um plano
3. É redirecionado para página de checkout
4. Sistema cria preferência de pagamento no Mercado Pago
5. Usuário é levado para portal do Mercado Pago
6. Após pagamento, Mercado Pago notifica via webhook
7. Sistema processa pagamento e credita dias de assinatura

## Pré-requisitos

### 1. Criar Conta no Mercado Pago

1. Acesse: https://www.mercadopago.com.br
2. Crie uma conta ou faça login
3. Acesse o Painel de Desenvolvedor

### 2. Obter Credenciais

1. Acesse: https://www.mercadopago.com.br/developers/panel/credentials
2. **Modo de Teste (desenvolvimento)**:
   - Public Key: `TEST-xxxxxx`
   - Access Token: `TEST-xxxxxx`
3. **Modo de Produção** (após testar):
   - Public Key: `APP_USR-xxxxxx`
   - Access Token: `APP_USR-xxxxxx`

### 3. Instalar SDK do Mercado Pago

```bash
pip install mercadopago
```

## Configuração

### 1. Arquivo de Configuração

Crie o arquivo `config/mercadopago_config.py`:

```python
import os

# Credenciais do Mercado Pago
MERCADOPAGO_ACCESS_TOKEN = os.getenv('MERCADOPAGO_ACCESS_TOKEN', 'TEST-xxxxxx')
MERCADOPAGO_PUBLIC_KEY = os.getenv('MERCADOPAGO_PUBLIC_KEY', 'TEST-xxxxxx')

# URLs de retorno (ajustar para seu domínio)
BASE_URL = os.getenv('BASE_URL', 'http://localhost:8002')
SUCCESS_URL = f"{BASE_URL}/pagamento/sucesso"
FAILURE_URL = f"{BASE_URL}/pagamento/falha"
PENDING_URL = f"{BASE_URL}/pagamento/pendente"
WEBHOOK_URL = f"{BASE_URL}/webhook/mercadopago"

# Modo de teste
TEST_MODE = True  # Mudar para False em produção
```

### 2. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxx
MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxx
BASE_URL=http://localhost:8002
```

**IMPORTANTE**: Adicione `.env` ao `.gitignore` para não commitar as credenciais!

## Estrutura do Banco de Dados

Foram criadas duas novas tabelas:

### Tabela `plano`
```sql
CREATE TABLE plano (
    id INTEGER PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    dias_assinatura INTEGER NOT NULL,
    valor FLOAT NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    ordem_exibicao INTEGER DEFAULT 0,
    data_criacao DATETIME
);
```

### Tabela `pagamento`
```sql
CREATE TABLE pagamento (
    id INTEGER PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    plano_id INTEGER NOT NULL,
    preference_id VARCHAR(200),
    payment_id VARCHAR(200),
    external_reference VARCHAR(200) UNIQUE NOT NULL,
    valor FLOAT NOT NULL,
    dias_assinatura INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    status_detail VARCHAR(200),
    payment_type VARCHAR(50),
    payment_method VARCHAR(50),
    data_criacao DATETIME,
    data_aprovacao DATETIME,
    data_expiracao DATETIME,
    observacoes TEXT,
    dados_mp TEXT,
    FOREIGN KEY (empresa_id) REFERENCES empresa(id),
    FOREIGN KEY (plano_id) REFERENCES plano(id)
);
```

## Fluxo de Integração

### 1. Cadastrar Planos

Execute o script `popular_planos.py` para criar os planos:

```python
from app import app, db, Plano

with app.app_context():
    # Limpar planos existentes (apenas em dev)
    Plano.query.delete()

    # Criar planos
    planos = [
        Plano(
            nome="Plano 30 Dias",
            codigo="30d",
            dias_assinatura=30,
            valor=49.90,
            descricao="Acesso completo por 30 dias",
            ativo=True,
            ordem_exibicao=1
        ),
        Plano(
            nome="Plano 90 Dias",
            codigo="90d",
            dias_assinatura=90,
            valor=99.90,
            descricao="Acesso completo por 90 dias",
            ativo=True,
            ordem_exibicao=2
        ),
        Plano(
            nome="Plano Anual",
            codigo="anual",
            dias_assinatura=365,
            valor=300.00,
            descricao="Acesso completo por 365 dias",
            ativo=True,
            ordem_exibicao=3
        )
    ]

    for plano in planos:
        db.session.add(plano)

    db.session.commit()
    print("✅ Planos cadastrados com sucesso!")
```

### 2. Modificar Botões de Assinatura

Nos templates HTML (ex: `precos.html`), modifique os botões:

**ANTES:**
```html
<a href="/registro" class="btn btn-primary">Assinar Agora</a>
```

**DEPOIS:**
```html
<a href="/checkout/30d" class="btn btn-primary">Assinar Agora</a>
<!-- ou -->
<a href="/checkout/90d" class="btn btn-primary">Assinar Agora</a>
<!-- ou -->
<a href="/checkout/anual" class="btn btn-primary">Assinar Agora</a>
```

### 3. Rotas da Aplicação

#### GET `/checkout/<plano_codigo>`
Página de checkout que mostra resumo do plano e botão de pagamento.

#### POST `/criar-preferencia`
Cria a preferência de pagamento no Mercado Pago e redireciona o usuário.

```python
@app.route('/checkout/<plano_codigo>')
def checkout(plano_codigo):
    """Página de checkout"""
    plano = Plano.query.filter_by(codigo=plano_codigo, ativo=True).first_or_404()
    return render_template('checkout.html', plano=plano)

@app.route('/criar-preferencia', methods=['POST'])
def criar_preferencia():
    """Cria preferência de pagamento no Mercado Pago"""
    import mercadopago
    import uuid

    plano_id = request.form.get('plano_id')
    empresa_id = request.form.get('empresa_id')  # ou criar nova empresa

    plano = Plano.query.get_or_404(plano_id)

    # Inicializar SDK
    sdk = mercadopago.SDK(MERCADOPAGO_ACCESS_TOKEN)

    # Gerar referência única
    external_reference = f"PAG-{uuid.uuid4().hex[:12].upper()}"

    # Criar pagamento no banco
    pagamento = Pagamento(
        empresa_id=empresa_id,
        plano_id=plano.id,
        external_reference=external_reference,
        valor=plano.valor,
        dias_assinatura=plano.dias_assinatura,
        status='pending'
    )
    db.session.add(pagamento)
    db.session.commit()

    # Criar preferência
    preference_data = {
        "items": [
            {
                "title": plano.nome,
                "description": plano.descricao,
                "quantity": 1,
                "unit_price": plano.valor,
                "currency_id": "BRL"
            }
        ],
        "payer": {
            "name": "Nome do Cliente",
            "email": "cliente@email.com"
        },
        "back_urls": {
            "success": SUCCESS_URL,
            "failure": FAILURE_URL,
            "pending": PENDING_URL
        },
        "auto_return": "approved",
        "external_reference": external_reference,
        "notification_url": WEBHOOK_URL,
        "statement_descriptor": "ASA FINANCE",
        "expires": False
    }

    preference_response = sdk.preference().create(preference_data)
    preference = preference_response["response"]

    # Salvar preference_id
    pagamento.preference_id = preference["id"]
    db.session.commit()

    # Redirecionar para Mercado Pago
    return redirect(preference["init_point"])
```

### 4. Webhook do Mercado Pago

```python
@app.route('/webhook/mercadopago', methods=['POST'])
def webhook_mercadopago():
    """Recebe notificações do Mercado Pago"""
    import mercadopago

    data = request.get_json()

    # Verificar se é notificação de pagamento
    if data.get('type') == 'payment':
        payment_id = data['data']['id']

        # Buscar detalhes do pagamento
        sdk = mercadopago.SDK(MERCADOPAGO_ACCESS_TOKEN)
        payment_info = sdk.payment().get(payment_id)
        payment = payment_info["response"]

        # Buscar pagamento no banco
        external_reference = payment.get('external_reference')
        pagamento = Pagamento.query.filter_by(external_reference=external_reference).first()

        if not pagamento:
            return jsonify({'error': 'Pagamento não encontrado'}), 404

        # Atualizar status
        pagamento.payment_id = str(payment_id)
        pagamento.status = payment['status']
        pagamento.status_detail = payment.get('status_detail')
        pagamento.payment_type = payment.get('payment_type_id')
        pagamento.payment_method = payment.get('payment_method_id')
        pagamento.dados_mp = json.dumps(payment)

        # Se aprovado, creditar dias
        if payment['status'] == 'approved':
            pagamento.data_aprovacao = datetime.utcnow()

            # Creditar dias na empresa
            empresa = pagamento.empresa
            if empresa.dias_assinatura and empresa.dias_assinatura > 0:
                empresa.dias_assinatura += pagamento.dias_assinatura
            else:
                empresa.dias_assinatura = pagamento.dias_assinatura
                empresa.data_inicio_assinatura = datetime.utcnow()

            pagamento.observacoes = f"Pagamento aprovado. {pagamento.dias_assinatura} dias creditados."

        db.session.commit()

        return jsonify({'success': True}), 200

    return jsonify({'success': True}), 200
```

## Páginas de Retorno

### `/pagamento/sucesso`
```python
@app.route('/pagamento/sucesso')
def pagamento_sucesso():
    payment_id = request.args.get('payment_id')
    external_reference = request.args.get('external_reference')

    pagamento = Pagamento.query.filter_by(external_reference=external_reference).first()

    return render_template('pagamento_sucesso.html', pagamento=pagamento)
```

### `/pagamento/falha`
```python
@app.route('/pagamento/falha')
def pagamento_falha():
    return render_template('pagamento_falha.html')
```

### `/pagamento/pendente`
```python
@app.route('/pagamento/pendente')
def pagamento_pendente():
    return render_template('pagamento_pendente.html')
```

## Configurar Webhook no Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel/notifications/webhooks
2. Clique em "Criar webhook"
3. **URL de produção**: `https://seudominio.com.br/webhook/mercadopago`
4. **Eventos**: Selecione "Pagamentos"
5. Salve

**Para desenvolvimento local**, use ngrok para expor seu servidor:
```bash
ngrok http 8002
```
Use a URL gerada (ex: `https://xxxx.ngrok.io/webhook/mercadopago`)

## Testar a Integração

### 1. Cartões de Teste

Mercado Pago fornece cartões para teste:

| Cartão | Número | CVV | Validade | Resultado |
|--------|--------|-----|----------|-----------|
| Mastercard | 5031 4332 1540 6351 | 123 | 11/25 | Aprovado |
| Visa | 4235 6477 2802 5682 | 123 | 11/25 | Aprovado |
| Visa | 4013 5406 8274 6260 | 123 | 11/25 | Recusado |

**Titular**: APRO (aprovado) ou OTHE (outros casos)
**CPF**: 123.456.789-01

### 2. Fluxo de Teste

1. Acesse `http://localhost:8002/precos`
2. Clique em "Assinar Agora"
3. Preencha dados da empresa
4. Clique em "Pagar com Mercado Pago"
5. Use cartão de teste
6. Verifique webhook sendo chamado
7. Confirme dias creditados na empresa

## Segurança

1. **Nunca commite credenciais** no código
2. Use variáveis de ambiente
3. **Valide webhook**: Verifique IP de origem ou use assinatura
4. **HTTPS obrigatório** em produção
5. **Valide valores**: Nunca confie em dados do frontend

## Troubleshooting

### Webhook não é chamado
- Verifique URL configurada no painel MP
- Use ngrok em desenvolvimento
- Verifique logs do servidor

### Pagamento não credita dias
- Verifique se webhook foi recebido
- Veja logs da rota `/webhook/mercadopago`
- Confirme `external_reference` correto

### Preferência não é criada
- Verifique credenciais (Access Token)
- Confirme SDK instalado
- Veja mensagem de erro do MP

## Referências

- Documentação oficial: https://www.mercadopago.com.br/developers/pt/docs
- SDK Python: https://github.com/mercadopago/sdk-python
- Painel de desenvolvedor: https://www.mercadopago.com.br/developers/panel
- Cartões de teste: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/test/cards

## Próximos Passos

1. Implementar assinaturas recorrentes
2. Adicionar cancelamento de assinatura
3. Enviar emails de confirmação
4. Implementar nota fiscal automática
5. Dashboard de pagamentos para admin
