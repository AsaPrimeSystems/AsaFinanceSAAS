# 🔑 Como Obter as Credenciais do Mercado Pago

## Passo a Passo Completo

### 📝 Passo 1: Criar/Acessar Conta no Mercado Pago

1. Acesse: **https://www.mercadopago.com.br**

2. Se NÃO tem conta:
   - Clique em **"Criar conta"**
   - Escolha **"Vender pela internet"** ou **"Para minha empresa"**
   - Preencha: Email, senha, dados da empresa
   - Confirme seu email

3. Se JÁ tem conta:
   - Clique em **"Entrar"**
   - Digite email e senha

---

### 🎯 Passo 2: Acessar o Painel de Desenvolvedor

1. Após fazer login, acesse diretamente:
   **https://www.mercadopago.com.br/developers/panel**

   OU

   - No menu superior, clique em **"Seu negócio"**
   - Depois clique em **"Configurações"**
   - No menu lateral, procure **"Desenvolvedor"** ou **"Developer"**
   - Clique em **"Credenciais"** ou **"Credentials"**

---

### 🔐 Passo 3: Obter Credenciais de TESTE (Recomendado para começar)

1. Na página de credenciais, você verá duas abas:
   - **"Credenciais de teste"** (Test credentials)
   - **"Credenciais de produção"** (Production credentials)

2. Clique em **"Credenciais de teste"**

3. Você verá duas credenciais:

   **📌 Public Key (Chave Pública)**
   ```
   TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```
   - Clique no ícone de 👁️ (olho) para revelar
   - Clique no ícone de 📋 (copiar) para copiar

   **📌 Access Token (Token de Acesso)**
   ```
   TEST-xxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxx
   ```
   - Clique no ícone de 👁️ (olho) para revelar
   - Clique no ícone de 📋 (copiar) para copiar

4. **COPIE E GUARDE** essas duas credenciais!

---

### ✏️ Passo 4: Colar no Arquivo de Configuração

1. Abra o arquivo: **`mercadopago_config.py`**

2. Localize as linhas 14-24 (aproximadamente):

```python
# SUBSTITUA AQUI COM SEU ACCESS TOKEN
MERCADOPAGO_ACCESS_TOKEN = os.getenv(
    'MERCADOPAGO_ACCESS_TOKEN',
    'TEST-SUBSTITUA-AQUI-SEU-ACCESS-TOKEN'  # ← COLE AQUI
)

# SUBSTITUA AQUI COM SUA PUBLIC KEY
MERCADOPAGO_PUBLIC_KEY = os.getenv(
    'MERCADOPAGO_PUBLIC_KEY',
    'TEST-SUBSTITUA-AQUI-SUA-PUBLIC-KEY'  # ← COLE AQUI
)
```

3. **Substitua** os textos entre aspas:

**ANTES:**
```python
MERCADOPAGO_ACCESS_TOKEN = os.getenv(
    'MERCADOPAGO_ACCESS_TOKEN',
    'TEST-SUBSTITUA-AQUI-SEU-ACCESS-TOKEN'
)
```

**DEPOIS (exemplo):**
```python
MERCADOPAGO_ACCESS_TOKEN = os.getenv(
    'MERCADOPAGO_ACCESS_TOKEN',
    'TEST-1234567890-012345-ab12cd34ef56gh78ij90kl12mn34op56-123456789'
)
```

4. Faça o mesmo com a **Public Key**

5. **SALVE** o arquivo (Ctrl+S ou Cmd+S)

---

### ✅ Passo 5: Verificar se Está Correto

No terminal, execute:

```bash
python3 -c "from mercadopago_config import validar_configuracao; print(validar_configuracao())"
```

Se aparecer:
```
(True, '✅ Configuração válida')
```
**Está tudo certo!**

Se aparecer erro:
```
(False, '⚠️ ACCESS TOKEN não configurado!...')
```
Volte ao Passo 4 e verifique se colou corretamente.

---

### 🎯 Links Diretos Importantes

| O que | Link |
|-------|------|
| **Painel Desenvolvedor** | https://www.mercadopago.com.br/developers/panel |
| **Credenciais** | https://www.mercadopago.com.br/developers/panel/credentials |
| **Criar Conta** | https://www.mercadopago.com.br/hub/registration/landing |
| **Documentação** | https://www.mercadopago.com.br/developers/pt/docs |

---

### 📖 Exemplo Visual

```
┌─────────────────────────────────────────────────────┐
│  Mercado Pago - Credenciais de teste               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Public Key                                         │
│  TEST-12345678-abcd-1234-efgh-123456789012  [📋]   │
│                                                     │
│  Access Token                                       │
│  TEST-1234567890123-012345-abc...xyz-123... [📋]   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Clique nos ícones [📋] para copiar!

---

### ⚠️ Importante: Teste vs Produção

#### 🧪 **Credenciais de TESTE** (começar por aqui)
- Começam com `TEST-`
- Servem para testar sem cobrar dinheiro real
- Use cartões de teste (5031 4332 1540 6351)
- Pagamentos não são reais

#### 💰 **Credenciais de PRODUÇÃO** (depois que testar)
- Começam com `APP_USR-`
- Servem para aceitar pagamentos reais
- Cobram dinheiro de verdade dos clientes
- Use apenas quando tudo estiver funcionando!

**SEMPRE TESTE PRIMEIRO COM AS CREDENCIAIS DE TESTE!**

---

### 🔄 Para Mudar para Produção (Depois)

1. No painel, clique em **"Credenciais de produção"**
2. Copie as credenciais de produção (começam com `APP_USR-`)
3. Cole no `mercadopago_config.py` (substituindo as de teste)
4. Altere a linha:
   ```python
   TEST_MODE = False  # Mudar para False
   ```

---

### 🆘 Problemas Comuns

**❌ "Não consigo acessar o painel de desenvolvedor"**
- Verifique se confirmou seu email
- Tente acessar diretamente: https://www.mercadopago.com.br/developers/panel
- Limpe cache do navegador e tente novamente

**❌ "Não vejo as credenciais"**
- Verifique se está na aba "Credenciais de teste"
- Clique no ícone de 👁️ (olho) para revelar
- Atualize a página (F5)

**❌ "Dá erro ao copiar"**
- Copie manualmente selecionando o texto
- Certifique-se de copiar TODA a credencial
- Não copie espaços no início ou fim

---

### 📞 Suporte

**Mercado Pago:**
- Central de Ajuda: https://www.mercadopago.com.br/ajuda
- Suporte Desenvolvedor: https://www.mercadopago.com.br/developers/pt/support

**Seu Sistema:**
- Leia: `CONFIGURAR_MERCADOPAGO.md`
- Leia: `INTEGRACAO_MERCADOPAGO.md`

---

### ✨ Resumo Rápido

```bash
1. Acesse: https://www.mercadopago.com.br/developers/panel/credentials
2. Clique em "Credenciais de teste"
3. Copie: Public Key e Access Token
4. Cole em: mercadopago_config.py (linhas 14 e 19)
5. Salve o arquivo
6. Teste em: http://localhost:8002/precos
```

**Pronto! 🎉**
