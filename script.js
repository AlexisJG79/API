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

function crearTarjeta(personaje) {
    const div = document.createElement("div");
    div.classList.add("personaje");

    div.innerHTML = `
        <div class="inner">
            <div class="front">
                <img src="${personaje.image}" alt="${personaje.name}">
                <h2>${personaje.name}</h2>
            </div>
            <div class="back">
                <p>${personaje.name}</p>
                <p><strong>Género:</strong> ${personaje.gender}</p>
                <p><strong>Raza:</strong> ${personaje.race}</p>
                <p><strong>KI:</strong> ${personaje.ki}</p>
            </div>
        </div>
    `;

    div.addEventListener("click", () => {
        div.classList.toggle("flipped");
    });

    contenedor.appendChild(div);
}

function cargarPersonajes() {
    if (load || buscando) return;
    load = true;

    fetch(`https://dragonball-api.com/api/characters?page=${page}`)
        .then(res => res.json())
        .then(data => {
            data.items.forEach(personaje => crearTarjeta(personaje));
            page++;
            load = false;
        })
        .catch(error => {
            console.error("Error al cargar personajes:", error);
            load = false;
        });
}

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

            filtrados.forEach(p => crearTarjeta(p));
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
