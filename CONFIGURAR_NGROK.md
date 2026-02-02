# 🌐 Guia de Instalação e Configuração do ngrok

## 📋 O que é ngrok?

O ngrok expõe seu servidor local (localhost:8002) para a internet através de um túnel seguro, permitindo que o Mercado Pago envie notificações de pagamento para o seu webhook.

---

## 🔽 Passo 1: Download e Instalação

### macOS (seu sistema atual)

1. **Download direto:**
   - Acesse: https://ngrok.com/download
   - Clique em **"Download for macOS (Intel)"** ou **"Download for macOS (Apple Silicon)"**
   - Ou use este link direto: https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-darwin-amd64.zip

2. **Instalação via Homebrew (recomendado):**
   ```bash
   brew install ngrok/ngrok/ngrok
   ```

3. **Instalação manual:**
   ```bash
   # Descompactar o arquivo baixado
   cd ~/Downloads
   unzip ngrok-v3-stable-darwin-amd64.zip

   # Mover para pasta no PATH
   sudo mv ngrok /usr/local/bin/

   # Dar permissão de execução
   chmod +x /usr/local/bin/ngrok

   # Verificar instalação
   ngrok version
   ```

---

## 🔑 Passo 2: Criar Conta (Opcional mas Recomendado)

1. Acesse: https://dashboard.ngrok.com/signup
2. Crie conta gratuita (GitHub, Google ou email)
3. Após login, vá para: https://dashboard.ngrok.com/get-started/your-authtoken
4. Copie seu authtoken

5. **Configure o authtoken:**
   ```bash
   ngrok config add-authtoken SEU_TOKEN_AQUI
   ```

**Benefícios da conta:**
- URLs não expiram tão rápido
- Sessões mais longas
- Túneis personalizados

---

## 🚀 Passo 3: Expor seu Servidor Local

### 3.1 - Garantir que seu servidor está rodando

```bash
# Se ainda não estiver rodando:
python3 app.py
```

Deve aparecer:
```
* Running on http://localhost:8002
```

### 3.2 - Em outro terminal, iniciar ngrok

```bash
ngrok http 8002
```

### 3.3 - O que você verá

```
ngrok

Session Status                online
Account                       Daniel Coelho (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://xxxx-xxx-xxx-xxx.ngrok-free.app -> http://localhost:8002

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

### 3.4 - Copiar a URL de Forwarding

**IMPORTANTE:** Copie a URL que começa com `https://` (exemplo abaixo é fictício):
```
https://a1b2-123-456-789-012.ngrok-free.app
```

**Sua URL será diferente!** Anote ela!

---

## 🔔 Passo 4: Configurar Webhook no Mercado Pago

### 4.1 - Acessar painel de webhooks

1. Acesse: https://www.mercadopago.com.br/developers/panel/notifications/webhooks
2. Faça login se necessário

### 4.2 - Criar novo webhook

1. Clique em **"Criar webhook"** ou **"+ Novo webhook"**

2. Preencha:
   - **Nome:** ASA Finance Webhook (ou qualquer nome)
   - **URL de produção:** `https://SUA-URL-NGROK.ngrok-free.app/webhook/mercadopago`

   **EXEMPLO (use SUA URL):**
   ```
   https://a1b2-123-456-789-012.ngrok-free.app/webhook/mercadopago
   ```

3. **Eventos a monitorar:**
   - Marque: ✅ **Pagamentos** (payments)
   - Ou marque: ✅ **Todos os eventos** (recomendado)

4. Clique em **"Salvar"** ou **"Criar"**

### 4.3 - Testar webhook

1. No painel do Mercado Pago, deve aparecer botão **"Testar webhook"**
2. Clique nele
3. Deve retornar **HTTP 200 OK**

**Se retornar erro:**
- Verifique se ngrok está rodando
- Verifique se servidor Flask está ativo
- Veja logs do terminal do ngrok

---

## 📊 Passo 5: Monitorar Requisições

### Interface Web do ngrok

Enquanto o ngrok está rodando, você pode ver todas as requisições em:

```
http://127.0.0.1:4040
```

Abra esse link no navegador e você verá:
- Todas as requisições HTTP recebidas
- Headers
- Body (corpo da requisição)
- Response (resposta enviada)

**Muito útil para debug!**

---

## ✅ Passo 6: Testar Integração Completa

### 6.1 - Fazer um pagamento de teste

1. Acesse: http://localhost:8002/precos
2. Clique em **"Assinar Agora"** em qualquer plano
3. Preencha dados do checkout
4. Clique em **"Pagar com Mercado Pago"**
5. Na página do Mercado Pago, faça o pagamento

**IMPORTANTE:** Como está em modo PRODUÇÃO, será cobrado valor real!

**Para testar sem cobrar:**
- Altere `TEST_MODE = True` em `mercadopago_config.py`
- Substitua credenciais por credenciais de TESTE
- Reinicie o servidor
- Use cartão de teste: 5031 4332 1540 6351

### 6.2 - Verificar logs

**Terminal do Flask:**
```bash
tail -f logs/app.log
```

**Terminal do ngrok:**
Você verá requisições chegando em tempo real!

**Interface Web:**
http://127.0.0.1:4040 mostrará os dados da notificação

### 6.3 - O que deve acontecer

1. **Pagamento aprovado** no Mercado Pago
2. **Mercado Pago envia notificação** para o webhook via ngrok
3. **Seu servidor recebe** a notificação
4. **Sistema credita dias** automaticamente na conta
5. **Usuário vê** os dias atualizados no dashboard

---

## ⚠️ Limitações do ngrok (Plano Free)

1. **URL muda a cada reinício** do ngrok
   - Solução: Atualizar URL no painel do MP quando reiniciar

2. **Sessão expira após 2 horas** (pode variar)
   - Solução: Reiniciar ngrok e atualizar webhook

3. **Aviso "Visit Site" ao acessar**
   - Normal no plano gratuito
   - Usuários precisarão clicar em "Visit Site"

### Upgrade para plano pago (opcional)

Se quiser:
- URL fixa (ex: `https://asafinance.ngrok.app`)
- Sessões ilimitadas
- Sem aviso "Visit Site"

Acesse: https://ngrok.com/pricing

**Para produção real, recomendamos hospedar o sistema em servidor com domínio próprio!**

---

## 🔄 Comandos Úteis

### Iniciar ngrok
```bash
ngrok http 8002
```

### Iniciar com subdomínio customizado (plano pago)
```bash
ngrok http 8002 --subdomain=asafinance
```

### Iniciar com região específica
```bash
ngrok http 8002 --region=sa  # South America
```

### Ver túneis ativos
```bash
ngrok tunnels
```

### Parar ngrok
```
Ctrl + C
```

---

## 🐛 Troubleshooting

### "ngrok: command not found"
```bash
# Verificar instalação
which ngrok

# Se não encontrar, reinstalar
brew install ngrok/ngrok/ngrok
```

### "Authtoken required"
```bash
# Configurar token
ngrok config add-authtoken SEU_TOKEN_AQUI
```

### Webhook retorna erro 404
- Verifique se a URL termina com `/webhook/mercadopago`
- Verifique se servidor Flask está rodando
- Veja logs do servidor

### Webhook retorna erro 500
- Veja logs do Flask: `tail -f logs/app.log`
- Verifique se banco de dados está acessível
- Reinicie o servidor

### "This site is ahead of you"
- Normal no plano gratuito
- Clique em "Visit Site"
- Ou faça upgrade do ngrok

---

## 📝 Resumo do Fluxo

```
┌─────────────────┐
│ Cliente paga    │
│ no Mercado Pago │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Mercado Pago envia      │
│ notificação HTTP POST   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ ngrok recebe e          │
│ encaminha para          │
│ localhost:8002          │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Flask processa webhook  │
│ /webhook/mercadopago    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Sistema credita dias    │
│ na conta do cliente     │
└─────────────────────────┘
```

---

## 🎯 Checklist Final

Antes de testar pagamento real:

- [ ] ngrok instalado e funcionando
- [ ] Servidor Flask rodando (python3 app.py)
- [ ] ngrok expondo porta 8002 (ngrok http 8002)
- [ ] URL do ngrok copiada
- [ ] Webhook configurado no painel do Mercado Pago
- [ ] Webhook testado e retornou HTTP 200
- [ ] Credenciais de PRODUÇÃO configuradas (ou TESTE se for testar)
- [ ] Interface web do ngrok aberta (http://127.0.0.1:4040)

---

## 📞 Suporte

**Documentação oficial ngrok:**
- https://ngrok.com/docs

**Mercado Pago Webhooks:**
- https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks

**Seus arquivos:**
- `mercadopago_config.py` - Configurações
- `INTEGRACAO_MERCADOPAGO.md` - Documentação completa da integração
- `CONFIGURAR_MERCADOPAGO.md` - Guia rápido

---

## ✨ Pronto!

Após seguir todos os passos, seu sistema estará pronto para:

1. ✅ Receber pagamentos via Mercado Pago
2. ✅ Receber notificações de pagamento em tempo real
3. ✅ Creditar dias automaticamente
4. ✅ Monitorar tudo via interface web

**Boa sorte! 🚀**
