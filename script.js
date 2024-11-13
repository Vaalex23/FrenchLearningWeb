async function cargarVerbos() {
    const response = await fetch('verbos_frances_present_simple.json');
    const verbos = await response.json();
    
    // Seleccionar un verbo al azar de la lista
    const verboAleatorio = verbos[Math.floor(Math.random() * verbos.length)];
    mostrarVerbo(verboAleatorio);
}

function mostrarVerbo(verbo) {
    // Sujeto aleatorio
    const sujetos = Object.keys(verbo.conjugaciones);
    const sujetoAleatorio = sujetos[Math.floor(Math.random() * sujetos.length)];
    
    document.getElementById('verbo').innerText = verbo.infinitivo;
    document.getElementById('sujeto').innerText = sujetoAleatorio;
    document.getElementById('respuesta').dataset.correcto = verbo.conjugaciones[sujetoAleatorio];
}

function verificar() {
    const respuesta = document.getElementById('respuesta').value;
    const correcto = document.getElementById('respuesta').dataset.correcto;
    const resultado = document.getElementById('resultado');
    const flipCard = document.getElementById('flipCard');

    if (respuesta === correcto) {
        resultado.innerText = 'Correcto!';
        resultado.style.backgroundColor = 'green';
    } else {
        resultado.innerText = `Incorrecto, la respuesta es: ${correcto}`;
        resultado.style.backgroundColor = 'red';
    }

    // Girar la tarjeta para mostrar el resultado
    flipCard.classList.add('flip');
}

// Cargar un verbo al azar al inicio
cargarVerbos();
