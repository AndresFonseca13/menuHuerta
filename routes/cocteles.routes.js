
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const validarCoctel = require('../middleware/validarCocteles');

const cocteles = [
    {
        nombre: "Margarita",
        ingredientes: ["Tequila", "Triple sec", "Lima"],
        precio: 10
    },
    {
        nombre: "Mojito",
        ingredientes: ["Ron", "Hierbabuena", "Lima"],
        precio: 8
    },
    {
        nombre: "Piña Colada",
        ingredientes: ["Ron", "Piña", "Crema de coco"],
        precio: 12
    }
]

router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT c.id AS coctel_id, c.nombre AS coctel_nombre, c.precio, 
                   array_agg(i.nombre) AS ingredientes
            FROM cocteles c
            LEFT JOIN cocteles_ingredientes ci ON c.id = ci.coctel_id
            LEFT JOIN ingredientes i ON ci.ingrediente_id = i.id
            GROUP BY c.id
        `;
        const result = await pool.query(query);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener los cócteles:', error);
        res.status(500).json({ mensaje: 'Error al obtener los cócteles', error });
    }
});

router.get('/:nombre', (req, res) => {
    const nombre = req.params.nombre;
    const coctel = cocteles.find(c => c.nombre.toLowerCase() === nombre.toLowerCase());
    if (coctel) {
        res.json(coctel);
    } else {
        res.status(404).json({ mensaje: 'Coctel no encontrado' });
    }
});

router.post('/', validarCoctel([]), async (req, res) => {
    const { nombre, ingredientes, precio } = req.body;
    
    try {
        // Verificar si el coctel ya existe
        const vericarQuery = 'SELECT * FROM cocteles WHERE nombre = $1';
        const verificarResult = await pool.query(vericarQuery, [nombre]);

        if (verificarResult.rows.length > 0) {
            return res.status(400).json({ mensaje: 'El coctel ya existe' });
        }

        // Iniciar la transaccion
        await pool.query('BEGIN');
        //Insetar el coctel
        const coctelQuery = 'INSERT INTO cocteles (nombre, precio) VALUES ($1, $2) RETURNING id';
        const coctelResult = await pool.query(coctelQuery, [nombre, precio]);
        const coctelId = coctelResult.rows[0].id;

        //Insertar los ingredientes y Obtener sus IDs
        const ingredientesIds = [];
        for(const ingrediente of ingredientes){
            const ingredienteQuery = `
                INSERT INTO ingredientes (nombre) 
                VALUES ($1) 
                ON CONFLICT (nombre) DO NOTHING 
                RETURNING id
                `;
            const ingredienteResult = await pool.query(ingredienteQuery, [ingrediente]);

            // Si el ingrediente ya existe, obtener su ID
            if(ingredienteResult.rows.length > 0){
                ingredientesIds.push(ingredienteResult.rows[0].id);
            } else {
                const existingIngredienteQuery = 'SELECT id FROM ingredientes WHERE nombre = $1';
                const existingIngredienteResult = await pool.query(existingIngredienteQuery, [ingrediente]);
                ingredientesIds.push(existingIngredienteResult.rows[0].id);
            }
        }

        // Relacionar el coctel con los ingredientes
        for (const ingredienteId of ingredientesIds) {
            const relacionQuery = 'INSERT INTO cocteles_ingredientes (coctel_id, ingrediente_id) VALUES ($1, $2)';
            await pool.query(relacionQuery, [coctelId, ingredienteId]);
        }

        // Confirmamos la transaccion
        await pool.query('COMMIT');

        res.status(201).json({ mensaje: 'Coctel creado', coctelId });
    } catch ( error ){
        // Revertir la transaccion en caso de error
        await pool.query('ROLLBACK');
        console.error('Error al crear el coctel:', error);
        res.status(500).json({ mensaje: 'Error al crear el coctel' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try{
        if (id === undefined || isNaN(id)) {
            return res.status(400).json({ mensaje: 'ID inválido' });
        }

        // Verificar si el coctel ya existe
        const vericarQuery = 'SELECT * FROM cocteles WHERE id = $1';
        const verificarResult = await pool.query(vericarQuery, [id]);

        if (verificarResult.rows.length < 1) {
            return res.status(400).json({ mensaje: 'El coctel no existe' });
        }

        const query = 'DELETE FROM cocteles WHERE id = $1';
        const result = await pool.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ mensaje: 'Coctel no encontrado' });
        }

        res.status(200).json({ mensaje: 'Coctel eliminado exitosamente' });
    }catch (error){
        console.error('Error al eliminar el coctel:', error);
        res.status(500).json({ mensaje: 'Error al eliminar el coctel' });
    }
})

module.exports = router;

