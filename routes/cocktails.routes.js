const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const validarCoctel = require('../middleware/validarCocteles');
const cocktailsController = require('../controllers/cocktails.controler');

router.get('/', cocktailsController.getAllCocktails);

router.get("/:id", cocktailsController.getCocktailById);

router.post('/', validarCoctel([]), cocktailsController.createCocktail);

// router.put('/:id', async (req, res) => {
//     const { id } = req.params;
//     const { nombre, precio, ingredientes } = req.body;

//     if (id === undefined || isNaN(id)) {
//         return res.status(400).json({ mensaje: 'ID inválido' });
//     }

//     try {
//         // Verificar si el cóctel existe
//         const verificarQuery = 'SELECT * FROM products WHERE id = $1';
//         const verificarResult = await pool.query(verificarQuery, [id]);

//         if (verificarResult.rows.length < 1) {
//             return res.status(404).json({ mensaje: 'El cóctel no existe' });
//         }

//         await pool.query('BEGIN');

//         // Actualizar nombre y precio
//         const updateCoctelQuery = `UPDATE products SET name = $1, price = $2 WHERE id = $3`;
//         await pool.query(updateCoctelQuery, [nombre, precio, id]);

//         if (ingredientes && Array.isArray(ingredientes)) {
//             // Eliminar relaciones actuales
//             const deleteIngredientesQuery = `DELETE FROM products_ingredients WHERE product_id = $1`;
//             await pool.query(deleteIngredientesQuery, [id]);

//             // Insertar nuevos ingredientes
//             for (const ingrediente of ingredientes) {
//                 const insertIngredienteQuery = `
//                     INSERT INTO ingredients (name)
//                     VALUES ($1)
//                     ON CONFLICT (name) DO NOTHING
//                     RETURNING id
//                 `;
//                 const ingredienteResult = await pool.query(insertIngredienteQuery, [ingrediente]);

//                 let ingredienteId;
//                 if (ingredienteResult.rows.length > 0) {
//                     ingredienteId = ingredienteResult.rows[0].id;
//                 } else {
//                     const getIngredienteIdQuery = `SELECT id FROM ingredients WHERE name = $1`;
//                     const getIngredienteIdResult = await pool.query(getIngredienteIdQuery, [ingrediente]);
//                     ingredienteId = getIngredienteIdResult.rows[0].id;
//                 }

//                 const insertRelacionQuery = `INSERT INTO products_ingredients (product_id, ingredient_id) VALUES ($1, $2)`;
//                 await pool.query(insertRelacionQuery, [id, ingredienteId]);
//             }
//         }

//         await pool.query('COMMIT');

//         res.status(200).json({ mensaje: 'Cóctel actualizado exitosamente' });
//     } catch (error) {
//         await pool.query('ROLLBACK');
//         console.error('Error al actualizar el cóctel:', error);
//         res.status(500).json({ mensaje: 'Error al actualizar el cóctel' });
//     }
// });

router.put('/:id', cocktailsController.updateCocktail);

router.delete('/:id', cocktailsController.deleteCocktail);

module.exports = router;

