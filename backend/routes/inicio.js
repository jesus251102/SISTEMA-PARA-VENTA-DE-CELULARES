const express = require("express");
const bcrypt = require("bcryptjs");
const { connectDB, sql } = require("../config/db");
const router = express.Router();

// Ruta para iniciar sesión
router.post("/sesion", async (req, res) => {
    const { email, contraseña } = req.body;

    try {
        const pool = await connectDB();

        const userQuery = await pool.request()
            .input("email", sql.VarChar, email)
            .query("SELECT * FROM Usuarios WHERE email = @email");

        if (userQuery.recordset.length === 0) {
            return res.status(400).json({ success: false, error: "Usuario no encontrado" });
        }

        const usuario = userQuery.recordset[0];
        console.log("Usuario encontrado:", usuario);

        const hashedPassword = usuario.Contraseña; // Asegúrate de que es el nombre correcto de la columna
        console.log("Contraseña almacenada en BD:", hashedPassword);

        if (!hashedPassword) {
            return res.status(500).json({ success: false, error: "Contraseña no encontrada en la base de datos" });
        }

        // Comparar la contraseña ingresada con la almacenada usando bcrypt
        const isMatch = await bcrypt.compare(contraseña, hashedPassword);

        if (!isMatch) {
            return res.status(400).json({ success: false, error: "Contraseña incorrecta" });
        }

        res.json({ success: true, message: "Inicio de sesión exitoso" });

    } catch (err) {
        console.error("Error en la ruta /sesion:", err);
        res.status(500).json({ success: false, error: "Error al iniciar sesión" });
    }
});

module.exports = router;
