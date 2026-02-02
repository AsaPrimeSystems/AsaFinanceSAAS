# ============================================================================
# ENDPOINT PARA BUSCA EM /admin/usuarios
# Modificar a rota admin_usuarios existente (linhas ~1624-1678)
# ============================================================================

from unidecode import unidecode  # Adicionar ao imports: pip install unidecode

@app.route('/admin/usuarios')
def admin_usuarios():
    """Página de gerenciamento de usuários com busca"""
    if 'usuario_id' not in session:
        return redirect(url_for('login'))
    
    usuario = Usuario.query.options(db.joinedload(Usuario.empresa)).get(session['usuario_id'])
    if not usuario or usuario.tipo != 'admin':
        return redirect(url_for('dashboard'))
    
    try:
        # Obter parâmetro de busca
        search_query = request.args.get('search', '').strip()
        
        # Buscar todas as empresas/pessoas cadastradas (exceto admin)
        try:
            empresas = Empresa.query.filter(Empresa.tipo_conta != 'admin').order_by(Empresa.id.desc()).all()
        except Exception as e:
            app.logger.error(f"Erro ao buscar empresas com ordenação: {str(e)}")
            empresas = Empresa.query.filter(Empresa.tipo_conta != 'admin').all()
        
        # Aplicar filtro de busca se fornecido
        if search_query:
            search_lower = unidecode(search_query.lower())
            empresas_filtradas = []
            
            for empresa in empresas:
                # Verificar em múltiplos campos
                campos_busca = [
                    unidecode(empresa.razao_social.lower()) if empresa.razao_social else '',
                    unidecode(empresa.nome_fantasia.lower()) if empresa.nome_fantasia else '',
                    unidecode(empresa.email.lower()) if empresa.email else '',
                    unidecode(empresa.telefone.lower()) if empresa.telefone else '',
                    (empresa.cpf or '').lower(),
                    (empresa.cnpj or '').lower()
                ]
                
                # Se algum campo contém a busca, incluir
                if any(search_lower in campo for campo in campos_busca):
                    empresas_filtradas.append(empresa)
            
            empresas = empresas_filtradas
        
        # Buscar usuários de cada empresa e atualizar dias de assinatura
        empresas_com_usuarios = []
        for empresa in empresas:
            try:
                # Atualizar dias de assinatura automaticamente
                atualizar_dias_assinatura(empresa)
                
                usuarios_empresa = Usuario.query.filter_by(empresa_id=empresa.id).order_by(Usuario.nome).all()
            except Exception as e:
                app.logger.error(f"Erro ao buscar usuários da empresa {empresa.id}: {str(e)}")
                usuarios_empresa = Usuario.query.filter_by(empresa_id=empresa.id).all()
            
            empresas_com_usuarios.append({
                'empresa': empresa,
                'usuarios': usuarios_empresa
            })
        
        # Estatísticas
        stats = {
            'total': len(empresas),
            'empresas': len([e for e in empresas if e.tipo_conta == 'empresa']),
            'pessoas_fisicas': len([e for e in empresas if e.tipo_conta == 'pessoa_fisica']),
            'contadores': len([e for e in empresas if e.tipo_conta == 'contador_bpo']),
            'ativas': len([e for e in empresas if e.ativo]),
            'inativas': len([e for e in empresas if not e.ativo])
        }
        
        return render_template('admin_usuarios.html', 
                             usuario=usuario, 
                             empresas_com_usuarios=empresas_com_usuarios, 
                             stats=stats,
                             search_query=search_query)
    except Exception as e:
        app.logger.error(f"Erro na rota admin_usuarios: {str(e)}")
        import traceback
        app.logger.error(traceback.format_exc())
        flash(f'Erro ao carregar dados: {str(e)}', 'error')
        # Retornar template com dados vazios em caso de erro
        return render_template('admin_usuarios.html', 
                             usuario=usuario, 
                             empresas_com_usuarios=[], 
                             stats={'total': 0, 'empresas': 0, 'pessoas_fisicas': 0, 'contadores': 0, 'ativas': 0, 'inativas': 0},
                             search_query='')
