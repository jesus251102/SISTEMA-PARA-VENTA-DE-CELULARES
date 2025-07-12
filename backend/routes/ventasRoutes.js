const express = require("express");
const { connectDB, sql } = require("../config/db");
const router = express.Router();

// 📌 Obtener todas las ventas
router.get("/", async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT c.Dni,
                c.NombreCompleto + ' ' + c.ApellidoPaterno AS 'Nombre Completo', 
                r.Reparacion + ' ' + r.Marca + ' ' + r.Modelo AS 'Reparación',
                r.Precio,
                v.Fecha
            FROM Ventas v
            INNER JOIN Clientes c ON v.ClienteID = c.ClienteID
            INNER JOIN DetalleVentas dv ON v.VentaID = dv.VentaID
            INNER JOIN Reparacion r ON dv.ReparacionID = r.ReparacionID
        `);
        res.json({ success: true, ventas: result.recordset });
    } catch (error) {
        console.error("Error al obtener ventas:", error);
        res.status(500).json({ success: false, error: "Error al obtener ventas" });
    }
});

// 📌 Registrar una nueva venta
router.post("/", async (req, res) => {
    try {
        const { clienteID, reparacionID, fecha } = req.body;

        if (!clienteID || !reparacionID || !fecha) {
            return res.status(400).json({ success: false, error: "Faltan campos obligatorios" });
        }

        const pool = await connectDB();
        await pool.request()
            .input("clienteID", sql.Int, clienteID)
            .input("fecha", sql.Date, fecha)
            .query(`INSERT INTO Ventas (ClienteID, Fecha) VALUES (@clienteID, @fecha)`);

        // Obtener el ID de la venta recién creada
        const result = await pool.request().query("SELECT SCOPE_IDENTITY() AS VentaID");
        const ventaID = result.recordset[0].VentaID;

        // Insertar en DetalleVentas
        await pool.request()
            .input("ventaID", sql.Int, ventaID)
            .input("reparacionID", sql.Int, reparacionID)
            .query(`INSERT INTO DetalleVentas (VentaID, ReparacionID) VALUES (@ventaID, @reparacionID)`);

        res.json({ success: true, message: "Venta registrada exitosamente" });
    } catch (error) {
        console.error("Error al registrar venta:", error);
        res.status(500).json({ success: false, error: "Error al registrar la venta" });
    }
});


module.exports = router;
