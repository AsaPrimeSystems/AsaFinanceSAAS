"""
Migração COMPLETA para PostgreSQL em Produção
Execute este script no Render Shell para adicionar TODAS as colunas que faltam
"""
from app import app, db
from sqlalchemy import text

def verificar_coluna_existe(tabela, coluna):
    """Verifica se uma coluna existe em uma tabela PostgreSQL"""
    try:
        result = db.session.execute(text("""
            SELECT column_name FROM information_schema.columns
            WHERE table_name = :tabela AND column_name = :coluna
        """), {'tabela': tabela, 'coluna': coluna})
        return result.fetchone() is not None
    except Exception as e:
        print(f"⚠️ Erro ao verificar coluna {coluna}: {e}")
        return False

def migrar_producao():
    """Adiciona TODAS as colunas que faltam em produção"""

    print("=" * 80)
    print("MIGRAÇÃO COMPLETA PARA PRODUÇÃO - PostgreSQL")
    print("=" * 80)

    # Definir TODAS as migrações necessárias
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
        'venda': [
            ('nota_fiscal', 'VARCHAR(50)'),
            ('empresa_id', 'INTEGER'),
        ],
        'compra': [
            ('nota_fiscal', 'VARCHAR(50)'),
            ('empresa_id', 'INTEGER'),
        ],
        'cliente': [
            ('empresa_id', 'INTEGER'),
        ],
        'fornecedor': [
            ('empresa_id', 'INTEGER'),
        ],
        'plano_conta': [
            ('codigo', 'VARCHAR(50)'),
            ('natureza', "VARCHAR(20) DEFAULT 'analitica'"),
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

    # Processar cada tabela
    for tabela, colunas in migracoes.items():
        print(f"\n📋 Processando tabela: {tabela}")

        for coluna, tipo in colunas:
            try:
                if not verificar_coluna_existe(tabela, coluna):
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
            # Verificar se empresa_id existe antes de tentar preencher
            if verificar_coluna_existe(tabela, 'empresa_id'):
                db.session.execute(text(f"""
                    UPDATE {tabela}
                    SET empresa_id = u.empresa_id
                    FROM usuario u
                    WHERE {tabela}.usuario_id = u.id
                      AND {tabela}.empresa_id IS NULL
                """))

                db.session.commit()
                count = db.session.execute(text(f"SELECT COUNT(*) FROM {tabela} WHERE empresa_id IS NOT NULL")).scalar()
                print(f"  ✅ {tabela}: {count} registros com empresa_id")
            else:
                print(f"  ⚠️ {tabela}: coluna empresa_id não existe, pulando...")

        except Exception as e:
            print(f"  ⚠️ Erro ao atualizar {tabela}: {str(e)}")
            db.session.rollback()

    print("\n" + "=" * 80)
    print("✅ MIGRAÇÃO COMPLETA CONCLUÍDA!")
    print("=" * 80)
    print("\n🔄 Execute 'exit' e reinicie o servidor Render")

if __name__ == '__main__':
    with app.app_context():
        try:
            migrar_producao()
        except Exception as e:
            print(f"\n❌ ERRO CRÍTICO: {str(e)}")
            import traceback
            traceback.print_exc()
