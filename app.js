
const express = require('express');
const app = express();
const port = 3000;
const coctelesRoutes = require('./routes/cocktails.routes');
const categoriesRoutes = require('./routes/categories.routes');
const authRoutes = require('./routes/auth.routes');

app.use(express.json());
app.use('/cocktails', coctelesRoutes);
app.use('/categories', categoriesRoutes);
app.use('/auth', authRoutes);
app.get("/bienvenido", (req, res) =>{
    mensaje = "Bienvenido a Huerta"
    res.json({mensaje})
})

app.listen(port, () =>{
    console.log(`Servidor escuchando en http://localhost:${port}`);
})