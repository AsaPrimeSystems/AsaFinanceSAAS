# Guia do Sistema de Vouchers

## Visão Geral

O sistema de vouchers permite que administradores criem e gerenciem códigos promocionais que concedem dias de assinatura para empresas cadastradas no sistema.

## Funcionalidades Implementadas

### 1. Modelos de Banco de Dados

Foram criadas duas novas tabelas:

- **Voucher**: Armazena os vouchers criados
  - `codigo`: Código único do voucher (convertido para maiúsculas)
  - `dias_assinatura`: Quantidade de dias a serem creditados
  - `validade`: Data de expiração do voucher
  - `ativo`: Status do voucher (ativo/inativo)
  - `data_criacao`: Data de criação
  - `criado_por`: ID do usuário admin que criou

- **VoucherUso**: Registra histórico de uso de vouchers
  - `voucher_id`: ID do voucher usado
  - `empresa_id`: ID da empresa que recebeu os dias
  - `data_uso`: Data/hora do uso
  - `dias_creditados`: Quantidade de dias creditados
  - `usuario_admin_id`: Admin que aplicou o voucher
  - `observacoes`: Observações sobre o uso

### 2. Rotas da API

#### GET `/admin/vouchers`
Lista todos os vouchers cadastrados em formato JSON.

**Resposta de sucesso:**
```json
{
  "sucesso": true,
  "vouchers": [
    {
      "id": 1,
      "codigo": "PROMO2025",
      "dias_assinatura": 30,
      "validade": "31/12/2025 23:59",
      "ativo": true,
      "pode_usar": true,
      "usos": 0,
      "data_criacao": "22/12/2025 13:45"
    }
  ]
}
```

#### POST `/admin/vouchers`
Cria um novo voucher.

**Payload:**
```json
{
  "codigo": "PROMO2025",
  "dias_assinatura": 30,
  "validade": "2025-12-31"
}
```

**Resposta de sucesso:**
```json
{
  "sucesso": true,
  "mensagem": "Voucher PROMO2025 criado com sucesso",
  "voucher": {
    "id": 1,
    "codigo": "PROMO2025",
    "dias_assinatura": 30,
    "validade": "31/12/2025 00:00",
    "ativo": true
  }
}
```

#### PATCH `/admin/vouchers/<id>/toggle`
Ativa ou desativa um voucher.

**Resposta de sucesso:**
```json
{
  "sucesso": true,
  "mensagem": "Voucher ativado com sucesso",
  "ativo": true
}
```

#### POST `/admin/vouchers/aplicar`
Aplica um voucher a uma empresa.

**Payload:**
```json
{
  "codigo": "PROMO2025",
  "empresa_id": 5
}
```

**Resposta de sucesso:**
```json
{
  "sucesso": true,
  "mensagem": "Voucher aplicado com sucesso! 30 dias creditados.",
  "empresa": {
    "id": 5,
    "razao_social": "Empresa Exemplo Ltda",
    "dias_anteriores": 10,
    "dias_creditados": 30,
    "dias_atuais": 40
  }
}
```

#### DELETE `/admin/vouchers/<id>`
Deleta um voucher (apenas se nunca foi usado).

**Resposta de sucesso:**
```json
{
  "sucesso": true,
  "mensagem": "Voucher deletado com sucesso"
}
```

#### GET `/admin/vouchers/usos`
Lista o histórico de uso de vouchers.

**Resposta de sucesso:**
```json
{
  "sucesso": true,
  "usos": [
    {
      "id": 1,
      "codigo_voucher": "PROMO2025",
      "empresa": "Empresa Exemplo Ltda",
      "dias_creditados": 30,
      "data_uso": "22/12/2025 14:30",
      "admin": "Administrador"
    }
  ]
}
```

### 3. Interface Web

**Rota da página:** `http://localhost:8002/admin/vouchers-page`

A interface permite:

1. **Criar Voucher**
   - Código (será convertido para maiúsculas)
   - Dias de assinatura
   - Data de validade

2. **Listar Vouchers**
   - Visualizar todos os vouchers
   - Status visual (Disponível/Usado/Inativo)
   - Quantidade de usos

3. **Ações**
   - Ativar/Desativar voucher
   - Excluir voucher (se nunca foi usado)

4. **Aplicar Voucher**
   - Inserir código do voucher
   - Inserir ID da empresa
   - Sistema aplica automaticamente os dias

5. **Histórico de Uso**
   - Ver todos os vouchers já aplicados
   - Empresa beneficiada
   - Admin que aplicou
   - Data e hora do uso

## Regras de Negócio

1. **Código Único**: Cada voucher deve ter um código único
2. **Uso Único**: Cada voucher pode ser usado apenas uma vez
3. **Validade**: Vouchers expirados não podem ser aplicados
4. **Status**: Vouchers inativos não podem ser aplicados
5. **Não-Admin**: Vouchers não podem ser aplicados em contas admin
6. **Exclusão**: Apenas vouchers nunca usados podem ser excluídos
7. **Creditar Dias**:
   - Se a empresa tem assinatura expirada (0 dias): seta os dias do voucher e data de início
   - Se a empresa tem assinatura ativa: soma os dias do voucher aos dias existentes

## Como Acessar

1. Faça login com uma conta admin
   - CNPJ: `00.000.000/0000-00`
   - Username: `admin`
   - Password: `admin123`

2. No menu lateral, clique em "Gerenciar Vouchers"

3. Use os botões na interface para criar e gerenciar vouchers

## Estrutura de Arquivos

- `app.py` (linhas 570-616): Modelos Voucher e VoucherUso
- `app.py` (linhas 14281-14558): Rotas da API de vouchers
- `app.py` (linha 14166-14173): Rota da página HTML
- `templates/admin_vouchers.html`: Interface completa
- `templates/base.html` (linhas 157-162): Link no menu admin

## Exemplos de Uso

### Criar um voucher para promoção de fim de ano
```
Código: NATAL2025
Dias: 60
Validade: 31/12/2025
```

### Aplicar voucher a uma empresa
1. Vá para o Painel Completo (ou Gerenciar Usuários)
2. Anote o ID da empresa desejada
3. Volte para Gerenciar Vouchers
4. Clique em "Aplicar Voucher"
5. Digite o código e o ID da empresa
6. Confirme

O sistema automaticamente:
- Valida o voucher
- Verifica se está ativo e dentro da validade
- Credita os dias na conta da empresa
- Registra o uso no histórico
- Marca o voucher como usado

## Segurança

- Apenas usuários admin têm acesso às rotas de vouchers
- Todas as rotas verificam autenticação e tipo de usuário
- Vouchers usados ficam registrados e não podem ser deletados (auditoria)
- Códigos são convertidos para maiúsculas automaticamente
- Validações impedem uso indevido (voucher expirado, inativo, já usado, etc.)

## Suporte e Manutenção

Para adicionar novas funcionalidades ou modificar o comportamento:

1. **Modelos**: Edite as classes `Voucher` e `VoucherUso` em [app.py:570-616](app.py#L570-L616)
2. **API**: Modifique as rotas em [app.py:14281-14558](app.py#L14281-L14558)
3. **Interface**: Edite [templates/admin_vouchers.html](templates/admin_vouchers.html)
4. **Menu**: Atualize [templates/base.html:157-162](templates/base.html#L157-L162)
