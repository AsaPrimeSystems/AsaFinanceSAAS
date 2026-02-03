"""
Script para atribuir plano a uma empresa para teste
Execute: python3 atribuir_plano_teste.py
"""
from app import app, db, Empresa, Plano

def atribuir_plano():
    with app.app_context():
        print("=" * 60)
        print("ATRIBUIR PLANO A EMPRESA (TESTE)")
        print("=" * 60)

        # Buscar empresa (excluindo admin)
        empresas = Empresa.query.filter(Empresa.tipo_conta != 'admin').all()

        if not empresas:
            print("❌ Nenhuma empresa encontrada.")
            return

        print("\n📋 Empresas disponíveis:")
        for i, emp in enumerate(empresas, 1):
            print(f"{i}. {emp.razao_social} - Tipo: {emp.tipo_conta}")

        escolha = int(input("\nEscolha o número da empresa: "))
        empresa = empresas[escolha - 1]

        # Buscar planos
        planos = Plano.query.filter_by(ativo=True).order_by(Plano.ordem_exibicao).all()

        print("\n💎 Planos disponíveis:")
        for i, plano in enumerate(planos, 1):
            print(f"{i}. {plano.nome} - R$ {plano.valor:.2f} - {plano.dias_assinatura} dias")

        escolha_plano = int(input("\nEscolha o número do plano: "))
        plano = planos[escolha_plano - 1]

        # Atribuir plano
        empresa.plano_id = plano.id
        empresa.dias_assinatura = plano.dias_assinatura
        db.session.commit()

        print(f"\n✅ Plano '{plano.nome}' atribuído a '{empresa.razao_social}'!")
        print(f"   Dias de assinatura: {empresa.dias_assinatura}")
        print("\n🔄 Faça login novamente para ver o plano no cabeçalho.")

if __name__ == '__main__':
    atribuir_plano()
