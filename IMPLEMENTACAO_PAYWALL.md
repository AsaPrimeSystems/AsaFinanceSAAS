# 🔐 Guia de Implementação: Sistema de Paywall Obrigatório

Este documento contém as instruções completas para implementar o sistema de paywall obrigatório quando a assinatura está expirada (dias_assinatura = 0).

---

## 📋 Resumo das Alterações

O sistema de paywall foi desenvolvido com as seguintes funcionalidades:

1. **Modal Obrigatório**: Aparece automaticamente quando um usuário não-admin tenta acessar o sistema com assinatura expirada.
2. **Bloqueio de UI**: Impede que o usuário feche o modal, navegue ou use qualquer funcionalidade do app.
3. **Proteção de Rotas**: Backend valida e bloqueia acesso a rotas protegidas se a assinatura está expirada.
4. **API de Status**: Endpoint para verificar o status de assinatura do usuário.
5. **Intenção de Assinatura**: Sistema placeholder para registrar intenções de compra antes da integração com gateway real.

---

## 📦 Arquivos Criados/Modificados

### Novos Arquivos

```
paywall_assinatura/
├── app_modificacoes/
│   ├── 01_model_assinatura_intencao.py
│   ├── 02_endpoints_assinatura_api.py
│   ├── 03_paywall_assinatura.js
│   └── 04_protetor_rotas.py
├── templates/
│   └── pagamento.html
└── migration_assinatura.py
```

### Arquivos Modificados

- `app.py` - Adicionar modelos, endpoints, decorator e proteção de rotas
- `templates/base.html` - Incluir script do paywall
- `templates/dashboard.html` - Garantir que o paywall seja acionado ao carregar

---

## 🔧 Instruções de Implementação

### Passo 1: Adicionar Modelo de Dados

Abra seu `app.py` e localize a classe `VoucherUso` (por volta da linha 600). Após essa classe, adicione todo o conteúdo do arquivo `app_modificacoes/01_model_assinatura_intencao.py`.

**Importante**: O modelo deve ser adicionado **antes** de criar as tabelas.

### Passo 2: Adicionar Protetor de Rotas

No início do seu `app.py`, após os imports (por volta da linha 40), adicione todo o conteúdo do arquivo `app_modificacoes/04_protetor_rotas.py`.

**Nota**: Este arquivo contém o decorator `@requer_assinatura` e o hook `@app.before_request` que protegem as rotas.

### Passo 3: Adicionar Endpoints de API

Após as rotas de vouchers no seu `app.py`, adicione todo o conteúdo do arquivo `app_modificacoes/02_endpoints_assinatura_api.py`.

Estes endpoints incluem:
- `GET /api/assinatura/status` - Verifica status de assinatura
- `POST /api/assinatura/iniciar` - Cria intenção de assinatura
- `POST /api/assinatura/confirmar-pagamento` - Confirma pagamento (placeholder)
- `GET /pagamento` - Página de checkout

### Passo 4: Adicionar Template de Pagamento

Copie o arquivo `templates/pagamento.html` para a pasta `templates/` do seu projeto.

### Passo 5: Adicionar Módulo JavaScript

1. Crie uma nova pasta `static/js/assinatura/`.
2. Copie o arquivo `app_modificacoes/03_paywall_assinatura.js` para `static/js/assinatura/assinatura.js`.

### Passo 6: Incluir Script no Template Base

Abra o arquivo `templates/base.html` e localize o bloco `{% block extra_js %}` (geralmente no final do arquivo). Adicione a seguinte linha:

```html
{% block extra_js %}
    <script src="{{ url_for('static', filename='js/assinatura/assinatura.js') }}"></script>
{% endblock %}
```

Se o bloco `extra_js` não existir, adicione-o antes do fechamento da tag `</body>`:

```html
    {% block extra_js %}
        <script src="{{ url_for('static', filename='js/assinatura/assinatura.js') }}"></script>
    {% endblock %}
</body>
```

### Passo 7: Atualizar Banco de Dados

Execute o script de migração para criar a tabela de intenção de assinatura:

```bash
python migration_assinatura.py
```

O script criará a tabela `assinatura_intencao` e seus índices automaticamente.

### Passo 8: Garantir que Novas Contas Iniciem com dias_assinatura = 0

Localize a função/rota de registro (`def registro():`) no seu `app.py`. Certifique-se de que ao criar uma nova `Empresa`, o campo `dias_assinatura` está sendo definido como `0`:

```python
nova_empresa = Empresa(
    # ... outros campos ...
    dias_assinatura=0,  # ← Garantir que está aqui
    data_inicio_assinatura=None
)
```

---

## ✅ Checklist de Testes Manuais

Após implementar todas as alterações, realize os seguintes testes:

### Teste 1: Login com Assinatura Expirada

- [ ] Crie uma nova conta (ou use uma com `dias_assinatura = 0`).
- [ ] Faça login.
- [ ] O modal de paywall deve aparecer **imediatamente** após o login.
- [ ] Verifique que o modal **não pode ser fechado** (sem botão X, sem ESC, sem clicar fora).
- [ ] Verifique que os botões e links fora do modal estão **desabilitados** (opacidade reduzida).
- [ ] Verifique que o scroll da página está **bloqueado**.

### Teste 2: Verificar Planos Exibidos

- [ ] Se a conta é `pessoa_fisica`, devem aparecer os planos: 30 Dias (R$ 49,90), 90 Dias (R$ 99,90), Anual (R$ 300,00).
- [ ] Se a conta é `empresa`, devem aparecer os mesmos planos.
- [ ] Se a conta é `contador_bpo`, deve aparecer a mensagem "Preços personalizados" com botão "Falar com Atendimento".

### Teste 3: Iniciar Assinatura

- [ ] Clique em um botão "Assinar Agora".
- [ ] O botão deve mostrar um spinner de loading.
- [ ] Você deve ser redirecionado para a página `/pagamento?intencao_id=X`.
- [ ] A página de pagamento deve exibir o resumo do plano selecionado.

### Teste 4: Confirmar Pagamento

- [ ] Na página de pagamento, clique em "Confirmar Pagamento (Simular)".
- [ ] Deve aparecer uma mensagem de sucesso: "Pagamento confirmado com sucesso!".
- [ ] Após 3 segundos, você deve ser redirecionado para o dashboard.
- [ ] O modal de paywall **não deve aparecer mais** (pois agora tem dias > 0).

### Teste 5: Login com Assinatura Ativa

- [ ] Crie/use uma conta com `dias_assinatura > 0`.
- [ ] Faça login.
- [ ] O modal de paywall **não deve aparecer**.
- [ ] Você deve ter acesso normal ao sistema.

### Teste 6: Admin Não Vê Paywall

- [ ] Faça login com a conta admin.
- [ ] O modal de paywall **não deve aparecer** (mesmo que `dias_assinatura = 0`).
- [ ] Admin deve ter acesso total ao sistema.

### Teste 7: Proteção de Rotas

- [ ] Com uma conta com `dias_assinatura = 0`, tente acessar diretamente URLs como `/lancamentos`, `/clientes`, etc.
- [ ] Você deve ser redirecionado para `/dashboard` (que mostrará o paywall).
- [ ] Requisições AJAX devem retornar erro 403 com mensagem "Assinatura expirada".

### Teste 8: Páginas Públicas Acessíveis

- [ ] Faça logout.
- [ ] Acesse `/` (landing page) - deve funcionar.
- [ ] Acesse `/precos` - deve funcionar.
- [ ] Acesse `/login` - deve funcionar.
- [ ] Acesse `/registro` - deve funcionar.

---

## 🔄 Fluxo de Funcionamento

```
1. Usuário faz login
   ↓
2. Página carrega (dashboard ou outra rota)
   ↓
3. Script paywall.js executa
   ↓
4. Faz requisição GET /api/assinatura/status
   ↓
5. Se bloqueado == true:
   - Renderiza modal de paywall
   - Bloqueia UI (desabilita navegação)
   - Modal é "static" (não pode fechar)
   ↓
6. Usuário clica em "Assinar Agora"
   ↓
7. POST /api/assinatura/iniciar
   ↓
8. Cria AssinaturaIntencao no banco
   ↓
9. Redireciona para /pagamento?intencao_id=X
   ↓
10. Usuário clica "Confirmar Pagamento"
    ↓
11. POST /api/assinatura/confirmar-pagamento
    ↓
12. Atualiza empresa.dias_assinatura
    ↓
13. Redireciona para /dashboard
    ↓
14. Modal não aparece mais (dias > 0)
```

---

## 🛠️ Troubleshooting

### Problema: Modal não aparece ao fazer login

**Solução**: 
- Verifique se o script `assinatura.js` foi adicionado ao `base.html`.
- Verifique se o endpoint `/api/assinatura/status` está retornando `bloqueado: true`.
- Abra o console do navegador (F12) e procure por erros.

### Problema: Usuário consegue fechar o modal

**Solução**:
- Verifique se o modal foi criado com `data-bs-backdrop="static"` e `data-bs-keyboard="false"`.
- Certifique-se de que o evento de teclado está bloqueando ESC.

### Problema: Usuário consegue navegar para outras páginas

**Solução**:
- Verifique se a função `lockUI()` está sendo chamada.
- Verifique se o CSS está desabilitando `pointer-events`.
- Verifique se o `@app.before_request` está redirecionando corretamente.

### Problema: Erro ao criar AssinaturaIntencao

**Solução**:
- Execute `python migration_assinatura.py` para criar a tabela.
- Verifique se o modelo foi adicionado ao `app.py`.
- Reinicie o servidor Flask.

---

## 📝 Notas Importantes

1. **Placeholder para Gateway**: O sistema atual é um placeholder. Quando integrar com um gateway real (Stripe, PayPal, etc), substitua o endpoint `/api/assinatura/confirmar-pagamento` pela lógica real do gateway.

2. **Segurança**: Certifique-se de que todos os endpoints validam a autenticação e autorização do usuário.

3. **Compatibilidade**: O sistema foi desenvolvido para ser compatível com Flask, SQLAlchemy, Bootstrap 5 e Vanilla JavaScript, respeitando a estrutura modular do seu projeto.

4. **Testes**: Teste em diferentes navegadores e dispositivos para garantir que o modal funciona corretamente.

---

Se tiver dúvidas ou encontrar problemas, consulte o console do navegador (F12) para mensagens de erro detalhadas.
