#!/usr/bin/env python3
"""
Migração standalone para adicionar campos de transferência
Pode ser executado diretamente no shell do Render
"""

import os
import sys

try:
    import psycopg2
    from psycopg2 import sql
except ImportError:
    print("❌ Erro: psycopg2 não está instalado")
    print("Execute: pip install psycopg2-binary")
    sys.exit(1)

def migrar():
    # Pegar DATABASE_URL do ambiente
    database_url = os.environ.get('DATABASE_URL')

    if not database_url:
        print("❌ Erro: DATABASE_URL não encontrada nas variáveis de ambiente")
        sys.exit(1)

    # Render usa postgres:// mas psycopg2 precisa de postgresql://
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)

    print(f"🔗 Conectando ao banco de dados...")

    try:
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()

        print("✅ Conectado com sucesso!")

        # Verificar se as colunas já existem
        cursor.execute("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'lancamento'
            AND column_name IN ('eh_transferencia', 'transferencia_id')
        """)

        colunas_existentes = [row[0] for row in cursor.fetchall()]

        if 'eh_transferencia' in colunas_existentes and 'transferencia_id' in colunas_existentes:
            print("✅ As colunas já existem. Migração não necessária.")
            cursor.close()
            conn.close()
            return

        print("📝 Adicionando colunas à tabela lancamento...")

        # Adicionar eh_transferencia se não existir
        if 'eh_transferencia' not in colunas_existentes:
            cursor.execute("""
                ALTER TABLE lancamento
                ADD COLUMN eh_transferencia BOOLEAN DEFAULT FALSE
            """)
            print("  ✅ Coluna 'eh_transferencia' adicionada")
        else:
            print("  ℹ️  Coluna 'eh_transferencia' já existe")

        # Adicionar transferencia_id se não existir
        if 'transferencia_id' not in colunas_existentes:
            cursor.execute("""
                ALTER TABLE lancamento
                ADD COLUMN transferencia_id VARCHAR(36)
            """)
            print("  ✅ Coluna 'transferencia_id' adicionada")
        else:
            print("  ℹ️  Coluna 'transferencia_id' já existe")

        # Criar índice para melhor performance
        print("📝 Criando índice para transferencia_id...")
        try:
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_lancamento_transferencia_id
                ON lancamento(transferencia_id)
            """)
            print("  ✅ Índice criado")
        except Exception as e:
            print(f"  ⚠️  Índice já existe ou erro ao criar: {e}")

        # Commit das alterações
        conn.commit()
        print("✅ Migração concluída com sucesso!")

        # Verificar o resultado
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'lancamento'
            AND column_name IN ('eh_transferencia', 'transferencia_id')
            ORDER BY column_name
        """)

        print("\n📊 Estrutura das novas colunas:")
        for row in cursor.fetchall():
            print(f"  - {row[0]}: {row[1]} (nullable: {row[2]})")

        cursor.close()
        conn.close()

    except psycopg2.Error as e:
        print(f"❌ Erro ao executar migração: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        sys.exit(1)

if __name__ == '__main__':
    print("=" * 60)
    print("🔧 MIGRAÇÃO: Adicionar campos de transferência")
    print("=" * 60)
    migrar()
    print("=" * 60)
