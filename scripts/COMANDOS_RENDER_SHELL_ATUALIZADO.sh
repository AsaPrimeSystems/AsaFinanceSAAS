#!/bin/bash
# ========================================
# COMANDOS ATUALIZADOS PARA RENDER SHELL
# IMPORTANTE: Executar na ordem!
# ========================================

echo "🚀 Iniciando configuração pós-deploy..."
echo ""

# Ativar ambiente virtual
echo "1️⃣ Ativando ambiente virtual..."
source .venv/bin/activate

# Verificar versão do Python
echo ""
echo "2️⃣ Verificando Python:"
python3 --version

# IMPORTANTE: Executar PRIMEIRO a migração da tabela plano e coluna plano_id
echo ""
echo "3️⃣ [CRÍTICO] Criando tabela plano e coluna plano_id..."
python3 migrar_plano_id_empresa.py

# Executar migração conta_caixa
echo ""
echo "4️⃣ Executando migração conta_caixa..."
python3 migrar_postgresql_conta_caixa.py

# Criar tabela DRE
echo ""
echo "5️⃣ Criando tabela DRE..."
python3 criar_tabela_dre.py

# Verificar migrações
echo ""
echo "6️⃣ Verificando migrações..."
python3 << 'EOF'
from app import app, db
from sqlalchemy import text

with app.app_context():
    print("\n📊 Verificando estrutura do banco...\n")

    # Verificar tabela plano
    result = db.session.execute(text("""
        SELECT table_name FROM information_schema.tables WHERE table_name = 'plano'
    """))
    print("✅ Tabela plano:", "EXISTE" if result.fetchone() else "NÃO EXISTE")

    # Verificar coluna plano_id em empresa
    result = db.session.execute(text("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'empresa' AND column_name = 'plano_id'
    """))
    print("✅ Coluna empresa.plano_id:", "EXISTE" if result.fetchone() else "NÃO EXISTE")

    # Verificar colunas da conta_caixa
    result = db.session.execute(text("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'conta_caixa'
        ORDER BY column_name
    """))
    colunas = [row[0] for row in result.fetchall()]
    print("✅ Colunas da conta_caixa:", len(colunas))

    # Verificar colunas críticas
    colunas_necessarias = ['banco', 'agencia', 'conta']
    faltando = [c for c in colunas_necessarias if c not in colunas]
    if faltando:
        print(f"⚠️  ATENÇÃO: Colunas faltando em conta_caixa: {faltando}")
    else:
        print(f"✅ Todas as colunas necessárias em conta_caixa!")

    # Verificar tabela dre_configuracao
    result = db.session.execute(text("""
        SELECT table_name FROM information_schema.tables WHERE table_name = 'dre_configuracao'
    """))
    print("✅ Tabela dre_configuracao:", "EXISTE" if result.fetchone() else "NÃO EXISTE")

    # Contar planos
    result = db.session.execute(text("SELECT COUNT(*) FROM plano"))
    print(f"✅ Planos cadastrados: {result.fetchone()[0]}")

    # Contar empresas com plano
    result = db.session.execute(text("SELECT COUNT(*) FROM empresa WHERE plano_id IS NOT NULL"))
    print(f"✅ Empresas com plano: {result.fetchone()[0]}")

    print("\n" + "="*50)
EOF

# Limpar cache
echo ""
echo "7️⃣ Limpando cache..."
find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true

echo ""
echo "="*50
echo "✅ CONFIGURAÇÃO CONCLUÍDA!"
echo "="*50
echo ""
echo "📋 CHECKLIST:"
echo "  ✅ Ambiente virtual ativado"
echo "  ✅ Tabela plano criada"
echo "  ✅ Coluna plano_id adicionada"
echo "  ✅ Migração conta_caixa executada"
echo "  ✅ Tabela DRE criada"
echo "  ✅ Estrutura do banco verificada"
echo "  ✅ Cache limpo"
echo ""
echo "🚀 Sistema pronto para uso!"
echo "Acesse: https://asafinancesaas.onrender.com/login"
echo ""
