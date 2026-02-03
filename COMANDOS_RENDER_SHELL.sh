#!/bin/bash
# ========================================
# COMANDOS PARA EXECUTAR NO RENDER SHELL
# Após deploy dos commits com correções
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

# Executar migração conta_caixa
echo ""
echo "3️⃣ Executando migração conta_caixa..."
python3 migrar_postgresql_conta_caixa.py

# Criar tabela DRE
echo ""
echo "4️⃣ Criando tabela DRE..."
python3 criar_tabela_dre.py

# Verificar migrações
echo ""
echo "5️⃣ Verificando migrações..."
python3 << 'EOF'
from app import app, db
from sqlalchemy import text

with app.app_context():
    print("\n📊 Verificando estrutura do banco...\n")

    # Verificar colunas da conta_caixa
    result = db.session.execute(text("""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'conta_caixa'
        ORDER BY column_name
    """))
    colunas = [row[0] for row in result.fetchall()]
    print("✅ Colunas da conta_caixa:")
    for col in colunas:
        print(f"   - {col}")

    # Verificar colunas críticas
    colunas_necessarias = ['banco', 'agencia', 'conta']
    faltando = [c for c in colunas_necessarias if c not in colunas]
    if faltando:
        print(f"\n⚠️  ATENÇÃO: Colunas faltando: {faltando}")
    else:
        print(f"\n✅ Todas as colunas necessárias estão presentes!")

    # Verificar tabela dre_configuracao
    result = db.session.execute(text("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_name = 'dre_configuracao'
    """))
    if result.fetchone():
        print("✅ Tabela dre_configuracao existe!")

        # Verificar colunas da dre_configuracao
        result = db.session.execute(text("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'dre_configuracao'
            ORDER BY column_name
        """))
        colunas_dre = [row[0] for row in result.fetchall()]
        print(f"   Colunas: {', '.join(colunas_dre)}")
    else:
        print("⚠️  Tabela dre_configuracao NÃO existe!")

    print("\n" + "="*50)
EOF

# Limpar cache
echo ""
echo "6️⃣ Limpando cache..."
find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true

echo ""
echo "="*50
echo "✅ CONFIGURAÇÃO CONCLUÍDA!"
echo "="*50
echo ""
echo "📋 CHECKLIST:"
echo "  ✅ Ambiente virtual ativado"
echo "  ✅ Migração conta_caixa executada"
echo "  ✅ Tabela DRE criada"
echo "  ✅ Estrutura do banco verificada"
echo "  ✅ Cache limpo"
echo ""
echo "🚀 Sistema pronto para uso!"
echo ""
