const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const validarCoctel = require('../middleware/validarCocteles');
const { getAllCocktails } = require('../controllers/cocktails.controler');

router.get('/', getAllCocktails);


router.get('/:id', (req, res) => {
    const id = req.params.id;
    if (id === undefined || isNaN(id)) {
        return res.status(400).json({ mensaje: 'ID inválido' });
    }
    const query = `
        SELECT p.id AS product_id, p.name AS product_name, p.price, 
               array_agg(i.name) AS ingredients
        FROM products p
        LEFT JOIN products_ingredients pi ON p.id = pi.product_id
        LEFT JOIN ingredients i ON pi.ingredient_id = i.id
        WHERE p.id = $1
        GROUP BY p.id
    `;

    pool.query(query, [id])
        .then(result => {
            if (result.rows.length === 0) {
                return res.status(404).json({ mensaje: 'Coctel no encontrado' });
            }
            res.status(200).json(result.rows[0]);
        })
        .catch(error => {
            console.error('Error al obtener el coctel:', error);
            res.status(500).json({ mensaje: 'Error al obtener el coctel', error });
        });

});

router.post('/', validarCoctel([]), async (req, res) => {
    const { nombre, ingredientes, precio } = req.body;
    
    try {
        // Verificar si el coctel ya existe
        const vericarQuery = 'SELECT * FROM products WHERE name = $1';
        const verificarResult = await pool.query(vericarQuery, [nombre]);

        if (verificarResult.rows.length > 0) {
            return res.status(400).json({ mensaje: 'El coctel ya existe' });
        }

        // Iniciar la transaccion
        await pool.query('BEGIN');
        //Insetar el coctel
        const coctelQuery = 'INSERT INTO products (name, price) VALUES ($1, $2) RETURNING id';
        const coctelResult = await pool.query(coctelQuery, [nombre, precio]);
        const coctelId = coctelResult.rows[0].id;

        //Insertar los ingredientes y Obtener sus IDs
        const ingredientesIds = [];
        for(const ingrediente of ingredientes){
            const ingredienteQuery = `
                INSERT INTO ingredients (name) 
                VALUES ($1) 
                ON CONFLICT (name) DO NOTHING 
                RETURNING id
                `;
            const ingredienteResult = await pool.query(ingredienteQuery, [ingrediente]);

            // Si el ingrediente ya existe, obtener su ID
            if(ingredienteResult.rows.length > 0){
                ingredientesIds.push(ingredienteResult.rows[0].id);
            } else {
                const existingIngredienteQuery = 'SELECT id FROM ingredients WHERE nombre = $1';
                const existingIngredienteResult = await pool.query(existingIngredienteQuery, [ingrediente]);
                ingredientesIds.push(existingIngredienteResult.rows[0].id);
            }
        }

        // Relacionar el coctel con los ingredientes
        for (const ingredienteId of ingredientesIds) {
            const relacionQuery = 'INSERT INTO products_ingredients (product_id, ingredient_id) VALUES ($1, $2)';
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

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, ingredientes } = req.body;

    if (id === undefined || isNaN(id)) {
        return res.status(400).json({ mensaje: 'ID inválido' });
    }

    try {
        // Verificar si el cóctel existe
        const verificarQuery = 'SELECT * FROM products WHERE id = $1';
        const verificarResult = await pool.query(verificarQuery, [id]);

        if (verificarResult.rows.length < 1) {
            return res.status(404).json({ mensaje: 'El cóctel no existe' });
        }

        await pool.query('BEGIN');

        // Actualizar nombre y precio
        const updateCoctelQuery = `UPDATE products SET name = $1, price = $2 WHERE id = $3`;
        await pool.query(updateCoctelQuery, [nombre, precio, id]);

        if (ingredientes && Array.isArray(ingredientes)) {
            // Eliminar relaciones actuales
            const deleteIngredientesQuery = `DELETE FROM products_ingredients WHERE product_id = $1`;
            await pool.query(deleteIngredientesQuery, [id]);

            // Insertar nuevos ingredientes
            for (const ingrediente of ingredientes) {
                const insertIngredienteQuery = `
                    INSERT INTO ingredients (name)
                    VALUES ($1)
                    ON CONFLICT (name) DO NOTHING
                    RETURNING id
                `;
                const ingredienteResult = await pool.query(insertIngredienteQuery, [ingrediente]);

                let ingredienteId;
                if (ingredienteResult.rows.length > 0) {
                    ingredienteId = ingredienteResult.rows[0].id;
                } else {
                    const getIngredienteIdQuery = `SELECT id FROM ingredients WHERE name = $1`;
                    const getIngredienteIdResult = await pool.query(getIngredienteIdQuery, [ingrediente]);
                    ingredienteId = getIngredienteIdResult.rows[0].id;
                }

                const insertRelacionQuery = `INSERT INTO products_ingredients (product_id, ingredient_id) VALUES ($1, $2)`;
                await pool.query(insertRelacionQuery, [id, ingredienteId]);
            }
        }

        await pool.query('COMMIT');

        res.status(200).json({ mensaje: 'Cóctel actualizado exitosamente' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error al actualizar el cóctel:', error);
        res.status(500).json({ mensaje: 'Error al actualizar el cóctel' });
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

