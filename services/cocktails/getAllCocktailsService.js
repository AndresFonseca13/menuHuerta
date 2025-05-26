const pool = require('../../config/db');

const getAllCocktailsService = async (req, res) => {
    const query = `
        SELECT 
            p.id AS product_id, 
            p.name AS product_name, 
            p.price, 
            array_agg(DISTINCT i.name) AS ingredients,
            array_agg(DISTINCT img.url) AS images
        FROM products p
        LEFT JOIN products_ingredients pi ON p.id = pi.product_id
        LEFT JOIN ingredients i ON pi.ingredient_id = i.id
        LEFT JOIN images img ON p.id = img.product_id
        GROUP BY p.id
    `;
    const result = await pool.query(query);
    return result.rows
}

module.exports = getAllCocktailsService;