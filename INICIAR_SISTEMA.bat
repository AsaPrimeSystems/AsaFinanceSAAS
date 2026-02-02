@echo off
setlocal enableextensions
set LOGDIR=logs
if not exist "%LOGDIR%" mkdir "%LOGDIR%" >nul 2>&1
set LOGFILE=%LOGDIR%\iniciar_sistema.log
echo ========================================> "%LOGFILE%"
echo Execucao iniciada em %DATE% %TIME%>> "%LOGFILE%"
title Sistema de Gestao Financeira
echo ========================================
echo    SISTEMA DE GESTAO FINANCEIRA
echo    Backend: Python Flask
echo ========================================
echo.
echo Parando processos Python existentes...
taskkill /F /IM python.exe >nul 2>&1
echo.
echo Aguardando 3 segundos para limpeza...
ping 127.0.0.1 -n 4 >nul
echo.

:check_python
REM ========================================
REM VERIFICACAO ROBUSTA DO PYTHON
REM ========================================

echo.
echo Verificando instalacao do Python...
echo [INFO] Verificando Python/pip>> "%LOGFILE%"
set PYTHON_CMD=
set PIP_CMD=

REM Tenta diferentes comandos Python
python --version >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_CMD=python
    echo Python encontrado: python
    goto :check_pip
)

python3 --version >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_CMD=python3
    echo Python encontrado: python3
    goto :check_pip
)

py --version >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_CMD=py
    echo Python encontrado: py
    goto :check_pip
)

REM Se chegou aqui, Python nao foi encontrado
echo.
echo ERRO: Python nao encontrado no sistema!
echo.
echo Tentando instalacao automatica...
goto :install_python

:check_pip
echo.
echo Verificando pip...

REM Tenta diferentes comandos pip
%PYTHON_CMD% -m pip --version >nul 2>&1
if %errorlevel% equ 0 (
    set PIP_CMD=%PYTHON_CMD% -m pip
    echo pip encontrado: %PYTHON_CMD% -m pip
    goto :check_version
)

pip --version >nul 2>&1
if %errorlevel% equ 0 (
    set PIP_CMD=pip
    echo pip encontrado: pip
    goto :check_version
)

pip3 --version >nul 2>&1
if %errorlevel% equ 0 (
    set PIP_CMD=pip3
    echo pip encontrado: pip3
    goto :check_version
)

echo.
echo ERRO: pip nao encontrado!
echo Tentando reparar instalacao do pip...
%PYTHON_CMD% -m ensurepip --upgrade >nul 2>&1
if %errorlevel% equ 0 (
    set PIP_CMD=%PYTHON_CMD% -m pip
    echo pip reparado com sucesso!
    goto :check_version
) else (
    echo ERRO: Nao foi possivel reparar o pip
    goto :manual_solution
)

:check_version
echo.
echo Verificando versao do Python...
for /f "tokens=2" %%i in ('%PYTHON_CMD% --version 2^>^&1') do set PYTHON_VERSION=%%i

echo Versao encontrada: %PYTHON_VERSION%

REM Extrai versao principal (ex: 3.11.7 -> 3.11)
for /f "tokens=1,2 delims=." %%a in ("%PYTHON_VERSION%") do (
    set MAJOR=%%a
    set MINOR=%%b
)

REM Verifica se a versao e compativel (Python 3.7+)
if %MAJOR% lss 3 (
    echo ERRO: Python %PYTHON_VERSION% e muito antigo. Necessario Python 3.7+
    goto :install_python
)

if %MAJOR% equ 3 if %MINOR% lss 7 (
    echo ERRO: Python %PYTHON_VERSION% e muito antigo. Necessario Python 3.7+
    goto :install_python
)

echo Python %PYTHON_VERSION% e compativel!
echo [OK] Python %PYTHON_VERSION%>> "%LOGFILE%"
goto :install_requirements

:install_python
echo.
echo ========================================
echo    INSTALANDO PYTHON AUTOMATICAMENTE
echo ========================================
echo.
echo Baixando Python 3.11.7 (versao estavel)...
set PYTHON_URL=https://www.python.org/ftp/python/3.11.7/python-3.11.7-amd64.exe
set PYTHON_INSTALLER=python-3.11.7-amd64.exe

echo Aguarde, baixando instalador...
powershell -Command "try { $ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri '%PYTHON_URL%' -OutFile '%PYTHON_INSTALLER%' -UseBasicParsing; Write-Host 'Download concluido!' } catch { Write-Host 'Erro no download: ' + $_.Exception.Message; exit 1 }" 2>nul

if not exist "%PYTHON_INSTALLER%" (
    echo ERRO: Nao foi possivel baixar Python automaticamente
    goto :manual_solution
)

echo.
echo Download concluido! Instalando Python...
echo ATENCAO: A instalacao sera silenciosa (sem interface grafica)
echo    Isso pode levar alguns minutos...
echo.

"%PYTHON_INSTALLER%" /quiet InstallAllUsers=1 PrependPath=1 Include_test=0 Include_doc=0 Include_dev=0

echo Aguardando conclusao da instalacao...
ping 127.0.0.1 -n 46 >nul

echo Limpando arquivos temporarios...
del "%PYTHON_INSTALLER%" 2>nul

echo.
echo Python instalado! Atualizando variaveis de ambiente...
echo IMPORTANTE: Reinicie o prompt de comando e execute este arquivo novamente
echo    para que as mudancas no PATH tenham efeito.
echo.
pause
exit /b 0

:install_requirements
echo.
echo ========================================
echo    VERIFICANDO DEPENDENCIAS PYTHON
echo ========================================
echo.

if not exist "requirements.txt" (
    echo AVISO: Arquivo requirements.txt nao encontrado
    echo Continuando sem instalar dependencias...
    goto :start_system
)

echo Verificando dependencias do requirements.txt...
echo.

REM Instala/atualiza dependencias
echo Instalando/atualizando dependencias...
echo [INFO] Instalando requirements.txt>> "%LOGFILE%"
%PIP_CMD% install -r requirements.txt --upgrade

if %errorlevel% neq 0 (
    echo.
    echo ERRO: Falha na instalacao das dependencias
    echo Tentando instalacao individual...
    echo.
    
    REM Tenta instalar cada dependencia individualmente (mostrando saida)
    for /f "tokens=*" %%i in (requirements.txt) do (
        echo Instalando: %%i
        rem Tratamento especial para reportlab em Windows: preferir wheel binario
        if /I "%%i"=="reportlab==4.0.4" (
            %PIP_CMD% install --only-binary=:all: "%%i"
        ) else (
            %PIP_CMD% install "%%i"
        )
        if %errorlevel% neq 0 (
            echo AVISO: Falha ao instalar %%i
        ) else (
            echo OK: %%i instalado
        )
    )
)

echo.
echo Verificando instalacao do Flask...
%PIP_CMD% show flask >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Flask nao esta instalado corretamente
    echo Tentando instalar Flask...
    %PIP_CMD% install Flask
    if %errorlevel% neq 0 (
        echo ERRO CRITICO: Nao foi possivel instalar Flask
        goto :manual_solution
    )
)

echo Flask verificado com sucesso!
echo [OK] Flask instalado/verificado>> "%LOGFILE%"
goto :start_system

:manual_solution
echo.
echo ========================================
echo    SOLUCAO MANUAL NECESSARIA
echo ========================================
echo.
echo Nao foi possivel configurar automaticamente o ambiente.
echo.
echo PASSOS MANUAIS:
echo 1. Acesse: https://www.python.org/downloads/
echo 2. Baixe Python 3.11 ou superior
echo 3. Execute o instalador marcando "Add Python to PATH"
echo 4. Abra um novo prompt de comando
echo 5. Execute: pip install -r requirements.txt
echo 6. Execute este arquivo novamente
echo.
echo Se o problema persistir, verifique:
echo - Se o Python esta no PATH do sistema
echo - Se o pip esta funcionando: python -m pip --version
echo - Se ha restricoes de firewall/antivirus
echo.
pause
exit /b 1

:start_system
echo.
echo ========================================
echo    AMBIENTE CONFIGURADO COM SUCESSO
echo ========================================
echo.

echo Atualizando banco de dados...
%PYTHON_CMD% atualizar_banco.py
if %errorlevel% neq 0 (
    echo AVISO: Erro na atualizacao do banco de dados
    echo O sistema pode nao funcionar corretamente
    echo.
)

echo.
echo ========================================
echo    INICIANDO SISTEMA FINANCEIRO
echo ========================================
echo.
echo Servidor iniciando na porta 8002...
echo.
echo FUNCIONALIDADES DO SISTEMA:
echo    - Cliente/Fornecedor nos lancamentos
echo    - Campos de data digitaveis
echo    - Relatorios completos
echo    - Acoes em lote
echo    - Todas as funcionalidades anteriores
echo.
echo Acesse: http://localhost:8002
echo.
echo Credenciais do Administrador:
echo    Email: admin@sistema.com
echo    Senha: admin123
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

%PYTHON_CMD% app.py

echo.
echo Servidor finalizado.
pause

