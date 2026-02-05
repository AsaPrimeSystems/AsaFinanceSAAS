import sqlite3
import os

db_path = 'instance/saas_financeiro_v2.db'

if not os.path.exists(db_path):
    print(f"Erro: Banco de dados não encontrado em {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    print("Iniciando migração de dados...")
    
    # Atualizar tabela lancamento
    print("Atualizando tabela 'lancamento'...")
    cursor.execute("UPDATE lancamento SET tipo = 'entrada' WHERE tipo = 'receita'")
    print(f"Lançamentos de receita atualizados: {cursor.rowcount}")
    
    cursor.execute("UPDATE lancamento SET tipo = 'saida' WHERE tipo = 'despesa'")
    print(f"Lançamentos de despesa atualizados: {cursor.rowcount}")
    
    # Atualizar tabela plano_conta
    print("Atualizando tabela 'plano_conta'...")
    cursor.execute("UPDATE plano_conta SET tipo = 'entrada' WHERE tipo = 'receita'")
    print(f"Categorias de receita atualizadas: {cursor.rowcount}")
    
    cursor.execute("UPDATE plano_conta SET tipo = 'saida' WHERE tipo = 'despesa'")
    print(f"Categorias de despesa atualizadas: {cursor.rowcount}")
    
    # Atualizar tabela importacao (se houver campos legados)
    print("Verificando tabela 'importacao'...")
    try:
        cursor.execute("UPDATE importacao SET lancamentos_ids = REPLACE(lancamentos_ids, '\"tipo\": \"receita\"', '\"tipo\": \"entrada\"')")
        cursor.execute("UPDATE importacao SET lancamentos_ids = REPLACE(lancamentos_ids, '\"tipo\": \"despesa\"', '\"tipo\": \"saida\"')")
    except Exception as e:
        print(f"Aviso ao atualizar importacao (pode não existir): {e}")

    conn.commit()
    print("Migração concluída com sucesso!")

except Exception as e:
    conn.rollback()
    print(f"Erro durante a migração: {e}")
finally:
    conn.close()
