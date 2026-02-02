# 📋 Sistema de Gestão Financeira - SAAS

Sistema completo de gestão financeira com suporte para múltiplos tipos de conta, controle de assinatura, vínculos entre contadores e empresas, e gestão de sub-usuários.

---

## 🚀 Início Rápido

### Credenciais de Acesso ADMIN

```
Tipo de Acesso: Empresa (CNPJ)
CNPJ: 00.000.000/0000-00
Usuário: admin
Senha: admin123
```

### Como Iniciar o Sistema

**No Windows:**
Execute o arquivo `INICIAR_SISTEMA.bat`

**No macOS/Linux:**
Execute o arquivo `INICIAR_SISTEMA.sh`:
```bash
./INICIAR_SISTEMA.sh
```

**Via terminal direto:**
```bash
python app.py
```

O sistema iniciará automaticamente na porta configurada (padrão: 8002).

---

## 🔐 Tipos de Acesso

### 1. **ADMINISTRADOR (ADMIN)**
- **Função**: Gerenciamento completo do sistema
- **Credenciais**:
  - CNPJ: `00.000.000/0000-00`
  - Usuário: `admin`
  - Senha: `admin123`
- **Funcionalidades**:
  - ✅ Visualizar todas as contas (Empresa, Pessoa Física, Contador/BPO)
  - ✅ Ativar/Desativar contas
  - ✅ Editar dados de qualquer conta
  - ✅ Gerenciar dias de assinatura
  - ✅ Excluir contas
  - ✅ Acesso ilimitado (sem controle de dias)
- **Painel**: `/admin/painel-completo`

### 2. **EMPRESA**
- **Função**: Gestão financeira de pessoa jurídica
- **Cadastro**: Via formulário de registro com CNPJ
- **Funcionalidades**:
  - ✅ Gestão de lançamentos financeiros
  - ✅ Controle de contas a pagar e receber
  - ✅ Gestão de clientes e fornecedores
  - ✅ Controle de estoque
  - ✅ Relatórios financeiros
  - ✅ Autorizar vínculos com contadores
- **Controle**: ⏰ Sujeito a controle de assinatura (30 dias padrão)

### 3. **PESSOA FÍSICA**
- **Função**: Gestão financeira pessoal
- **Cadastro**: Via formulário de registro com CPF
- **Funcionalidades**:
  - ✅ Gestão de lançamentos financeiros pessoais
  - ✅ Controle de contas a pagar e receber
  - ✅ Relatórios financeiros
  - ✅ Autorizar vínculos com contadores
- **Controle**: ⏰ Sujeito a controle de assinatura (30 dias padrão)

### 4. **CONTADOR/BPO**
- **Função**: Gestão de múltiplas empresas vinculadas
- **Cadastro**: Via formulário de registro (CPF ou CNPJ)
- **Funcionalidades**:
  - ✅ Solicitar vínculo com empresas/pessoas físicas
  - ✅ Visualizar dados financeiros de empresas autorizadas
  - ✅ Dashboard consolidado por empresa
  - ✅ Criar sub-usuários
  - ✅ Gerenciar permissões de sub-usuários
- **Painel**: `/contador/dashboard`

### 5. **SUB-USUÁRIO (Contador/BPO)**
- **Função**: Acesso limitado às empresas autorizadas
- **Criação**: Apenas pelo usuário principal do Contador/BPO
- **Funcionalidades**:
  - ✅ Visualizar apenas empresas autorizadas
  - ✅ Dashboard filtrado por permissões
  - ❌ Não pode criar outros sub-usuários
  - ❌ Não pode solicitar novos vínculos

---

## 📊 Funcionalidades Principais

### Gestão Financeira
- ✅ Lançamentos (Receitas e Despesas)
- ✅ Contas a Pagar e Receber
- ✅ Clientes e Fornecedores
- ✅ Produtos e Serviços
- ✅ Estoque
- ✅ Vendas e Compras
- ✅ Contas Caixa (Múltiplas contas bancárias)
- ✅ Plano de Contas
- ✅ Relatórios Completo (Excel, PDF)

### Controle de Assinatura
- 📅 Dias restantes exibidos no cabeçalho
- ⚠️ Alerta quando < 7 dias
- 🔒 Bloqueio automático quando = 0 dias
- 👑 Admin pode gerenciar dias de qualquer conta

### Sistema de Vínculos
- 🔗 Contadores podem solicitar vínculo com empresas
- ✅ Empresas autorizam/rejeitam vínculos
- 📊 Dashboard consolidado para contadores
- 👥 Gestão de sub-usuários com permissões granulares

---

## 🛠️ Tecnologias Utilizadas

- **Backend**: Flask (Python)
- **Banco de Dados**: SQLite (SQLAlchemy ORM)
- **Frontend**: Bootstrap 5, JavaScript
- **Relatórios**: ReportLab (PDF), OpenPyXL (Excel)

---

## 📁 Estrutura do Projeto

```
SAAS-GESTAO-FINANCEIRA/
├── app.py                    # Arquivo principal da aplicação
├── criar_admin.py            # Script para criar/verificar admin
├── atualizar_banco.py        # Script para atualizar banco de dados
├── INICIAR_SISTEMA.bat       # Script de inicialização (Windows)
├── INICIAR_SISTEMA.sh        # Script de inicialização (macOS/Linux)
├── requirements.txt          # Dependências Python
├── README.md                 # Esta documentação
│
├── instance/
│   └── saas_financeiro_v2.db # Banco de dados SQLite
│
├── templates/                # Templates HTML
│   ├── base.html
│   ├── login.html
│   ├── login_novo.html
│   ├── dashboard.html
│   ├── admin_painel_completo.html
│   ├── contador_dashboard.html
│   └── ... (outros templates)
│
├── static/
│   ├── css/                  # Arquivos CSS
│   │   ├── style.css
│   │   ├── admin-usuarios.css
│   │   └── ...
│   │
│   └── js/                   # Arquivos JavaScript
│       ├── app.js
│       ├── admin/
│       ├── clientes/
│       ├── dashboard/
│       ├── lancamentos/
│       ├── utils/
│       └── ...
│
├── logs/                     # Logs do sistema
└── uploads/                  # Arquivos enviados
```

---

## 🔄 Fluxos de Trabalho

### Vínculo Contador ↔ Empresa

1. **Contador solicita vínculo**:
   - Acessa painel do contador (`/contador/dashboard`)
   - Aba "Vincular Empresa"
   - Informa CPF ou CNPJ da empresa
   - Sistema cria vínculo com status `pendente`

2. **Empresa autoriza**:
   - Usuário principal vê solicitação em "Vínculos Pendentes"
   - Visualiza dados do contador
   - Pode **Autorizar** ou **Rejeitar**

3. **Resultado**:
   - Status muda para `autorizado`
   - Contador passa a visualizar dados da empresa
   - Aparece no dashboard do contador

### Criação de Sub-Usuário

1. **Contador cria sub-usuário**:
   - Acessa aba "Sub-Usuários" no painel
   - Preenche: Nome, Email, Senha
   - Sistema cria sub-usuário

2. **Gerenciar permissões**:
   - Contador acessa "Permissões" do sub-usuário
   - Seleciona quais empresas vinculadas o sub-usuário pode acessar
   - Salva permissões

3. **Sub-usuário faz login**:
   - Login com email e senha
   - Vê apenas empresas autorizadas
   - Dashboard filtrado

---

## 🔧 Configuração e Instalação

### Requisitos

- Python 3.8+
- pip (gerenciador de pacotes Python)

### Instalação

1. **Instalar dependências**:
```bash
pip install -r requirements.txt
```

2. **Criar banco de dados** (automático na primeira execução):
```bash
python atualizar_banco.py
```

3. **Criar usuário admin** (se necessário):
```bash
python criar_admin.py
```

4. **Iniciar sistema**:
```bash
python app.py
```

**Windows:** Execute `INICIAR_SISTEMA.bat`  
**macOS/Linux:** Execute `./INICIAR_SISTEMA.sh`

---

## 📝 Principais Rotas

### Rotas Públicas
- `/` - Página inicial (redireciona para login)
- `/login` - Login
- `/registro` - Criar nova conta
- `/logout` - Logout

### Rotas ADMIN
- `/admin/painel-completo` - Painel principal do admin
- `/admin/usuarios` - Gestão de usuários
- `/admin/editar-dias` - Editar dias de assinatura

### Rotas CONTADOR/BPO
- `/contador/dashboard` - Dashboard do contador
- `/contador/vincular-empresa` - Solicitar vínculo
- `/contador/criar-sub-usuario` - Criar sub-usuário

### Rotas VÍNCULOS
- `/vinculos/pendentes` - Listar vínculos pendentes
- `/vinculos/<id>/autorizar` - Autorizar vínculo
- `/vinculos/<id>/rejeitar` - Rejeitar vínculo

### Rotas Principais (Empresa/PF)
- `/dashboard` - Dashboard principal
- `/lancamentos` - Gestão de lançamentos
- `/clientes` - Gestão de clientes
- `/fornecedores` - Gestão de fornecedores
- `/estoque` - Controle de estoque
- `/vendas` - Gestão de vendas
- `/compras` - Gestão de compras
- `/relatorios` - Relatórios
- `/configuracoes` - Configurações

---

## 🐛 Troubleshooting

### "Acesso negado"
**Solução**: Verificar tipo de usuário e permissões

### "Assinatura expirada"
**Solução**: Login como ADMIN e edite os dias de assinatura em `/admin/painel-completo`

### "Usuário ou senha incorretos" (Admin)
**Solução**: Execute `python criar_admin.py` para criar/resetar o admin

### "Vínculo não aparece"
**Solução**: Verificar se status é "autorizado" e se o usuário tem permissão

### "Sub-usuário não vê empresa"
**Solução**: Verificar permissões do sub-usuário nas configurações do contador

---

## 📊 Controle de Assinatura

### Dias Restantes

O sistema exibe um cabeçalho com os dias restantes:
- **> 30 dias**: Badge verde ✅
- **7-30 dias**: Badge amarelo ⚠️
- **1-6 dias**: Badge vermelho ❌
- **0 dias**: Bloqueado 🔒

### Gerenciar Dias (ADMIN)

1. Acesse `/admin/painel-completo`
2. Localize a conta
3. Clique no ícone de calendário 📅
4. Digite o número de dias
5. Salvar

**Dica**: Digite `0` para bloquear acesso imediatamente

---

## 🔒 Segurança

- ✅ Senhas criptografadas com `werkzeug.security`
- ✅ Validação de CPF e CNPJ
- ✅ Controle de sessão (24 horas)
- ✅ Verificação de permissões em todas as rotas
- ✅ Proteção contra XSS e CSRF
- ✅ Sanitização de inputs
- ✅ Timeout de sessão automático

---

## 📈 Recursos Implementados

✅ Painel ADMIN completo  
✅ Painel CONTADOR/BPO  
✅ Sistema de vínculos com autorização  
✅ Gestão de sub-usuários  
✅ Controle de permissões granular  
✅ Controle de assinatura por dias  
✅ Bloqueio automático por expiração  
✅ Dashboard consolidado por empresa  
✅ Filtros e buscas avançadas  
✅ Interface responsiva e moderna  
✅ Relatórios em Excel e PDF  
✅ Gestão completa de lançamentos financeiros  
✅ Sistema de vendas e compras com parcelas  
✅ Controle de estoque  
✅ Múltiplas contas caixa  

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique esta documentação
2. Consulte os logs do sistema (pasta `logs/`)
3. Entre em contato com o administrador

---

## 📄 Licença

Este sistema foi desenvolvido para uso interno da ASA Prime Systems.

---

**Versão**: 2.0  
**Última atualização**: Novembro 2025  
**Status**: ✅ Sistema Completo e Funcional
