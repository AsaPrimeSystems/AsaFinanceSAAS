import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

app = Flask(__name__)
database_url = 'sqlite:////Users/danielcoelho/Documents/ASA PRIME SYSTEMS/PROJETOS DANIEL/SAAS-GESTAO-FINANCEIRA/instance/saas_financeiro_v2.db'
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

def run_migrations():
    with app.app_context():
        # 1. empresa_id
        tabelas_empresa = ['cliente', 'fornecedor', 'venda', 'compra']
        for tab in tabelas_empresa:
            res = db.session.execute(text(f"PRAGMA table_info({tab})"))
            cols = [r[1] for r in res.fetchall()]
            if 'empresa_id' not in cols:
                print(f"Adding empresa_id to {tab}")
                db.session.execute(text(f"ALTER TABLE {tab} ADD COLUMN empresa_id INTEGER"))
        
        # 2. nota_fiscal
        tabelas_nf = ['lancamento', 'venda', 'compra']
        for tab in tabelas_nf:
            res = db.session.execute(text(f"PRAGMA table_info({tab})"))
            cols = [r[1] for r in res.fetchall()]
            if 'nota_fiscal' not in cols:
                print(f"Adding nota_fiscal to {tab}")
                db.session.execute(text(f"ALTER TABLE {tab} ADD COLUMN nota_fiscal VARCHAR(50)"))
                
        # 3. Hierarquia PlanoConta
        res = db.session.execute(text("PRAGMA table_info(plano_conta)"))
        cols = [r[1] for r in res.fetchall()]
        novas_colunas_pc = {
            'codigo': 'VARCHAR(50)',
            'natureza': 'VARCHAR(20) DEFAULT "analitica"',
            'nivel': 'INTEGER DEFAULT 1',
            'pai_id': 'INTEGER',
            'empresa_id': 'INTEGER'
        }
        for col, tipo in novas_colunas_pc.items():
            if col not in cols:
                print(f"Adding {col} to plano_conta")
                db.session.execute(text(f"ALTER TABLE plano_conta ADD COLUMN {col} {tipo}"))
                
        # 4. plano_conta_id in lancamento
        res = db.session.execute(text("PRAGMA table_info(lancamento)"))
        cols = [r[1] for r in res.fetchall()]
        if 'plano_conta_id' not in cols:
            print("Adding plano_conta_id to lancamento")
            db.session.execute(text("ALTER TABLE lancamento ADD COLUMN plano_conta_id INTEGER"))
            
        db.session.commit()
        print("Migrations completed successfully!")

if __name__ == "__main__":
    run_migrations()
