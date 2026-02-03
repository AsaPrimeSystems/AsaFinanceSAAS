#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Migração: Adicionar coluna plano_id na tabela empresa
E criar tabela plano se não existir
"""

from app import app, db
from sqlalchemy import text

def migrar_plano_empresa():
    with app.app_context():
        print("=" * 60)
        print("MIGRAÇÃO: Tabela Plano e coluna plano_id em Empresa")
        print("=" * 60)

        try:
            # 1. Verificar se tabela plano existe
            result = db.session.execute(text("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_name = 'plano'
            """))

            if not result.fetchone():
                print("\n📋 Criando tabela 'plano'...")
                db.session.execute(text("""
                    CREATE TABLE plano (
                        id SERIAL PRIMARY KEY,
                        nome VARCHAR(100) NOT NULL,
                        codigo VARCHAR(50) UNIQUE NOT NULL,
                        descricao TEXT,
                        preco NUMERIC(10, 2) NOT NULL DEFAULT 0,
                        dias_duracao INTEGER NOT NULL DEFAULT 30,
                        ativo BOOLEAN DEFAULT TRUE,
                        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))
                db.session.commit()
                print("✅ Tabela 'plano' criada com sucesso!")

                # Inserir planos padrão
                print("\n📋 Inserindo planos padrão...")
                db.session.execute(text("""
                    INSERT INTO plano (nome, codigo, descricao, preco, dias_duracao, ativo)
                    VALUES
                        ('Plano Básico 30 Dias', 'basico_30d', 'Plano básico com 30 dias de acesso', 0, 30, TRUE),
                        ('Plano Plus 30 Dias', 'plus_30d', 'Plano plus com recursos avançados - 30 dias', 99.90, 30, TRUE),
                        ('Plano Premium 30 Dias', 'premium_30d', 'Plano premium com todos os recursos - 30 dias', 199.90, 30, TRUE),
                        ('Plano Básico 90 Dias', 'basico_90d', 'Plano básico com 90 dias de acesso', 0, 90, TRUE),
                        ('Plano Plus 90 Dias', 'plus_90d', 'Plano plus com recursos avançados - 90 dias', 269.90, 90, TRUE),
                        ('Plano Premium 90 Dias', 'premium_90d', 'Plano premium com todos os recursos - 90 dias', 539.90, 90, TRUE)
                    ON CONFLICT (codigo) DO NOTHING
                """))
                db.session.commit()
                print("✅ Planos padrão inseridos!")
            else:
                print("✅ Tabela 'plano' já existe!")

            # 2. Verificar se coluna plano_id existe na tabela empresa
            result = db.session.execute(text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'empresa' AND column_name = 'plano_id'
            """))

            if not result.fetchone():
                print("\n📋 Adicionando coluna 'plano_id' na tabela empresa...")
                db.session.execute(text("""
                    ALTER TABLE empresa
                    ADD COLUMN plano_id INTEGER REFERENCES plano(id)
                """))
                db.session.commit()
                print("✅ Coluna 'plano_id' adicionada!")

                # Atualizar empresas existentes com plano básico
                print("\n📋 Atribuindo plano básico para empresas existentes...")
                db.session.execute(text("""
                    UPDATE empresa
                    SET plano_id = (SELECT id FROM plano WHERE codigo = 'basico_30d' LIMIT 1)
                    WHERE plano_id IS NULL AND tipo_conta != 'admin'
                """))
                db.session.commit()
                print("✅ Empresas atualizadas com plano básico!")
            else:
                print("✅ Coluna 'plano_id' já existe!")

            # 3. Verificar resultado final
            print("\n📊 Verificando estrutura final...")

            result = db.session.execute(text("""
                SELECT COUNT(*) FROM plano
            """))
            count_planos = result.fetchone()[0]
            print(f"✅ Planos cadastrados: {count_planos}")

            result = db.session.execute(text("""
                SELECT COUNT(*) FROM empresa WHERE plano_id IS NOT NULL
            """))
            count_empresas_com_plano = result.fetchone()[0]
            print(f"✅ Empresas com plano: {count_empresas_com_plano}")

            print("\n" + "=" * 60)
            print("✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!")
            print("=" * 60)

        except Exception as e:
            print(f"\n❌ ERRO na migração: {str(e)}")
            db.session.rollback()
            import traceback
            print(traceback.format_exc())
            raise

if __name__ == '__main__':
    migrar_plano_empresa()
