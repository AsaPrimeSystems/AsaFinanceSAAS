"""
Script para adicionar campo plano_id na tabela empresa
Execute: python3 adicionar_plano_empresa.py
"""
from app import app, db
from sqlalchemy import text

def adicionar_plano_id():
    with app.app_context():
        print("=" * 60)
        print("ADICIONANDO CAMPO PLANO_ID NA TABELA EMPRESA")
        print("=" * 60)

        # Verificar se a coluna já existe
        result = db.session.execute(text("PRAGMA table_info(empresa)"))
        columns = [row[1] for row in result.fetchall()]

        if 'plano_id' not in columns:
            print("\n📝 Adicionando coluna plano_id...")
            db.session.execute(text("""
                ALTER TABLE empresa
                ADD COLUMN plano_id INTEGER
            """))
            db.session.commit()
            print("✅ Coluna plano_id adicionada!")
        else:
            print("✓ Coluna plano_id já existe")

        print("\n" + "=" * 60)
        print("✅ MIGRAÇÃO CONCLUÍDA!")
        print("=" * 60)

if __name__ == '__main__':
    adicionar_plano_id()
