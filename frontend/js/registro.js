document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".formCliente");

    if (!form) {
        console.error("Formulario no encontrado");
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Obtener los datos del formulario
        const dni = document.getElementById("dni").value.trim();
        const nombreCompleto = document.getElementById("nombreCompleto").value.trim();
        const apellidoPaterno = document.getElementById("apePaterno").value.trim();
        const apellidoMaterno = document.getElementById("apeMaterno").value.trim();
        const telefono = document.getElementById("telefono").value.trim();

        // Validar que los campos no estén vacíos
        if (!dni || !nombreCompleto || !apellidoPaterno) {
            return Swal.fire({
                title: "Error",
                text: "Complete los campos obligatorios",
                icon: "warning",
                confirmButtonText: "OK"
            });
        }

        try {
            const response = await fetch("http://localhost:5000/api/usuarios/registrar", { // Se corrigió la URL
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dni, nombreCompleto, apellidoPaterno, apellidoMaterno, telefono }),
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire({
                    title: "¡Registro exitoso!",
                    text: "Usuario registrado correctamente",
                    icon: "success",
                    confirmButtonText: "OK"
                }).then(() => {
                    form.reset();
                });
            } else {
                Swal.fire({
                    title: "Error",
                    text: data.error || "No se pudo registrar el usuario",
                    icon: "error",
                    confirmButtonText: "OK"
                });
            }
        } catch (error) {
            Swal.fire({
                title: "Error de conexión",
                text: "No se pudo conectar con el servidor",
                icon: "error",
                confirmButtonText: "OK"
            });
            console.error("Error:", error);
        }
    });
});