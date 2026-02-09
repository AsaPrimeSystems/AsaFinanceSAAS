# 🐛 BUGS NOS RELATÓRIOS - ANÁLISE E CORREÇÕES

## Data: 09/02/2026
## Status: CRÍTICO - 3 relatórios com falhas

---

## 📊 RESUMO EXECUTIVO

Após reset do banco de dados e testes com a credencial 1 (daniel/PJ), os 3 relatórios problemáticos apresentam os seguintes comportamentos:

1. **Relatório de Saldos**: Filtro não funciona - clica em "Filtrar" e nada acontece
2. **Relatório de Clientes**: Erro ao clicar em "Filtrar" - mensagem "Erro ao gerar relatório de clientes"
3. **Relatório de Fornecedores**: Erro ao carregar - mensagem "Erro ao gerar relatório de fornecedores"

---

## 🔍 ANÁLISE DETALHADA

### 1. RELATÓRIO DE SALDOS (`/relatorios/saldos`)

**Localização do código:** `app.py` linhas 7532-7809

**Sintoma:**
- Página carrega normalmente
- Mostra mensagem informativa: "Para visualizar o relatório de saldos, você precisa ter..."
- Ao preencher datas (01/01/2026 a 28/02/2026) e clicar em "Filtrar"
- URL muda para incluir parâmetros: `?data_inicio=01%2F01%2F2026&data_fim=28%2F02%2F2026`
- **MAS**: Nenhum dado aparece, mesma mensagem continua, sem erro visível

**Causa provável:**
O código está funcionando corretamente (sem exceções), mas o template `relatorio_saldos.html` provavelmente tem uma condição que só mostra os dados se existirem lançamentos/contas caixa/plano de contas configurados. Quando o banco está vazio, ele não mostra erro, apenas mantém a mensagem informativa.

**Correção:**
1. O backend está correto e trata exceções (linha 7763-7809)
2. O problema está no **TEMPLATE** `templates/relatorio_saldos.html`
3. Precisa verificar se o template tem lógica tipo:
   ```jinja
   {% if lancamentos or contas_caixa %}
       [mostrar relatório]
   {% else %}
       [mostrar mensagem informativa]
   {% endif %}
   ```
4. **SOLUÇÃO**: Modificar o template para sempre mostrar o relatório, mesmo que vazio (com zeros)

---

### 2. RELATÓRIO DE CLIENTES (`/relatorios/clientes`)

**Localização do código:** `app.py` linhas 8159-8506

**Sintoma:**
- Página carrega mostrando "Nenhum cliente encontrado" (esperado sem dados)
- Ao clicar em "Filtrar"
- **ERRO VERMELHO**: "Erro ao gerar relatório de clientes"
- Deveria mostrar tabela vazia, não erro

**Causa provável:**
O código tem uma exceção sendo lançada na linha 8483-8505. Possíveis causas:

1. **Query complexa com múltiplos joins** (linha 8329):
   ```python
   lancamentos_query = lancamentos_query.outerjoin(Cliente, Lancamento.cliente_id == Cliente.id).outerjoin(Fornecedor, Lancamento.fornecedor_id == Fornecedor.id).filter(...)
   ```
   Esta query faz LEFT JOIN com Cliente e Fornecedor mesmo que já tenha feito JOIN antes (linha 8303)

2. **Possível erro de variável não definida**: Se não há clientes (linha 8234-8245 retorna early), mas há uma exceção na inicialização de variáveis

3. **Filtro de busca complexo** (linha 8329-8334) que pode falhar se não houver dados

**Correção:**

```python
# LINHA 8329 - REMOVER JOINS DUPLICADOS
# ANTES:
lancamentos_query = lancamentos_query.outerjoin(Cliente, Lancamento.cliente_id == Cliente.id).outerjoin(Fornecedor, Lancamento.fornecedor_id == Fornecedor.id).filter(...)

# DEPOIS:
if filtro_busca:
    termo = f"%{filtro_busca.lower()}%"
    try:
        valor_busca = float(filtro_busca.replace(',', '.'))
    except (ValueError, TypeError):
        valor_busca = None
    from sqlalchemy import func
    # Usar aliases para evitar conflito de joins
    cliente_alias = aliased(Cliente)
    fornecedor_alias = aliased(Fornecedor)
    lancamentos_query = lancamentos_query.outerjoin(
        cliente_alias, Lancamento.cliente_id == cliente_alias.id
    ).outerjoin(
        fornecedor_alias, Lancamento.fornecedor_id == fornecedor_alias.id
    ).filter(
        or_(
            func.lower(Lancamento.descricao).like(termo),
            func.lower(cliente_alias.nome).like(termo),
            func.lower(fornecedor_alias.nome).like(termo),
            Lancamento.valor == valor_busca if valor_busca is not None else False
        )
    )
```

**Ou simplesmente remover o filtro de busca quando há conflito de JOINs**

---

### 3. RELATÓRIO DE FORNECEDORES (`/relatorios/fornecedores`)

**Localização do código:** `app.py` linha 9051+

**Sintoma:**
- Ao tentar acessar o relatório
- **ERRO IMEDIATO**: "Erro ao gerar relatório de fornecedores. Verifique os logs para mais detalhes."
- Volta para página principal de relatórios
- Nem carrega a página do relatório

**Causa provável:**
Erro mais grave, provavelmente:
1. Erro de sintaxe ou import faltando
2. Query mal formada
3. Variável não definida antes do try/except
4. Mesmo problema de JOINs duplicados do relatório de Clientes

**Correção:**
Precisa verificar o código completo da função `relatorio_fornecedores()` para identificar o erro específico. Provavelmente tem estrutura similar ao de Clientes e sofre do mesmo problema.

---

## 🔧 PLANO DE CORREÇÃO

### PRIORIDADE 1 - IMEDIATA

1. **Ativar logs detalhados** para ver os erros reais:
   ```python
   app.logger.error(f"Erro no relatório de clientes: {str(e)}")
   import traceback
   app.logger.error(traceback.format_exc())  # LOG COMPLETO DO ERRO
   ```

2. **Adicionar try/except individual** nas queries complexas:
   ```python
   try:
       lancamentos_query = lancamentos_query.outerjoin(...)
   except Exception as e:
       app.logger.error(f"Erro na query de busca: {str(e)}")
       # Ignorar filtro de busca em caso de erro
       pass
   ```

3. **Verificar imports** no topo do arquivo:
   ```python
   from sqlalchemy.orm import aliased
   from sqlalchemy import or_, func, and_
   ```

### PRIORIDADE 2 - CORREÇÕES ESTRUTURAIS

1. **Template relatorio_saldos.html**: Sempre mostrar tabela mesmo vazia
2. **Relatório Clientes**: Simplificar query de busca ou adicionar verificações
3. **Relatório Fornecedores**: Corrigir baseado no erro específico dos logs

---

## 📝 TESTES NECESSÁRIOS

Após correções, testar cada relatório com:

1. ✅ Banco vazio (sem dados)
2. ✅ Com dados mínimos (1 cliente, 1 fornecedor, 1 lançamento)
3. ✅ Filtros com datas
4. ✅ Filtros com busca textual
5. ✅ Paginação
6. ✅ Exportação PDF/Excel

---

## 💡 RECOMENDAÇÕES

1. **Separar lógica de negócio**: Mover cálculos complexos para funções auxiliares
2. **Validação de entrada**: Sempre validar parâmetros antes de usar em queries
3. **Mensagens amigáveis**: Não mostrar "Erro ao gerar relatório", mostrar mensagem específica
4. **Logging estruturado**: Usar diferentes níveis (DEBUG, INFO, ERROR) com contexto
5. **Testes automatizados**: Criar testes unitários para cada relatório

---

## 🚨 AÇÃO IMEDIATA REQUERIDA

1. Verificar logs do servidor para erros específicos
2. Aplicar correção de JOINs duplicados
3. Adicionar logging detalhado com traceback
4. Testar com banco vazio
5. Validar correções com dados reais

---

**Documentado por:** Claude Sonnet 4.5
**Data:** 09/02/2026
**Ambiente:** Produção (asafinancesaas.onrender.com)
**Credencial testada:** daniel/123456 (CNPJ - Conta PJ)
