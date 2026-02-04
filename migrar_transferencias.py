#!/usr/bin/env python3
"""
Migração: Adicionar suporte para transferências entre contas
Data: 2026-02-03
"""

from app import app, db
from sqlalchemy import text

def migrar_transferencias():
    with app.app_context():
        print("=" * 70)
        print("🔄 MIGRAÇÃO: Suporte para Transferências entre Contas")
        print("=" * 70)

        try:
            # Verificar dialeto do banco
            dialect = db.engine.dialect.name
            print(f"\n📊 Banco de dados: {dialect.upper()}")

            # 1. Adicionar coluna eh_transferencia em lancamento
            print("\n1️⃣  Verificando coluna 'eh_transferencia' em lancamento...")

            if dialect == 'postgresql':
                result = db.session.execute(text("""
                    SELECT column_name FROM information_schema.columns
                    WHERE table_name = 'lancamento' AND column_name = 'eh_transferencia'
                """))
                existe_eh_transferencia = result.fetchone() is not None
            else:  # sqlite
                result = db.session.execute(text("PRAGMA table_info(lancamento)"))
                columns = [row[1] for row in result.fetchall()]
                existe_eh_transferencia = 'eh_transferencia' in columns

            if not existe_eh_transferencia:
                print("   ➕ Adicionando coluna 'eh_transferencia'...")
                db.session.execute(text("ALTER TABLE lancamento ADD COLUMN eh_transferencia BOOLEAN DEFAULT FALSE"))
                db.session.commit()
                print("   ✅ Coluna 'eh_transferencia' adicionada com sucesso!")
            else:
                print("   ℹ️  Coluna 'eh_transferencia' já existe")

            # 2. Adicionar coluna transferencia_id em lancamento
            print("\n2️⃣  Verificando coluna 'transferencia_id' em lancamento...")

            if dialect == 'postgresql':
                result = db.session.execute(text("""
                    SELECT column_name FROM information_schema.columns
                    WHERE table_name = 'lancamento' AND column_name = 'transferencia_id'
                """))
                existe_transferencia_id = result.fetchone() is not None
            else:  # sqlite
                result = db.session.execute(text("PRAGMA table_info(lancamento)"))
                columns = [row[1] for row in result.fetchall()]
                existe_transferencia_id = 'transferencia_id' in columns

            if not existe_transferencia_id:
                print("   ➕ Adicionando coluna 'transferencia_id'...")
                db.session.execute(text("ALTER TABLE lancamento ADD COLUMN transferencia_id INTEGER"))
                db.session.commit()
                print("   ✅ Coluna 'transferencia_id' adicionada com sucesso!")
            else:
                print("   ℹ️  Coluna 'transferencia_id' já existe")

            # 3. Atualizar registros existentes
            print("\n3️⃣  Atualizando registros existentes...")
            db.session.execute(text("""
                UPDATE lancamento
                SET eh_transferencia = FALSE
                WHERE eh_transferencia IS NULL
            """))
            db.session.commit()
            print("   ✅ Registros existentes atualizados!")

            print("\n" + "=" * 70)
            print("✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!")
            print("=" * 70)
            print("\n📝 Resumo:")
            print("   ✅ Coluna 'eh_transferencia' (BOOLEAN) adicionada")
            print("   ✅ Coluna 'transferencia_id' (INTEGER) adicionada")
            print("   ✅ Sistema pronto para transferências entre contas!")
            print("\n🎯 Próximos passos:")
            print("   1. Reiniciar o servidor Flask")
            print("   2. Acessar /lancamentos/novo")
            print("   3. Selecionar 'Transferência entre contas' no tipo")
            print("=" * 70)

        except Exception as e:
            print(f"\n❌ ERRO durante a migração: {str(e)}")
            db.session.rollback()
            raise

if __name__ == '__main__':
    migrar_transferencias()
