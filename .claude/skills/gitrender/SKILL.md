---
name: gitrender
description: Deploy to GitHub and Render - commits all changes, pushes to GitHub, and triggers Render auto-deployment
disable-model-invocation: true
allowed-tools: Bash(git *)
---

# Deploy to GitHub + Render

Execute the following steps in sequence:

1. **Check git status**: Run `git status` to see what files will be committed

2. **Stage all changes**: Run `git add .`

3. **Commit changes**: Run `git commit -m "$ARGUMENTS"` using the provided commit message
   - If no message provided, use: "Deploy: Atualização do sistema"

4. **Push to GitHub**: Run `git push origin main`

5. **Confirm deployment**: Print success message:
   ```
   ✅ Deploy concluído!
   📤 Changes pushed to GitHub
   🚀 Render detectará automaticamente e fará o deploy
   💾 Banco de dados permanece intacto (apenas código atualizado)
   ```

**IMPORTANT**:
- Run each command and verify success before proceeding
- If any step fails, stop and report the error
- Never modify the database - only deploy code changes
- The Render PostgreSQL database is separate and won't be affected
