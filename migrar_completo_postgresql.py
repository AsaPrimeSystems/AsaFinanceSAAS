#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MIGRAÇÃO MASTER - COMPLETA E ABRANGENTE
Corrige TODA a estrutura do banco PostgreSQL em produção
Cria tabelas faltantes e adiciona colunas ausentes
"""

from app import app, db
from sqlalchemy import text
import sys

def log(msg, tipo="INFO"):
    simbolos = {"INFO": "ℹ️", "SUCCESS": "✅", "WARNING": "⚠️", "ERROR": "❌"}
    print(f"{simbolos.get(tipo, 'ℹ️')} {msg}")

def verificar_tabela_existe(nome_tabela):
    """Verifica se uma tabela existe no PostgreSQL"""
    result = db.session.execute(text("""
        SELECT table_name FROM information_schema.tables
        WHERE table_name = :tabela
    """), {'tabela': nome_tabela})
    return result.fetchone() is not None

def verificar_coluna_existe(tabela, coluna):
    """Verifica se uma coluna existe em uma tabela"""
    result = db.session.execute(text("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name = :tabela AND column_name = :coluna
    """), {'tabela': tabela, 'coluna': coluna})
    return result.fetchone() is not None

def migrar_completo():
    with app.app_context():
        print("\n" + "="*70)
        log("MIGRAÇÃO MASTER - ESTRUTURA COMPLETA POSTGRESQL", "INFO")
        print("="*70 + "\n")

        erros = []
        sucesso = []

        try:
            # ================================================================
            # 1. TABELA PLANO (CRÍTICA - BASE PARA ASSINATURAS)
            # ================================================================
            log("1. Verificando tabela PLANO...", "INFO")

            if not verificar_tabela_existe('plano'):
                log("Criando tabela PLANO...", "WARNING")
                db.session.execute(text("""
                    CREATE TABLE plano (
                        id SERIAL PRIMARY KEY,
                        nome VARCHAR(100) NOT NULL,
                        codigo VARCHAR(50) UNIQUE NOT NULL,
                        dias_assinatura INTEGER NOT NULL DEFAULT 30,
                        valor NUMERIC(10, 2) NOT NULL DEFAULT 0,
                        descricao TEXT,
                        ativo BOOLEAN DEFAULT TRUE,
                        ordem_exibicao INTEGER DEFAULT 0,
                        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))
                db.session.commit()

                # Inserir planos padrão
                db.session.execute(text("""
                    INSERT INTO plano (nome, codigo, dias_assinatura, valor, descricao, ordem_exibicao, ativo)
                    VALUES
                        ('Plano Básico 30 Dias', 'basico_30d', 30, 0, 'Plano básico gratuito - 30 dias', 1, TRUE),
                        ('Plano Plus 30 Dias', 'plus_30d', 30, 99.90, 'Plano plus com recursos avançados - 30 dias', 2, TRUE),
                        ('Plano Premium 30 Dias', 'premium_30d', 30, 199.90, 'Plano premium com todos os recursos - 30 dias', 3, TRUE),
                        ('Plano Básico 90 Dias', 'basico_90d', 90, 0, 'Plano básico gratuito - 90 dias', 4, TRUE),
                        ('Plano Plus 90 Dias', 'plus_90d', 90, 269.90, 'Plano plus com recursos avançados - 90 dias', 5, TRUE),
                        ('Plano Premium 90 Dias', 'premium_90d', 90, 539.90, 'Plano premium com todos os recursos - 90 dias', 6, TRUE)
                    ON CONFLICT (codigo) DO NOTHING
                """))
                db.session.commit()
                sucesso.append("Tabela PLANO criada com 6 planos padrão")
            else:
                sucesso.append("Tabela PLANO já existe")

            # ================================================================
            # 2. COLUNA plano_id EM EMPRESA (CRÍTICA - ERRO ATUAL)
            # ================================================================
            log("2. Verificando coluna plano_id em EMPRESA...", "INFO")

            if not verificar_coluna_existe('empresa', 'plano_id'):
                log("Adicionando coluna plano_id...", "WARNING")
                db.session.execute(text("""
                    ALTER TABLE empresa
                    ADD COLUMN plano_id INTEGER REFERENCES plano(id)
                """))
                db.session.commit()

                # Atribuir plano básico para empresas existentes
                db.session.execute(text("""
                    UPDATE empresa
                    SET plano_id = (SELECT id FROM plano WHERE codigo = 'basico_30d' LIMIT 1)
                    WHERE plano_id IS NULL AND tipo_conta != 'admin'
                """))
                db.session.commit()
                sucesso.append("Coluna empresa.plano_id adicionada e preenchida")
            else:
                sucesso.append("Coluna empresa.plano_id já existe")

            # ================================================================
            # 3. COLUNAS EM CONTA_CAIXA
            # ================================================================
            log("3. Verificando colunas em CONTA_CAIXA...", "INFO")

            colunas_conta_caixa = [
                ('banco', 'VARCHAR(200)'),
                ('agencia', 'VARCHAR(50)'),
                ('conta', 'VARCHAR(50)'),
                ('produto_servico', 'VARCHAR(200)'),
                ('tipo_produto_servico', 'VARCHAR(50)'),
                ('nota_fiscal', 'VARCHAR(50)'),
                ('plano_conta_id', 'INTEGER REFERENCES plano_conta(id)'),
                ('saldo_inicial', 'NUMERIC(10, 2) DEFAULT 0.0'),
                ('saldo_atual', 'NUMERIC(10, 2) DEFAULT 0.0')
            ]

            for coluna, tipo in colunas_conta_caixa:
                if not verificar_coluna_existe('conta_caixa', coluna):
                    log(f"Adicionando conta_caixa.{coluna}...", "WARNING")
                    db.session.execute(text(f"""
                        ALTER TABLE conta_caixa
                        ADD COLUMN {coluna} {tipo}
                    """))
                    db.session.commit()
                    sucesso.append(f"Coluna conta_caixa.{coluna} adicionada")

            # ================================================================
            # 4. TABELA DRE_CONFIGURACAO
            # ================================================================
            log("4. Verificando tabela DRE_CONFIGURACAO...", "INFO")

            if not verificar_tabela_existe('dre_configuracao'):
                log("Criando tabela DRE_CONFIGURACAO...", "WARNING")
                db.session.execute(text("""
                    CREATE TABLE dre_configuracao (
                        id SERIAL PRIMARY KEY,
                        empresa_id INTEGER NOT NULL REFERENCES empresa(id),
                        plano_conta_id INTEGER REFERENCES plano_conta(id),
                        codigo VARCHAR(20) NOT NULL,
                        descricao VARCHAR(200) NOT NULL,
                        tipo_linha VARCHAR(20) DEFAULT 'conta',
                        formula VARCHAR(500),
                        operacao VARCHAR(10),
                        ordem INTEGER NOT NULL,
                        nivel INTEGER DEFAULT 1,
                        negrito BOOLEAN DEFAULT FALSE,
                        linha_acima BOOLEAN DEFAULT FALSE,
                        linha_abaixo BOOLEAN DEFAULT FALSE,
                        ativo BOOLEAN DEFAULT TRUE,
                        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))
                db.session.commit()
                sucesso.append("Tabela dre_configuracao criada")
            else:
                sucesso.append("Tabela dre_configuracao já existe")

            # ================================================================
            # 5. COLUNAS DE AUDITORIA EM LANCAMENTO
            # ================================================================
            log("5. Verificando colunas de auditoria em LANCAMENTO...", "INFO")

            colunas_auditoria = [
                ('usuario_criacao_id', 'INTEGER REFERENCES usuario(id)'),
                ('usuario_ultima_edicao_id', 'INTEGER REFERENCES usuario(id)'),
                ('data_ultima_edicao', 'TIMESTAMP'),
                ('plano_conta_id', 'INTEGER REFERENCES plano_conta(id)'),
                ('tipo_produto_servico', 'VARCHAR(20)'),
                ('itens_carrinho', 'TEXT')
            ]

            for coluna, tipo in colunas_auditoria:
                if not verificar_coluna_existe('lancamento', coluna):
                    log(f"Adicionando lancamento.{coluna}...", "WARNING")
                    db.session.execute(text(f"""
                        ALTER TABLE lancamento
                        ADD COLUMN {coluna} {tipo}
                    """))
                    db.session.commit()
                    sucesso.append(f"Coluna lancamento.{coluna} adicionada")

            # ================================================================
            # 6. COLUNA usuario EM SUB_USUARIO_CONTADOR
            # ================================================================
            log("6. Verificando coluna usuario em SUB_USUARIO_CONTADOR...", "INFO")

            if not verificar_coluna_existe('sub_usuario_contador', 'usuario'):
                log("Adicionando sub_usuario_contador.usuario...", "WARNING")
                db.session.execute(text("""
                    ALTER TABLE sub_usuario_contador
                    ADD COLUMN usuario VARCHAR(50)
                """))
                db.session.commit()

                # Preencher com email ou nome como fallback
                db.session.execute(text("""
                    UPDATE sub_usuario_contador
                    SET usuario = COALESCE(email, nome, 'usuario_' || id)
                    WHERE usuario IS NULL
                """))
                db.session.commit()
                sucesso.append("Coluna sub_usuario_contador.usuario adicionada e preenchida")
            else:
                sucesso.append("Coluna sub_usuario_contador.usuario já existe")

            # ================================================================
            # 7. COLUNA data_inicio_assinatura EM EMPRESA
            # ================================================================
            log("7. Verificando coluna data_inicio_assinatura em EMPRESA...", "INFO")

            if not verificar_coluna_existe('empresa', 'data_inicio_assinatura'):
                log("Adicionando empresa.data_inicio_assinatura...", "WARNING")
                db.session.execute(text("""
                    ALTER TABLE empresa
                    ADD COLUMN data_inicio_assinatura TIMESTAMP
                """))
                db.session.commit()

                # Definir como data_criacao para empresas existentes
                db.session.execute(text("""
                    UPDATE empresa
                    SET data_inicio_assinatura = data_criacao
                    WHERE data_inicio_assinatura IS NULL
                """))
                db.session.commit()
                sucesso.append("Coluna empresa.data_inicio_assinatura adicionada e preenchida")
            else:
                sucesso.append("Coluna empresa.data_inicio_assinatura já existe")

            # ================================================================
            # 8. COLUNA ativo EM PRODUTO
            # ================================================================
            log("8. Verificando coluna ativo em PRODUTO...", "INFO")

            if not verificar_coluna_existe('produto', 'ativo'):
                log("Adicionando produto.ativo...", "WARNING")
                db.session.execute(text("""
                    ALTER TABLE produto
                    ADD COLUMN ativo BOOLEAN DEFAULT TRUE
                """))
                db.session.commit()

                # Ativar produtos com estoque > 0
                db.session.execute(text("""
                    UPDATE produto
                    SET ativo = TRUE
                    WHERE estoque > 0
                """))
                db.session.commit()
                sucesso.append("Coluna produto.ativo adicionada")
            else:
                sucesso.append("Coluna produto.ativo já existe")

            # ================================================================
            # 9. COLUNA empresa_id EM CLIENTE, FORNECEDOR, VENDA, COMPRA
            # ================================================================
            log("9. Verificando empresa_id em tabelas críticas...", "INFO")

            tabelas_empresa_id = ['cliente', 'fornecedor', 'venda', 'compra']

            for tabela in tabelas_empresa_id:
                if not verificar_coluna_existe(tabela, 'empresa_id'):
                    log(f"Adicionando {tabela}.empresa_id...", "WARNING")
                    db.session.execute(text(f"""
                        ALTER TABLE {tabela}
                        ADD COLUMN empresa_id INTEGER REFERENCES empresa(id)
                    """))
                    db.session.commit()

                    # Preencher com base no usuario_id
                    db.session.execute(text(f"""
                        UPDATE {tabela}
                        SET empresa_id = u.empresa_id
                        FROM usuario u
                        WHERE {tabela}.usuario_id = u.id AND {tabela}.empresa_id IS NULL
                    """))
                    db.session.commit()
                    sucesso.append(f"Coluna {tabela}.empresa_id adicionada e preenchida")

            # ================================================================
            # 10. COLUNA nota_fiscal EM LANCAMENTO, VENDA, COMPRA
            # ================================================================
            log("10. Verificando coluna nota_fiscal...", "INFO")

            tabelas_nf = ['lancamento', 'venda', 'compra']

            for tabela in tabelas_nf:
                if not verificar_coluna_existe(tabela, 'nota_fiscal'):
                    log(f"Adicionando {tabela}.nota_fiscal...", "WARNING")
                    db.session.execute(text(f"""
                        ALTER TABLE {tabela}
                        ADD COLUMN nota_fiscal VARCHAR(50)
                    """))
                    db.session.commit()
                    sucesso.append(f"Coluna {tabela}.nota_fiscal adicionada")

            # ================================================================
            # 11. COLUNAS DE HIERARQUIA EM PLANO_CONTA
            # ================================================================
            log("11. Verificando hierarquia em PLANO_CONTA...", "INFO")

            colunas_plano_conta = [
                ('codigo', 'VARCHAR(50)'),
                ('natureza', 'VARCHAR(20) DEFAULT \'analitica\''),
                ('nivel', 'INTEGER DEFAULT 1'),
                ('pai_id', 'INTEGER REFERENCES plano_conta(id)'),
                ('empresa_id', 'INTEGER REFERENCES empresa(id)')
            ]

            for coluna, tipo in colunas_plano_conta:
                if not verificar_coluna_existe('plano_conta', coluna):
                    log(f"Adicionando plano_conta.{coluna}...", "WARNING")
                    db.session.execute(text(f"""
                        ALTER TABLE plano_conta
                        ADD COLUMN {coluna} {tipo}
                    """))
                    db.session.commit()
                    sucesso.append(f"Coluna plano_conta.{coluna} adicionada")

            # ================================================================
            # 12. TABELA PAGAMENTO (SE NÃO EXISTIR)
            # ================================================================
            log("12. Verificando tabela PAGAMENTO...", "INFO")

            if not verificar_tabela_existe('pagamento'):
                log("Criando tabela PAGAMENTO...", "WARNING")
                db.session.execute(text("""
                    CREATE TABLE pagamento (
                        id SERIAL PRIMARY KEY,
                        empresa_id INTEGER REFERENCES empresa(id),
                        plano_id INTEGER NOT NULL REFERENCES plano(id),
                        preference_id VARCHAR(200),
                        payment_id VARCHAR(200),
                        external_reference VARCHAR(200) UNIQUE NOT NULL,
                        valor NUMERIC(10, 2) NOT NULL,
                        dias_assinatura INTEGER NOT NULL,
                        status VARCHAR(50) DEFAULT 'pending',
                        status_detail VARCHAR(200),
                        payment_type VARCHAR(50),
                        payment_method VARCHAR(50),
                        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        data_aprovacao TIMESTAMP,
                        data_expiracao TIMESTAMP,
                        observacoes TEXT,
                        dados_mp TEXT
                    )
                """))
                db.session.commit()
                sucesso.append("Tabela pagamento criada")
            else:
                sucesso.append("Tabela pagamento já existe")

            # ================================================================
            # RESUMO FINAL
            # ================================================================
            print("\n" + "="*70)
            log("RESUMO DA MIGRAÇÃO", "SUCCESS")
            print("="*70)

            if sucesso:
                log(f"Operações bem-sucedidas: {len(sucesso)}", "SUCCESS")
                for msg in sucesso:
                    print(f"  ✅ {msg}")

            if erros:
                log(f"Erros encontrados: {len(erros)}", "ERROR")
                for msg in erros:
                    print(f"  ❌ {msg}")

            # Estatísticas finais
            print("\n" + "-"*70)
            log("ESTATÍSTICAS DO BANCO", "INFO")
            print("-"*70)

            result = db.session.execute(text("SELECT COUNT(*) FROM plano"))
            log(f"Planos cadastrados: {result.fetchone()[0]}", "INFO")

            result = db.session.execute(text("SELECT COUNT(*) FROM empresa WHERE plano_id IS NOT NULL"))
            log(f"Empresas com plano: {result.fetchone()[0]}", "INFO")

            result = db.session.execute(text("SELECT COUNT(*) FROM usuario"))
            log(f"Usuários cadastrados: {result.fetchone()[0]}", "INFO")

            print("\n" + "="*70)
            log("MIGRAÇÃO COMPLETA FINALIZADA COM SUCESSO!", "SUCCESS")
            print("="*70 + "\n")

            return True

        except Exception as e:
            log(f"ERRO CRÍTICO na migração: {str(e)}", "ERROR")
            db.session.rollback()
            import traceback
            print("\n" + traceback.format_exc())
            return False

if __name__ == '__main__':
    sucesso = migrar_completo()
    sys.exit(0 if sucesso else 1)
