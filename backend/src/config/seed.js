const bcrypt = require('bcryptjs');
const prisma = require('./db');

async function main() {
  console.log('🌱 Veritabanı tohumlama (seeding) başlatıldı...');

  // Önceki verileri temizle (opsiyonel ama temiz başlangıç için faydalı)
  await prisma.taskLog.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Eski veriler temizlendi.');

  // Şifreleri hashle
  const salt = await bcrypt.genSalt(12);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);
  const userPasswordHash = await bcrypt.hash('user123', salt);

  // Kullanıcıları oluştur
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      name: 'Sistem Yöneticisi',
      role: 'ADMIN',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    }
  });

  const memberUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      passwordHash: userPasswordHash,
      name: 'Bekir Karşıyaka',
      role: 'USER',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bekir'
    }
  });

  const extraUser = await prisma.user.create({
    data: {
      email: 'ekip1@example.com',
      passwordHash: userPasswordHash,
      name: 'Ayşe Yılmaz',
      role: 'USER',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ayse'
    }
  });

  console.log('👤 Kullanıcılar oluşturuldu:');
  console.log(`   - Admin: ${adminUser.email} (şifre: admin123)`);
  console.log(`   - User: ${memberUser.email} (şifre: user123)`);
  console.log(`   - Ekip Üyesi: ${extraUser.email} (şifre: user123)`);

  // Proje oluştur
  const project1 = await prisma.project.create({
    data: {
      title: 'Trello Clone Geliştirme',
      description: 'Faz 1-4 entegrasyonu ve sunum hazırlığı.',
      color: '#6366f1',
      ownerId: memberUser.id
    }
  });

  const project2 = await prisma.project.create({
    data: {
      title: 'Pazarlama ve Lansman',
      description: 'Ürün lansmanı ve PR yönetimi.',
      color: '#ec4899',
      ownerId: adminUser.id
    }
  });

  console.log('📁 Projeler oluşturuldu.');

  // Proje Üyeliklerini Ata
  await prisma.projectMember.createMany({
    data: [
      { projectId: project1.id, userId: memberUser.id, role: 'OWNER' },
      { projectId: project1.id, userId: adminUser.id, role: 'MEMBER' },
      { projectId: project1.id, userId: extraUser.id, role: 'MEMBER' },
      { projectId: project2.id, userId: adminUser.id, role: 'OWNER' },
      { projectId: project2.id, userId: memberUser.id, role: 'MEMBER' }
    ]
  });

  console.log('👥 Üyelikler atandı.');

  // Görevleri oluştur
  const task1 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'User Story ve ER Tasarımı',
      description: 'Proje için teknik user storylerin yazılması ve ER diyagramı planının hazırlanması.',
      status: 'done',
      priority: 'HIGH',
      orderIndex: 0,
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // dün
      tags: 'Analiz,Planlama',
      assigneeId: memberUser.id,
      createdById: memberUser.id
    }
  });

  const task2 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Express ve Prisma Kurulumu',
      description: 'Backend projesinin başlatılması, Prisma şemasının PostgreSQL ve SQLite uyumlu olacak şekilde hazırlanması.',
      status: 'doing',
      priority: 'HIGH',
      orderIndex: 0,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 gün sonra
      tags: 'Backend,DB',
      assigneeId: memberUser.id,
      createdById: memberUser.id
    }
  });

  const task3 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Kanban UI Tasarımı (React)',
      description: 'Glassmorphism esintili Dark ve Light modlu React Kanban Pano arayüzünün geliştirilmesi.',
      status: 'todo',
      priority: 'MEDIUM',
      orderIndex: 0,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 gün sonra
      tags: 'Frontend,UI',
      assigneeId: extraUser.id,
      createdById: memberUser.id
    }
  });

  const task4 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'JWT ve Role-Based Auth Entegrasyonu',
      description: 'Kullanıcı rollerinin doğrulanması, admin yetkilerinin kontrolü ve rate limit güvenlik ayarları.',
      status: 'todo',
      priority: 'URGENT',
      orderIndex: 1,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 gün sonra
      tags: 'Backend,Güvenlik',
      assigneeId: adminUser.id,
      createdById: memberUser.id
    }
  });

  console.log('📌 Görevler oluşturuldu.');

  // Görev Logları
  await prisma.taskLog.createMany({
    data: [
      { taskId: task1.id, userId: memberUser.id, action: 'CREATED', details: 'Görev oluşturuldu.' },
      { taskId: task1.id, userId: memberUser.id, action: 'STATUS_CHANGE', details: "Durum değiştirildi: 'todo' -> 'done'" },
      { taskId: task2.id, userId: memberUser.id, action: 'CREATED', details: 'Görev oluşturuldu.' },
      { taskId: task2.id, userId: memberUser.id, action: 'STATUS_CHANGE', details: "Durum değiştirildi: 'todo' -> 'doing'" }
    ]
  });

  console.log('📝 Görev hareket günlükleri (Logs) yazıldı.');
  console.log('🎉 Tohumlama işlemi başarıyla tamamlandı!');
}

main()
  .catch((e) => {
    console.error('❌ Tohumlama hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
