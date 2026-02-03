"""
Script de migração para PostgreSQL - Conta Caixa
Este script adiciona TODOS os campos faltantes na tabela conta_caixa

Execute no Render Shell:
source .venv/bin/activate
python3 migrar_postgresql_conta_caixa.py
"""
from app import app, db
from sqlalchemy import text

def verificar_coluna_existe_pg(tabela, coluna):
    """Verifica se uma coluna existe em uma tabela PostgreSQL"""
    try:
        result = db.session.execute(text("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = :tabela AND column_name = :coluna
        """), {'tabela': tabela, 'coluna': coluna})
        return result.fetchone() is not None
    except Exception as e:
        print(f"⚠️ Erro ao verificar coluna {coluna}: {e}")
        return False

def migrar_conta_caixa_postgresql():
    with app.app_context():
        print("=" * 70)
        print("MIGRAÇÃO POSTGRESQL - CONTA_CAIXA")
        print("=" * 70)

        campos_adicionar = [
            ('banco', 'VARCHAR(200)'),
            ('agencia', 'VARCHAR(50)'),
            ('conta', 'VARCHAR(50)'),
            ('produto_servico', 'VARCHAR(200)'),
            ('tipo_produto_servico', 'VARCHAR(50)'),
            ('nota_fiscal', 'VARCHAR(50)'),
            ('plano_conta_id', 'INTEGER')
        ]

        print(f"\n📋 Verificando e adicionando campos na tabela conta_caixa...")

        for coluna, tipo in campos_adicionar:
            try:
                if not verificar_coluna_existe_pg('conta_caixa', coluna):
                    print(f"\n  📝 Adicionando coluna '{coluna}'...")

                    db.session.execute(text(f"""
                        ALTER TABLE conta_caixa
                        ADD COLUMN {coluna} {tipo}
                    """))
                    db.session.commit()

                    print(f"  ✅ Coluna '{coluna}' adicionada!")
                else:
                    print(f"  ✓ Coluna '{coluna}' já existe")

            except Exception as e:
                print(f"  ⚠️ Erro ao adicionar coluna '{coluna}': {str(e)}")
                db.session.rollback()

        print("\n" + "=" * 70)
        print("✅ MIGRAÇÃO CONCLUÍDA!")
        print("=" * 70)
        print("\n🔄 Reinicie o serviço no Render para aplicar as mudanças.")

if __name__ == '__main__':
    migrar_conta_caixa_postgresql()
