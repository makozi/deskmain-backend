import express from 'express';
import { verifyMerchant } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: List all products (marketplace)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of products
 */
router.get('/', async (req, res) => res.json({ products: [], total: 0 }));

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get product details
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product details
 */
router.get('/:id', async (req, res) => res.json({ product: 'details here' }));

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *               product_type: { type: string }
 *     responses:
 *       201:
 *         description: Product created
 */
router.post('/', verifyMerchant, async (req, res) => {
  res.status(201).json({ message: 'Product created', id: 'product_id' });
});

/**
 * @swagger
 * /api/v1/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product updated
 */
router.put('/:id', verifyMerchant, async (req, res) => res.json({ message: 'Product updated' }));

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product deleted
 */
router.delete('/:id', verifyMerchant, async (req, res) => res.json({ message: 'Product deleted' }));

/**
 * @swagger
 * /api/v1/products/{id}/reviews:
 *   get:
 *     summary: Get product reviews
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product reviews
 */
router.get('/:id/reviews', async (req, res) => res.json({ reviews: [], total: 0 }));

export default router;
