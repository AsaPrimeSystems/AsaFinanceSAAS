# 🐛 BUGS ENCONTRADOS - Teste Completo do Sistema

**Data:** 10/02/2026
**Testador:** Claude Sonnet 4.5
**Ambiente:** https://asafinancesaas.onrender.com/
**Credencial:** daniel/123456 (CNPJ - Conta PJ)

---

## BUG #1: Formulário de Compras - Validação de Fornecedor Problemática

### 📍 Localização
- **Módulo:** Compras
- **Página:** `/compras/nova`
- **Componente:** Formulário de Nova Compra

### 📝 Descrição
O formulário de nova compra não aceita a criação de fornecedor via autocomplete. Ao digitar um nome de fornecedor que não existe, aparece a sugestão "Criar novo fornecedor: [Nome]", mas ao tentar salvar a compra, retorna erro "Fornecedor é obrigatório", mesmo com o campo preenchido.

### 🔄 Passos para Reproduzir
1. Acessar `/compras/nova`
2. Preencher campo "Fornecedor" com "Móveis Office Ltda" (fornecedor inexistente)
3. Sistema mostra sugestão: "Criar novo fornecedor: Móveis Office Ltda"
4. Preencher dados do produto: "Cadeira Ergonômica", valor R$ 850, quantidade 2
5. Sistema mostra sugestão: "Criar produto: Cadeira Ergonômica"
6. Selecionar conta caixa: "Banco Bradesco"
7. Tipo de Pagamento: "À Vista", Parcelas: 1
8. Clicar em "💾 Salvar Compra"

### ❌ Resultado Atual
- Erro exibido: "Fornecedor é obrigatório"
- Compra não é salva
- Formulário permanece na página (não redireciona)

### ✅ Resultado Esperado
- Fornecedor deve ser criado automaticamente ao salvar
- Produto deve ser criado automaticamente ao salvar
- Compra deve ser salva com sucesso
- Redirecionamento para lista de compras com mensagem de sucesso

### 🎯 Severidade
**ALTA** - Impede a criação de compras com novos fornecedores

### 📸 Observações
- O campo "Fornecedor" visual está preenchido com "Móveis Office Ltda"
- A sugestão de autocomplete aparece corretamente
- Clicar na sugestão não parece ter efeito
- Pode haver um campo hidden que não está sendo preenchido corretamente
- Ao rolar a página após o erro, o formulário fica com fundo azul sólido (possível bug de renderização adicional)

### 🔧 Possível Causa
- Campo hidden `textbox "Fornecedor" [ref_64] type="hidden"` não está sendo preenchido
- Validação do formulário verifica o campo hidden, não o campo de texto visível
- Autocomplete não está disparando evento para preencher o campo hidden
- Função JavaScript que deve criar o fornecedor ao clicar na sugestão não está funcionando

---

## BUG #2: Formulário de Compras - Itens Duplicados no Carrinho

### 📍 Localização
- **Módulo:** Compras
- **Página:** `/compras/nova`
- **Componente:** Carrinho de Produtos

### 📝 Descrição
Ao clicar em "+ Adicionar item" múltiplas vezes, o sistema adiciona linhas vazias ou duplica itens preenchidos, causando cálculos incorretos no total da operação.

### 🔄 Passos para Reproduzir
1. Acessar `/compras/nova`
2. Clicar em "+ Adicionar item"
3. Preencher dados do produto
4. Clicar em "+ Adicionar item" novamente
5. Observar que às vezes o item é duplicado com os mesmos dados

### ❌ Resultado Atual
- Itens duplicados aparecem no carrinho
- Total da operação é multiplicado incorretamente
- Ao remover um item, às vezes remove todos

### ✅ Resultado Esperado
- Cada clique em "+ Adicionar item" deve adicionar UMA linha vazia
- Dados preenchidos devem permanecer na linha correspondente
- Remoção deve afetar apenas a linha específica

### 🎯 Severidade
**MÉDIA** - Causa confusão mas pode ser contornado com cuidado

---

## BUG #3: Formulário de Compras - Renderização com Fundo Azul

### 📍 Localização
- **Módulo:** Compras
- **Página:** `/compras/nova`
- **Componente:** Formulário completo

### 📝 Descrição
Após erro de validação "Fornecedor é obrigatório" e rolagem da página, o formulário desaparece e a área fica com fundo azul sólido, mostrando apenas o título "Nova Compra".

### 🔄 Passos para Reproduzir
1. Acessar `/compras/nova`
2. Tentar salvar com erro de validação
3. Rolar a página para cima
4. Observar que o conteúdo do formulário desaparece

### ❌ Resultado Atual
- Formulário não é exibido
- Apenas fundo azul é visível
- Impossível corrigir o erro sem recarregar a página

### ✅ Resultado Esperado
- Formulário deve permanecer visível após erro de validação
- Campos devem manter os valores preenchidos
- Mensagem de erro deve apontar claramente para o campo problemático

### 🎯 Severidade
**MÉDIA** - Bug visual que força recarga da página

---

## BUG #4: Relatório de Fornecedores - Inconsistência de Valores - ❌ NÃO REPRODUZÍVEL

### 📍 Localização
- **Módulo:** Relatórios
- **Página:** `/relatorios/fornecedores`
- **Componente:** Tabela vs Cards de Totais

### 📝 Descrição Original
Foi reportado que havia inconsistência entre os valores mostrados nos cards de totais e os valores mostrados na tabela de fornecedores.

### 🔍 Verificação (11/02/2026)
Após teste completo do relatório, **NÃO foi possível reproduzir este bug**. Todos os valores estão corretos e consistentes:

- **Cards mostram:** VENCIDO: R$ 1.700,00 ✅
- **Tabela mostra:** Fornecedor "Móveis Office Ltda" com Vencido: R$ 1.700,00 ✅
- **Footer tabela:** VENCIDO: R$ 1.700,00 ✅
- **Saldo Aberto:** R$ 1.700,00 ✅ (consistente em todos os lugares)

### ✅ Resultado Verificado
Cards, tabela e totalizações estão todos mostrando os mesmos valores corretamente. O relatório está funcionando perfeitamente.

### 🎯 Status
**FALSO POSITIVO** - Bug não existe. Possível erro de leitura durante teste inicial ou correção automática

---

## 📊 RESUMO

| Bug | Severidade | Status | Módulo |
|-----|------------|--------|--------|
| #1 | 🔴 ALTA | ✅ CORRIGIDO | Compras - Validação Fornecedor |
| #2 | 🟡 MÉDIA | 🔄 Aberto | Compras - Carrinho |
| #3 | 🟡 MÉDIA | 🔄 Aberto | Compras - Renderização |
| #4 | - | ❌ FALSO POSITIVO | Relatórios - Fornecedores (não reproduzível) |

**Total de Bugs Reais:** 3
**Bugs Críticos:** 0
**Bugs Altos:** 1 (corrigido)
**Bugs Médios:** 2 (abertos)
**Falsos Positivos:** 1

---

## 📋 RESULTADO DOS TESTES DE RELATÓRIOS

### ✅ Relatório de Saldos
- **Status:** FUNCIONANDO
- **Valores:** ✅ Corretos (R$ 1.700,00 em Vencido)
- **Totalizações:** ✅ Corretas
- **Composição:** ✅ Visível e clara
- **Observação:** Compra marcada como "Vencida" (pode ser esperado se data de vencimento passou)

### ✅ Relatório de Lançamentos
- **Status:** FUNCIONANDO PERFEITAMENTE
- **Dados:** ✅ 1 lançamento exibido corretamente
- **Totais:** ✅ R$ 1.700,00 em saídas
- **Detalhes:** ✅ Data, descrição, fornecedor, status todos corretos
- **Exportação:** ✅ Botões CSV e Imprimir disponíveis

### ✅ Relatório de Clientes
- **Status:** FUNCIONANDO
- **Mensagem:** ✅ "Nenhum cliente encontrado" (correto - sem vendas)
- **Bug Anterior:** ✅ CORRIGIDO (não crashou com UndefinedError)
- **Filtros:** ✅ Todos disponíveis

### ✅ Relatório de Fornecedores
- **Status:** FUNCIONANDO PERFEITAMENTE
- **Cards:** ✅ R$ 1.700,00 vencido (correto)
- **Tabela:** ✅ R$ 1.700,00 vencido (correto)
- **Totais:** ✅ Todos os valores consistentes
- **Exportação:** ✅ Excel, PDF, Imprimir disponíveis
- **Nota:** Bug #4 inicialmente reportado NÃO EXISTE - valores estão corretos em todos os lugares

### ✅ DRE - Demonstração do Resultado
- **Status:** FUNCIONANDO (não configurado)
- **Rota:** `/dre/visualizar` (não `/relatorios/dre`)
- **Interface:** ✅ Campos de data funcionando
- **Observação:** Precisa configurar contas primeiro via "Configurar DRE"

---

## 🔄 PRÓXIMOS PASSOS

1. ✅ Documentar bugs encontrados
2. ⏳ Tentar abordagem alternativa: criar fornecedor manualmente antes da compra
3. ⏳ Continuar testes com vendas, transferências e relatórios
4. ⏳ Corrigir todos os bugs identificados
5. ⏳ Fazer deploy e re-testar

---

**Última atualização:** 10/02/2026 - Bugs iniciais documentados
