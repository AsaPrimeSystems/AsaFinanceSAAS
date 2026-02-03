"""
Script para adicionar TODOS os campos faltantes na tabela conta_caixa
Execute: python3 migrar_conta_caixa_completo.py
"""
from app import app, db
from sqlalchemy import text

def migrar_conta_caixa():
    with app.app_context():
        print("=" * 60)
        print("MIGRANDO CONTA_CAIXA - TODOS OS CAMPOS")
        print("=" * 60)

        # Verificar colunas existentes
        result = db.session.execute(text("PRAGMA table_info(conta_caixa)"))
        columns = [row[1] for row in result.fetchall()]

        campos_adicionar = [
            ('banco', 'VARCHAR(200)'),
            ('agencia', 'VARCHAR(50)'),
            ('conta', 'VARCHAR(50)'),
            ('produto_servico', 'VARCHAR(200)'),
            ('tipo_produto_servico', 'VARCHAR(50)'),
            ('nota_fiscal', 'VARCHAR(50)'),
            ('plano_conta_id', 'INTEGER')
        ]

        for coluna, tipo in campos_adicionar:
            if coluna not in columns:
                print(f"\n📝 Adicionando coluna '{coluna}'...")
                db.session.execute(text(f"ALTER TABLE conta_caixa ADD COLUMN {coluna} {tipo}"))
                db.session.commit()
                print(f"✅ Coluna '{coluna}' adicionada!")
            else:
                print(f"✓ Coluna '{coluna}' já existe")

        print("\n" + "=" * 60)
        print("✅ MIGRAÇÃO COMPLETA!")
        print("=" * 60)

if __name__ == '__main__':
    migrar_conta_caixa()
