#!/usr/bin/env python3
"""
Script para testar a configuração do Mercado Pago
"""

from mercadopago_config import validar_configuracao, MERCADOPAGO_ACCESS_TOKEN, MERCADOPAGO_PUBLIC_KEY

print("=" * 60)
print("TESTE DE CONFIGURAÇÃO DO MERCADO PAGO")
print("=" * 60)

print(f"\n1. ACCESS TOKEN:")
print(f"   Primeiros 20 caracteres: {MERCADOPAGO_ACCESS_TOKEN[:20]}...")
print(f"   Tamanho: {len(MERCADOPAGO_ACCESS_TOKEN)} caracteres")

print(f"\n2. PUBLIC KEY:")
print(f"   Primeiros 20 caracteres: {MERCADOPAGO_PUBLIC_KEY[:20]}...")
print(f"   Tamanho: {len(MERCADOPAGO_PUBLIC_KEY)} caracteres")

print(f"\n3. VALIDAÇÃO:")
valido, mensagem = validar_configuracao()
print(f"   Válido: {valido}")
print(f"   Mensagem: {mensagem}")

if valido:
    print("\n✅ Configuração OK! Testando SDK...")
    try:
        import mercadopago
        sdk = mercadopago.SDK(MERCADOPAGO_ACCESS_TOKEN)
        print("✅ SDK do Mercado Pago carregado com sucesso!")
    except ImportError:
        print("❌ SDK do Mercado Pago não instalado!")
        print("   Execute: pip install mercadopago")
    except Exception as e:
        print(f"❌ Erro ao inicializar SDK: {e}")
else:
    print("\n❌ Configuração inválida!")

print("\n" + "=" * 60)
