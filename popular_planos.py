"""
Script para popular planos de assinatura no banco de dados
Execute: python3 popular_planos.py
"""
from app import app, db, Plano

def popular_planos():
    with app.app_context():
        print("=" * 60)
        print("POPULANDO PLANOS DE ASSINATURA")
        print("=" * 60)

        # Verificar se já existem planos
        planos_existentes = Plano.query.count()
        if planos_existentes > 0:
            print(f"\n⚠️  Já existem {planos_existentes} planos cadastrados.")
            resposta = input("Deseja substituir todos os planos? (s/N): ")
            if resposta.lower() != 's':
                print("Operação cancelada.")
                return

            # Limpar planos existentes
            Plano.query.delete()
            print("✅ Planos anteriores removidos.")

        # Criar novos planos
        planos = [
            Plano(
                nome="Plano 30 Dias",
                codigo="30d",
                dias_assinatura=30,
                valor=49.90,
                descricao="Acesso completo por 30 dias - Até 5 usuários",
                ativo=True,
                ordem_exibicao=1
            ),
            Plano(
                nome="Plano 90 Dias",
                codigo="90d",
                dias_assinatura=90,
                valor=99.90,
                descricao="Acesso completo por 90 dias - Até 10 usuários",
                ativo=True,
                ordem_exibicao=2
            ),
            Plano(
                nome="Plano Anual",
                codigo="anual",
                dias_assinatura=365,
                valor=300.00,
                descricao="Acesso completo por 365 dias - Usuários ilimitados",
                ativo=True,
                ordem_exibicao=3
            )
        ]

        for plano in planos:
            db.session.add(plano)
            print(f"\n➕ Criando: {plano.nome}")
            print(f"   Código: {plano.codigo}")
            print(f"   Valor: R$ {plano.valor:.2f}")
            print(f"   Dias: {plano.dias_assinatura}")

        db.session.commit()

        print("\n" + "=" * 60)
        print("✅ PLANOS CADASTRADOS COM SUCESSO!")
        print("=" * 60)

        # Listar planos cadastrados
        print("\nPlanos disponíveis:")
        planos_lista = Plano.query.order_by(Plano.ordem_exibicao).all()
        for p in planos_lista:
            print(f"  • {p.nome} ({p.codigo}) - R$ {p.valor:.2f} - {p.dias_assinatura} dias")

if __name__ == '__main__':
    popular_planos()
