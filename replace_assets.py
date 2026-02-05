import os

def replace_in_assets(directory):
    replacements = {
        "Receita": "Entrada",
        "Receitas": "Entradas",
        "Despesa": "Saída",
        "Despesas": "Saídas",
        "receita": "entrada",
        "despesa": "saida",
        "total_receitas": "total_entradas",
        "total_despesas": "total_saidas",
        "receita-total": "entrada-total",
        "despesa-total": "saida-total",
        "receita-realizada": "entrada-realizada",
        "despesa-realizada": "saida-realizada",
        "receita-a-vencer": "entrada-a-vencer",
        "despesa-a-vencer": "saida-a-vencer",
        "receita-vencida": "entrada-vencida",
        "despesa-vencida": "saida-vencida",
        "receita-agendada": "entrada-agendada",
        "despesa-agendada": "saida-agendada"
    }

    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.js', '.css')):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Sort by length descending to replace longer phrases first
                for old, new in sorted(replacements.items(), key=lambda x: len(x[0]), reverse=True):
                    # For JS/CSS we need to be careful with classes and variable names
                    # Simple replace for now, as these are very specific
                    content = content.replace(old, new)

                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)

if __name__ == "__main__":
    replace_in_assets('static/js')
    replace_in_assets('static/css')
    print("Replacements in static assets complete.")
