
const express = require('express');
const app = express();
const port = 3000;
const coctelesRoutes = require('./routes/cocteles.routes');
const pool = require('./config/db');

app.use(express.json());
app.use('/cocteles', coctelesRoutes);

app.get("/bienvenido", (req, res) =>{
    mensaje = "Bienvenido a Huerta"
    res.json({mensaje})
})

app.get('/db-test', async (req, res) => {
    try{
        const result = await pool.query('SELECT NOW()');
        res.json({ mensaje: 'Conexion Exitosa', fecha: result.rows[0].now });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al conectar a la base de datos', error });
    }
});

app.listen(port, () =>{
    console.log(`Servidor escuchando en http://localhost:${port}`);
})