document.addEventListener("DOMContentLoaded", function () {
    cargarMenu();
    inicializarEventos();
});

function cargarMenu() {
    fetch("/frontend/pages/index.html") // Cambia a un archivo menu.html que contenga el menú
        .then(response => response.text())
        .then(data => {
            document.body.insertAdjacentHTML("afterbegin", data);
            inicializarEventos(); // Llamamos esta función después de cargar el menú
        })
        .catch(error => console.error("Error al cargar el menú:", error));
}

function inicializarEventos() {
    const body = document.querySelector('body'),
        sidebar = document.querySelector('.sidebar'),
        toogle = document.querySelector('.toogle'),
        searchBtn = document.querySelector('.search-box'),
        modeSwitch = document.querySelector('.toogle-switch'),
        modeText = document.querySelector('.mode-text');

    if (!sidebar || !toogle || !searchBtn || !modeSwitch || !modeText) {
        console.warn("Algunos elementos del menú no se encontraron. Verifica el HTML.");
        return;
    }

    toogle.addEventListener('click', () => {
        sidebar.classList.toggle("close");
    });

    searchBtn.addEventListener('click', () => {
        sidebar.classList.remove("close");
    });

    modeSwitch.addEventListener('click', () => {
        body.classList.toggle("dark");
        modeText.innerText = body.classList.contains("dark") ? "Light Mode" : "Dark Mode";
    });
}
