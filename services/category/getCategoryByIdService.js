const pool = require('../../config/db');

const getCategoryByIdService = async (id) => {
    // Verificar si la categoría existe
    const checkQuery = 'SELECT * FROM categories WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    if (checkResult.rows.length === 0) {
        throw new Error('Categoría no encontrada');
    }

    const query = `
        SELECT c.id, c.name, c.type
        FROM categories c
        WHERE c.id = $1;
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
}

module.exports = getCategoryByIdService;