def replace_in_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replacements for string literals and context-specific terms
    replacements = {
        "'receita'": "'entrada'",
        "'despesa'": "'saida'",
        "receitas": "entradas",
        "despesas": "saidas",
        "receita_total": "entrada_total",
        "despesa_total": "saida_total",
        "receita_realizada": "entrada_realizada",
        "despesa_realizada": "saida_realizada",
        "receita_a_vencer": "entrada_a_vencer",
        "despesa_a_vencer": "saida_a_vencer",
        "receita_vencida": "entrada_vencida",
        "despesa_vencida": "saida_vencida",
        "receita_agendada": "entrada_agendada",
        "despesa_agendada": "saida_agendada",
        "total_receitas": "total_entradas",
        "total_despesas": "total_saidas",
        "receber_hoje": "entrada_hoje",
        "pagar_hoje": "saida_hoje",
        "receber_mes": "entrada_mes",
        "pagar_mes": "saida_mes",
        "total_receber_hoje": "total_entrada_hoje",
        "total_pagar_hoje": "total_saida_hoje",
        "total_receber_mes": "total_entrada_mes",
        "total_pagar_mes": "total_saida_mes",
        "todas_contas_receber": "todas_contas_entrada",
        "todas_contas_pagar": "todas_contas_saida"
    }

    # Be careful with word boundaries if needed, but these seem specific enough.
    import re
    
    # We use a sort by length descending to replace longer phrases first
    for old, new in sorted(replacements.items(), key=lambda x: len(x[0]), reverse=True):
        # Escaping old for safe regex (though these don't have special chars)
        content = re.sub(r'\b' + re.escape(old) + r'\b', new, content)
        # Also handle the quoted versions if they weren't caught
        if not old.startswith("'"):
             content = re.sub(r"'" + re.escape(old) + r"'", "'" + new + "'", content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    replace_in_file('app.py')
    print("Replacements in app.py complete.")
