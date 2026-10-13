const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: API Dokümantasyonu Hazırla
 *         description:
 *           type: string
 *           example: Swagger üzerinde tüm uç noktaları açıkla
 *         status:
 *           type: string
 *           enum: [To Do, In Progress, Done]
 *           example: To Do
 *         project_id:
 *           type: integer
 *           example: 1
 *         assigned_to:
 *           type: integer
 *           nullable: true
 *           example: 2
 *         project:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *         assignee:
 *           type: object
 *           nullable: true
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
 * /api/tasks:
 *   post:
 *     summary: Yeni bir görev oluşturur
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - projectId
 *             properties:
 *               title:
 *                 type: string
 *                 example: Veritabanı İndekslerini Kontrol Et
 *               description:
 *                 type: string
 *                 example: Performans için indeks ekle
 *               projectId:
 *                 type: integer
 *                 example: 1
 *               assignedTo:
 *                 type: integer
 *                 nullable: true
 *                 example: 2
 *               status:
 *                 type: string
 *                 enum: [To Do, In Progress, Done]
 *                 default: To Do
 *     responses:
 *       201:
 *         description: Görev başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Geçersiz parametre, eksik başlık veya geçersiz durum
 *       401:
 *         description: Yetkisiz erişim (token eksik veya geçersiz)
 *       404:
 *         description: Proje veya atanan kullanıcı bulunamadı
 */
router.post('/', authenticate, authorize(['Yönetici', 'Ekip Üyesi']), taskController.createTask);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Görevleri listeler ve filtreler
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: integer
 *         description: Proje kimliğine göre filtrele
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: integer
 *         description: Atanan kullanıcı kimliğine göre filtrele
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [To Do, In Progress, Done]
 *         description: Görev durumuna göre filtrele
 *     responses:
 *       200:
 *         description: Görevler başarıyla listelendi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       401:
 *         description: Yetkisiz erişim (token eksik veya geçersiz)
 */
router.get('/', authenticate, authorize(['Yönetici', 'Ekip Üyesi']), taskController.getTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *   patch:
 *     summary: Görev durumunu veya atanan kullanıcıyı günceller
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Görev ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [To Do, In Progress, Done]
 *                 example: In Progress
 *               assignedTo:
 *                 type: integer
 *                 nullable: true
 *                 example: 2
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Görev başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Geçersiz görev ID veya geçersiz durum
 *       401:
 *         description: Yetkisiz erişim (token eksik veya geçersiz)
 *       404:
 *         description: Görev veya atanacak kullanıcı bulunamadı
 */
router.patch('/:id', authenticate, authorize(['Yönetici', 'Ekip Üyesi']), taskController.updateTask);

module.exports = router;
