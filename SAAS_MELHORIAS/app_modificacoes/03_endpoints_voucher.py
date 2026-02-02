# ============================================================================
# ENDPOINTS PARA SISTEMA DE VOUCHERS
# Adicionar ao app.py após as rotas de admin existentes
# ============================================================================

# ============================================================================
# ROTAS DE VOUCHERS (ADMIN)
# ============================================================================

@app.route('/admin/vouchers', methods=['GET'])
def listar_vouchers():
    """Lista todos os vouchers em formato JSON para o modal"""
    if 'usuario_id' not in session:
        return jsonify({'erro': 'Não autenticado'}), 401
    
    usuario = Usuario.query.get(session['usuario_id'])
    if not usuario or usuario.tipo != 'admin':
        return jsonify({'erro': 'Acesso negado'}), 403
    
    try:
        vouchers = Voucher.query.order_by(Voucher.data_criacao.desc()).all()
        
        dados = []
        for v in vouchers:
            dados.append({
                'id': v.id,
                'codigo': v.codigo,
                'dias_assinatura': v.dias_assinatura,
                'validade': v.validade.strftime('%d/%m/%Y %H:%M') if v.validade else '',
                'ativo': v.ativo,
                'pode_usar': v.pode_usar(),
                'usos': len(v.usos),
                'data_criacao': v.data_criacao.strftime('%d/%m/%Y %H:%M') if v.data_criacao else ''
            })
        
        return jsonify({'sucesso': True, 'vouchers': dados}), 200
    except Exception as e:
        app.logger.error(f"Erro ao listar vouchers: {str(e)}")
        return jsonify({'erro': str(e)}), 500


@app.route('/admin/vouchers', methods=['POST'])
def criar_voucher():
    """Cria um novo voucher"""
    if 'usuario_id' not in session:
        return jsonify({'erro': 'Não autenticado'}), 401
    
    usuario = Usuario.query.get(session['usuario_id'])
    if not usuario or usuario.tipo != 'admin':
        return jsonify({'erro': 'Acesso negado'}), 403
    
    try:
        dados = request.get_json()
        
        # Validações
        if not dados.get('codigo'):
            return jsonify({'erro': 'Código é obrigatório'}), 400
        
        if not dados.get('dias_assinatura') or int(dados.get('dias_assinatura', 0)) <= 0:
            return jsonify({'erro': 'Dias de assinatura deve ser maior que 0'}), 400
        
        if not dados.get('validade'):
            return jsonify({'erro': 'Validade é obrigatória'}), 400
        
        # Verificar se código já existe
        if Voucher.query.filter_by(codigo=dados['codigo']).first():
            return jsonify({'erro': 'Código de voucher já existe'}), 400
        
        # Converter data
        try:
            validade = datetime.strptime(dados['validade'], '%Y-%m-%d')
        except ValueError:
            return jsonify({'erro': 'Formato de data inválido (use YYYY-MM-DD)'}), 400
        
        # Criar voucher
        novo_voucher = Voucher(
            codigo=dados['codigo'].upper().strip(),
            dias_assinatura=int(dados['dias_assinatura']),
            validade=validade,
            ativo=True,
            criado_por=usuario.id
        )
        
        db.session.add(novo_voucher)
        db.session.commit()
        
        return jsonify({
            'sucesso': True,
            'mensagem': f'Voucher {novo_voucher.codigo} criado com sucesso',
            'voucher': {
                'id': novo_voucher.id,
                'codigo': novo_voucher.codigo,
                'dias_assinatura': novo_voucher.dias_assinatura,
                'validade': novo_voucher.validade.strftime('%d/%m/%Y %H:%M'),
                'ativo': novo_voucher.ativo
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erro ao criar voucher: {str(e)}")
        return jsonify({'erro': str(e)}), 500


@app.route('/admin/vouchers/<int:voucher_id>/toggle', methods=['PATCH'])
def toggle_voucher(voucher_id):
    """Ativa ou desativa um voucher"""
    if 'usuario_id' not in session:
        return jsonify({'erro': 'Não autenticado'}), 401
    
    usuario = Usuario.query.get(session['usuario_id'])
    if not usuario or usuario.tipo != 'admin':
        return jsonify({'erro': 'Acesso negado'}), 403
    
    try:
        voucher = Voucher.query.get(voucher_id)
        if not voucher:
            return jsonify({'erro': 'Voucher não encontrado'}), 404
        
        voucher.ativo = not voucher.ativo
        db.session.commit()
        
        status = 'ativado' if voucher.ativo else 'desativado'
        return jsonify({
            'sucesso': True,
            'mensagem': f'Voucher {status} com sucesso',
            'ativo': voucher.ativo
        }), 200
    
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erro ao toggle voucher: {str(e)}")
        return jsonify({'erro': str(e)}), 500


@app.route('/admin/vouchers/aplicar', methods=['POST'])
def aplicar_voucher():
    """Aplica um voucher a uma empresa"""
    if 'usuario_id' not in session:
        return jsonify({'erro': 'Não autenticado'}), 401
    
    usuario = Usuario.query.get(session['usuario_id'])
    if not usuario or usuario.tipo != 'admin':
        return jsonify({'erro': 'Acesso negado'}), 403
    
    try:
        dados = request.get_json()
        
        if not dados.get('codigo'):
            return jsonify({'erro': 'Código do voucher é obrigatório'}), 400
        
        if not dados.get('empresa_id'):
            return jsonify({'erro': 'ID da empresa é obrigatório'}), 400
        
        # Buscar voucher
        voucher = Voucher.query.filter_by(codigo=dados['codigo'].upper().strip()).first()
        if not voucher:
            return jsonify({'erro': 'Voucher não encontrado'}), 404
        
        # Validar voucher
        if not voucher.ativo:
            return jsonify({'erro': 'Voucher está inativo'}), 400
        
        if datetime.utcnow() > voucher.validade:
            return jsonify({'erro': 'Voucher expirado'}), 400
        
        if not voucher.pode_usar():
            return jsonify({'erro': 'Voucher já foi utilizado'}), 400
        
        # Buscar empresa
        empresa = Empresa.query.get(dados['empresa_id'])
        if not empresa:
            return jsonify({'erro': 'Empresa não encontrada'}), 404
        
        # Não permitir aplicar em admin
        if empresa.tipo_conta == 'admin':
            return jsonify({'erro': 'Não é permitido aplicar voucher em conta admin'}), 400
        
        # Verificar se já foi usado para esta empresa
        uso_existente = VoucherUso.query.filter_by(
            voucher_id=voucher.id,
            empresa_id=empresa.id
        ).first()
        if uso_existente:
            return jsonify({'erro': 'Este voucher já foi aplicado a esta empresa'}), 400
        
        # Aplicar voucher
        dias_anteriores = empresa.dias_assinatura or 0
        
        if dias_anteriores == 0:
            # Se expirado, setar data de início
            empresa.dias_assinatura = voucher.dias_assinatura
            empresa.data_inicio_assinatura = datetime.utcnow()
        else:
            # Se ativo, somar dias
            empresa.dias_assinatura = dias_anteriores + voucher.dias_assinatura
        
        # Registrar uso
        uso = VoucherUso(
            voucher_id=voucher.id,
            empresa_id=empresa.id,
            dias_creditados=voucher.dias_assinatura,
            usuario_admin_id=usuario.id,
            observacoes=f'Voucher {voucher.codigo} aplicado automaticamente'
        )
        
        db.session.add(uso)
        db.session.commit()
        
        return jsonify({
            'sucesso': True,
            'mensagem': f'Voucher aplicado com sucesso! {voucher.dias_assinatura} dias creditados.',
            'empresa': {
                'id': empresa.id,
                'razao_social': empresa.razao_social,
                'dias_anteriores': dias_anteriores,
                'dias_creditados': voucher.dias_assinatura,
                'dias_atuais': empresa.dias_assinatura
            }
        }), 200
    
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erro ao aplicar voucher: {str(e)}")
        return jsonify({'erro': str(e)}), 500


@app.route('/admin/vouchers/<int:voucher_id>', methods=['DELETE'])
def deletar_voucher(voucher_id):
    """Deleta um voucher (apenas se não foi usado)"""
    if 'usuario_id' not in session:
        return jsonify({'erro': 'Não autenticado'}), 401
    
    usuario = Usuario.query.get(session['usuario_id'])
    if not usuario or usuario.tipo != 'admin':
        return jsonify({'erro': 'Acesso negado'}), 403
    
    try:
        voucher = Voucher.query.get(voucher_id)
        if not voucher:
            return jsonify({'erro': 'Voucher não encontrado'}), 404
        
        # Não permitir deletar se foi usado
        if len(voucher.usos) > 0:
            return jsonify({'erro': 'Não é possível deletar um voucher que já foi utilizado'}), 400
        
        db.session.delete(voucher)
        db.session.commit()
        
        return jsonify({
            'sucesso': True,
            'mensagem': 'Voucher deletado com sucesso'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erro ao deletar voucher: {str(e)}")
        return jsonify({'erro': str(e)}), 500


@app.route('/admin/vouchers/usos', methods=['GET'])
def listar_usos_vouchers():
    """Lista histórico de uso de vouchers"""
    if 'usuario_id' not in session:
        return jsonify({'erro': 'Não autenticado'}), 401
    
    usuario = Usuario.query.get(session['usuario_id'])
    if not usuario or usuario.tipo != 'admin':
        return jsonify({'erro': 'Acesso negado'}), 403
    
    try:
        usos = VoucherUso.query.order_by(VoucherUso.data_uso.desc()).all()
        
        dados = []
        for uso in usos:
            dados.append({
                'id': uso.id,
                'codigo_voucher': uso.voucher.codigo,
                'empresa': uso.empresa.razao_social,
                'dias_creditados': uso.dias_creditados,
                'data_uso': uso.data_uso.strftime('%d/%m/%Y %H:%M'),
                'admin': uso.usuario_admin.nome if uso.usuario_admin else 'Sistema'
            })
        
        return jsonify({'sucesso': True, 'usos': dados}), 200
    except Exception as e:
        app.logger.error(f"Erro ao listar usos de vouchers: {str(e)}")
        return jsonify({'erro': str(e)}), 500
