document.addEventListener("DOMContentLoaded", async function () {
    obtenerIngresosPorMes();

    // Obtener datos de reparaciones desde el backend
    try {
        const response = await fetch("http://localhost:5000/api/ventas/reparacion");
        const data = await response.json();

        if (!data.success) {
            console.error("Error al obtener los datos de reparaciones:", data.error);
            return;
        }

        const reparaciones = data.reparacion;
        generarGraficos(reparaciones);
        calcularCostoPromedio(reparaciones);
    } catch (error) {
        console.error("Error al cargar reportes:", error);
    }
});

// Función para generar los gráficos
function generarGraficos(reparaciones) {
    const ctxGanancias = document.getElementById("gananciasChart").getContext("2d");
    const ctxMarcas = document.getElementById("marcasChart").getContext("2d");

    // Procesar datos para los gráficos
    const gananciasPorDia = {};
    const reparacionesPorMarca = {};

    reparaciones.forEach((rep) => {
        // Formatear fecha
        const fecha = new Date(rep.FechaReparacion).toLocaleDateString();

        // Acumular ganancias por día
        if (!gananciasPorDia[fecha]) gananciasPorDia[fecha] = 0;
        gananciasPorDia[fecha] += rep.Precio - rep.Costo;

        // Contar reparaciones por marca
        if (!reparacionesPorMarca[rep.Marca]) reparacionesPorMarca[rep.Marca] = 0;
        reparacionesPorMarca[rep.Marca]++;
    });

    // Convertir datos en arreglos para Chart.js
    const fechas = Object.keys(gananciasPorDia);
    const ganancias = Object.values(gananciasPorDia);
    const marcas = Object.keys(reparacionesPorMarca);
    const reparacionesCount = Object.values(reparacionesPorMarca);

    // Gráfico de Ganancias Diarias
    new Chart(ctxGanancias, {
        type: "line",
        data: {
            labels: fechas,
            datasets: [{
                label: "Ganancias en S/.",
                data: ganancias,
                borderColor: "rgba(75, 71, 255, 1)",
                backgroundColor: "rgba(75, 71, 255, 1)",
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: true } }
        }
    });

    const coloresMarcas = {
        "Samsung": "rgba(0, 102, 204, 1)",   // Azul Samsung
        "Huawei": "rgba(255, 0, 0, 1)",      // Rojo Huawei
        "Honor": "rgba(128, 0, 128, 1)",     // Morado Honor
        "Redmi": "rgba(255, 102, 0, 1)",     // Naranja Redmi
        "Poco": "rgba(255, 204, 0, 1)",      // Amarillo Poco
        "iPhone": "rgba(192, 192, 192, 1)",  // Gris iPhone
        "Motorola": "rgba(0, 153, 255, 1)",  // Celeste Motorola
        "LG": "rgba(255, 51, 153, 1)",       // Rosa LG
        "Realme": "rgba(255, 255, 0, 1)",    // Amarillo Realme
        "Oppo": "rgba(0, 204, 102, 1)",      // Verde Oppo
        "ZTE": "rgba(102, 51, 153, 1)"       // Púrpura ZTE
    };

    // Generar los colores para el gráfico basados en las marcas
    const backgroundColors = marcas.map(marca => coloresMarcas[marca] || "rgba(100, 100, 100, 1)"); // Color gris si la marca no está en la lista

    // Gráfico de Reparaciones por Marca
    new Chart(ctxMarcas, {
        type: "bar",
        data: {
            labels: marcas,
            datasets: [{
                label: "Reparaciones",
                data: reparacionesCount,
                backgroundColor: backgroundColors, // Usamos los colores personalizados
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true }
            }
        }
    });
}

// Función para calcular el costo promedio de reparación
function calcularCostoPromedio(reparaciones) {
    if (reparaciones.length === 0) {
        document.getElementById("costoPromedio").innerText = "No hay datos suficientes.";
        return;
    }

    const totalCosto = reparaciones.reduce((acc, rep) => acc + rep.Costo, 0);
    const promedio = (totalCosto / reparaciones.length).toFixed(2);
    document.getElementById("costoPromedio").innerText = `S/. ${promedio}`;
}

async function obtenerIngresosPorMes() {
    // Datos procesados para Chart.js
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const ingresos = Array(12).fill(0); // Inicializar con 0

    data.ingresos.forEach((item) => {
        ingresos[item.Mes - 1] = item.TotalIngresos; // Asignar ingresos al mes correspondiente
    });

    // Configurar el gráfico
    const ctx = document.getElementById("ingresosChart").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: meses,
            datasets: [{
                label: "Ingresos (S/)",
                data: ingresos,
                backgroundColor: "rgba(54, 162, 235, 0.6)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

async function obtenerIngresosPorMes(reparaciones) {
    try {
        const response = await fetch("http://localhost:5000/api/ventas/ingreso-por-mes");
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || "Error al cargar ingresos por mes");
        }

        // Datos procesados para Chart.js
        const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const ingresos = Array(12).fill(0); // Inicializar con 0

        data.ingresos.forEach((item) => {
            ingresos[item.Mes - 1] = item.TotalIngresos;
        });

        // Configurar el gráfico
        const ctx = document.getElementById("ingresosChart").getContext("2d");
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: meses,
                datasets: [{
                    label: "Ingresos (S/)",
                    data: ingresos,
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

    } catch (error) {
        console.error("Error al cargar ingresos por mes:", error);
    }
}
