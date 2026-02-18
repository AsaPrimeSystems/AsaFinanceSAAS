# 📜 CHANGELOG - SAAS GESTÃO FINANCEIRA

Histórico de correções, melhorias e implementações do sistema.

---

## [2026-02-03] - Correções Críticas e Melhorias

### 🔧 CORREÇÃO CRÍTICA: Acesso BPO/Contador
**Commit**: b04709a

**Problema**: Contadores criavam registros que não apareciam nas listagens
- ❌ Plano de contas criado mas não aparecia
- ❌ Lançamentos criados mas não apareciam
- ❌ Vendas/compras criadas mas não apareciam

**Causa**: Queries filtravam por `usuario_id.in_(usuarios_ids)` em vez de `empresa_id`

**Solução**: 62 substituições em 6 modelos
- Lancamento: 18 correções
- Cliente: 11 correções
- Fornecedor: 10 correções
- PlanoConta: 8 correções
- Compra: 8 correções
- Venda: 7 correções

**Resultado**: ✅ Sistema BPO 100% funcional

---

### 🔄 CORREÇÃO: Transações PostgreSQL (Rollback)
**Commits**: bd1e74d, 77f8a14, 0118b75

**Problema**: Erro "current transaction is aborted" travava todo o sistema
```
sqlalchemy.exc.InternalError: (psycopg2.errors.InFailedSqlTransaction)
current transaction is aborted, commands ignored until end of transaction block
```

**Causa**: Blocos `try/except` sem `db.session.rollback()`

**Solução**: 34 blocos corrigidos
- Inicialização: 7+ blocos
- Rotas críticas: 3 rotas (/login, /dashboard, /admin)
- Todos os módulos: 20 rotas

**Resultado**: ✅ Sistema resiliente a erros, não trava mais

---

### 📋 IMPLEMENTAÇÃO: Regra de Contas Analíticas/Sintéticas
**Commit**: 3b47371

**Regras Implementadas**:

**Contas Sintéticas** (agrupamento):
- ✅ Podem ser raiz (sem pai)
- ✅ Podem ser filhas de outras sintéticas
- ✅ Não recebem lançamentos diretos

**Contas Analíticas** (movimentação):
- ❌ NÃO podem ser criadas sem pai
- ❌ NÃO podem ser filhas de outras analíticas
- ✅ Recebem lançamentos diretos

**Validações**:
- Ao criar: analítica DEVE ter pai sintético
- Ao editar: analítica não pode ficar órfã

**Resultado**: ✅ Estrutura contábil correta e hierárquica

---

### 🎨 MELHORIA: Dashboard Contador - Botões de Ação
**Commit**: df9cb31

**Implementação**:
- ✅ Coluna "Ações" em Contas a Receber
- ✅ Coluna "Ações" em Contas a Pagar
- ✅ Botão toggle para marcar como realizado/pendente
- ✅ AJAX para atualização sem reload

**Resultado**: ✅ Dashboard contador com funcionalidades iguais ao dashboard normal

---

### 🗃️ MIGRAÇÃO: Estrutura Completa PostgreSQL
**Arquivo**: migrar_completo_postgresql.py

**Operações (35+)**:

**Tabelas Criadas**:
- plano (6 planos padrão)
- dre_configuracao
- pagamento

**Colunas Adicionadas**:
- empresa: plano_id, data_inicio_assinatura
- conta_caixa: banco, agencia, conta, saldo_inicial, saldo_atual, plano_conta_id
- lancamento: usuario_criacao_id, usuario_ultima_edicao_id, data_ultima_edicao, plano_conta_id
- plano_conta: codigo, natureza, nivel, pai_id, empresa_id
- venda/compra/lancamento: nota_fiscal
- cliente/fornecedor/venda/compra: empresa_id

**Características**:
- ✅ Idempotente (pode executar múltiplas vezes)
- ✅ Segura (não apaga dados)
- ✅ Abrangente (26 modelos)

---

### 🔧 CORREÇÕES: Permissões BPO
**Commit**: badc91a

**Problema**: BPO não podia excluir vendas/compras que criou

**Solução**: Ajustada lógica de permissão para permitir exclusão de registros criados pelo BPO

**Resultado**: ✅ BPO tem permissões corretas

---

### 🐛 CORREÇÃO: Toggle Dashboard Contador
**Commit**: 532b706

**Problema**: "Lançamento não encontrado" ao clicar toggle

**Solução**: Ajustado contexto de sessão para toggle em dashboard contador

**Resultado**: ✅ Toggle funciona corretamente

---

## Arquitetura do Sistema

### Multi-Tenant
- Empresas (PJ)
- Pessoas Físicas (PF)
- Contadores/BPO (com vinculação)
- Admin (sem restrições)

### Principais Entidades
- Empresa (base de todos os tipos de conta)
- Usuario (usuários de cada empresa)
- VinculoContador (links contador ↔ cliente)
- Lancamento (lançamentos financeiros)
- Venda/Compra (operações comerciais)
- PlanoConta (plano de contas hierárquico)

### Sistema de Assinatura
- Planos: Básico, Plus, Premium (30/90 dias)
- Badge colorido por dias restantes
- Bloqueio automático ao expirar

---

## Comandos Úteis

### Produção (Render)
```bash
# Migração completa
source .venv/bin/activate && python3 migrar_completo_postgresql.py

# Verificar tabelas
python3 -c "from app import app, db; from sqlalchemy import text; app.app_context().push(); r = db.session.execute(text('SELECT COUNT(*) FROM plano')); print(f'Planos: {r.fetchone()[0]}')"
```

### Local
```bash
# Iniciar sistema
python app.py
# ou
INICIAR_SISTEMA.bat (Windows)

# Criar admin
python criar_admin.py

# Atualizar banco
python atualizar_banco.py
```

---

## Credenciais Padrão

**Admin**:
- Tipo: Empresa (CNPJ)
- CNPJ: 00.000.000/0000-00
- Usuário: admin
- Senha: admin123

---

## Stack Tecnológica

- **Backend**: Flask 2.3.3
- **ORM**: SQLAlchemy 3.0.5
- **Database**: SQLite (local) / PostgreSQL (produção)
- **Frontend**: Bootstrap 5, Vanilla JS
- **Reports**: ReportLab (PDF), OpenPyXL (Excel)
- **Hosting**: Render (backend + PostgreSQL)

---

## Próximas Melhorias

- [ ] Integração Mercado Pago completa
- [ ] Sistema de vouchers
- [ ] DRE automatizado
- [ ] Webhooks de pagamento
- [ ] API REST externa

---

**Última atualização**: 2026-02-03
**Mantido por**: Equipe de Desenvolvimento
