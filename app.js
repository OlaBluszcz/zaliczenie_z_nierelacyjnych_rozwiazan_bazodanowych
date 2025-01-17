// Zmienne środowiskowe.
require('dotenv').config();

// Import expressa.
const express = require("express");

// Tworzenie instancji expressa.
const app = express();

// Import biblioteki cors, która umożliwia obsługę CORS.
const cors = require("cors");
app.use(cors({
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
}));

// Połączenie z bazą danych.
const mongoose = require("mongoose");
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.maauv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`)
    .then(() => console.log('Połączono z MongoDB'))
    .catch((err) => console.error('Błąd połączenia z MongoDB:', err));

// Logger.
const morgan = require("morgan");
app.use(morgan("dev"));

// Parsowanie body.
const bodyParser = require("body-parser");
app.use(bodyParser.json()); // od tej pory req.body ma informacje z części body

// Importuję routy.
const classesRoutes = require("./api/router/classes");
const schoolsRoutes = require("./api/router/schools");
const trainersRoutes = require("./api/router/trainers");
const usersRoutes = require("./api/router/users");

// Stosuję te routy.
app.use("/classes", classesRoutes);
app.use("/schools", schoolsRoutes);
app.use("/trainers", trainersRoutes);
app.use("/users", usersRoutes);


// Błąd routu.
app.use((req, res, next) => {
    res.status(404).json({ wiadomość: "Not found" });
});

app.get("/classes", (req, res) => {
    res.status(200).json({ message: "Trasa działa poprawnie!" });
});

app.options("*", (req, res) => {
    res.setHeader("Allow", "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD");
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({
        message: "OPTIONS request handled successfully",
        allowedMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    });
});

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

mongoose.connection.on("connected", () => {
    console.log("Połączono z MongoDB");
});

mongoose.connection.on("error", (err) => {
    console.error("Błąd połączenia z MongoDB:", err);
});

module.exports = app;