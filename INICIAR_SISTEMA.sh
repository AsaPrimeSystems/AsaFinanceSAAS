#!/bin/bash

# Mudar para o diretório do script (garante que estamos no diretório correto)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR" || exit 1

# Configuração de cores para output (opcional)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuração de diretórios
LOGDIR="logs"
LOGFILE="$LOGDIR/iniciar_sistema.log"

# Criar diretório de logs se não existir
mkdir -p "$LOGDIR"

# Redirecionar output para log e console
# Nota: O redirecionamento precisa vir depois de definir SCRIPT_DIR e mudar o diretório
LOGFILE_ABS="$SCRIPT_DIR/$LOGFILE"
exec > >(tee -a "$LOGFILE_ABS")
exec 2> >(tee -a "$LOGFILE_ABS" >&2)

echo "========================================" >> "$LOGFILE_ABS"
echo "Execução iniciada em $(date)" >> "$LOGFILE_ABS"
echo "Diretório de execução: $SCRIPT_DIR" >> "$LOGFILE_ABS"
echo "========================================"
echo "   SISTEMA DE GESTÃO FINANCEIRA"
echo "   Backend: Python Flask"
echo "========================================"
echo ""
echo -e "${YELLOW}NOTA:${NC} Se aparecer um aviso sobre 'xcode-select', isso é normal no macOS."
echo "Você pode ignorá-lo ou instalar as ferramentas com: xcode-select --install"
echo "O sistema funcionará normalmente mesmo com esse aviso."
echo ""

# Parar processos Python e ngrok existentes
echo "Parando processos Python existentes..."
pkill -f "python.*app.py" 2>/dev/null || true
pkill -f "python3.*app.py" 2>/dev/null || true

echo "Parando ngrok existente..."
pkill ngrok 2>/dev/null || true

echo ""
echo "Aguardando 3 segundos para limpeza..."
sleep 3
echo ""

# Função para verificar Python
check_python() {
    echo ""
    echo "Verificando instalação do Python..."
    echo "[INFO] Verificando Python/pip" >> "$LOGFILE_ABS"
    
    # Tenta diferentes comandos Python
    if command -v python3 &> /dev/null; then
        PYTHON_CMD="python3"
        echo "Python encontrado: python3"
        check_pip
        return 0
    elif command -v python &> /dev/null; then
        PYTHON_CMD="python"
        echo "Python encontrado: python"
        check_pip
        return 0
    else
        echo ""
        echo -e "${RED}ERRO: Python não encontrado no sistema!${NC}"
        echo ""
        echo "Tentando instalação automática..."
        install_python
        return 1
    fi
}

# Função para verificar pip
check_pip() {
    echo ""
    echo "Verificando pip..."
    
    # Tenta diferentes comandos pip
    if $PYTHON_CMD -m pip --version &> /dev/null; then
        PIP_CMD="$PYTHON_CMD -m pip"
        echo "pip encontrado: $PYTHON_CMD -m pip"
        check_version
        return 0
    elif command -v pip3 &> /dev/null; then
        PIP_CMD="pip3"
        echo "pip encontrado: pip3"
        check_version
        return 0
    elif command -v pip &> /dev/null; then
        PIP_CMD="pip"
        echo "pip encontrado: pip"
        check_version
        return 0
    else
        echo ""
        echo "ERRO: pip não encontrado!"
        echo "Tentando reparar instalação do pip..."
        if $PYTHON_CMD -m ensurepip --upgrade &> /dev/null; then
            PIP_CMD="$PYTHON_CMD -m pip"
            echo "pip reparado com sucesso!"
            check_version
            return 0
        else
            echo -e "${RED}ERRO: Não foi possível reparar o pip${NC}"
            manual_solution
            return 1
        fi
    fi
}

# Função para verificar versão do Python
check_version() {
    echo ""
    echo "Verificando versão do Python..."
    
    # Captura a versão do Python, filtrando mensagens do xcode-select
    # Ignora stderr para evitar mensagens do xcode-select
    PYTHON_VERSION_OUTPUT=$($PYTHON_CMD --version 2>/dev/null)
    
    # Se não conseguiu, tenta capturar e filtrar
    if [ -z "$PYTHON_VERSION_OUTPUT" ]; then
        PYTHON_VERSION_OUTPUT=$($PYTHON_CMD --version 2>&1 | grep -E "^Python [0-9]" | head -1)
    fi
    
    # Extrai apenas a versão (formato: Python X.Y.Z -> X.Y.Z)
    PYTHON_VERSION=$(echo "$PYTHON_VERSION_OUTPUT" | grep -E "^Python [0-9]" | awk '{print $2}' | head -1)
    
    # Se ainda não encontrou, tenta extrair qualquer padrão de versão
    if [ -z "$PYTHON_VERSION" ]; then
        PYTHON_VERSION=$(echo "$PYTHON_VERSION_OUTPUT" | grep -oE "[0-9]+\.[0-9]+\.[0-9]+" | head -1)
    fi
    
    if [ -z "$PYTHON_VERSION" ]; then
        echo -e "${YELLOW}AVISO: Não foi possível determinar a versão do Python automaticamente${NC}"
        echo "Tentando continuar mesmo assim (Python foi encontrado como $PYTHON_CMD)..."
        echo "[OK] Python encontrado (versão não verificada)" >> "$LOGFILE_ABS"
        install_requirements
        return 0
    fi
    
    echo "Versão encontrada: $PYTHON_VERSION"
    
    # Extrai versão principal (ex: 3.11.7 -> 3.11)
    MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
    MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)
    
    # Verifica se conseguiu extrair números válidos
    if ! [[ "$MAJOR" =~ ^[0-9]+$ ]] || ! [[ "$MINOR" =~ ^[0-9]+$ ]]; then
        echo -e "${YELLOW}AVISO: Não foi possível validar a versão do Python, mas continuando...${NC}"
        echo "[OK] Python $PYTHON_VERSION (validação pulada)" >> "$LOGFILE_ABS"
        install_requirements
        return 0
    fi
    
    # Verifica se a versão é compatível (Python 3.7+)
    if [ "$MAJOR" -lt 3 ] || ([ "$MAJOR" -eq 3 ] && [ "$MINOR" -lt 7 ]); then
        echo -e "${RED}ERRO: Python $PYTHON_VERSION é muito antigo. Necessário Python 3.7+${NC}"
        install_python
        return 1
    fi
    
    echo -e "${GREEN}Python $PYTHON_VERSION é compatível!${NC}"
    echo "[OK] Python $PYTHON_VERSION" >> "$LOGFILE_ABS"
    install_requirements
    return 0
}

# Função para instalar Python (Mac)
install_python() {
    echo ""
    echo "========================================"
    echo "   INSTALAÇÃO DO PYTHON"
    echo "========================================"
    echo ""
    echo "No macOS, você pode instalar Python de várias formas:"
    echo ""
    echo "1. Usando Homebrew (recomendado):"
    echo "   brew install python3"
    echo ""
    echo "2. Baixar do site oficial:"
    echo "   https://www.python.org/downloads/"
    echo ""
    echo "3. Usando pyenv:"
    echo "   brew install pyenv"
    echo "   pyenv install 3.11.7"
    echo "   pyenv global 3.11.7"
    echo ""
    echo "Após instalar, execute este script novamente."
    echo ""
    read -p "Pressione ENTER para sair..."
    exit 1
}

# Função para instalar requirements
install_requirements() {
    echo ""
    echo "========================================"
    echo "   VERIFICANDO DEPENDÊNCIAS PYTHON"
    echo "========================================"
    echo ""
    
    # Já estamos no diretório correto (mudado no início do script)
    
    if [ ! -f "requirements.txt" ]; then
        echo -e "${YELLOW}AVISO: Arquivo requirements.txt não encontrado${NC}"
        echo "Diretório atual: $(pwd)"
        echo "Continuando sem instalar dependências..."
        start_system
        return
    fi
    
    echo "Verificando dependências do requirements.txt..."
    echo ""
    
    # Instala/atualiza dependências
    echo "Instalando/atualizando dependências..."
    echo "[INFO] Instalando requirements.txt" >> "$LOGFILE_ABS"
    $PIP_CMD install -r requirements.txt --upgrade --break-system-packages
    
    if [ $? -ne 0 ]; then
        echo ""
        echo "ERRO: Falha na instalação das dependências"
        echo "Tentando instalação individual..."
        echo ""
        
        # Tenta instalar cada dependência individualmente
        while IFS= read -r line; do
            # Ignora linhas vazias e comentários
            if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
                continue
            fi
            
            echo "Instalando: $line"
            $PIP_CMD install "$line" --break-system-packages
            if [ $? -ne 0 ]; then
                echo "AVISO: Falha ao instalar $line"
            else
                echo "OK: $line instalado"
            fi
        done < requirements.txt
    fi
    
    echo ""
    echo "Verificando instalação do Flask..."
    $PIP_CMD show flask &> /dev/null
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}ERRO: Flask não está instalado corretamente${NC}"
        echo "Tentando instalar Flask..."
        $PIP_CMD install Flask --break-system-packages
        if [ $? -ne 0 ]; then
            echo -e "${RED}ERRO CRÍTICO: Não foi possível instalar Flask${NC}"
            manual_solution
            return 1
        fi
    fi
    
    echo -e "${GREEN}Flask verificado com sucesso!${NC}"
    echo "[OK] Flask instalado/verificado" >> "$LOGFILE_ABS"
    start_system
    return 0
}

# Função para solução manual
manual_solution() {
    echo ""
    echo "========================================"
    echo "   SOLUÇÃO MANUAL NECESSÁRIA"
    echo "========================================"
    echo ""
    echo "Não foi possível configurar automaticamente o ambiente."
    echo ""
    echo "PASSOS MANUAIS:"
    echo "1. Instale Python 3.7+ usando Homebrew:"
    echo "   brew install python3"
    echo ""
    echo "2. Ou baixe do site oficial:"
    echo "   https://www.python.org/downloads/"
    echo ""
    echo "3. Abra um novo terminal"
    echo "4. Execute: pip3 install -r requirements.txt"
    echo "5. Execute este script novamente"
    echo ""
    echo "Se o problema persistir, verifique:"
    echo "- Se o Python está no PATH do sistema"
    echo "- Se o pip está funcionando: python3 -m pip --version"
    echo "- Se há restrições de firewall/antivírus"
    echo ""
    read -p "Pressione ENTER para sair..."
    exit 1
}

# Função para verificar e iniciar ngrok
start_ngrok() {
    echo ""
    echo "========================================"
    echo "   VERIFICANDO NGROK"
    echo "========================================"
    echo ""

    # Verificar se ngrok está instalado
    if command -v ngrok &> /dev/null; then
        NGROK_CMD="ngrok"
    elif [ -f "$HOME/bin/ngrok" ]; then
        NGROK_CMD="$HOME/bin/ngrok"
    else
        echo -e "${YELLOW}AVISO: ngrok não encontrado${NC}"
        echo "O webhook do Mercado Pago não funcionará sem ngrok."
        echo ""
        echo "Para instalar ngrok:"
        echo "1. Acesse: https://ngrok.com/download"
        echo "2. Ou siga o guia: CONFIGURAR_NGROK.md"
        echo ""
        echo "Continuando sem ngrok..."
        return 1
    fi

    # Verificar se está configurado
    if ! $NGROK_CMD config check &> /dev/null; then
        echo -e "${YELLOW}AVISO: ngrok não está configurado${NC}"
        echo "Configure o authtoken primeiro:"
        echo "  ngrok config add-authtoken SEU_TOKEN"
        echo ""
        echo "Veja o guia: NGROK_AUTHTOKEN.md"
        echo ""
        echo "Continuando sem ngrok..."
        return 1
    fi

    echo "Iniciando ngrok na porta 8002..."
    $NGROK_CMD http 8002 --log=stdout > "$LOGDIR/ngrok.log" 2>&1 &
    NGROK_PID=$!

    echo "Aguardando ngrok inicializar..."
    sleep 4

    # Verificar se ngrok iniciou corretamente
    if ! ps -p $NGROK_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}AVISO: ngrok não iniciou corretamente${NC}"
        echo "Verifique os logs em: $LOGDIR/ngrok.log"
        return 1
    fi

    # Obter URL pública
    NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | grep -o 'https://[^"]*\.ngrok-free\.dev' | head -1)

    if [ -z "$NGROK_URL" ]; then
        echo -e "${YELLOW}AVISO: Não foi possível obter URL do ngrok${NC}"
        echo "O ngrok está rodando mas a URL não foi detectada."
        echo "Acesse manualmente: http://127.0.0.1:4040"
    else
        echo ""
        echo -e "${GREEN}✅ ngrok iniciado com sucesso!${NC}"
        echo ""
        echo "URL Pública: $NGROK_URL"
        echo "Webhook URL: $NGROK_URL/webhook/mercadopago"
        echo "Interface Web: http://127.0.0.1:4040"
        echo ""
        echo "CONFIGURE NO MERCADO PAGO:"
        echo "→ https://www.mercadopago.com.br/developers/panel/notifications/webhooks"
        echo "→ URL: $NGROK_URL/webhook/mercadopago"
        echo ""
    fi

    return 0
}

# Função para iniciar o sistema
start_system() {
    echo ""
    echo "========================================"
    echo "   AMBIENTE CONFIGURADO COM SUCESSO"
    echo "========================================"
    echo ""

    echo "Atualizando banco de dados..."
    # Garantir que estamos no diretório correto
    cd "$SCRIPT_DIR" || exit 1

    # Executa atualização do banco
    if ! $PYTHON_CMD atualizar_banco.py 2>/dev/null; then
        echo -e "${YELLOW}AVISO: Erro na atualização do banco de dados${NC}"
        echo "O sistema pode não funcionar corretamente"
        echo ""
    fi

    # Iniciar ngrok primeiro
    start_ngrok

    echo ""
    echo "========================================"
    echo "   INICIANDO SISTEMA FINANCEIRO"
    echo "========================================"
    echo ""
    echo "Servidor iniciando na porta 8002..."
    echo ""
    echo "FUNCIONALIDADES DO SISTEMA:"
    echo "   - Integração com Mercado Pago"
    echo "   - Webhook para pagamentos (via ngrok)"
    echo "   - Cliente/Fornecedor nos lançamentos"
    echo "   - Campos de data digitáveis"
    echo "   - Relatórios completos"
    echo "   - Ações em lote"
    echo "   - Todas as funcionalidades anteriores"
    echo ""
    echo "URLs do Sistema:"
    echo "   Sistema: http://localhost:8002"
    echo "   ngrok Interface: http://127.0.0.1:4040"
    echo ""
    echo "Credenciais do Administrador:"
    echo "   Email: admin@sistema.com"
    echo "   Senha: admin123"
    echo ""
    echo "Pressione Ctrl+C para parar servidor e ngrok"
    echo ""

    # Função para cleanup ao sair
    cleanup() {
        echo ""
        echo "Encerrando sistema..."
        pkill -f "python.*app.py" 2>/dev/null || true
        pkill ngrok 2>/dev/null || true
        echo "Sistema encerrado."
        exit 0
    }

    # Registrar trap para Ctrl+C
    trap cleanup SIGINT SIGTERM

    # Executar o app.py
    # Nota: Se aparecer um aviso sobre xcode-select, você pode ignorá-lo
    # ou instalar as ferramentas: xcode-select --install
    export PYTHONUNBUFFERED=1

    # Garantir que estamos no diretório correto
    cd "$SCRIPT_DIR" || exit 1

    # Executa o app.py normalmente
    # O aviso do xcode-select aparecerá mas não impedirá a execução
    $PYTHON_CMD app.py

    echo ""
    echo "Servidor finalizado."
    echo ""

    # Cleanup ao sair normalmente
    cleanup
}

# Verificar se o script está sendo executado no macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${YELLOW}AVISO: Este script foi projetado para macOS. Pode funcionar em Linux também.${NC}"
    echo ""
fi

# Verificar se xcode-select está instalado (opcional, mas recomendado)
# Nota: O aviso do xcode-select pode aparecer mas não impede a execução do Python
# Ele só é necessário se alguma biblioteca precisar compilar código C

# Executar verificação do Python
check_python

