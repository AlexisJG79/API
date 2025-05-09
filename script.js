
let page = 1;
let load = false;
let buscando = false;

const form = document.getElementById("busqueda-form");
const input = document.getElementById("busqueda");
const botonBuscar = document.getElementById("btnBuscar");
const contenedor = document.getElementById("personajes");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const texto = input.value.trim();
    if (texto.length >= 3) {
        busquedaPersonajes(texto);
    }
});

botonBuscar.addEventListener("click", () => {
    const texto = input.value.trim();
    if (texto.length >= 3) {
        busquedaPersonajes(texto);
    }
});

input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        const texto = input.value.trim();
        if (texto.length >= 3) {
            busquedaPersonajes(texto);
        }
    }
});

input.addEventListener("input", () => {
    if (input.value.trim() === "") {
        contenedor.innerHTML = "";
        page = 1;
        buscando = false;
        cargarPersonajes();
    }
});

// Función para obtener todas las transformaciones
function obtenerTransformaciones() {
    return fetch('https://dragonball-api.com/api/transformations/')
        .then(res => res.json())
        .then(data => {
            console.log('Transformaciones obtenidas:', data); // Verificar las transformaciones obtenidas
            return data;
        })
        .catch(error => {
            console.error("Error al obtener transformaciones:", error);
            return []; // Devuelve un arreglo vacío si hay error
        });
}

// Función para crear la tarjeta del personaje
function crearTarjeta(personaje, transformaciones) {
    const div = document.createElement("div");
    div.classList.add("personaje");

    // Filtrar las transformaciones que corresponden a este personaje
    const transformacionesPersonaje = transformaciones.filter(trans => 
        trans.name.toLowerCase().includes(personaje.name.toLowerCase())
    );

    // Crear el contenido del reverso con transformaciones
    const transformacionesHTML = transformacionesPersonaje.length > 0
        ? transformacionesPersonaje.map(trans => {
            return `
                <div class="transformacion">
                    <img src="${trans.image}" alt="${trans.name}">
                    <p>${trans.name}</p>
                    <p><strong>Ki:</strong> ${trans.ki}</p>
                </div>
            `;
        }).join('')
        : '<p>No tiene transformaciones.</p>';

    div.innerHTML = `
        <div class="inner">
            <div class="front">
                <img src="${personaje.image}" alt="${personaje.name}">
                <h2>${personaje.name}</h2>
                <h3>Transformaciones:</h3>
                    ${transformacionesHTML}
            </div>
            <div class="back">
                <p><strong>Nombre:</strong> ${personaje.name}</p>
                <p><strong>Género:</strong> ${personaje.gender}</p>
                <p><strong>Raza:</strong> ${personaje.race}</p>
                <p><strong>KI:</strong> ${personaje.ki}</p>
                <div class="transformaciones">
                    
                </div>
            </div>
        </div>
    `;

    // Manejo de flip de la tarjeta al hacer clic
    div.addEventListener("click", () => {
        div.classList.toggle("flipped");
    });

    contenedor.appendChild(div);
}

// Función para cargar los personajes
function cargarPersonajes() {
    if (load || buscando) return;
    load = true;

    fetch(`https://dragonball-api.com/api/characters?page=${page}`)
        .then(res => res.json())
        .then(data => {
            console.log('Personajes obtenidos:', data); // Verificar los personajes obtenidos
            // Obtener las transformaciones antes de mostrar los personajes
            obtenerTransformaciones().then(transformaciones => {
                data.items.forEach(personaje => crearTarjeta(personaje, transformaciones));
            });
            page++;
            load = false;
        })
        .catch(error => {
            console.error("Error al cargar personajes:", error);
            load = false;
        });
}

// Función de búsqueda de personajes
function busquedaPersonajes(texto) {
    contenedor.innerHTML = "<p>Buscando...</p>";
    buscando = true;

    fetch("https://dragonball-api.com/api/characters?limit=1000")
        .then(res => res.json())
        .then(data => {
            contenedor.innerHTML = "";
            const personajes = Array.isArray(data) ? data : data.items;

            const filtrados = personajes.filter(p =>
                p.name.toLowerCase().includes(texto.toLowerCase()) ||
                (p.race && p.race.toLowerCase() === texto.toLowerCase()) ||
                (p.gender && p.gender.toLowerCase() === texto.toLowerCase())
            );

            if (filtrados.length === 0) {
                contenedor.innerHTML = "<p>No se encontraron personajes.</p>";
                return;
            }

            // Obtener las transformaciones antes de mostrar los personajes filtrados
            obtenerTransformaciones().then(transformaciones => {
                filtrados.forEach(p => crearTarjeta(p, transformaciones));
            });
        })
        .catch(error => {
            console.error("Error al buscar personaje:", error);
            contenedor.innerHTML = "<p>Error al buscar personaje.</p>";
        });
}

window.addEventListener("scroll", () => {
    if (!buscando && window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        cargarPersonajes();
    }
});

cargarPersonajes();
