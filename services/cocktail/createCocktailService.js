const pool = require('../../config/db');
const { ConflictError } = require('../../errors/ConflictError');

const createCocktailService = async (name, price, description, ingredients, images, categories, userid) => {
    const checkQuery = `SELECT * FROM products WHERE name = $1`;
    const checkResult = await pool.query(checkQuery, [name]);
    if (checkResult.rows.length > 0) {
        throw new ConflictError('El cóctel ya existe');
    }
    try{
        await pool.query('BEGIN');
        const insertCocktailQuery = 'INSERT INTO products (name, price, description, created_by) VALUES ($1, $2, $3, $4) RETURNING id, name, price, description';
        const cocktailResult = await pool.query(insertCocktailQuery, [name, price, description, userid]);
        const cocktailId = cocktailResult.rows[0].id;

        const ingredientsIds = [];

        for(const ingredient of ingredients){
            const ingredientQuery = `
                INSERT INTO ingredients (name) 
                VALUES ($1) 
                ON CONFLICT (name) DO NOTHING 
                RETURNING id
                `;
            const ingredientResult = await pool.query(ingredientQuery, [ingredient]);

            // Si el ingrediente ya existe, obtener su ID
            if(ingredientResult.rows.length > 0){
                ingredientsIds.push(ingredientResult.rows[0].id);
            } else {
                const existingIngredientQuery = 'SELECT id FROM ingredients WHERE name = $1';
                const existingIngredientResult = await pool.query(existingIngredientQuery, [ingredient]);
                ingredientsIds.push(existingIngredientResult.rows[0].id);
            }
        }

        // Relacionar el coctel con los ingredientes
        for (const ingredientId of ingredientsIds) {
            const relacionQuery = 'INSERT INTO products_ingredients (product_id, ingredient_id) VALUES ($1, $2)';
            await pool.query(relacionQuery, [cocktailId, ingredientId]);
        }

        for (const { name: categoryName, type: categoryType } of categories) {
          const insertCategoryQuery = `
              INSERT INTO categories (name, type)
              VALUES ($1, $2)
              ON CONFLICT (name, type) DO NOTHING
              RETURNING id;
          `;
          const result = await pool.query(insertCategoryQuery, [categoryName, categoryType]);

          let categoryId;
          if (result.rows.length > 0) {
              categoryId = result.rows[0].id;
          } else {
              const existingQuery = 'SELECT id FROM categories WHERE name = $1 AND type = $2';
              const existingResult = await pool.query(existingQuery, [categoryName, categoryType]);
              categoryId = existingResult.rows[0].id;
          }

          await pool.query(
              'INSERT INTO products_categories (product_id, category_id) VALUES ($1, $2)',
              [cocktailId, categoryId]
          );
        }

        for (const url of images) {
            const insertPhotoQuery = `
            INSERT INTO images (product_id, url)
            VALUES ($1, $2)
            `;
    await pool.query(insertPhotoQuery, [cocktailId, url]);
}

        // Confirmamos la transaccion
        await pool.query('COMMIT');
        
        return cocktailResult.rows[0];
    } catch (error) {
    await pool.query('ROLLBACK');
    console.error('⛔ Error real:', error);
    throw new Error(`Error al crear el cóctel: ${error.message}`);
}
}
module.exports = createCocktailService;