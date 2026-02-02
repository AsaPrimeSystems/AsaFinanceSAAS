# 🚀 Guia de Implementação: Melhorias no SaaS de Gestão Financeira

Olá! Concluí o desenvolvimento das melhorias solicitadas para o seu projeto. Este documento contém todas as instruções necessárias para integrar as novas funcionalidades ao seu sistema.

As melhorias foram divididas em três partes principais, conforme solicitado:

1.  **Busca Avançada no Painel de Admin**: Adicionada uma funcionalidade de busca na página `/admin/usuarios`.
2.  **Sistema Completo de Vouchers**: Implementado um sistema de criação, gerenciamento e aplicação de vouchers de assinatura.
3.  **Páginas Públicas Profissionais**: Criadas uma nova Landing Page e uma página de Preços.

---

## 📦 Arquivos e Código-Fonte

Todos os novos arquivos e o código-fonte completo estão disponíveis no arquivo `SAAS_MELHORIAS.zip` anexado a esta mensagem. O zip contém:

```
SAAS_MELHORIAS/
├── templates/
│   ├── landing.html
│   └── precos.html
├── static/
│   └── js/
│       └── vouchers/
│           └── vouchers.js
├── app_modificacoes/
│   ├── 01_models_voucher.py
│   ├── 02_rota_admin_usuarios_busca.py
│   ├── 03_endpoints_voucher.py
│   └── 04_rotas_publicas.py
├── admin_usuarios.html_modificacoes.txt
└── migration_vouchers.py
```

---

## 📝 Instruções de Implementação

Siga os passos abaixo para aplicar as alterações no seu projeto. Recomendo fazer um backup do seu código antes de começar.

### Passo 1: Adicionar Novos Templates

Copie os seguintes arquivos para a pasta `templates/` do seu projeto:

1.  `templates/landing.html`
2.  `templates/precos.html`

### Passo 2: Adicionar Novo Módulo JavaScript

1.  Crie uma nova pasta `vouchers` dentro de `static/js/`.
2.  Copie o arquivo `static/js/vouchers/vouchers.js` para a nova pasta `static/js/vouchers/`.

### Passo 3: Modificar o Arquivo Principal `app.py`

As alterações no `app.py` foram separadas em arquivos para facilitar a integração. Abra seu `app.py` e adicione o conteúdo dos seguintes arquivos nas seções indicadas:

1.  **Adicionar Novos Modelos de Voucher**:
    - Copie todo o conteúdo de `app_modificacoes/01_models_voucher.py`.
    - Cole no final da seção de modelos do seu `app.py` (após a classe `SubUsuarioContador`).

2.  **Atualizar Rota `admin_usuarios` com Busca**:
    - **Adicione a importação `from unidecode import unidecode` no início do seu `app.py`.** Se `unidecode` não estiver instalado, execute: `pip install unidecode`.
    - Encontre a função `def admin_usuarios():` (por volta da linha 1625).
    - Substitua **toda** a função `admin_usuarios` pelo conteúdo de `app_modificacoes/02_rota_admin_usuarios_busca.py`.

3.  **Adicionar Endpoints de Voucher**:
    - Copie todo o conteúdo de `app_modificacoes/03_endpoints_voucher.py`.
    - Cole no final do seu `app.py`, após as rotas de admin existentes.

4.  **Adicionar Rotas Públicas**:
    - Copie todo o conteúdo de `app_modificacoes/04_rotas_publicas.py`.
    - Cole no seu `app.py`, preferencialmente antes da seção de rotas autenticadas.

### Passo 4: Modificar o Template `admin_usuarios.html`

Abra o arquivo `templates/admin_usuarios.html` e aplique as seguintes alterações, conforme o arquivo `admin_usuarios.html_modificacoes.txt`:

1.  **Adicionar Formulário de Busca**:
    - Logo abaixo da tag `<div class="card-header">`, adicione o formulário de busca para permitir a pesquisa de usuários.

2.  **Adicionar Botão "Gerenciar Vouchers"**:
    - Ao lado do título "Pessoas e Contas Cadastradas", adicione o botão que abrirá o modal de vouchers.

3.  **Adicionar o Modal de Vouchers**:
    - No final do arquivo, antes do `{% endblock %}`, cole o código completo do modal de vouchers.

4.  **Incluir o JavaScript do Voucher**:
    - Dentro do bloco `{% block extra_js %}`, adicione a linha para incluir o novo arquivo JS:
      ```html
      <script src="{{ url_for(\'static\', filename=\'js/vouchers/vouchers.js\') }}"></script>
      ```

### Passo 5: Atualizar o Banco de Dados

Para criar as novas tabelas `voucher` e `voucher_uso` no banco de dados, execute o script de migração:

```bash
python migration_vouchers.py
```

O script foi projetado para ser seguro e não executará se as tabelas já existirem.

---

## ✅ Checklist de Testes Manuais

Após aplicar todas as alterações e reiniciar o servidor, realize os seguintes testes para garantir que tudo está funcionando corretamente:

1.  **Busca no Painel de Admin**:
    - [ ] Acesse `/admin/usuarios`.
    - [ ] Verifique se o campo de busca e os botões "Pesquisar" e "Limpar" são exibidos.
    - [ ] Pesquise por nome, e-mail e CNPJ/CPF de uma empresa/pessoa existente e verifique se o resultado é filtrado.
    - [ ] Clique em "Limpar" e verifique se a lista completa é exibida novamente.

2.  **Sistema de Vouchers**:
    - [ ] Em `/admin/usuarios`, clique em "Gerenciar Vouchers".
    - [ ] O modal deve abrir com as abas "Vouchers", "Aplicar Voucher" e "Histórico".
    - [ ] Na aba "Vouchers", clique em "Criar novo voucher".
    - [ ] Preencha o formulário com dados válidos (código, dias, validade) e salve. Verifique se o voucher aparece na lista.
    - [ ] Tente criar um voucher com um código já existente e verifique se a mensagem de erro é exibida.
    - [ ] Ative e desative um voucher e verifique se o status muda na tabela.
    - [ ] Na aba "Aplicar Voucher", selecione uma empresa, insira o código do voucher criado e clique em "Aplicar". Verifique a mensagem de sucesso.
    - [ ] Verifique na lista de usuários se os dias de assinatura da empresa foram atualizados.
    - [ ] Na aba "Histórico", verifique se o uso do voucher foi registrado.
    - [ ] Tente aplicar o mesmo voucher novamente e verifique se o sistema impede o uso duplicado.

3.  **Páginas Públicas**:
    - [ ] Acesse a rota principal (`/` ou `http://localhost:8002`).
    - [ ] Verifique se a nova Landing Page é exibida corretamente.
    - [ ] Clique nos links do menu ("Home", "Preços", "Log In") e verifique se redirecionam corretamente.
    - [ ] Acesse a página `/precos` diretamente e verifique se a página de preços é exibida.
    - [ ] Verifique se, ao estar logado, o acesso a `/` e `/precos` redireciona para o `/dashboard`.

---

Se encontrar qualquer problema ou tiver alguma dúvida, estou à disposição para ajudar!
