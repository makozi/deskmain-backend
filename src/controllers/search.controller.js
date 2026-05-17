import db from '../config/database.js';
import logger from '../config/logger.js';

export const search = async (req, res) => {
  try {
    const { q, type = 'all', limit = 20, offset = 0 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchTerm = `%${q.toLowerCase()}%`;
    const results = [];

    // Search products
    if (type === 'all' || type === 'products') {
      const productResult = await db.query(
        `SELECT id, name, description, price, category, image, 'product' as type
         FROM products WHERE LOWER(name) LIKE $1 OR LOWER(description) LIKE $1
         LIMIT $2 OFFSET $3`,
        [searchTerm, limit, offset]
      );
      results.push(...productResult.rows);
    }

    // Search courses
    if (type === 'all' || type === 'courses') {
      const courseResult = await db.query(
        `SELECT id, title as name, description, price, category, NULL as image, 'course' as type
         FROM courses WHERE LOWER(title) LIKE $1 OR LOWER(description) LIKE $1
         LIMIT $2 OFFSET $3`,
        [searchTerm, limit, offset]
      );
      results.push(...courseResult.rows);
    }

    // Search merchants
    if (type === 'all' || type === 'merchants') {
      const merchantResult = await db.query(
        `SELECT id, business_name as name, NULL as description, NULL as price, NULL as category, NULL as image, 'merchant' as type
         FROM merchants WHERE LOWER(business_name) LIKE $1
         LIMIT $2 OFFSET $3`,
        [searchTerm, limit, offset]
      );
      results.push(...merchantResult.rows);
    }

    // Log search
    await db.query(
      'INSERT INTO search_logs (query, result_count, user_ip, created_at) VALUES ($1, $2, $3, NOW())',
      [q, results.length, req.ip]
    );

    res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    logger.error('Error searching:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getSearchSuggestions = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const searchTerm = `${q.toLowerCase()}%`;

    // Get recent searches
    const recentResult = await db.query(
      `SELECT DISTINCT query FROM search_logs
       WHERE LOWER(query) LIKE $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [searchTerm, limit]
    );

    const suggestions = recentResult.rows.map(row => row.query);

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    logger.error('Error fetching suggestions:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getSearchStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const result = await db.query(
      `SELECT COUNT(*) as total_searches, COUNT(DISTINCT query) as unique_queries,
              COUNT(DISTINCT user_ip) as unique_users
       FROM search_logs
       WHERE created_at > NOW() - INTERVAL '1 day' * $1`,
      [days]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching search stats:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getPopularSearches = async (req, res) => {
  try {
    const { days = 30, limit = 10 } = req.query;

    const result = await db.query(
      `SELECT query, COUNT(*) as count
       FROM search_logs
       WHERE created_at > NOW() - INTERVAL '1 day' * $1
       GROUP BY query
       ORDER BY count DESC
       LIMIT $2`,
      [days, limit]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching popular searches:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
