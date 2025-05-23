
const express = require('express');
const app = express();
const port = 3000;
const coctelesRoutes = require('./routes/cocktails.routes');
const pool = require('./config/db');

app.use(express.json());
app.use('/cocktails', coctelesRoutes);

app.get("/bienvenido", (req, res) =>{
    mensaje = "Bienvenido a Huerta"
    res.json({mensaje})
})

app.listen(port, () =>{
    console.log(`Servidor escuchando en http://localhost:${port}`);
})