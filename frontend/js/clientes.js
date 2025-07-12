document.addEventListener("DOMContentLoaded", async () => {
    const formCliente = document.querySelector(".formCliente");
    const buscarBtn = document.querySelector(".buscar");
    const buscarInput = document.querySelector(".buscarCliente input");
    const tablaBody = document.querySelector("#tablaBody");
    const btnMostrarMas = document.getElementById("mostrarMasBtn");
    let registrosVisibles = 3;

    if (!formCliente) {
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

    // Función para cargar clientes desde la base de datos
    async function cargarClientes() {
        try {
            const response = await fetch("http://localhost:5000/api/ventas/clientes");
            const data = await response.json();

            if (data.success) {
                tablaBody.innerHTML = ""; // Limpiar la tabla antes de agregar registros

                //Ordenar los clientes de los maás recientes al más antiguo
                data.clientes.sort((a, b) => new Date(b.FechaRegistro) - new Date(a.FechaRegistro));

                data.clientes.forEach(cliente => {
                    const fila = document.createElement("tr");
                    fila.innerHTML = `
                        <td>${cliente.Dni}</td>
                        <td>${cliente.NombreCompleto}</td>
                        <td>${cliente.ApellidoPaterno}</td>
                        <td>${cliente.ApellidoMaterno || "-"}</td>
                        <td>${cliente.Telefono || "-"}</td>
                        <td>${new Date(cliente.FechaRegistro).toLocaleDateString()}</td>
                    `;
                    tablaBody.appendChild(fila);
                });

                actualizarVisibilidad();
            } else {
                console.error("Error al cargar los clientes:", data.error);
            }
        } catch (error) {
            console.error("Error al conectar con el servidor:", error);
        }
    }

    // Función para actualizar visibilidad de registros
    function actualizarVisibilidad() {
        const filas = Array.from(tablaBody.querySelectorAll("tr"));
        filas.forEach((fila, index) => {
            fila.style.display = index < registrosVisibles ? "" : "none";
        });

        // Cambiar el texto del botón dependiendo de la cantidad de registros visibles
        if (registrosVisibles >= filas.length) {
            btnMostrarMas.textContent = "Mostrar menos";
        } else {
            btnMostrarMas.textContent = "Mostrar más";
        }

        // Ocultar el botón si hay menos registros de los que se muestran por defecto
        btnMostrarMas.style.display = filas.length > 3 ? "block" : "none";
    }

    // Evento para "Mostrar más" o "Mostrar menos"
    btnMostrarMas.addEventListener("click", () => {
        const filas = Array.from(tablaBody.querySelectorAll("tr"));

        if (registrosVisibles >= filas.length) {
            registrosVisibles = 3;
        } else {
            registrosVisibles += 5;
        }

        actualizarVisibilidad();
    });

    // Validar y registrar clientes
    formCliente.addEventListener("submit", async (event) => {
        event.preventDefault();

        const dni = document.getElementById("dni").value.trim();
        const nombreCompleto = document.getElementById("nombreCompleto").value.trim();
        const apePaterno = document.getElementById("apePaterno").value.trim();
        const apeMaterno = document.getElementById("apeMaterno").value.trim();
        const telefono = document.getElementById("telefono").value.trim();

        if (!dni || !nombreCompleto || !apePaterno) {
            return mostrarAlerta("Complete los campos obligatorios", "warning");
        }

        try {
            const response = await fetch("http://localhost:5000/api/ventas/clientes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dni, nombreCompleto, apePaterno, apeMaterno, telefono }),
            });

            const data = await response.json();

            if (response.ok) {
                mostrarAlerta("Cliente registrado exitosamente", "success");
                formCliente.reset();

                // Recargar la lista de clientes para reflejar el nuevo registro con fecha
                await cargarClientes();
            } else {
                mostrarAlerta(data.error || "No se pudo registrar el usuario", "error");
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
            const response = await fetch(`http://localhost:5000/api/ventas/clientes/${dniBuscado}`);
            const data = await response.json();

            if (!response.ok) {
                return Swal.fire({
                    title: "Error",
                    text: data.error || "Cliente no encontrado",
                    icon: "error",
                    confirmButtonText: "OK"
                });
            }

            // Si el cliente existe, mostrarlo en la tabla
            tablaBody.innerHTML = `
                <tr>
                    <td>${data.cliente.Dni}</td>
                    <td>${data.cliente.NombreCompleto}</td>
                    <td>${data.cliente.ApellidoPaterno}</td>
                    <td>${data.cliente.ApellidoMaterno || "-"}</td>
                    <td>${data.cliente.Telefono || "-"}</td>
                    <td>${new Date(data.cliente.FechaRegistro).toLocaleDateString()}</td>
                </tr>
            `;

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

    // Cargar los clientes cuando la página se inicie
    await cargarClientes();
});
