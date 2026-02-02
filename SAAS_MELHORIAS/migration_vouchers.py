#!/usr/bin/env python3
# ============================================================================
# SCRIPT DE MIGRAÇÃO PARA ADICIONAR TABELAS DE VOUCHERS
# Executar: python migration_vouchers.py
# ============================================================================

from app import app, db, Voucher, VoucherUso
from datetime import datetime

def criar_tabelas_vouchers():
    """Cria as tabelas de vouchers se não existirem"""
    with app.app_context():
        try:
            print("=" * 70)
            print("MIGRAÇÃO: ADICIONANDO TABELAS DE VOUCHERS")
            print("=" * 70)
            
            # Verificar se tabelas já existem
            from sqlalchemy import text
            
            try:
                # Tentar consultar tabela voucher
                db.session.execute(text("SELECT 1 FROM voucher LIMIT 1"))
                print("✅ Tabela 'voucher' já existe")
            except:
                print("📝 Criando tabela 'voucher'...")
                db.session.execute(text("""
                    CREATE TABLE voucher (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        codigo VARCHAR(50) UNIQUE NOT NULL,
                        dias_assinatura INTEGER NOT NULL,
                        validade DATETIME NOT NULL,
                        ativo BOOLEAN DEFAULT 1,
                        data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
                        criado_por INTEGER,
                        FOREIGN KEY (criado_por) REFERENCES usuario(id)
                    )
                """))
                db.session.commit()
                print("✅ Tabela 'voucher' criada com sucesso")
            
            try:
                # Tentar consultar tabela voucher_uso
                db.session.execute(text("SELECT 1 FROM voucher_uso LIMIT 1"))
                print("✅ Tabela 'voucher_uso' já existe")
            except:
                print("📝 Criando tabela 'voucher_uso'...")
                db.session.execute(text("""
                    CREATE TABLE voucher_uso (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        voucher_id INTEGER NOT NULL,
                        empresa_id INTEGER NOT NULL,
                        data_uso DATETIME DEFAULT CURRENT_TIMESTAMP,
                        dias_creditados INTEGER NOT NULL,
                        usuario_admin_id INTEGER,
                        observacoes TEXT,
                        FOREIGN KEY (voucher_id) REFERENCES voucher(id),
                        FOREIGN KEY (empresa_id) REFERENCES empresa(id),
                        FOREIGN KEY (usuario_admin_id) REFERENCES usuario(id)
                    )
                """))
                db.session.commit()
                print("✅ Tabela 'voucher_uso' criada com sucesso")
            
            # Criar índices para melhor performance
            try:
                db.session.execute(text("CREATE INDEX idx_voucher_codigo ON voucher(codigo)"))
            except:
                pass
            
            try:
                db.session.execute(text("CREATE INDEX idx_voucher_uso_empresa ON voucher_uso(empresa_id)"))
            except:
                pass
            
            db.session.commit()
            
            print("\n" + "=" * 70)
            print("✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!")
            print("=" * 70)
            print("\nPróximos passos:")
            print("1. Acesse /admin/usuarios")
            print("2. Clique em 'Gerenciar Vouchers'")
            print("3. Crie seus primeiros vouchers")
            print("\n")
            
        except Exception as e:
            print(f"\n❌ ERRO NA MIGRAÇÃO: {str(e)}")
            print(f"Detalhes: {e}")
            db.session.rollback()
            import traceback
            traceback.print_exc()


if __name__ == '__main__':
    criar_tabelas_vouchers()
