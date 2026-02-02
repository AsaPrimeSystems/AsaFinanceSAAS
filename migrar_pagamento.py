#!/usr/bin/env python3
"""
Script para atualizar a coluna empresa_id na tabela pagamento
para permitir valores NULL (pagamentos de usuários não logados)
"""

import sqlite3
import os

# Caminho do banco de dados
db_path = 'instance/saas_financeiro_v2.db'

if not os.path.exists(db_path):
    print(f"❌ Banco de dados não encontrado: {db_path}")
    exit(1)

print("=" * 60)
print("ATUALIZAÇÃO DO BANCO DE DADOS - TABELA PAGAMENTO")
print("=" * 60)

try:
    # Conectar ao banco
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("\n1. Verificando estrutura atual da tabela pagamento...")
    cursor.execute("PRAGMA table_info(pagamento)")
    colunas = cursor.fetchall()
    
    print("\n   Colunas atuais:")
    for col in colunas:
        print(f"   - {col[1]}: {col[2]} (NOT NULL: {col[3]})")
    
    # Verificar se empresa_id é NOT NULL
    empresa_id_col = [col for col in colunas if col[1] == 'empresa_id'][0]
    if empresa_id_col[3] == 1:  # NOT NULL
        print("\n2. ⚠️  empresa_id está como NOT NULL. Iniciando migração...")
        
        # SQLite não suporta ALTER COLUMN diretamente, então precisamos:
        # 1. Criar nova tabela
        # 2. Copiar dados
        # 3. Deletar tabela antiga
        # 4. Renomear nova tabela
        
        print("\n3. Criando tabela temporária...")
        cursor.execute("""
            CREATE TABLE pagamento_new (
                id INTEGER PRIMARY KEY,
                empresa_id INTEGER,
                plano_id INTEGER NOT NULL,
                preference_id VARCHAR(200),
                payment_id VARCHAR(200),
                external_reference VARCHAR(200) UNIQUE NOT NULL,
                valor FLOAT NOT NULL,
                dias_assinatura INTEGER NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                status_detail VARCHAR(200),
                payment_type VARCHAR(50),
                payment_method VARCHAR(50),
                data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
                data_aprovacao DATETIME,
                data_expiracao DATETIME,
                observacoes TEXT,
                dados_mp TEXT,
                FOREIGN KEY (empresa_id) REFERENCES empresa(id),
                FOREIGN KEY (plano_id) REFERENCES plano(id)
            )
        """)
        
        print("4. Copiando dados da tabela antiga...")
        cursor.execute("""
            INSERT INTO pagamento_new 
            SELECT * FROM pagamento
        """)
        
        print("5. Removendo tabela antiga...")
        cursor.execute("DROP TABLE pagamento")
        
        print("6. Renomeando tabela nova...")
        cursor.execute("ALTER TABLE pagamento_new RENAME TO pagamento")
        
        conn.commit()
        print("\n✅ Migração concluída com sucesso!")
    else:
        print("\n✅ empresa_id já permite NULL. Nenhuma alteração necessária.")
    
    # Verificar resultado
    print("\n7. Verificando estrutura final...")
    cursor.execute("PRAGMA table_info(pagamento)")
    colunas_final = cursor.fetchall()
    
    print("\n   Colunas finais:")
    for col in colunas_final:
        print(f"   - {col[1]}: {col[2]} (NOT NULL: {col[3]})")
    
    conn.close()
    
    print("\n" + "=" * 60)
    print("✅ ATUALIZAÇÃO CONCLUÍDA!")
    print("=" * 60)
    print("\nAgora reinicie o servidor para aplicar as mudanças.")
    
except Exception as e:
    print(f"\n❌ Erro durante a migração: {e}")
    import traceback
    traceback.print_exc()
    if conn:
        conn.rollback()
        conn.close()
    exit(1)
