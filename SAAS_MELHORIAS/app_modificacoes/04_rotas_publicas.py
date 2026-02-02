# ============================================================================
# ROTAS PARA LANDING PAGE E PÁGINA DE PREÇOS
# Adicionar ao app.py após as rotas de admin
# ============================================================================

# ============================================================================
# ROTAS PÚBLICAS (SEM AUTENTICAÇÃO)
# ============================================================================

@app.route('/')
def landing():
    """Landing page pública"""
    # Se usuário já está autenticado, redirecionar para dashboard
    if 'usuario_id' in session:
        return redirect(url_for('dashboard'))
    
    return render_template('landing.html')


@app.route('/precos')
def precos():
    """Página de preços pública"""
    # Se usuário já está autenticado, redirecionar para dashboard
    if 'usuario_id' in session:
        return redirect(url_for('dashboard'))
    
    return render_template('precos.html')
