document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".login-form").addEventListener("submit", async function (event) {
        event.preventDefault(); // Evita que se recargue la página

        const email = document.getElementById("email").value;
        const contraseña = document.getElementById("contraseña").value;

        try {
            const response = await fetch("http://localhost:5000/api/inicio/sesion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, contraseña }),
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire({
                    title: "Sesión iniciada correctamente!",
                    icon: "success",
                    confirmButtonText: "OK"
                }).then(() => {
                    window.location.href = "sistema.html"; // Redirige a la página principal
                });
            } else {
                Swal.fire({
                    title: "Error!",
                    text: data.error || "Correo o contraseña incorrectos",
                    icon: "error",
                    confirmButtonText: "OK"
                });
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
            Swal.fire({
                title: "Error!",
                text: "No se pudo conectar con el servidor",
                icon: "error",
                confirmButtonText: "OK"
            });
        }
    });
});
