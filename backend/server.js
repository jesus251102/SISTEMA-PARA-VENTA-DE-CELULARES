const express = require("express");
const cors = require("cors");
const clienteRoutes = require("./routes/clientesRoutes");
const inicioSesion = require("./routes/inicio");
const reparacionRoutes = require("./routes/reparacionRoutes");
const ventasRoutes = require("./routes/ventasRoutes");
const { connectDB, sql } = require("./config/db");

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

//Rutas
app.use("/api/ventas", clienteRoutes);
app.use("/api/inicio", inicioSesion);
app.use("/api/ventas", reparacionRoutes);
app.use("/api/reportes", reparacionRoutes);
app.use("/api/ventas", ventasRoutes);
app.use("/api/ventas/ingreso-por-mes", reparacionRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
