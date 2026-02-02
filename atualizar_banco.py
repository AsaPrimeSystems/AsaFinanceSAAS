"""
Script de atualização/início do banco de dados.

Executa db.create_all() dentro do contexto da aplicação para garantir
que as tabelas existam antes de iniciar o servidor.
"""

from app import app, db  # type: ignore


def atualizar_banco() -> None:
    """Cria tabelas ausentes sem apagar dados existentes."""
    with app.app_context():
        db.create_all()


if __name__ == "__main__":
    atualizar_banco()
    print("Banco de dados verificado/atualizado com sucesso.")


