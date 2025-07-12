// Propósito: Conexión a la base de datos SQL Server de forma segura y reutilizable
require("dotenv").config();
const sql = require("mssql");

// Configuración de la conexión a SQL Server
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true, // Usa true si estás en Azure
        trustServerCertificate: true, // Usa true en entornos locales
    },
};

let pool; // Variable para almacenar la conexión

// Función para conectar a la base de datos
const connectDB = async () => {
    try {
        if (!pool) {
            pool = await sql.connect(config);
            console.log("Conexión a SQL Server establecida.");
        }
        return pool;
    } catch (err) {
        console.error("Error de conexión a la base de datos:", err.message);
        throw new Error("Error al conectar con la base de datos.");
    }
};

// Función para realizar consultas de manera más sencilla
const queryDB = async (query, params = []) => {
    try {
        const pool = await connectDB();
        const request = pool.request();
        params.forEach((param, index) => {
            request.input(`param${index + 1}`, param);
        });
        const result = await request.query(query);
        return result.recordset;
    } catch (err) {
        console.error("Error en la consulta SQL:", err.message);
        throw new Error("Error en la consulta.");
    }
};

// Exportar funciones y el módulo sql
module.exports = { connectDB, queryDB, sql };
