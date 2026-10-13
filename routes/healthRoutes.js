const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: API ve Veritabanı sağlık durumu kontrolü
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Başarılı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 database:
 *                   type: string
 *                   example: connected
 */
router.get('/', healthController.checkHealth);

module.exports = router;
