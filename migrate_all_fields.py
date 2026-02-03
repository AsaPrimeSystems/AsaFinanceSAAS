"""
Migração completa para PostgreSQL - Adiciona TODOS os campos que faltam
Execute este script no servidor de produção para corrigir o erro 500
"""
from app import app, db
from sqlalchemy import text

def verificar_coluna_existe(tabela, coluna, db_type='postgresql'):
    """Verifica se uma coluna existe em uma tabela"""
    try:
        if db_type == 'sqlite':
            result = db.session.execute(text(f"PRAGMA table_info({tabela})"))
            columns = [row[1] for row in result.fetchall()]
        else:  # PostgreSQL
            result = db.session.execute(text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = :tabela AND column_name = :coluna
            """), {'tabela': tabela, 'coluna': coluna})
            return result.fetchone() is not None
        return coluna in columns
    except Exception as e:
        print(f"⚠️ Erro ao verificar coluna {coluna}: {e}")
        return False

def migrar_todos_campos():
    """Adiciona todos os campos que faltam em produção"""

    print("=" * 80)
    print("MIGRAÇÃO COMPLETA - Adicionando campos que faltam")
    print("=" * 80)

    db_type = db.engine.name
    print(f"\n🔍 Banco detectado: {db_type}")

    # Definir todas as migrações necessárias
    migracoes = {
        'lancamento': [
            ('nota_fiscal', 'VARCHAR(50)'),
            ('observacoes', 'TEXT'),
            ('produto_servico', 'VARCHAR(200)'),
            ('tipo_produto_servico', 'VARCHAR(20)'),
            ('itens_carrinho', 'TEXT'),
            ('usuario_criacao_id', 'INTEGER'),
            ('usuario_ultima_edicao_id', 'INTEGER'),
            ('data_ultima_edicao', 'TIMESTAMP'),
            ('plano_conta_id', 'INTEGER'),
        ],
        'cliente': [
            ('empresa_id', 'INTEGER'),
        ],
        'fornecedor': [
            ('empresa_id', 'INTEGER'),
        ],
        'venda': [
            ('empresa_id', 'INTEGER'),
        ],
        'compra': [
            ('empresa_id', 'INTEGER'),
        ],
        'plano_conta': [
            ('natureza', 'VARCHAR(20) DEFAULT \'analitica\''),
            ('nivel', 'INTEGER DEFAULT 1'),
            ('pai_id', 'INTEGER'),
            ('empresa_id', 'INTEGER'),
        ],
        'produto': [
            ('ativo', 'BOOLEAN DEFAULT TRUE'),
        ],
        'sub_usuario_contador': [
            ('usuario', 'VARCHAR(50)'),
        ],
        'empresa': [
            ('data_inicio_assinatura', 'TIMESTAMP'),
        ],
    }

    for tabela, colunas in migracoes.items():
        print(f"\n📋 Processando tabela: {tabela}")

        for coluna, tipo in colunas:
            try:
                if not verificar_coluna_existe(tabela, coluna, db_type):
                    print(f"  📝 Adicionando coluna '{coluna}'...")

                    db.session.execute(text(f"ALTER TABLE {tabela} ADD COLUMN {coluna} {tipo}"))
                    db.session.commit()

                    print(f"  ✅ Coluna '{coluna}' adicionada!")
                else:
                    print(f"  ✓ Coluna '{coluna}' já existe")

            except Exception as e:
                print(f"  ⚠️ Erro ao adicionar coluna '{coluna}': {str(e)}")
                db.session.rollback()

    # Preencher empresa_id nas tabelas que precisam
    print(f"\n📝 Preenchendo campos empresa_id...")
    tabelas_empresa = ['cliente', 'fornecedor', 'venda', 'compra', 'lancamento']

    for tabela in tabelas_empresa:
        try:
            if db_type == 'sqlite':
                db.session.execute(text(f"""
                    UPDATE {tabela}
                    SET empresa_id = (
                        SELECT empresa_id FROM usuario WHERE usuario.id = {tabela}.usuario_id
                    )
                    WHERE empresa_id IS NULL
                """))
            else:  # PostgreSQL
                db.session.execute(text(f"""
                    UPDATE {tabela}
                    SET empresa_id = u.empresa_id
                    FROM usuario u
                    WHERE {tabela}.usuario_id = u.id
                      AND {tabela}.empresa_id IS NULL
                """))

            db.session.commit()
            count = db.session.execute(text(f"SELECT COUNT(*) FROM {tabela} WHERE empresa_id IS NOT NULL")).scalar()
            print(f"  ✅ {tabela}: {count} registros atualizados")

        except Exception as e:
            print(f"  ⚠️ Erro ao atualizar {tabela}: {str(e)}")
            db.session.rollback()

    print("\n" + "=" * 80)
    print("✅ MIGRAÇÃO COMPLETA CONCLUÍDA!")
    print("=" * 80)
    print("\n🔄 Reinicie o servidor para aplicar as mudanças")

if __name__ == '__main__':
    with app.app_context():
        try:
            migrar_todos_campos()
        except Exception as e:
            print(f"\n❌ ERRO CRÍTICO: {str(e)}")
            import traceback
            traceback.print_exc()
