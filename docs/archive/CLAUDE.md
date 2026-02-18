# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SAAS-GESTAO-FINANCEIRA is a multi-tenant financial management system built with Flask that supports three distinct account types: **Empresa** (companies), **Pessoa Física** (individuals), and **Contador/BPO** (accountants). The system includes subscription-based access control, linking mechanisms between accountants and their clients, and comprehensive financial management features.

## Running the Application

### Start the server
```bash
python app.py
```
Or use the Windows batch file:
```bash
INICIAR_SISTEMA.bat
```

The application runs on **port 8002** by default (not port 5000).

### Create/Reset admin user
```bash
python criar_admin.py
```

### Update database schema
```bash
python atualizar_banco.py
```

### Admin credentials
- **Type**: Empresa (CNPJ)
- **CNPJ**: 00.000.000/0000-00
- **Username**: admin
- **Password**: admin123

## Architecture Overview

### Multi-Tenant Account System

The system uses a unique architecture where the `Empresa` model serves as the base for all account types, distinguished by `tipo_conta`:

1. **admin** - System administrators (unlimited access, no subscription control)
2. **empresa** - Companies (PJ) with subscription control
3. **pessoa_fisica** - Individuals (PF) with subscription control
4. **contador_bpo** - Accountants/BPOs who can link to multiple client accounts

Each account type has a primary user in the `Usuario` table. The `empresa_id` foreign key links all data to the owning account.

### Key Database Models

**Core Account Structure:**
- `Empresa` - Base model for all account types (PJ/PF/Contador/Admin)
- `Usuario` - Users belonging to an account (primary user + additional users)
- `CategoriaUsuario` - Custom user roles with granular permissions
- `Permissao` / `PermissaoCategoria` - Permission system for users/categories

**Linking System (Contador ↔ Clients):**
- `VinculoContador` - Links accountants to client accounts (status: pendente/autorizado/rejeitado)
- `SubUsuarioContador` - Sub-users created by accountants
- `PermissaoSubUsuario` - Controls which linked companies each sub-user can access

**Financial Operations:**
- `Lancamento` - Financial entries (receitas/despesas) with tracking fields
- `Venda` / `Compra` - Sales/purchases that auto-generate lancamentos
- `Parcela` - Installment payments for vendas/compras
- `ContaCaixa` - Multiple bank/cash accounts
- `Cliente` / `Fornecedor` - Customers and suppliers
- `Produto` / `Servico` - Products and services

**Data Integrity:**
- `Vinculo` - Pivot table for entity relationships
- `EventLog` - Event registry with hash-based deduplication
- `Importacao` - Import history with rollback capability

### Subscription Control

All non-admin accounts have `dias_assinatura` (days remaining):
- Badge colors: green (>30 days), yellow (7-30), red (1-6), blocked (0)
- Auto-calculated from `data_inicio_assinatura` if set
- Admin can manage via `/admin/painel-completo`

### Contador/BPO Workflow

1. **Link Request**: Contador requests link via `/contador/vincular-empresa` (creates `VinculoContador` with status=pendente)
2. **Authorization**: Client sees pending requests in `/vinculos/pendentes` and can authorize/reject
3. **Access**: Once authorized, contador sees client data in consolidated dashboard at `/contador/dashboard`
4. **Sub-users**: Contador can create sub-users with granular permissions to specific linked companies

### Session Context Switching

The system uses `session['acesso_contador']` and `session['empresa_vinculada_id']` to allow accountants to switch context between their own account and linked client accounts. Use `obter_empresa_id_sessao()` helper function to get the correct empresa_id.

## Frontend Structure

### JavaScript Architecture

- **Core**: `static/js/app.js` - Global initialization, button management, telemetry
- **Module Pattern**: Each feature has dedicated JS in `static/js/{modulo}/{modulo}.js`
- **Page Initializers**: `static/js/pages/{page}-init.js` for page-specific setup
- **Utilities**: `static/js/utils/` for common functions (security, page-loader, subscription-badge)

### CSS Organization

- **Base**: `static/css/style.css` - Main stylesheet
- **Enhancements**: `static/css/professional-enhancements.css` - Subtle UI refinements (v2.0)
- **Specialized**: Component-specific stylesheets (admin-usuarios, relatorios-profissionais, etc.)

**IMPORTANT**: The professional-enhancements.css v2.0 is intentionally minimal (116 lines) to avoid layout conflicts. Do not add aggressive global styles.

### Bootstrap Integration

The system uses Bootstrap 5 for UI components. JavaScript in app.js specifically avoids intercepting Bootstrap-controlled elements (buttons with `data-bs-*` attributes or inside `.modal`).

## Database Conventions

### Multi-tenancy
Every data table (except `Empresa`) includes `usuario_id` and/or `empresa_id` for proper data isolation. Always filter queries by the current user's empresa_id.

### Audit Trail
`Lancamento` includes tracking fields:
- `usuario_criacao_id` - User who created the entry
- `usuario_ultima_edicao_id` - Last user to edit
- `data_ultima_edicao` - Timestamp of last edit

### Event Deduplication
Use `EventLog` with `hash_evento` (SHA256) to prevent duplicate processing of sales/purchases when they generate financial entries or update inventory.

## Important Routes

### Authentication
- `/login` - Login page
- `/registro` - New account registration
- `/logout` - Logout

### Admin Panel
- `/admin/painel-completo` - Main admin dashboard (view/manage all accounts)
- `/admin/editar-dias` - Manage subscription days

### Contador Dashboard
- `/contador/dashboard` - Consolidated dashboard with all linked companies
- `/contador/vincular-empresa` - Request link to client
- `/contador/criar-sub-usuario` - Create sub-user

### Vinculos Management
- `/vinculos/pendentes` - View pending link requests
- `/vinculos/<id>/autorizar` - Authorize link
- `/vinculos/<id>/rejeitar` - Reject link

### Main Features (Empresa/PF)
- `/dashboard` - Main dashboard
- `/lancamentos` - Financial entries
- `/clientes` - Customer management
- `/fornecedores` - Supplier management
- `/vendas` - Sales management
- `/compras` - Purchase management
- `/estoque` - Inventory control
- `/relatorios` - Reports (Excel/PDF generation)

## Development Guidelines

### When Adding Features

1. **Respect multi-tenancy**: Always filter by `empresa_id` from session
2. **Check subscription**: Non-admin accounts must have `dias_assinatura > 0`
3. **Use audit fields**: Set `usuario_criacao_id` on create, `usuario_ultima_edicao_id` on update
4. **Prevent duplicates**: Use `EventLog` with hash for idempotency when creating linked records
5. **Session context**: Use `obter_empresa_id_sessao()` when in contador context-switching scenarios

### Database Migrations

The app uses auto-migration on startup (see app.py lines 64-214). To add columns:
1. Check if column exists using `PRAGMA table_info(table_name)`
2. Use `ALTER TABLE` to add column
3. Run data migration if needed
4. Commit changes

Example pattern (see app.py):
```python
result = db.session.execute(text("PRAGMA table_info(table_name)"))
columns = [row[1] for row in result.fetchall()]
if 'new_column' not in columns:
    db.session.execute(text("ALTER TABLE table_name ADD COLUMN new_column TYPE"))
    db.session.commit()
```

### JavaScript Modules

When adding new module JS files:
1. Mark Bootstrap-controlled buttons with `data-no-intercept` to avoid conflicts
2. Use `console.log` with emoji prefixes for consistency (🚀 init, ✅ success, ❌ error)
3. Follow the telemetry pattern in app.js for button clicks
4. Load module scripts in base.html or page-specific templates

### Report Generation

The system uses:
- **Excel**: `openpyxl` library
- **PDF**: `reportlab` library

Reports are generated in-memory (BytesIO) and sent via `send_file()`. See routes in app.py around `/relatorios/*`.

## Common Tasks

### Add a new financial category
Edit the category options in the lancamentos form template and update any validation logic.

### Create a new account type
Add value to `tipo_conta` enum in `Empresa` model, update login logic, and create dedicated dashboard route.

### Extend permissions system
Add new module/action combinations to `Permissao` and `PermissaoCategoria` models, then update authorization checks in routes.

### Debug subscription issues
Check `dias_assinatura` and `data_inicio_assinatura` fields in `Empresa` table. Admin can override via painel-completo.

### Fix contador linking
Verify `VinculoContador` status and ensure `empresa_id` matches on both sides. Check that `tipo_conta='contador_bpo'` for accountant.

## Technical Stack

- **Backend**: Flask 2.3.3, SQLAlchemy 3.0.5
- **Database**: SQLite (file: `instance/saas_financeiro_v2.db`)
- **Frontend**: Bootstrap 5, Vanilla JavaScript (no frameworks)
- **Security**: Werkzeug password hashing, session management (24h lifetime)
- **Reports**: ReportLab (PDF), OpenPyXL (Excel)
- **Scheduling**: APScheduler for background tasks
