import json

# Función para obtener el auxiliar en imperfecto
def get_imperfect_auxiliary(auxiliary):
    auxiliaries_imperfect = {
        "ai": "avais",
        "as": "avais",
        "a": "avait",
        "avons": "avions",
        "avez": "aviez",
        "ont": "avaient",
        "suis": "étais",
        "es": "étais",
        "est": "était",
        "sommes": "étions",
        "êtes": "étiez",
        "sont": "étaient"
    }
    return auxiliaries_imperfect.get(auxiliary, auxiliary)

# Función para procesar las conjugaciones, incluyendo verbos reflexivos
def parse_reflexive_conjugation(conjugation):
    parts = conjugation.split()
    if len(parts) > 1 and parts[0] in ["me", "te", "se", "nous", "vous"]:
        # Caso reflexivo
        reflexive_pronoun = parts[0]
        auxiliary = parts[1]  # El auxiliar es la segunda parte
        past_participle = " ".join(parts[2:])
        imperfect_auxiliary = get_imperfect_auxiliary(auxiliary)
        return f"{reflexive_pronoun} {imperfect_auxiliary} {past_participle}"
    elif len(parts) > 0:
        # Caso no reflexivo
        auxiliary = parts[0]
        past_participle = " ".join(parts[1:])
        imperfect_auxiliary = get_imperfect_auxiliary(auxiliary)
        return f"{imperfect_auxiliary} {past_participle}"
    else:
        # Caso vacío o mal formado
        return conjugation  # Devuelve como está

# Cargar el archivo JSON de entrada
input_file = "C:/Users/Vladi/Desktop/FrenchLearning/JsonFiles/Verbs/verbos_frances_passe_compose.json"
output_file = "C:/Users/Vladi/Desktop/FrenchLearning/JsonFiles/Verbs/verbos_frances_plus_que_parfait.json"


with open(input_file, "r", encoding="utf-8") as file:
    verbs_data = json.load(file)

# Procesar cada verbo y generar el plus-que-parfait
plus_que_parfait_data = []

for verb in verbs_data:
    infinitive = verb["infinitivo"]
    translation = verb["traduccion"]
    conjugations_pc = verb["conjugaciones"]

    conjugations_pqp = {}
    for pronoun, pc_conjugation in conjugations_pc.items():
        conjugations_pqp[pronoun] = parse_reflexive_conjugation(pc_conjugation)

    plus_que_parfait_data.append({
        "infinitivo": infinitive,
        "conjugaciones": conjugations_pqp,
        "traduccion": translation
    })

# Guardar el resultado en un archivo JSON
with open(output_file, "w", encoding="utf-8") as output_file:
    json.dump(plus_que_parfait_data, output_file, ensure_ascii=False, indent=4)

print(f"El archivo '{output_file.name}' se ha generado correctamente.")
