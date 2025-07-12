document.addEventListener("DOMContentLoaded", async () => {
    const tablaBody = document.getElementById("tablaBody");
    const btnMostrarMas = document.getElementById("mostrarMasBtn");
    let registrosVisibles = 3;

    try {
        const response = await fetch("http://localhost:5000/api/ventas");

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Datos recibidos en frontend:", data);

        if (!data.success) {
            console.error("🚨 Error en la respuesta:", data.error);
            alert("Hubo un error con los datos de las ventas.");
            return;
        }

        // Función para cargar las ventas
        function cargarVentas(ventas) {
            tablaBody.innerHTML = ""; // Limpiar la tabla antes de agregar datos

            ventas.sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha)); // Ordenar por fecha descendente

            ventas.forEach(venta => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${venta.Dni}</td>
                    <td>${venta["Nombre Completo"]}</td>
                    <td>${venta.Reparación}</td>
                    <td>S/. ${venta.Precio.toFixed(2)}</td>
                    <td>${new Date(venta.Fecha).toLocaleDateString()}</td>
                `;
                tablaBody.appendChild(fila);
            });
        }

        // Llamar la función con los datos recibidos
        cargarVentas(data.ventas);

        // Función para actualizar visibilidad de las ventas con sus respectivos clientes
        function actualizarVisibilidad() {
            const filas = Array.from(tablaBody.querySelectorAll("tr"));
            filas.forEach((fila, index) => {
                fila.style.display = index < registrosVisibles ? "" : "none"; // Mostrar solo las primeras 3 filas
            });

            btnMostrarMas.textContent = registrosVisibles >= filas.length ? "Mostrar menos" : "Mostrar más";
            btnMostrarMas.style.display = filas.length > 3 ? "block" : "none"; // Mostrar botón solo si hay más de 3 filas
        }

        btnMostrarMas.addEventListener("click", () => {
            const filas = Array.from(tablaBody.querySelectorAll("tr"));
            registrosVisibles = registrosVisibles >= filas.length ? 3 : registrosVisibles + 5;
            actualizarVisibilidad();
        });

    } catch (error) {
        console.error("🚨 Error al cargar ventas:", error);
        alert("Error al cargar las ventas. Verifica la consola para más detalles.");
    }
});
