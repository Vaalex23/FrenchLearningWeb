import json

# Función para generar el gerundio basado en la raíz de "nous"
def generate_gerund(conjugations, infinitive):
    irregulars = {
        "être": "étant",
        "avoir": "ayant",
        "savoir": "sachant"
    }
    if infinitive in irregulars:
        return irregulars[infinitive]
    else:
        # Tomar la conjugación de "nous" para la raíz
        nous_form = conjugations.get("nous", "")
        if nous_form:
            root = nous_form[:-3]  # Quitar "ons" de la forma de "nous"
            return f"{root}ant"
        else:
            return None  # Si no hay forma de "nous", devolver None

# Cargar el archivo JSON de entrada
input_file = "C:/Users/Vladi/Desktop/FrenchLearning/JsonFiles/Verbs/verbos_frances_present_simple.json"
output_file = "C:/Users/Vladi/Desktop/FrenchLearning/JsonFiles/Verbs/verbos_frances_gerondif.json"

with open(input_file, "r", encoding="utf-8") as file:
    verbs_data = json.load(file)

# Generar gerundio con estructura uniforme
gerundio_data = []

for verb in verbs_data:
    infinitive = verb["infinitivo"]
    translation = verb["traduccion"]
    conjugations = verb["conjugaciones"]
    gerundio = generate_gerund(conjugations, infinitive)
    
    if gerundio:
        gerundio_data.append({
            "infinitivo": infinitive,
            "gerundio": gerundio,  # Incluye la forma del gerundio
            "traduccion": translation
        })

# Guardar el resultado en un archivo JSON
with open(output_file, "w", encoding="utf-8") as output_file:
    json.dump(gerundio_data, output_file, ensure_ascii=False, indent=4)

print(f"El archivo '{output_file.name}' se ha generado correctamente.")
