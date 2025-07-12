const express = require("express");
const { connectDB, sql } = require("../config/db");
const router = express.Router();

// Ruta para registrar una reparación
router.post("/reparacion", async (req, res) => {
    const { dniCliente, reparacion, marca, modelo, precio, costo } = req.body;

    // Validaciones básicas
    if (!dniCliente || dniCliente.length !== 8 || isNaN(dniCliente)) {
        return res.status(400).json({ success: false, error: "DNI inválido. Debe tener 8 dígitos numéricos." });
    }
    if (!reparacion || /\d/.test(reparacion)) {
        return res.status(400).json({ success: false, error: "Reparación no debe contener números." });
    }

    try {
        const pool = await connectDB();

        // Verificar si el cliente está registrado
        const checkCliente = await pool.request()
            .input("dniCliente", sql.Char, dniCliente)
            .query("SELECT ClienteID FROM Clientes WHERE dni = @dniCliente");

        if (checkCliente.recordset.length === 0) {
            return res.status(409).json({ success: false, error: "El DNI no está registrado" });
        }

        // Iniciar transacción
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Insertar la venta en la Tabla Ventas
            const resultCliente = await transaction.request()
                .input("dniCliente", sql.Char, dniCliente)
                .query(`SELECT ClienteID FROM Clientes WHERE Dni = @dniCliente`);

            if (resultCliente.recordset.length == 0) {
                throw new Error("No se encontró un cliente con el DNI proporcionado.");
            }

            const ClienteID = resultCliente.recordset[0].ClienteID;

            const resultVenta = await transaction.request()
                .input("clienteID", sql.Int, ClienteID)
                .input("fecha", sql.DateTime, new Date()) // Usamos la fecha actual
                .input("total", sql.Decimal(10, 2), parseFloat(precio)) // Usamos el precio de la reparación como total
                .query(`
                    INSERT INTO Ventas (ClienteID, Fecha, Total)
                    OUTPUT INSERTED.VentaID
                    VALUES (@clienteID, @fecha, @total)
                `);

            const ventaID = resultVenta.recordset[0].VentaID;

            // Insertar la reparación en la tabla Reparacion
            const resultReparacion = await transaction.request()
                .input("dniCliente", sql.Char, dniCliente)
                .input("reparacion", sql.NVarChar, reparacion)
                .input("marca", sql.NVarChar, marca)
                .input("modelo", sql.NVarChar, modelo)
                .input("precio", sql.Decimal(10, 2), parseFloat(precio))
                .input("costo", sql.Decimal(10, 2), parseFloat(costo))
                .query(`
                    INSERT INTO Reparacion (DniCliente, Reparacion, Marca, Modelo, Precio, Costo)
                    OUTPUT INSERTED.ReparacionID
                    VALUES (@dniCliente, @reparacion, @marca, @modelo, @precio, @costo)
                `);

            const reparacionID = resultReparacion.recordset[0].ReparacionID;

            // Insertar detalle en DetalleVentas
            await transaction.request()
                .input("ventaID", sql.Int, ventaID)
                .input("reparacionID", sql.Int, reparacionID)
                .query(`
                    INSERT INTO DetalleVentas (VentaID, ReparacionID)
                    VALUES (@ventaID, @reparacionID)
                `);

            // Confirmar la transacción si todo ha ido bien
            await transaction.commit();

            res.status(201).json({ success: true, message: "Reparación registrada y venta procesada exitosamente." });
        } catch (err) {
            // Si algo falla, revertir la transacción
            await transaction.rollback();
            console.error("Error al registrar la reparación, venta o detalle:", err);
            res.status(500).json({ success: false, error: "Error en el servidor." });
        }
    } catch (err) {
        console.error("Error al conectar con la base de datos:", err);
        res.status(500).json({ success: false, error: "Error en el servidor." });
    }
});

// Ruta para obtener todas las reparaciones registradas
router.get("/reparacion", async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query("SELECT * FROM Reparacion");

        res.json({ success: true, reparacion: result.recordset });
    } catch (err) {
        console.error("Error al obtener las reparaciones:", err);
        res.status(500).json({ success: false, error: "Error en el servidor." });
    }
});

// Ruta para buscar una reparación por DNI
router.get("/reparacion/:dniCliente", async (req, res) => {
    const { dniCliente } = req.params;

    if (!dniCliente || dniCliente.length !== 8 || isNaN(dniCliente)) {
        return res.status(400).json({ success: false, error: "DNI inválido. Debe tener 8 dígitos numéricos." });
    }

    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input("dniCliente", sql.Char, dniCliente)
            .query("SELECT * FROM Reparacion WHERE DniCliente = @dniCliente");

        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, error: "No hay reparaciones registradas para este cliente." });
        }

        res.json({ success: true, reparaciones: result.recordset });

    } catch (err) {
        console.error("Error al buscar la reparación:", err);
        res.status(500).json({ success: false, error: "Error en el servidor." });
    }
});

// Ruta para obtener reportes y estadísticas
router.get("/reportes", async (req, res) => {
    try {
        const pool = await connectDB();

        // Obtener ganancias totales
        const ganancias = await pool.request().query(`
            SELECT 
                SUM(Precio - Costo) AS GananciaTotal,
                FORMAT(Fecha, 'yyyy-MM-dd') AS Fecha
            FROM Reparacion
            GROUP BY FORMAT(Fecha, 'yyyy-MM-dd')
            ORDER BY Fecha DESC
        `);

        // Cantidad de reparaciones por marca
        const reparacionesPorMarca = await pool.request().query(`
            SELECT Marca, COUNT(*) AS Cantidad
            FROM Reparacion
            GROUP BY Marca
            ORDER BY Cantidad DESC
        `);

        // Costo promedio de reparación
        const costoPromedio = await pool.request().query(`
            SELECT AVG(Costo) AS CostoPromedio FROM Reparacion
        `);

        res.json({
            success: true,
            ganancias: ganancias.recordset,
            reparacionesPorMarca: reparacionesPorMarca.recordset,
            costoPromedio: costoPromedio.recordset[0].CostoPromedio
        });
    } catch (err) {
        console.error("Error al obtener los reportes:", err);
        res.status(500).json({ success: false, error: "Error en el servidor." });
    }
});

router.get("/ingreso-por-mes", async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT
            MONTH(v.Fecha) AS Mes,
            ISNULL(SUM(r.Precio), 0) AS 'Total Ingresos'
            FROM Ventas v
            INNER JOIN DetalleVentas dv ON v.VentaID = dv.VentaID
            INNER JOIN Reparacion r ON dv.ReparacionID = r.ReparacionID
            WHERE YEAR(v.Fecha) = YEAR(GETDATE())
            GROUP BY MONTH(v.Fecha)
            ORDER BY Mes
            `)
        res.json({ success: true, ingresos: result.recordset });
    } catch (error) {
        console.error("Error al obtener ingresos por mes:", error);
        res.status(500).json({ success: false, error: "Error al obtener ingresos por mes" });
    }
});

module.exports = router;
