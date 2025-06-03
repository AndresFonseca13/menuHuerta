const pool = require('../../config/db');
const getAllCocktailsService = async ({ categoria, tipo, orden, limite, offset }) => {
  const ordenValido = ['name', 'price'].includes(orden) ? orden : 'name';

  const query = `
    SELECT p.id, p.name, p.price, p.description,
           array_agg(DISTINCT i.name) AS ingredients,
           array_agg(DISTINCT c.name) AS categories
    FROM products p
    LEFT JOIN products_ingredients pi ON p.id = pi.product_id
    LEFT JOIN ingredients i ON pi.ingredient_id = i.id
    LEFT JOIN products_categories pc ON p.id = pc.product_id
    LEFT JOIN categories c ON pc.category_id = c.id
    WHERE ($1::text IS NULL OR c.name = $1)
      AND ($2::text IS NULL OR c.type = $2)
    GROUP BY p.id
    ORDER BY p."${ordenValido}"
    LIMIT $3 OFFSET $4
  `;

  const values = [categoria, tipo, limite, offset];

  const result = await pool.query(query, values);
  return result.rows;
};

module.exports = getAllCocktailsService;