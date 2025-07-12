document.addEventListener("DOMContentLoaded", async () => {
    const formReparacion = document.querySelector(".formReparacion");
    const buscarBtn = document.querySelector(".buscar");
    const buscarInput = document.querySelector(".buscarCliente input");
    const tablaBody = document.querySelector("#tablaBody");
    const btnMostrarMas = document.getElementById("mostrarMasBtn");
    let registrosVisibles = 3;

    if (!formReparacion) {
        console.error("Formulario no encontrado");
        return;
    }

    // Función para mostrar alertas
    const mostrarAlerta = (mensaje, tipo) => {
        Swal.fire({
            icon: tipo,
            title: mensaje,
            showConfirmButton: false,
            timer: 2000
        });
    };

    // Función para crear filas de reparaciones
    const crearFilaReparacion = (reparacion) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${reparacion.DniCliente}</td>
            <td>${reparacion.Reparacion}</td>
            <td>${reparacion.Marca}</td>
            <td>${reparacion.Modelo}</td>
            <td>${reparacion.Precio.toFixed(2)}</td>
            <td>${reparacion.Costo.toFixed(2)}</td>
            <td>${(reparacion.Precio - reparacion.Costo).toFixed(2)}</td>
            <td>${new Date(reparacion.FechaReparacion).toLocaleDateString()}</td>
        `;
        tablaBody.appendChild(fila);
    };

    // Función para cargar reparaciones desde la base de datos
    async function cargarReparaciones() {
        try {
            const response = await fetch("http://localhost:5000/api/ventas/reparacion");
            const data = await response.json();

            if (data.success) {
                tablaBody.innerHTML = ""; // Limpiar tabla antes de agregar registros

                data.reparacion.sort((a, b) => new Date(b.FechaReparacion) - new Date(a.FechaReparacion));

                data.reparacion.forEach(crearFilaReparacion);
                actualizarVisibilidad();
            } else {
                mostrarAlerta(data.error || "Error al cargar reparaciones", "error");
            }
        } catch (error) {
            console.error("Error al conectar con el servidor:", error);
            mostrarAlerta("Error al conectar con el servidor", "error");
        }
    }

    // Función para actualizar visibilidad de registros
    function actualizarVisibilidad() {
        const filas = Array.from(tablaBody.querySelectorAll("tr"));
        filas.forEach((fila, index) => {
            fila.style.display = index < registrosVisibles ? "" : "none";
        });

        btnMostrarMas.textContent = registrosVisibles >= filas.length ? "Mostrar menos" : "Mostrar más";
        btnMostrarMas.style.display = filas.length > 3 ? "block" : "none";
    }

    btnMostrarMas.addEventListener("click", () => {
        const filas = Array.from(tablaBody.querySelectorAll("tr"));
        registrosVisibles = registrosVisibles >= filas.length ? 3 : registrosVisibles + 5;
        actualizarVisibilidad();
    });

    // Validar y registrar reparaciones
    formReparacion.addEventListener("submit", async (event) => {
        event.preventDefault();

        const dniCliente = document.getElementById("dniCliente").value.trim();
        const reparacion = document.getElementById("reparacion").value.trim();
        const marca = document.getElementById("marca").value.trim();
        const modelo = document.getElementById("modelo").value.trim();
        const precio = parseFloat(document.getElementById("precio").value);
        const costo = parseFloat(document.getElementById("costo").value);

        if (!dniCliente || !reparacion || !marca || !modelo || isNaN(precio) || isNaN(costo)) {
            return mostrarAlerta("Complete los campos obligatorios correctamente", "warning");
        }

        try {
            const response = await fetch("http://localhost:5000/api/ventas/reparacion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dniCliente, reparacion, marca, modelo, precio, costo }),
            });

            const data = await response.json();

            if (response.ok) {
                mostrarAlerta("Reparación registrada exitosamente", "success");
                formReparacion.reset();
                await cargarReparaciones();
            } else {
                mostrarAlerta(data.error || "No se pudo registrar la reparación", "error");
            }
        } catch (error) {
            mostrarAlerta("Error de conexión con el servidor", "error");
            console.error("Error:", error);
        }
    });

    // Buscar cliente por DNI
    buscarBtn.addEventListener("click", async () => {
        const dniBuscado = buscarInput.value.trim();

        if (!dniBuscado) {
            return Swal.fire({
                title: "Aviso",
                text: "Ingresa un DNI para buscar",
                icon: "info",
                confirmButtonText: "OK"
            });
        }

        try {
            const response = await fetch(`http://localhost:5000/api/ventas/reparacion/${dniBuscado}`);
            const data = await response.json();

            if (!response.ok) {
                return Swal.fire({
                    title: "Error",
                    text: data.error || "Cliente no encontrado",
                    icon: "error",
                    confirmButtonText: "OK"
                });
            }

            tablaBody.innerHTML = ""; // Limpiar tabla y agregar solo la búsqueda
            data.reparaciones.sort((a, b) => new Date(b.FechaReparacion) - new Date(a.FechaReparacion));
            data.reparaciones.forEach(reparacion => {
                crearFilaReparacion(reparacion);
            });

            Swal.fire({
                title: "Cliente encontrado",
                text: `DNI: ${dniBuscado}`,
                icon: "success",
                confirmButtonText: "OK"
            });
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: "No se pudo conectar con el servidor",
                icon: "error",
                confirmButtonText: "OK"
            });
        }
    });

    await cargarReparaciones();
});
