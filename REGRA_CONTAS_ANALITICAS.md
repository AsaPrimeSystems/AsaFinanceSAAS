# 📋 REGRA DE NEGÓCIO - CONTAS ANALÍTICAS E SINTÉTICAS

**Data**: 2026-02-03
**Status**: ✅ IMPLEMENTADO
**Commit**: 3b47371

---

## 📖 CONCEITOS CONTÁBEIS

### Conta Sintética
Conta de **agrupamento** que serve para organizar outras contas. Não recebe lançamentos diretos, apenas soma os valores das contas filhas (analíticas).

**Exemplos:**
- `1.0 RECEITAS OPERACIONAIS` (sintética)
- `2.0 DESPESAS OPERACIONAIS` (sintética)
- `1.1 RECEITAS DE VENDAS` (sintética)

### Conta Analítica
Conta de **movimentação** que recebe lançamentos diretos. É onde os valores financeiros são efetivamente registrados.

**Exemplos:**
- `1.1.1 Vendas de Produtos` (analítica)
- `1.1.2 Vendas de Serviços` (analítica)
- `2.1.1 Salários e Encargos` (analítica)

---

## ✅ REGRAS IMPLEMENTADAS

### Para Contas SINTÉTICAS:

1. ✅ **Pode ser raiz** (sem pai)
   - Exemplo: `1.0 RECEITAS` (conta principal)

2. ✅ **Pode ser filha de outra sintética**
   - Exemplo: `1.1 RECEITAS DE VENDAS` filha de `1.0 RECEITAS`

3. ✅ **Não recebe lançamentos diretos**
   - Valores são calculados pela soma das filhas analíticas

### Para Contas ANALÍTICAS:

1. ❌ **NÃO pode ser criada sem pai**
   - Sempre precisa estar dentro de uma sintética

2. ❌ **NÃO pode ser filha de outra analítica**
   - Só pode ser filha de conta sintética

3. ✅ **Recebe lançamentos diretos**
   - É onde os valores são efetivamente registrados

---

## 🛡️ VALIDAÇÕES IMPLEMENTADAS

### Na Criação de Conta (`/plano-contas/nova`):

```python
# VALIDAÇÃO 1: Analítica DEVE ter pai
if natureza == 'analitica' and not pai_id:
    ❌ Erro: "Conta analítica deve estar vinculada a uma conta sintética (pai)!"

# VALIDAÇÃO 2: Pai DEVE ser sintético
if natureza == 'analitica' and pai.natureza != 'sintetica':
    ❌ Erro: "Conta analítica só pode ser filha de uma conta sintética!"
```

### Na Edição de Conta (`/plano-contas/<id>/editar`):

```python
# Mesmas validações
# Previne que conta analítica fique "órfã"
# Previne que analítica vire filha de outra analítica
```

---

## 📊 EXEMPLOS PRÁTICOS

### ✅ ESTRUTURA CORRETA:

```
1.0 RECEITAS (sintética - raiz)
├── 1.1 RECEITAS OPERACIONAIS (sintética - filha de sintética)
│   ├── 1.1.1 Vendas de Produtos (analítica - filha de sintética) ✅
│   └── 1.1.2 Vendas de Serviços (analítica - filha de sintética) ✅
└── 1.2 RECEITAS FINANCEIRAS (sintética - filha de sintética)
    └── 1.2.1 Juros Recebidos (analítica - filha de sintética) ✅
```

### ❌ ESTRUTURAS INVÁLIDAS:

```
❌ CENÁRIO 1: Analítica sem pai (órfã)
1.1.1 Vendas de Produtos (analítica - SEM PAI)
Erro: "Conta analítica deve estar vinculada a uma conta sintética (pai)!"

❌ CENÁRIO 2: Analítica filha de analítica
1.1.1 Vendas de Produtos (analítica)
└── 1.1.1.1 Vendas à Vista (analítica - filha de analítica!)
Erro: "Conta analítica só pode ser filha de uma conta sintética!"

❌ CENÁRIO 3: Criar analítica sem selecionar pai no formulário
Natureza: Analítica
Conta Pai: (vazio)
Erro: "Conta analítica deve estar vinculada a uma conta sintética (pai)!"
```

---

## 🎯 FLUXO DE CRIAÇÃO

### Passo a Passo CORRETO:

1. **Criar Conta Sintética Raiz**
   ```
   Nome: RECEITAS
   Natureza: Sintética
   Conta Pai: (vazio - é raiz)
   ✅ Permitido!
   ```

2. **Criar Conta Sintética Filha (opcional)**
   ```
   Nome: RECEITAS DE VENDAS
   Natureza: Sintética
   Conta Pai: RECEITAS
   ✅ Permitido!
   ```

3. **Criar Conta Analítica**
   ```
   Nome: Vendas de Produtos
   Natureza: Analítica
   Conta Pai: RECEITAS DE VENDAS (sintética)
   ✅ Permitido!
   ```

4. **Criar Lançamento**
   ```
   Categoria: Vendas de Produtos (analítica)
   Valor: R$ 1.000,00
   ✅ Lançamento criado na conta analítica
   ```

---

## 🔍 BENEFÍCIOS DESTA REGRA

### 1. **Organização Contábil**
- Estrutura hierárquica clara
- Separação entre agrupamento (sintética) e movimentação (analítica)

### 2. **Relatórios Consistentes**
- DRE (Demonstração de Resultado) correto
- Balancetes organizados
- Totalizações precisas

### 3. **Prevenção de Erros**
- Não permite lançamentos em contas sintéticas
- Não permite contas analíticas "soltas"
- Hierarquia sempre válida

### 4. **Padrão Contábil**
- Segue boas práticas contábeis
- Estrutura similar ao Plano de Contas Referencial (CFC)
- Facilita auditoria e análise

---

## 🧪 TESTES RECOMENDADOS

### Teste 1: Criar Sintética Raiz
```
✅ Deve permitir criar sintética sem pai
Nome: RECEITAS
Natureza: Sintética
Pai: (vazio)
Resultado esperado: ✅ Sucesso
```

### Teste 2: Tentar Criar Analítica Sem Pai
```
❌ Deve bloquear e mostrar erro
Nome: Vendas
Natureza: Analítica
Pai: (vazio)
Resultado esperado: ❌ "Conta analítica deve estar vinculada a uma conta sintética (pai)!"
```

### Teste 3: Criar Analítica Com Pai Sintético
```
✅ Deve permitir
Nome: Vendas de Produtos
Natureza: Analítica
Pai: RECEITAS (sintética)
Resultado esperado: ✅ Sucesso
```

### Teste 4: Editar Analítica Removendo Pai
```
❌ Deve bloquear
Conta existente: Vendas de Produtos (analítica, pai=RECEITAS)
Edição: Remover pai
Resultado esperado: ❌ "Conta analítica deve estar vinculada a uma conta sintética (pai)!"
```

---

## 📝 MENSAGENS DE ERRO

### Mensagem 1: Analítica Sem Pai
```
❌ Conta analítica deve estar vinculada a uma conta sintética (pai)!
```
**Quando aparece:**
- Ao criar conta analítica sem selecionar pai
- Ao editar conta analítica removendo o pai

**Solução:**
- Selecionar uma conta sintética como pai

### Mensagem 2: Pai Não É Sintético
```
❌ Conta analítica só pode ser filha de uma conta sintética!
```
**Quando aparece:**
- Ao tentar criar analítica filha de outra analítica
- Ao tentar editar pai de analítica para outra analítica

**Solução:**
- Selecionar uma conta sintética (não analítica) como pai

---

## 🔄 MIGRAÇÃO DE DADOS EXISTENTES

Se houver contas analíticas **órfãs** (sem pai) no banco:

```sql
-- Identificar contas analíticas sem pai
SELECT id, nome, natureza, pai_id
FROM plano_conta
WHERE natureza = 'analitica' AND pai_id IS NULL;

-- Criar conta sintética raiz se necessário
INSERT INTO plano_conta (nome, tipo, natureza, empresa_id, usuario_id)
VALUES ('OUTRAS CONTAS', 'despesa', 'sintetica', <empresa_id>, <usuario_id>);

-- Vincular contas órfãs à sintética criada
UPDATE plano_conta
SET pai_id = <id_da_sintetica_criada>
WHERE natureza = 'analitica' AND pai_id IS NULL;
```

---

## ⚙️ CONFIGURAÇÃO NO TEMPLATE

O template `nova_conta.html` e `editar_conta.html` já mostram apenas contas sintéticas no dropdown de "Conta Pai":

```python
# Backend (app.py)
planos_sinteticos = PlanoConta.query.filter(
    PlanoConta.empresa_id == empresa_id,
    PlanoConta.natureza == 'sintetica',  # Só sintéticas!
    PlanoConta.ativo == True
).order_by(PlanoConta.tipo, PlanoConta.codigo).all()
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

- [x] Validação na criação de conta
- [x] Validação na edição de conta
- [x] Mensagens de erro claras
- [x] Query de pai filtra apenas sintéticas
- [x] Testes de sintaxe Python OK
- [x] Documentação completa
- [x] Commit e push para GitHub

---

## 🎉 RESULTADO FINAL

**Sistema agora segue padrões contábeis corretos!**

✅ Estrutura hierárquica válida
✅ Contas analíticas sempre vinculadas
✅ Prevenção de erros na criação
✅ Relatórios contábeis consistentes
✅ Compatível com padrões CFC/CPC

---

**PRONTO PARA PRODUÇÃO!** 🚀

Aguarde o deploy e teste a criação de contas!
