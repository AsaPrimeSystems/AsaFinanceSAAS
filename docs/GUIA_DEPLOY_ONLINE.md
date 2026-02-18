# GUIA DE DEPLOY (Como colocar 100% online)

Para colocar seu sistema SaaS online acessível para todos, usaremos uma plataforma de nuvem. Recomendo o **Render.com** ou **Railway.app** pela facilidade e bom plano gratuito/barato.

## 🚀 Passo 1: Preparação (JÁ FEITO)
Já preparei os arquivos necessários no seu projeto:
- `requirements.txt`: Lista de dependências atualizada (incluindo Gunicorn).
- `Procfile`: Comando para iniciar o servidor web na nuvem.

## 📦 Passo 2: Colocar o código no GitHub
Se você ainda não tem o código no GitHub:
1. Crie uma conta no [GitHub.com](https://github.com)
2. Crie um novo repositório (ex: `saas-gestao-financeira`)
3. No terminal do VS Code, execute:
   ```bash
   git init
   git add .
   git commit -m "Primeiro commit - versão para deploy"
   git branch -M main
   # Substitua a URL abaixo pela do seu repositório:
   git remote add origin https://github.com/SEU_USUARIO/saas-gestao-financeira.git
   git push -u origin main
   ```

## ☁️ Passo 3: Criar Serviço no Render.com
1. Crie uma conta no [Render.com](https://render.com)
2. Clique em **"New +"** -> **"Web Service"**
3. Conecte sua conta do GitHub e selecione o repositório `saas-gestao-financeira`
4. Preencha os dados:
   - **Name**: `asa-finance-saas` (ou outro nome)
   - **Region**: Escolha a mais próxima (ex: Ohio ou Frankfurt)
   - **Branch**: `main`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
5. Escolha o plano **Free** (Grátis) ou **Starter** ($7/mês - recomendado para produção).

## 🔑 Passo 4: Configurar Variáveis (Environment Variables)
Ainda na tela de criação (ou na aba "Environment"), adicione as variáveis secretas que estão no seu `.env` e `mercadopago_config.py`:

| Key | Value |
|---|---|
| `MERCADOPAGO_ACCESS_TOKEN` | *Seu Token de Produção* |
| `MERCADOPAGO_PUBLIC_KEY` | *Sua Chave Pública de Produção* |
| `BASE_URL` | A URL que o Render criar para você (ex: `https://asa-finance.onrender.com`) |
| `FLASK_SECRET_KEY` | Crie uma senha forte aleatória |

## 🗄️ Passo 5: Banco de Dados (Importante!)
Por padrão, o Render (e outros PaaS) apagam arquivos criados localmente a cada deploy. O seu banco `SQLite` será **zerado** a cada atualização.
Para produção, você tem duas opções:

### Opção A: Usar PostgreSQL (Recomendado - 100% Profissional)
1. No Render, clique em **"New +"** -> **"PostgreSQL"**.
2. Crie o banco e copie a `Internal Database URL`.
3. No seu Web Service (Environment), adicione a variável:
   - `DATABASE_URL`: *Cole a URL do Postgres*
4. O sistema precisará de um pequeno ajuste no `app.py` para usar Postgres quando essa variável existir (posso fazer isso pra você).

### Opção B: Usar SQLite com Disco Persistente (Mais barato/Simples)
1. No Render, vá em **Disks** e crie um disco (custa ~$1/mês).
2. Monte o disco no caminho `/opt/render/project/src/instance`.
3. Isso garante que o arquivo `.db` não seja apagado.

## ✅ Passo 6: Finalizar
Clique em **"Create Web Service"**.
O Render vai instalar tudo e iniciar seu site. Em alguns minutos, você terá uma URL `https://....onrender.com` 100% funcional e segura (cadeado SSL).

---
**Precisa de ajuda com o Banco de Dados?**
Posso ajustar o código para aceitar PostgreSQL automaticamente se você decidir ir pelo caminho profissional.

---

## 🔄 Como Atualizar seu Site no Futuro

O processo para atualizar seu site é automático agora! Sempre que você quiser mudar algo (texto, código, preços):

1.  **Faça as alterações** aqui no VS Code.
2.  **Teste Localmente**: Rode `python3 app.py` e verifique se tudo funciona em `localhost:8002`.
3.  **Envie para o GitHub**:
    Abra o terminal e digite:
    ```bash
    git add .
    git commit -m "Descrição do que você mudou"
    git push
    ```

**Pronto!** O Render detecta o novo código no GitHub e atualiza seu site sozinho em 2-3 minutos.

> **Nota sobre Banco de Dados:** Se você adicionar novas colunas ou tabelas, lembre-se de rodar o comando de atualização na aba "Shell" do Render, ou configurar migrações automáticas.
