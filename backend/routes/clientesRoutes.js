const express = require("express");
const { connectDB, sql } = require("../config/db");
const router = express.Router();

// Ruta para registrar un cliente
router.post("/clientes", async (req, res) => {
    const { dni, nombreCompleto, apePaterno, apeMaterno, telefono } = req.body;

    // Validaciones básicas
    if (!dni || dni.length !== 8 || isNaN(dni)) {
        return res.status(400).json({ success: false, error: "DNI inválido. Debe tener 8 dígitos numéricos." });
    }
    if (!nombreCompleto || !apePaterno || /\d/.test(nombreCompleto) || /\d/.test(apePaterno)) {
        return res.status(400).json({ success: false, error: "Nombre y apellidos no deben contener números." });
    }
    if (telefono && (telefono.length < 7 || telefono.length > 12 || isNaN(telefono))) {
        return res.status(400).json({ success: false, error: "Número de teléfono inválido." });
    }

    try {
        const pool = await connectDB();

        // Buscar si el cliente ya existe con ese DNI
        const checkCliente = await pool.request()
            .input("dni", sql.Char, dni)
            .query("SELECT ClienteID FROM Clientes WHERE dni = @dni");

        if (checkCliente.recordset.length > 0) {
            return res.status(409).json({ success: false, error: `El cliente con DNI ${dni} ya está registrado` });
        }

        // Insertar el nuevo cliente 
        await pool.request()
            .input("dni", sql.Char, dni)
            .input("nombreCompleto", sql.NVarChar, nombreCompleto)
            .input("apellidoPaterno", sql.NVarChar, apePaterno)
            .input("apellidoMaterno", sql.NVarChar, apeMaterno || null)
            .input("telefono", sql.Char, telefono || null)
            .query(`
                INSERT INTO Clientes (dni, nombreCompleto, apellidoPaterno, apellidoMaterno, telefono)
                VALUES (@dni, @nombreCompleto, @apellidoPaterno, @apellidoMaterno, @telefono)
            `);

        res.status(201).json({ success: true, message: "Cliente registrado exitosamente." });
    } catch (err) {
        console.error("Error al registrar al cliente:", err);
        res.status(500).json({ success: false, error: "Error en el servidor." });
    }

});

// Ruta para buscar un cliente por DNI
router.get("/clientes/:dni", async (req, res) => {
    const { dni } = req.params;

    if (!dni || dni.length !== 8 || isNaN(dni)) {
        return res.status(400).json({ success: false, error: "DNI inválido. Debe tener 8 dígitos numéricos." });
    }

    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input("dni", sql.Char, dni)
            .query("SELECT * FROM Clientes WHERE dni = @dni");


        if (result.recordset.length === 0) {
            console.log("Cliente no encontrado en la base de datos.");
            return res.status(404).json({ success: false, error: "Cliente no encontrado" });
        }


        res.json({ success: true, cliente: result.recordset[0] });
    } catch (err) {
        console.error("Error al buscar el cliente:", err);
        res.status(500).json({ success: false, error: "Error en el servidor." });
    }
});

//Ruta para mostrar todos los clientes registrados
router.get("/clientes", async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query("SELECT * FROM Clientes");

        res.json({ success: true, clientes: result.recordset });
    } catch (err) {
        console.error("Error al obtener clientes:", err);
        res.status(500).json({ success: false, error: "Error en el servidor." });
    }
});

module.exports = router;
