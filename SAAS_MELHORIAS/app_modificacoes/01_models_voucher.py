# ============================================================================
# NOVOS MODELOS PARA SISTEMA DE VOUCHERS
# Adicionar ao app.py após a linha ~550 (após SubUsuarioContador)
# ============================================================================

class Voucher(db.Model):
    """Modelo para vouchers de assinatura"""
    __tablename__ = 'voucher'
    
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(50), unique=True, nullable=False, index=True)
    dias_assinatura = db.Column(db.Integer, nullable=False)  # Dias a creditar
    validade = db.Column(db.DateTime, nullable=False)  # Data de expiração
    ativo = db.Column(db.Boolean, default=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    criado_por = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=True)
    
    # Relacionamentos
    criador = db.relationship('Usuario', foreign_keys=[criado_por], backref='vouchers_criados')
    usos = db.relationship('VoucherUso', backref='voucher', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Voucher {self.codigo}>'
    
    def esta_valido(self):
        """Verifica se o voucher está válido (ativo e não expirado)"""
        return self.ativo and datetime.utcnow() < self.validade
    
    def pode_usar(self):
        """Verifica se o voucher pode ser usado (válido e não foi usado)"""
        if not self.esta_valido():
            return False
        # Verificar se já foi usado (uso único global)
        return len(self.usos) == 0


class VoucherUso(db.Model):
    """Modelo para auditoria de uso de vouchers"""
    __tablename__ = 'voucher_uso'
    
    id = db.Column(db.Integer, primary_key=True)
    voucher_id = db.Column(db.Integer, db.ForeignKey('voucher.id'), nullable=False)
    empresa_id = db.Column(db.Integer, db.ForeignKey('empresa.id'), nullable=False)
    data_uso = db.Column(db.DateTime, default=datetime.utcnow)
    dias_creditados = db.Column(db.Integer, nullable=False)
    usuario_admin_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=True)  # Admin que aplicou
    observacoes = db.Column(db.Text, nullable=True)
    
    # Relacionamentos
    empresa = db.relationship('Empresa', backref='vouchers_usados')
    usuario_admin = db.relationship('Usuario', foreign_keys=[usuario_admin_id], backref='vouchers_aplicados')
    
    def __repr__(self):
        return f'<VoucherUso {self.voucher_id} -> {self.empresa_id}>'
