"""
Script para criar tabela dre_configuracao
Execute: python3 criar_tabela_dre.py
"""
from app import app, db, DreConfiguracao

def criar_tabela():
    with app.app_context():
        print("=" * 60)
        print("CRIANDO TABELA DRE_CONFIGURACAO")
        print("=" * 60)

        # Criar todas as tabelas (incluindo dre_configuracao)
        db.create_all()

        print("\n✅ Tabela dre_configuracao criada com sucesso!")
        print("=" * 60)

if __name__ == '__main__':
    criar_tabela()
