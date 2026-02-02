from app import app, db
from sqlalchemy import text

def init_db():
    print("Iniciando criação de tabelas...")
    with app.app_context():
        # Tentar criar tabelas
        try:
            db.create_all()
            print("✅ Tabelas criadas com sucesso!")
        except Exception as e:
            print(f"❌ Erro ao criar tabelas: {e}")

        # Tentar criar admin se necessário (opcional, já tem lógica no app.py mas é bom garantir)
        try:
            print("Verificando se precisa criar tabelas auxiliares...")
            db.session.commit()
        except Exception as e:
            print(f"Erro na verificação final: {e}")

if __name__ == "__main__":
    init_db()
