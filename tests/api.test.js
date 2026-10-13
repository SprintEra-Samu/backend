const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('SprintEra API Tests', () => {
  
  it('GET /api/health should return status ok', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.database).toBe('connected');
  });

  it('POST /api/auth/register should create a new user', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    
    expect(response.status).toBe(201);
    expect(response.body.email).toBe('test@example.com');
    expect(response.body).toHaveProperty('id');
  });

  it('POST /api/auth/login should return a token for valid credentials', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123'
    });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe('test@example.com');
  });

  describe('Stage 1 - Authentication & Token Verification Tests', () => {
    const jwt = require('jsonwebtoken');
    let validToken;
    let expiredToken;

    beforeAll(async () => {
      // Login with newly created user to get valid token
      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123'
      });
      validToken = res.body.token;

      // Create an expired token
      expiredToken = jwt.sign(
        { user: { id: res.body.user.id, role_id: res.body.user.role_id } },
        process.env.JWT_SECRET,
        { expiresIn: '-1s' }
      );
    });

    it('GET /api/auth/me should return 401 when no token is provided', async () => {
      const response = await request(app).get('/api/auth/me');
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Erişim reddedildi. Geçerli bir token sağlanmadı.');
    });

    it('GET /api/auth/me should return 401 when header has invalid format', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Basic invalidtoken');
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('GET /api/auth/me should return 401 when token is invalid or malformed', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.payload');
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Geçersiz veya süresi dolmuş token.');
    });

    it('GET /api/auth/me should return 401 when token is expired', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Geçersiz veya süresi dolmuş token.');
    });

    it('GET /api/auth/me should return user details and exclude password_hash when token is valid', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.name).toBe('Test User');
      expect(response.body.password_hash).toBeUndefined();
      expect(response.body).toHaveProperty('Role');
      expect(response.body.Role).toHaveProperty('name');
    });

    it('Database seed should create roles and test users properly', async () => {
      const seed = require('../seed');
      const { Role, User } = require('../models');

      await seed(false);

      const adminRole = await Role.findOne({ where: { name: 'Yönetici' } });
      const memberRole = await Role.findOne({ where: { name: 'Ekip Üyesi' } });
      expect(adminRole).not.toBeNull();
      expect(memberRole).not.toBeNull();

      const adminUser = await User.findOne({ where: { email: 'admin@sprintera.com' } });
      const memberUser = await User.findOne({ where: { email: 'test@sprintera.com' } });
      expect(adminUser).not.toBeNull();
      expect(memberUser).not.toBeNull();

      // Test login with seeded admin user
      const adminLogin = await request(app).post('/api/auth/login').send({
        email: 'admin@sprintera.com',
        password: 'admin123'
      });
      expect(adminLogin.status).toBe(200);
      expect(adminLogin.body.user.email).toBe('admin@sprintera.com');
      expect(adminLogin.body.user.Role.name).toBe('Yönetici');

      // Test login with seeded member user
      const memberLogin = await request(app).post('/api/auth/login').send({
        email: 'test@sprintera.com',
        password: 'test1234'
      });
      expect(memberLogin.status).toBe(200);
      expect(memberLogin.body.user.email).toBe('test@sprintera.com');
      expect(memberLogin.body.user.Role.name).toBe('Ekip Üyesi');
    });
  });

  describe('Stage 2 - Project Management API Tests', () => {
    let token;
    let createdProjectId;

    beforeAll(async () => {
      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'admin@sprintera.com',
        password: 'admin123'
      });
      token = loginRes.body.token;
    });

    it('POST /api/projects should return 401 when token is missing', async () => {
      const response = await request(app).post('/api/projects').send({
        name: 'İzinsiz Proje'
      });
      expect(response.status).toBe(401);
    });

    it('POST /api/projects should return 400 when name is missing or empty', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'İsimsiz proje açıklaması'
        });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Proje adı zorunludur.');
    });

    it('POST /api/projects should create project and return 201 with creator info', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Sprint 3 Projesi',
          description: 'Jira benzeri proje yönetim paneli',
          date: '2026-10-20'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Sprint 3 Projesi');
      expect(response.body.description).toBe('Jira benzeri proje yönetim paneli');
      expect(response.body.date).toBe('2026-10-20');
      expect(response.body).toHaveProperty('creator');
      expect(response.body.creator.email).toBe('admin@sprintera.com');
      expect(response.body.creator.password_hash).toBeUndefined();

      createdProjectId = response.body.id;
    });

    it('GET /api/projects should return 401 when token is missing', async () => {
      const response = await request(app).get('/api/projects');
      expect(response.status).toBe(401);
    });

    it('GET /api/projects should list all projects for authenticated user', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);

      const found = response.body.find(p => p.id === createdProjectId);
      expect(found).toBeDefined();
      expect(found.name).toBe('Sprint 3 Projesi');
      expect(found.creator).toBeDefined();
      expect(found.creator.password_hash).toBeUndefined();
    });

    it('GET /api/projects/:id should return 401 when token is missing', async () => {
      const response = await request(app).get(`/api/projects/${createdProjectId}`);
      expect(response.status).toBe(401);
    });

    it('GET /api/projects/:id should return 400 for invalid id parameter', async () => {
      const response = await request(app)
        .get('/api/projects/invalid-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Geçersiz proje kimliği.');
    });

    it('GET /api/projects/:id should return 404 when project does not exist', async () => {
      const response = await request(app)
        .get('/api/projects/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Proje bulunamadı.');
    });

    it('GET /api/projects/:id should return project details for valid id', async () => {
      const response = await request(app)
        .get(`/api/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createdProjectId);
      expect(response.body.name).toBe('Sprint 3 Projesi');
      expect(response.body).toHaveProperty('creator');
      expect(response.body.creator.email).toBe('admin@sprintera.com');
      expect(response.body.creator.password_hash).toBeUndefined();
      expect(response.body).toHaveProperty('tasks');
    });
  });

  describe('Stage 3 - Task Management API Tests', () => {
    let token;
    let projectId;
    let adminUserId;
    let memberUserId;
    let createdTaskId;

    beforeAll(async () => {
      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'admin@sprintera.com',
        password: 'admin123'
      });
      token = loginRes.body.token;
      adminUserId = loginRes.body.user.id;

      const { User, Project } = require('../models');
      const member = await User.findOne({ where: { email: 'test@sprintera.com' } });
      memberUserId = member.id;

      const project = await Project.create({
        name: 'Görev Test Projesi',
        created_by: adminUserId
      });
      projectId = project.id;
    });

    it('POST /api/tasks should return 401 when token is missing', async () => {
      const response = await request(app).post('/api/tasks').send({
        title: 'İzinsiz Görev',
        projectId
      });
      expect(response.status).toBe(401);
    });

    it('POST /api/tasks should return 400 when title is missing or empty', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId
        });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Görev başlığı zorunludur.');
    });

    it('POST /api/tasks should return 400 when projectId is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Projesiz Görev'
        });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Geçerli bir proje kimliği (projectId) zorunludur.');
    });

    it('POST /api/tasks should return 404 when project does not exist', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Olmayan Proje Görevi',
          projectId: 999999
        });
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Bağlı olduğu proje bulunamadı.');
    });

    it('POST /api/tasks should return 404 when assigned user does not exist', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Olmayan Kullanıcıya Atanan Görev',
          projectId,
          assignedTo: 999999
        });
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Atanan kullanıcı bulunamadı.');
    });

    it('POST /api/tasks should return 400 when status is invalid', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Geçersiz Durumlu Görev',
          projectId,
          status: 'InvalidStatus'
        });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Geçersiz görev durumu');
    });

    it('POST /api/tasks should create a task with default status "To Do"', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'İlk Görev',
          description: 'Açıklama metni',
          projectId,
          assignedTo: memberUserId
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('İlk Görev');
      expect(response.body.status).toBe('To Do');
      expect(response.body.project_id).toBe(projectId);
      expect(response.body.assigned_to).toBe(memberUserId);
      expect(response.body).toHaveProperty('project');
      expect(response.body.project.name).toBe('Görev Test Projesi');
      expect(response.body).toHaveProperty('assignee');
      expect(response.body.assignee.email).toBe('test@sprintera.com');

      createdTaskId = response.body.id;
    });

    it('GET /api/tasks should return 401 when token is missing', async () => {
      const response = await request(app).get('/api/tasks');
      expect(response.status).toBe(401);
    });

    it('GET /api/tasks should list all tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/tasks should filter by projectId', async () => {
      const response = await request(app)
        .get(`/api/tasks?projectId=${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(task => {
        expect(task.project_id).toBe(projectId);
      });
    });

    it('GET /api/tasks should filter by assignedTo', async () => {
      const response = await request(app)
        .get(`/api/tasks?assignedTo=${memberUserId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(task => {
        expect(task.assigned_to).toBe(memberUserId);
      });
    });

    it('GET /api/tasks should filter by both projectId and assignedTo', async () => {
      const response = await request(app)
        .get(`/api/tasks?projectId=${projectId}&assignedTo=${memberUserId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(task => {
        expect(task.project_id).toBe(projectId);
        expect(task.assigned_to).toBe(memberUserId);
      });
    });

    it('PATCH /api/tasks/:id should return 401 when token is missing', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${createdTaskId}`)
        .send({ status: 'In Progress' });
      expect(response.status).toBe(401);
    });

    it('PATCH /api/tasks/:id should return 404 for non-existent task', async () => {
      const response = await request(app)
        .patch('/api/tasks/999999')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'In Progress' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Görev bulunamadı.');
    });

    it('PATCH /api/tasks/:id should return 400 for invalid status', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'Finished' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Geçersiz görev durumu');
    });

    it('PATCH /api/tasks/:id should update status to "In Progress"', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'In Progress' });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createdTaskId);
      expect(response.body.status).toBe('In Progress');
    });

    it('PATCH /api/tasks/:id should update status to "Done"', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'Done' });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createdTaskId);
      expect(response.body.status).toBe('Done');
    });

    it('PATCH /api/tasks/:id should reassign task to another user', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ assignedTo: adminUserId });

      expect(response.status).toBe(200);
      expect(response.body.assigned_to).toBe(adminUserId);
      expect(response.body.assignee.email).toBe('admin@sprintera.com');
    });

    it('PATCH /api/tasks/:id should return 404 when assigning to non-existent user', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ assignedTo: 999999 });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Atanan kullanıcı bulunamadı.');
    });
  });

  describe('Stage 4 - Role-Based Access Control (RBAC) Tests', () => {
    let adminToken;
    let memberToken;
    let unauthorizedToken;

    beforeAll(async () => {
      const jwt = require('jsonwebtoken');

      const adminLogin = await request(app).post('/api/auth/login').send({
        email: 'admin@sprintera.com',
        password: 'admin123'
      });
      adminToken = adminLogin.body.token;

      const memberLogin = await request(app).post('/api/auth/login').send({
        email: 'test@sprintera.com',
        password: 'test1234'
      });
      memberToken = memberLogin.body.token;

      // Token for user with a non-existent role
      unauthorizedToken = jwt.sign(
        { user: { id: 9999, role_id: 9999, role: 'Misafir' } },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
    });

    it('POST /api/projects should return 403 Forbidden when accessed by "Ekip Üyesi"', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          name: 'Ekip Üyesinin Projesi'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Bu işlemi gerçekleştirmek için yetkiniz bulunmamaktadır.');
    });

    it('POST /api/projects should succeed with 201 when accessed by "Yönetici"', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Yönetici Tarafından Oluşturulan Proje',
          description: 'RBAC test projesi'
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Yönetici Tarafından Oluşturulan Proje');
    });

    it('GET /api/projects should allow access to both "Yönetici" and "Ekip Üyesi"', async () => {
      const adminRes = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(adminRes.status).toBe(200);

      const memberRes = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${memberToken}`);
      expect(memberRes.status).toBe(200);
    });

    it('GET /api/projects should return 403 for unauthorized role', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${unauthorizedToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('GET /api/tasks should return 403 for unauthorized role', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${unauthorizedToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('POST /api/tasks should return 403 for unauthorized role', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${unauthorizedToken}`)
        .send({
          title: 'Yetkisiz Görev',
          projectId: 1
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Stage 5 & 6 - Complete End-to-End Workflow Test', () => {
    it('should complete the entire 9-step Swagger workflow seamlessly', async () => {
      // 1. Giriş yap ve token al.
      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'admin@sprintera.com',
        password: 'admin123'
      });
      expect(loginRes.status).toBe(200);
      const token = loginRes.body.token;
      expect(token).toBeDefined();

      // 2. Token ile mevcut kullanıcı bilgilerini getir.
      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(meRes.status).toBe(200);
      expect(meRes.body.email).toBe('admin@sprintera.com');

      // 3. Yeni proje oluştur.
      const createProjRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'E2E Test Projesi',
          description: 'Uçtan uca iş akışı testi',
          date: '2026-10-30'
        });
      expect(createProjRes.status).toBe(201);
      const projectId = createProjRes.body.id;
      expect(projectId).toBeDefined();

      // 4. Projeleri listele.
      const listProjRes = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${token}`);
      expect(listProjRes.status).toBe(200);
      expect(listProjRes.body.some(p => p.id === projectId)).toBe(true);

      // 5. Proje ayrıntılarını görüntüle.
      const getProjRes = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(getProjRes.status).toBe(200);
      expect(getProjRes.body.name).toBe('E2E Test Projesi');

      // 6. Projeye görev ekle.
      const createTaskRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'E2E Görevi',
          description: 'İş akışı test görevi',
          projectId: projectId,
          status: 'To Do'
        });
      expect(createTaskRes.status).toBe(201);
      const taskId = createTaskRes.body.id;
      expect(createTaskRes.body.status).toBe('To Do');

      // 7. Görevleri listele ve filtrele.
      const filterTasksRes = await request(app)
        .get(`/api/tasks?projectId=${projectId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(filterTasksRes.status).toBe(200);
      expect(filterTasksRes.body.some(t => t.id === taskId)).toBe(true);

      // 8. Görevi bir kullanıcıya ata.
      const { User } = require('../models');
      const testUser = await User.findOne({ where: { email: 'test@sprintera.com' } });
      const assignTaskRes = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ assignedTo: testUser.id });
      expect(assignTaskRes.status).toBe(200);
      expect(assignTaskRes.body.assigned_to).toBe(testUser.id);

      // 9. Görev durumunu To Do değerinden In Progress veya Done değerine değiştir.
      const updateStatusRes = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'In Progress' });
      expect(updateStatusRes.status).toBe(200);
      expect(updateStatusRes.body.status).toBe('In Progress');

      const markDoneRes = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'Done' });
      expect(markDoneRes.status).toBe(200);
      expect(markDoneRes.body.status).toBe('Done');
    });
  });
});
