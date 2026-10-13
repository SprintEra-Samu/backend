const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Web Sitesi Yenileme
 *         description:
 *           type: string
 *           example: Şirket web sitesinin yeniden tasarlanması
 *         date:
 *           type: string
 *           format: date
 *           example: 2026-10-25
 *         created_by:
 *           type: integer
 *           example: 1
 *         creator:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *             email:
 *               type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Yeni bir proje oluşturur
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Sprint 3 Backend Geliştirme
 *               description:
 *                 type: string
 *                 example: Proje ve Görev yönetim modüllerinin geliştirilmesi
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2026-10-20
 *     responses:
 *       201:
 *         description: Proje başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Geçersiz parametre veya eksik proje adı
 *       401:
 *         description: Yetkisiz erişim (token eksik veya geçersiz)
 *       403:
 *         description: Yetkisiz rol (yalnızca Yönetici proje oluşturabilir)
 */
router.post('/', authenticate, authorize(['Yönetici']), projectController.createProject);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Tüm projeleri listeler
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Projeler başarıyla listelendi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       401:
 *         description: Yetkisiz erişim (token eksik veya geçersiz)
 *       403:
 *         description: Yetkisiz rol
 */
router.get('/', authenticate, authorize(['Yönetici', 'Ekip Üyesi']), projectController.getAllProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Belirtilen projenin ayrıntılarını getirir
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Proje ID
 *     responses:
 *       200:
 *         description: Proje ayrıntıları başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Geçersiz proje ID
 *       401:
 *         description: Yetkisiz erişim (token eksik veya geçersiz)
 *       403:
 *         description: Yetkisiz rol
 *       404:
 *         description: Proje bulunamadı
 */
router.get('/:id', authenticate, authorize(['Yönetici', 'Ekip Üyesi']), projectController.getProjectById);

module.exports = router;
