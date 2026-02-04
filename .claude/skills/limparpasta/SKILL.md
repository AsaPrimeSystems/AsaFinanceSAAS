---
name: limparpasta
description: Limpeza inteligente do projeto - remove arquivos desnecessários, cache, e consolida documentação
disable-model-invocation: true
allowed-tools: Bash(rm *), Bash(find *)
---

# Limpeza Inteligente do Projeto

Execute uma limpeza completa e segura do projeto, removendo:
1. Scripts de migração antigos
2. Arquivos de teste temporários
3. Cache (Python e sistema)
4. Documentação duplicada

## Passos de Execução

### 1. Análise Prévia
Antes de remover, analise:
- Liste scripts de migração: `ls -lh migrate*.py migrar*.py`
- Liste arquivos de teste: `ls -lh test_*.py *_teste.py`
- Identifique documentação duplicada: `ls -lh *.md`

### 2. Categorização
Organize arquivos em categorias:

**MANTER sempre:**
- `app.py` - aplicação principal
- `criar_admin.py` - utilitário essencial
- `atualizar_banco.py` - utilitário essencial
- `mercadopago_config.py` - configuração
- `popular_planos.py` - utilitário
- `migrar_completo_postgresql.py` - migração consolidada
- `INICIAR_SISTEMA.bat` / `.sh` - inicialização
- `CLAUDE.md` - documentação principal
- `README.md` - documentação pública
- `CHANGELOG.md` - histórico (consolidado)
- `GUIA_DEPLOY_ONLINE.md` - guia de deploy

**REMOVER com segurança:**
- Scripts de migração antigos (migrate_*.py, migrar_*.py exceto migrar_completo_postgresql.py)
- Arquivos de teste (test_*.py, *_teste.py)
- Documentação de correções pontuais (CORRECAO_*.md, IMPLEMENTACAO_*.md)
- Cache Python (__pycache__/, *.pyc)
- Arquivos de sistema (.DS_Store)

### 3. Consolidação de Documentação
Se necessário, atualizar CHANGELOG.md com informações importantes dos arquivos que serão removidos.

### 4. Execução da Limpeza

```bash
# 1. Remover scripts de migração antigos (manter apenas migrar_completo_postgresql.py)
rm -f migrate_postgres.py migrate_db.py migrate_all_fields.py migrate_production_complete.py migrate_hierarchy.py
rm -f migrar_plano_id_empresa.py migrar_pagamento.py migrar_conta_caixa_completo.py migrar_postgresql_conta_caixa.py
rm -f adicionar_plano_empresa.py corrigir_conta_caixa.py criar_tabela_dre.py criar_tabelas.py

# 2. Remover arquivos de teste
rm -f test_*.py *_teste.py atribuir_plano_teste.py

# 3. Remover scripts duplicados
rm -f COMANDOS_RENDER_SHELL.sh

# 4. Limpar cache Python
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -type f -delete 2>/dev/null || true

# 5. Limpar arquivos de sistema
find . -name ".DS_Store" -type f -delete 2>/dev/null || true

# 6. Remover documentação consolidada (já está em CHANGELOG.md)
rm -f CORRECAO_*.md IMPLEMENTACAO_*.md WEBHOOK_*.md VERIFICACAO_*.md
rm -f MELHORIAS_*.md PROBLEMA_*.md INTEGRACAO_*.md PLANO_*.md
rm -f REVISAO_*.md CONFIGURAR_*.md ANALISE_*.md COMANDOS_DEFINITIVOS_*.md
rm -f README_IMPLEMENTACAO.md teste_resultados.md VOUCHERS_GUIA.md
rm -f OBTER_CREDENCIAIS_*.md REGRA_*.md GUIA_INTEGRACAO_*.md
```

### 5. Verificação Pós-Limpeza

```bash
# Listar arquivos Python restantes
echo "📄 Scripts Python restantes:"
ls -lh *.py 2>/dev/null | grep -v "app.py\|criar_admin.py\|atualizar_banco.py\|mercadopago_config.py\|popular_planos.py\|migrar_completo_postgresql.py"

# Listar documentação restante
echo "📚 Documentação restante:"
ls -lh *.md

# Verificar limpeza de cache
echo "🧹 Verificando cache:"
find . -name "__pycache__" -o -name "*.pyc" -o -name ".DS_Store" | wc -l
```

### 6. Relatório Final

Mostre ao usuário:
```
✅ Limpeza concluída!

📊 Estatísticas:
- Scripts de migração removidos: X arquivos
- Arquivos de teste removidos: X arquivos
- Arquivos de cache removidos: X arquivos
- Documentação consolidada: X arquivos → CHANGELOG.md

📁 Arquivos mantidos:
- Aplicação: app.py, mercadopago_config.py
- Utilitários: criar_admin.py, atualizar_banco.py, popular_planos.py
- Migração: migrar_completo_postgresql.py
- Inicialização: INICIAR_SISTEMA.bat, INICIAR_SISTEMA.sh
- Documentação: CLAUDE.md, README.md, CHANGELOG.md, GUIA_DEPLOY_ONLINE.md

💾 Espaço liberado: ~XXX KB
```

## IMPORTANTE

**NUNCA remover:**
- Pasta `static/` (CSS, JS, imagens)
- Pasta `templates/` (HTML)
- Pasta `instance/` (banco de dados)
- Pasta `.claude/` (configurações Claude)
- Arquivo `requirements.txt`
- Arquivo `render.yaml`
- Arquivo `.gitignore`

**Segurança:**
- Sempre verificar antes de remover
- Manter pelo menos uma migração funcional
- Consolidar documentação importante antes de apagar
- Nunca apagar dados de produção
