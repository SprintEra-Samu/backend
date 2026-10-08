const express = require("express");
const { Sequelize } = require("sequelize");
require("dotenv").config();

const app = express();

app.use(express.json());

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "postgres",
        logging: false
    }
);

app.get("/", (req, res) => {
    res.json({
        message: "SprintEra Backend çalışıyor!"
    });
});

const PORT = 3000;

app.listen(PORT, async () => {
    console.log(`SprintEra Backend http://localhost:${PORT} adresinde çalışıyor`);

    try {
        await sequelize.authenticate();
        console.log("PostgreSQL bağlantısı başarılı!");
    } catch (error) {
        console.error("PostgreSQL bağlantı hatası:", error.message);
    }
});