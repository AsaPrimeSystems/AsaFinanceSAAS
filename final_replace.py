import os
import re

def aggressive_replace(content):
    # Mapping for different cases
    mappings = [
        # Multi-word/Specific variable patterns first
        ("total_receitas", "total_entradas"),
        ("total_despesas", "total_saidas"),
        ("receita_total", "entrada_total"),
        ("despesa_total", "saida_total"),
        ("receita_realizada", "entrada_realizada"),
        ("despesa_realizada", "saida_realizada"),
        ("receitas_realizadas", "entradas_realizadas"),
        ("despesas_realizadas", "saidas_realizadas"),
        ("receita_a_vencer", "entrada_a_vencer"),
        ("despesa_a_vencer", "saida_a_vencer"),
        ("receitas_a_vencer", "entradas_a_vencer"),
        ("despesas_a_vencer", "saidas_a_vencer"),
        ("receita_vencida", "entrada_vencida"),
        ("despesa_vencida", "saida_vencida"),
        ("receitas_vencidas", "entradas_vencidas"),
        ("despesas_vencidas", "saidas_vencidas"),
        ("receita_agendada", "entrada_agendada"),
        ("despesa_agendada", "saida_agendada"),
        ("receitas_agendadas", "entradas_agendadas"),
        ("despesas_agendadas", "saidas_agendadas"),
        ("todas_contas_receber", "todas_contas_entrada"),
        ("todas_contas_pagar", "todas_contas_saida"),
        
        # Single words with case variations
        ("Receitas", "Entradas"),
        ("Despesas", "Saídas"),
        ("Receita", "Entrada"),
        ("Despesa", "Saída"),
        ("RECEITAS", "ENTRADAS"),
        ("DESPESAS", "SAÍDAS"),
        ("RECEITA", "ENTRADA"),
        ("DESPESA", "SAÍDA"),
        ("receitas", "entradas"),
        ("despesas", "saidas"),
        ("receita", "entrada"),
        ("despesa", "saida"),
    ]
    
    for old, new in mappings:
        # Use word boundaries to avoid partial matches like 'receitar' (if it existed)
        # But be careful with non-ascii characters in \b.
        # For simplicity and given the context, we can use a regex that handles word boundaries.
        content = re.sub(r'\b' + re.escape(old) + r'\b', new, content)
        
    return content

def process_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = aggressive_replace(content)
        
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
    return False

if __name__ == "__main__":
    # Process app.py
    if process_file('app.py'):
        print("Updated app.py")
    
    # Process all templates
    template_count = 0
    for root, dirs, files in os.walk('templates'):
        for file in files:
            if file.endswith('.html'):
                if process_file(os.path.join(root, file)):
                    template_count += 1
    print(f"Updated {template_count} templates")

    # Process static js/css
    asset_count = 0
    for root, dirs, files in os.walk('static'):
        for file in files:
            if file.endswith(('.js', '.css')):
                if process_file(os.path.join(root, file)):
                    asset_count += 1
    print(f"Updated {asset_count} assets")
