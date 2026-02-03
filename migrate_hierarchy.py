import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from datetime import datetime

app = Flask(__name__)
database_url = 'sqlite:////Users/danielcoelho/Documents/ASA PRIME SYSTEMS/PROJETOS DANIEL/SAAS-GESTAO-FINANCEIRA/instance/saas_financeiro_v2.db'
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Empresa(db.Model):
    id = db.Column(db.Integer, primary_key=True)

class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    empresa_id = db.Column(db.Integer, db.ForeignKey('empresa.id'))

class PlanoConta(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(200), nullable=False)
    codigo = db.Column(db.String(50))
    tipo = db.Column(db.String(20), nullable=False)
    natureza = db.Column(db.String(20), default='analitica')
    nivel = db.Column(db.Integer, default=1)
    pai_id = db.Column(db.Integer, db.ForeignKey('plano_conta.id'), nullable=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    empresa_id = db.Column(db.Integer, db.ForeignKey('empresa.id'), nullable=True)
    ativo = db.Column(db.Boolean, default=True)

class Lancamento(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    categoria = db.Column(db.String(100), nullable=False)
    plano_conta_id = db.Column(db.Integer, db.ForeignKey('plano_conta.id'), nullable=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)

def migrate():
    print("Iniciando migração de hierarquia...")
    with app.app_context():
        # Buscar todos os usuários que têm plano de contas
        usuarios_com_contas = db.session.query(PlanoConta.usuario_id).distinct().all()
        usuarios_ids = [u[0] for u in usuarios_com_contas]
        
        for u_id in usuarios_ids:
            print(f"\n--- Processando usuário ID: {u_id} ---")
            # Buscar empresa_id do usuário
            res = db.session.execute(text(f"SELECT empresa_id FROM usuario WHERE id = {u_id}"))
            row = res.fetchone()
            if not row:
                print(f"Usuário {u_id} não encontrado, pulando...")
                continue
            emp_id = row[0]
            
            # 1. Criar Raízes (Sintéticas Nível 1)
            # RECEITAS (1)
            receitas_root = PlanoConta.query.filter_by(usuario_id=u_id, codigo='1').first()
            if not receitas_root:
                print("Criando raiz RECEITAS")
                receitas_root = PlanoConta(nome='RECEITAS', codigo='1', tipo='receita', natureza='sintetica', nivel=1, usuario_id=u_id, empresa_id=emp_id)
                db.session.add(receitas_root)
            
            # DESPESAS (2)
            despesas_root = PlanoConta.query.filter_by(usuario_id=u_id, codigo='2').first()
            if not despesas_root:
                print("Criando raiz DESPESAS")
                despesas_root = PlanoConta(nome='DESPESAS', codigo='2', tipo='despesa', natureza='sintetica', nivel=1, usuario_id=u_id, empresa_id=emp_id)
                db.session.add(despesas_root)
            
            db.session.flush() # Garantir IDs
            
            # 2. Criar Subgrupos (Sintéticas Nível 2)
            rec_oper = PlanoConta.query.filter_by(usuario_id=u_id, codigo='1.1').first()
            if not rec_oper:
                rec_oper = PlanoConta(nome='Receitas Operacionais', codigo='1.1', tipo='receita', natureza='sintetica', nivel=2, pai_id=receitas_root.id, usuario_id=u_id, empresa_id=emp_id)
                db.session.add(rec_oper)

            desp_oper = PlanoConta.query.filter_by(usuario_id=u_id, codigo='2.1').first()
            if not desp_oper:
                desp_oper = PlanoConta(nome='Despesas Operacionais', codigo='2.1', tipo='despesa', natureza='sintetica', nivel=2, pai_id=despesas_root.id, usuario_id=u_id, empresa_id=emp_id)
                db.session.add(desp_oper)
            
            db.session.flush()
            
            # 3. Mapear e atualizar contas existentes (torná-las Analíticas Nível 3)
            contas_existentes = PlanoConta.query.filter(PlanoConta.usuario_id == u_id, PlanoConta.codigo == None).all()
            
            for conta in contas_existentes:
                conta.nivel = 3
                conta.empresa_id = emp_id
                conta.natureza = 'analitica'
                
                if conta.tipo == 'receita':
                    conta.pai_id = rec_oper.id
                    irmaos_count = PlanoConta.query.filter(PlanoConta.pai_id == rec_oper.id, PlanoConta.codigo != None).count()
                    conta.codigo = f"1.1.{irmaos_count + 1}"
                else:
                    nome_low = conta.nome.lower()
                    if any(x in nome_low for x in ['imposto', 'simples nacional', 'taxa']):
                        sub_imp = PlanoConta.query.filter_by(usuario_id=u_id, codigo='2.2').first()
                        if not sub_imp:
                            sub_imp = PlanoConta(nome='Impostos e Taxas', codigo='2.2', tipo='despesa', natureza='sintetica', nivel=2, pai_id=despesas_root.id, usuario_id=u_id, empresa_id=emp_id)
                            db.session.add(sub_imp)
                            db.session.flush()
                        conta.pai_id = sub_imp.id
                        irmaos_count = PlanoConta.query.filter(PlanoConta.pai_id == sub_imp.id, PlanoConta.codigo != None).count()
                        conta.codigo = f"2.2.{irmaos_count + 1}"
                    elif any(x in nome_low for x in ['pro-labore', 'pró-labore', 'pessoal', 'salário', 'folha']):
                        sub_pes = PlanoConta.query.filter_by(usuario_id=u_id, codigo='2.3').first()
                        if not sub_pes:
                            sub_pes = PlanoConta(nome='Pessoal', codigo='2.3', tipo='despesa', natureza='sintetica', nivel=2, pai_id=despesas_root.id, usuario_id=u_id, empresa_id=emp_id)
                            db.session.add(sub_pes)
                            db.session.flush()
                        conta.pai_id = sub_pes.id
                        irmaos_count = PlanoConta.query.filter(PlanoConta.pai_id == sub_pes.id, PlanoConta.codigo != None).count()
                        conta.codigo = f"2.3.{irmaos_count + 1}"
                    else:
                        conta.pai_id = desp_oper.id
                        irmaos_count = PlanoConta.query.filter(PlanoConta.pai_id == desp_oper.id, PlanoConta.codigo != None).count()
                        conta.codigo = f"2.1.{irmaos_count + 1}"
                
                print(f"   -> Conta '{conta.nome}' migrada para código {conta.codigo}")
            
            db.session.commit()
            
            # 4. Vincular Lançamentos (Strings -> IDs)
            print(f"   Vinculando lancamentos para usuário {u_id}...")
            # Mapear nome da categoria (string) para o id do plano_conta recém-organizado
            mapa_contas = {c.nome: c.id for c in PlanoConta.query.filter_by(usuario_id=u_id).all()}
            
            # Pegar lançamentos que ainda não têm plano_conta_id e têm categoria preenchida
            # Se categoria for string, precisamos encontrar o ID
            lancamentos = Lancamento.query.filter(Lancamento.usuario_id == u_id, Lancamento.plano_conta_id == None).all()
            count_lanc = 0
            for lanc in lancamentos:
                if lanc.categoria in mapa_contas:
                    lanc.plano_conta_id = mapa_contas[lanc.categoria]
                    count_lanc += 1
            
            db.session.commit()
            print(f"   {count_lanc} lançamentos vinculados.")

    print("\nMigração completa!")

if __name__ == "__main__":
    migrate()
