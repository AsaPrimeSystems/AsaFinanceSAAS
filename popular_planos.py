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

        # Criar novos planos (3 planos × 3 durações = 9 planos)
        planos = [
            # BÁSICO
            Plano(
                nome="Básico 30 Dias",
                codigo="basico_30d",
                dias_assinatura=30,
                valor=49.90,
                descricao="Plano Básico - Acesso completo por 30 dias - Até 3 usuários",
                ativo=True,
                ordem_exibicao=1
            ),
            Plano(
                nome="Básico 90 Dias",
                codigo="basico_90d",
                dias_assinatura=90,
                valor=139.70,
                descricao="Plano Básico - Acesso completo por 90 dias - Até 3 usuários",
                ativo=True,
                ordem_exibicao=2
            ),
            Plano(
                nome="Básico Anual",
                codigo="basico_anual",
                dias_assinatura=365,
                valor=539.00,
                descricao="Plano Básico - Acesso completo por 365 dias - Até 3 usuários",
                ativo=True,
                ordem_exibicao=3
            ),

            # PLUS
            Plano(
                nome="Plus 30 Dias",
                codigo="plus_30d",
                dias_assinatura=30,
                valor=59.90,
                descricao="Plano Plus - Acesso completo por 30 dias - Até 8 usuários",
                ativo=True,
                ordem_exibicao=4
            ),
            Plano(
                nome="Plus 90 Dias",
                codigo="plus_90d",
                dias_assinatura=90,
                valor=167.70,
                descricao="Plano Plus - Acesso completo por 90 dias - Até 8 usuários",
                ativo=True,
                ordem_exibicao=5
            ),
            Plano(
                nome="Plus Anual",
                codigo="plus_anual",
                dias_assinatura=365,
                valor=647.00,
                descricao="Plano Plus - Acesso completo por 365 dias - Até 8 usuários",
                ativo=True,
                ordem_exibicao=6
            ),

            # PREMIUM
            Plano(
                nome="Premium 30 Dias",
                codigo="premium_30d",
                dias_assinatura=30,
                valor=79.90,
                descricao="Plano Premium - Acesso completo por 30 dias - Usuários ilimitados",
                ativo=True,
                ordem_exibicao=7
            ),
            Plano(
                nome="Premium 90 Dias",
                codigo="premium_90d",
                dias_assinatura=90,
                valor=223.70,
                descricao="Plano Premium - Acesso completo por 90 dias - Usuários ilimitados",
                ativo=True,
                ordem_exibicao=8
            ),
            Plano(
                nome="Premium Anual",
                codigo="premium_anual",
                dias_assinatura=365,
                valor=863.00,
                descricao="Plano Premium - Acesso completo por 365 dias - Usuários ilimitados",
                ativo=True,
                ordem_exibicao=9
            ),
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
