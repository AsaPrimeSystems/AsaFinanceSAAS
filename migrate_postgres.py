"""
Migração para adicionar empresa_id às tabelas em PostgreSQL
Execute este script no servidor de produção
"""
from app import app, db
from sqlalchemy import text, inspect

def verificar_coluna_existe(tabela, coluna):
    """Verifica se uma coluna existe em uma tabela (PostgreSQL)"""
    query = text("""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = :tabela AND column_name = :coluna
    """)
    result = db.session.execute(query, {'tabela': tabela, 'coluna': coluna})
    return result.fetchone() is not None

def migrar_empresa_id():
    """Adiciona empresa_id às tabelas Cliente, Fornecedor, Venda, Compra"""
    tabelas = ['cliente', 'fornecedor', 'venda', 'compra']

    print("=" * 80)
    print("MIGRAÇÃO: Adicionar empresa_id para isolamento multi-tenant")
    print("=" * 80)

    for tabela in tabelas:
        print(f"\n📋 Processando tabela: {tabela}")

        try:
            # Verificar se empresa_id já existe
            if verificar_coluna_existe(tabela, 'empresa_id'):
                print(f"✓ Coluna 'empresa_id' já existe na tabela {tabela}")
                continue

            print(f"📝 Adicionando coluna 'empresa_id' na tabela {tabela}...")

            # Adicionar coluna (PostgreSQL permite NULL inicialmente)
            db.session.execute(text(f"ALTER TABLE {tabela} ADD COLUMN empresa_id INTEGER"))
            db.session.commit()
            print(f"✅ Coluna adicionada!")

            # Preencher empresa_id com base no usuario_id
            print(f"📝 Preenchendo empresa_id com base no usuario_id...")
            db.session.execute(text(f"""
                UPDATE {tabela}
                SET empresa_id = u.empresa_id
                FROM usuario u
                WHERE {tabela}.usuario_id = u.id
                  AND {tabela}.empresa_id IS NULL
            """))

            rows_updated = db.session.execute(text(f"SELECT COUNT(*) FROM {tabela} WHERE empresa_id IS NOT NULL")).scalar()
            db.session.commit()
            print(f"✅ {rows_updated} registros atualizados!")

            # Adicionar constraint NOT NULL (após preencher os dados)
            print(f"📝 Adicionando constraint NOT NULL...")
            db.session.execute(text(f"ALTER TABLE {tabela} ALTER COLUMN empresa_id SET NOT NULL"))
            db.session.commit()
            print(f"✅ Constraint adicionada!")

            # Adicionar foreign key
            print(f"📝 Adicionando foreign key...")
            db.session.execute(text(f"""
                ALTER TABLE {tabela}
                ADD CONSTRAINT fk_{tabela}_empresa
                FOREIGN KEY (empresa_id) REFERENCES empresa(id)
            """))
            db.session.commit()
            print(f"✅ Foreign key adicionada!")

        except Exception as e:
            print(f"❌ Erro ao processar tabela {tabela}: {str(e)}")
            db.session.rollback()
            raise

    print("\n" + "=" * 80)
    print("✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!")
    print("=" * 80)

if __name__ == '__main__':
    with app.app_context():
        try:
            migrar_empresa_id()
        except Exception as e:
            print(f"\n❌ ERRO CRÍTICO: {str(e)}")
            import traceback
            traceback.print_exc()
