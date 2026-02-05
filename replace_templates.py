import os
import re

def replace_in_templates(directory):
    replacements = {
        "Receita": "Entrada",
        "Receitas": "Entradas",
        "Despesa": "Saída",
        "Despesas": "Saídas",
        "receita": "entrada",
        "despesa": "saida",
        "total_receitas": "total_entradas",
        "total_despesas": "total_saidas",
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
        "receitas_realizadas": "entradas_realizadas",
        "despesas_realizadas": "saidas_realizadas",
        "receitas_a_vencer": "entradas_a_vencer",
        "despesas_a_vencer": "saidas_a_vencer",
        "receitas_vencidas": "entradas_vencidas",
        "despesas_vencidas": "saidas_vencidas",
        "receitas_agendadas": "entradas_agendadas",
        "despesas_agendadas": "saidas_agendadas",
        "todas_contas_receber": "todas_contas_entrada",
        "todas_contas_pagar": "todas_contas_saida",
        "Nova Transferência": "Nova Transferência entre contas"
    }

    # Files to skip or patterns to be careful with
    # For now, we apply to all .html files
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html'):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Sort by length descending to replace longer phrases first
                for old, new in sorted(replacements.items(), key=lambda x: len(x[0]), reverse=True):
                    # We use a word boundary \b but be careful with non-ascii like Saída
                    # In many contexts, these terms are within HTML tags or attributes
                    # For Saída/Despesa, the \b might be tricky with non-ascii.
                    # We'll use a simpler replace for now but try to avoid partial matches
                    content = content.replace(old, new)

                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)

if __name__ == "__main__":
    replace_in_templates('templates')
    print("Replacements in templates complete.")
