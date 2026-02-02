#!/usr/bin/env python3
"""
Script para criar ou verificar o usuário admin no banco de dados
"""

from app import app, db, Empresa, Usuario
from werkzeug.security import generate_password_hash

def criar_ou_verificar_admin():
    """Cria ou verifica se o usuário admin existe"""
    with app.app_context():
        try:
            # Verificar se existe empresa admin
            empresa_admin = Empresa.query.filter_by(cnpj='00.000.000/0000-00').first()
            
            if not empresa_admin:
                print("📋 Criando empresa ADMIN...")
                empresa_admin = Empresa(
                    cnpj='00.000.000/0000-00',
                    razao_social='Sistema Administrativo',
                    nome_fantasia='Admin',
                    tipo_empresa='servicos',
                    tipo_conta='admin',
                    dias_assinatura=999999,
                    ativo=True
                )
                db.session.add(empresa_admin)
                db.session.flush()
                print(f"   ✅ Empresa ADMIN criada com ID: {empresa_admin.id}")
            else:
                # Garantir que tipo_conta está correto
                if empresa_admin.tipo_conta != 'admin':
                    empresa_admin.tipo_conta = 'admin'
                    db.session.commit()
                    print("   ✅ Tipo de conta da empresa ADMIN atualizado!")
                else:
                    print(f"   ✅ Empresa ADMIN já existe (ID: {empresa_admin.id})")
            
            # Verificar se existe usuário admin
            usuario_admin = Usuario.query.filter_by(
                empresa_id=empresa_admin.id,
                usuario='admin'
            ).first()
            
            if not usuario_admin:
                print("📋 Criando usuário ADMIN...")
                usuario_admin = Usuario(
                    nome='Administrador',
                    usuario='admin',
                    email='admin@sistema.com',
                    senha=generate_password_hash('admin123'),
                    tipo='admin',
                    empresa_id=empresa_admin.id,
                    ativo=True
                )
                db.session.add(usuario_admin)
                db.session.commit()
                print("   ✅ Usuário ADMIN criado!")
            else:
                # Verificar se a senha está correta (resetar se necessário)
                from werkzeug.security import check_password_hash
                if not check_password_hash(usuario_admin.senha, 'admin123'):
                    print("📋 Resetando senha do ADMIN para 'admin123'...")
                    usuario_admin.senha = generate_password_hash('admin123')
                    db.session.commit()
                    print("   ✅ Senha do ADMIN resetada!")
                else:
                    print(f"   ✅ Usuário ADMIN já existe (ID: {usuario_admin.id})")
            
            print("\n" + "=" * 50)
            print("🔐 CREDENCIAIS DO ADMINISTRADOR:")
            print("=" * 50)
            print("   Tipo de Acesso: Empresa (CNPJ)")
            print("   CNPJ: 00.000.000/0000-00")
            print("   Usuário: admin")
            print("   Senha: admin123")
            print("=" * 50 + "\n")
            
        except Exception as e:
            print(f"❌ Erro ao criar/verificar admin: {str(e)}")
            db.session.rollback()
            raise

if __name__ == '__main__':
    criar_ou_verificar_admin()

