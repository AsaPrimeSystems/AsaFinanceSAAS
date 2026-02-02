# ✅ Webhook Corrigido - Mercado Pago

## 🔧 O que foi corrigido?

O webhook estava retornando **erro 400** porque não estava preparado para aceitar notificações de teste do Mercado Pago.

### Correções aplicadas:

1. **Aceitar método GET**
   - Mercado Pago às vezes envia GET para verificar se o webhook está ativo
   - Agora responde com HTTP 200 para requisições GET

2. **Aceitar notificações de teste**
   - Notificações com `"live_mode": false` agora são aceitas
   - Retorna HTTP 200 sem processar (pois não existe pagamento real)

3. **Suporte a múltiplos formatos de notificação**
   - `action: "payment.updated"`
   - `action: "payment.created"`
   - `topic: "payment"`
   - `type: "payment"`

4. **Tratamento de erros melhorado**
   - Se payment_id não existe no MP (como no teste 123456), retorna HTTP 200
   - Se external_reference não encontrada, retorna HTTP 200
   - Se pagamento não está no banco, retorna HTTP 200 (log warning)
   - Evita retentativas desnecessárias do Mercado Pago

5. **Logs mais detalhados**
   - ✅ para operações bem-sucedidas
   - ❌ para erros
   - ⚠️ para avisos

---

## 🔄 Servidor Flask Reiniciado

- ✅ Servidor parado: PID 71241
- ✅ Servidor iniciado: PID 71709
- ✅ Porta 8002 ativa
- ✅ Novas alterações aplicadas

---

## 🧪 Testar Novamente no Mercado Pago

Agora você pode:

1. **Voltar ao painel de webhooks:**
   https://www.mercadopago.com.br/developers/panel/notifications/webhooks

2. **Testar novamente o webhook**
   - Clique no botão "Testar"
   - **Resultado esperado:** ✅ HTTP 200 OK

3. **Verificar logs:**
   ```bash
   tail -f logs/app.log
   ```

   Você deve ver:
   ```
   INFO: Notificação de TESTE recebida - Topic: payment, Action: payment.updated
   ```

4. **Ver na interface do ngrok:**
   http://127.0.0.1:4040

   Deve mostrar:
   - Request POST /webhook/mercadopago
   - Response 200 OK
   - Body: {"success": true, "message": "Teste aceito"}

---

## 📋 URLs Atualizadas

| Descrição | URL |
|-----------|-----|
| **Webhook Mercado Pago** | https://superfantastic-hereditably-sonja.ngrok-free.dev/webhook/mercadopago |
| **Túnel ngrok** | https://superfantastic-hereditably-sonja.ngrok-free.dev |
| **Interface ngrok** | http://127.0.0.1:4040 |
| **Servidor Flask** | http://localhost:8002 |
| **Painel webhooks MP** | https://www.mercadopago.com.br/developers/panel/notifications/webhooks |

---

## 🎯 Próximos Passos

### 1. Salvar o webhook no Mercado Pago

Se ainda não salvou:
- URL: `https://superfantastic-hereditably-sonja.ngrok-free.dev/webhook/mercadopago`
- Eventos: Marcar "Pagamentos"
- Salvar

### 2. Testar webhook

- Clicar em "Testar" no painel
- Deve retornar: ✅ **200 OK**

### 3. Fazer pagamento de teste (RECOMENDADO)

**Para NÃO ser cobrado de verdade:**

1. Editar `mercadopago_config.py` linha 49:
   ```python
   TEST_MODE = True  # Mudar para True
   ```

2. Trocar para credenciais de TESTE:
   - Painel: https://www.mercadopago.com.br/developers/panel/credentials
   - Aba: "Credenciais de teste"
   - Copiar: Access Token (TEST-xxx) e Public Key (TEST-xxx)
   - Colar em `mercadopago_config.py` linhas 18 e 24

3. Reiniciar servidor:
   ```bash
   # Parar
   pkill -f "python3 app.py"

   # Iniciar
   python3 app.py
   ```

4. Acessar: http://localhost:8002/precos

5. Clicar em "Assinar Agora"

6. Pagar com cartão de teste:
   - Número: `5031 4332 1540 6351`
   - CVV: `123`
   - Validade: `11/25`
   - Titular: `APRO`
   - CPF: qualquer

7. Verificar:
   - Logs: `tail -f logs/app.log`
   - Interface ngrok: http://127.0.0.1:4040
   - Dias creditados no banco

### 4. Fazer pagamento REAL (produção)

**Só faça isso quando tiver testado e estiver tudo funcionando!**

1. Manter `TEST_MODE = False`
2. Manter credenciais APP_USR-xxx
3. Servidor já está configurado
4. Pagar com cartão real (será cobrado!)

---

## 🔍 Como Funciona Agora?

### Fluxo do Webhook:

```
1. Mercado Pago envia notificação
   ↓
2. ngrok recebe e encaminha para localhost:8002/webhook/mercadopago
   ↓
3. Flask recebe a requisição
   ↓
4. Webhook verifica:
   - É GET? → Retorna 200 OK (webhook ativo)
   - É teste (live_mode=false)? → Retorna 200 OK (teste aceito)
   - É pagamento real? → Consulta MP e processa
   ↓
5. Se pagamento aprovado:
   - Atualiza status no banco
   - Credita dias na empresa
   - Retorna 200 OK
   ↓
6. Mercado Pago marca webhook como OK ✅
```

---

## 📊 Monitoramento

### Ver logs em tempo real:
```bash
tail -f logs/app.log
```

### Ver interface ngrok:
```
http://127.0.0.1:4040
```

### Ver webhooks no MP:
```
https://www.mercadopago.com.br/developers/panel/notifications/webhooks
```

---

## 🆘 Troubleshooting

### Webhook ainda retorna 400

1. Verificar se servidor foi reiniciado:
   ```bash
   lsof -i :8002
   ```

2. Ver logs:
   ```bash
   tail -20 logs/app.log
   ```

3. Reiniciar servidor manualmente:
   ```bash
   pkill -f "python3 app.py"
   python3 app.py
   ```

### Webhook retorna 500

- Ver logs completos: `tail -f logs/app.log`
- Ver traceback do erro
- Verificar se banco de dados está acessível

### Dias não são creditados

- Verificar se pagamento foi APROVADO no MP
- Ver logs: deve mostrar "✅ Dias creditados: X para empresa Y"
- Verificar tabela `pagamento` no banco
- Verificar campo `dias_assinatura` na tabela `empresa`

---

## ✅ Status Final

- ✅ **Webhook corrigido**
- ✅ **Servidor reiniciado**
- ✅ **ngrok rodando**
- ✅ **Aceita notificações de teste**
- ✅ **Aceita requisições GET**
- ✅ **Tratamento de erros robusto**
- ⏳ **PENDENTE:** Testar webhook no painel do MP

---

**TESTE AGORA:** Volte ao painel do Mercado Pago e clique em "Testar" novamente!

👉 https://www.mercadopago.com.br/developers/panel/notifications/webhooks

Deve retornar: ✅ **200 OK** 🎉
