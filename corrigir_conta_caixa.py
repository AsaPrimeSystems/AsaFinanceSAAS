"""
Script para adicionar colunas faltantes na tabela conta_caixa
Execute: python3 corrigir_conta_caixa.py
"""
from app import app, db
from sqlalchemy import text

def corrigir_conta_caixa():
    with app.app_context():
        print("=" * 60)
        print("CORRIGINDO TABELA CONTA_CAIXA")
        print("=" * 60)

        # Verificar colunas existentes
        result = db.session.execute(text("PRAGMA table_info(conta_caixa)"))
        columns = [row[1] for row in result.fetchall()]

        colunas_adicionar = [
            ('produto_servico', 'VARCHAR(200)'),
            ('tipo_produto_servico', 'VARCHAR(20)'),
            ('nota_fiscal', 'VARCHAR(50)'),
            ('plano_conta_id', 'INTEGER')
        ]

        for coluna, tipo in colunas_adicionar:
            if coluna not in columns:
                print(f"\n📝 Adicionando coluna '{coluna}'...")
                db.session.execute(text(f"ALTER TABLE conta_caixa ADD COLUMN {coluna} {tipo}"))
                db.session.commit()
                print(f"✅ Coluna '{coluna}' adicionada!")
            else:
                print(f"✓ Coluna '{coluna}' já existe")

        print("\n" + "=" * 60)
        print("✅ TABELA CONTA_CAIXA CORRIGIDA!")
        print("=" * 60)

if __name__ == '__main__':
    corrigir_conta_caixa()
