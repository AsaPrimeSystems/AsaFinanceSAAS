# EXIBIÇÃO DO PLANO NO CABEÇALHO

**Data**: 2026-02-03
**Objetivo**: Mostrar qual plano está ativo (Básico, Plus, Premium) junto com os dias restantes no cabeçalho

---

## ✅ IMPLEMENTAÇÃO COMPLETA

### 1. Banco de Dados
**Tabela `empresa`:**
```sql
ALTER TABLE empresa ADD COLUMN plano_id INTEGER;
```
- Relacionamento com a tabela `plano`
- Armazena qual plano está ativo para cada conta

**Tabela `conta_caixa`:**
```sql
ALTER TABLE conta_caixa ADD COLUMN produto_servico VARCHAR(200);
ALTER TABLE conta_caixa ADD COLUMN tipo_produto_servico VARCHAR(20);
ALTER TABLE conta_caixa ADD COLUMN nota_fiscal VARCHAR(50);
ALTER TABLE conta_caixa ADD COLUMN plano_conta_id INTEGER;
```
- Correção de colunas faltantes

---

### 2. Modelo (app.py)
**Classe Empresa - linhas 372-381:**
```python
plano_id = db.Column(db.Integer, db.ForeignKey('plano.id'), nullable=True)
plano_ativo = db.relationship('Plano', foreign_keys=[plano_id], backref='empresas_ativas')
```

---

### 3. Sessão (app.py)
**Função login() - linhas 1230-1237:**
```python
# Informações do plano ativo
if hasattr(empresa, 'plano_ativo') and empresa.plano_ativo:
    session['plano_nome'] = empresa.plano_ativo.nome
    session['plano_codigo'] = empresa.plano_ativo.codigo
else:
    session['plano_nome'] = None
    session['plano_codigo'] = None
```

---

### 4. Interface (templates/base.html)
**Badge de assinatura - linhas 74-92:**

**Antes:**
```html
<div class="subscription-badge">
    <i class="fas fa-calendar-check"></i>
    <span class="subscription-days">30</span>
    <span class="subscription-text">dias restantes de assinatura</span>
</div>
```

**Depois:**
```html
<div class="subscription-badge">
    <div class="subscription-plan">
        <i class="fas fa-star"></i>
        <span class="plan-name">Plus 30 Dias</span>
    </div>
    <div class="subscription-days-info">
        <span class="subscription-days">30</span>
        <span class="subscription-text">dias restantes</span>
    </div>
</div>
```

**CSS adicionado - linhas 18-52:**
- `.subscription-plan` - Nome do plano com ícone de estrela dourada
- `.subscription-days-info` - Dias restantes em destaque
- Design limpo e profissional

---

## 🎨 VISUAL DO BADGE

```
┌─────────────────────────────┐
│ ⭐ Plus 30 Dias            │
│ 30 dias restantes           │
└─────────────────────────────┘
```

- **Linha 1**: ⭐ Nome do plano (negrito, cor escura)
- **Linha 2**: Dias em destaque (azul) + texto cinza

---

## 📝 SCRIPTS DE MIGRAÇÃO

### Para SQLite (Local):
```bash
python3 adicionar_plano_empresa.py   # Adiciona plano_id em empresa
python3 corrigir_conta_caixa.py      # Corrige conta_caixa
python3 atribuir_plano_teste.py      # Atribui plano para testar
```

### Para PostgreSQL (Produção):
```python
python3 << 'EOF'
from app import app, db
from sqlalchemy import text

with app.app_context():
    # Adicionar plano_id em empresa
    result = db.session.execute(text("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'empresa' AND column_name = 'plano_id'
    """))
    if not result.fetchone():
        db.session.execute(text("ALTER TABLE empresa ADD COLUMN plano_id INTEGER"))
        db.session.commit()
        print("✅ empresa.plano_id adicionada!")

    # Adicionar colunas em conta_caixa
    colunas = [
        ('produto_servico', 'VARCHAR(200)'),
        ('tipo_produto_servico', 'VARCHAR(20)'),
        ('nota_fiscal', 'VARCHAR(50)'),
        ('plano_conta_id', 'INTEGER')
    ]

    for coluna, tipo in colunas:
        result = db.session.execute(text(f"""
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'conta_caixa' AND column_name = '{coluna}'
        """))
        if not result.fetchone():
            db.session.execute(text(f"ALTER TABLE conta_caixa ADD COLUMN {coluna} {tipo}"))
            db.session.commit()
            print(f"✅ conta_caixa.{coluna} adicionada!")
EOF
```

---

## 🔄 COMO FUNCIONA

### 1. Usuário assina um plano
- Checkout processa pagamento
- `empresa.plano_id` é atualizado com o plano escolhido
- `empresa.dias_assinatura` é atualizado com os dias do plano

### 2. Usuário faz login
- Sistema carrega `empresa.plano_ativo`
- Adiciona `plano_nome` e `plano_codigo` na sessão
- Badge exibe as informações

### 3. Badge atualiza automaticamente
- Se `plano_nome` existe: mostra nome do plano
- Se não existe: mostra "Assinatura Ativa"
- Sempre mostra dias restantes

---

## 🎯 BENEFÍCIOS

1. **Transparência**: Usuário vê qual plano está ativo
2. **Clareza**: Informação visível o tempo todo
3. **Profissional**: Visual limpo e moderno
4. **Motivação**: Ícone de estrela valoriza o plano

---

## 📊 ESTRUTURA DE DADOS

### Tabela `empresa`
```
id | razao_social | plano_id | dias_assinatura
1  | Empresa X    | 4        | 30
```

### Tabela `plano`
```
id | nome           | codigo      | dias_assinatura | valor
4  | Plus 30 Dias   | plus_30d    | 30              | 59.90
```

### Sessão
```python
session = {
    'plano_nome': 'Plus 30 Dias',
    'plano_codigo': 'plus_30d',
    'dias_assinatura': 30
}
```

---

## ⚠️ OBSERVAÇÕES IMPORTANTES

### 1. Atribuição automática no checkout
**PENDENTE**: Atualizar rota `/criar-preferencia` para vincular plano após pagamento

**Localização**: app.py linha 16302
```python
@app.route('/criar-preferencia', methods=['POST'])
def criar_preferencia():
    # ... código existente ...

    # ADICIONAR após pagamento confirmado:
    if pagamento.status == 'approved':
        empresa.plano_id = plano.id
        empresa.dias_assinatura = plano.dias_assinatura
        db.session.commit()
```

### 2. Webhook do Mercado Pago
**IMPORTANTE**: Atualizar webhook para vincular plano quando pagamento for aprovado

### 3. Contas sem plano
- Contas antigas sem `plano_id` mostram "Assinatura Ativa"
- Badge funciona normalmente, só não exibe o nome do plano

---

## 🚀 DEPLOY EM PRODUÇÃO

### Passo 1: Executar migrações no Render Shell
```bash
source .venv/bin/activate
python3 adicionar_plano_empresa.py
python3 corrigir_conta_caixa.py
```

### Passo 2: Popular planos (se ainda não foi feito)
```bash
echo "s" | python3 popular_planos.py
```

### Passo 3: Reiniciar serviço
- Render detecta o push e reinicia automaticamente
- Ou manualmente no painel do Render

### Passo 4: Testar
- Fazer login em uma conta
- Verificar se badge aparece corretamente
- Atribuir plano manualmente: `python3 atribuir_plano_teste.py`

---

## 📝 CHECKLIST DE VERIFICAÇÃO

- [x] Coluna `plano_id` adicionada em `empresa`
- [x] Modelo `Empresa` atualizado com relacionamento
- [x] Sessão carrega `plano_nome` e `plano_codigo` no login
- [x] Badge exibe nome do plano no cabeçalho
- [x] CSS estilizado profissionalmente
- [x] Colunas faltantes adicionadas em `conta_caixa`
- [ ] Checkout atribui plano automaticamente (PENDENTE)
- [ ] Webhook atualiza plano após pagamento (PENDENTE)

---

**Status**: ✅ Implementação básica completa, pendente integração com pagamentos
