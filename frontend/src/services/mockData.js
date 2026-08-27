export const initialMockData = {
  users: [
    {
      id: "u1",
      email: "admin@example.com",
      name: "Sistem Yöneticisi",
      role: "ADMIN",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
    },
    {
      id: "u2",
      email: "user@example.com",
      name: "Bekir Karşıyaka",
      role: "USER",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bekir"
    },
    {
      id: "u3",
      email: "ekip1@example.com",
      name: "Ayşe Yılmaz",
      role: "USER",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ayse"
    }
  ],
  projects: [
    {
      id: "p1",
      title: "Trello Clone Geliştirme",
      description: "Faz 1-4 entegrasyonu ve sunum hazırlığı.",
      color: "#6366f1",
      ownerId: "u2"
    },
    {
      id: "p2",
      title: "Pazarlama ve Lansman",
      description: "Ürün lansmanı ve PR yönetimi.",
      color: "#ec4899",
      ownerId: "u1"
    }
  ],
  projectMembers: [
    { id: "pm1", projectId: "p1", userId: "u2", role: "OWNER" },
    { id: "pm2", projectId: "p1", userId: "u1", role: "MEMBER" },
    { id: "pm3", projectId: "p1", userId: "u3", role: "MEMBER" },
    { id: "pm4", projectId: "p2", userId: "u1", role: "OWNER" },
    { id: "pm5", projectId: "p2", userId: "u2", role: "MEMBER" }
  ],
  tasks: [
    {
      id: "t1",
      projectId: "p1",
      title: "User Story ve ER Tasarımı",
      description: "Proje için teknik user storylerin yazılması ve ER diyagramı planının hazırlanması.",
      status: "done",
      priority: "HIGH",
      orderIndex: 0,
      dueDate: "2026-08-20T18:00:00.000Z",
      tags: "Analiz,Planlama",
      assigneeId: "u2",
      createdById: "u2"
    },
    {
      id: "t2",
      projectId: "p1",
      title: "Express ve Prisma Kurulumu",
      description: "Backend projesinin başlatılması, Prisma şemasının PostgreSQL ve SQLite uyumlu olacak şekilde hazırlanması.",
      status: "doing",
      priority: "HIGH",
      orderIndex: 0,
      dueDate: "2026-08-25T18:00:00.000Z",
      tags: "Backend,DB",
      assigneeId: "u2",
      createdById: "u2"
    },
    {
      id: "t3",
      projectId: "p1",
      title: "Kanban UI Tasarımı (React)",
      description: "Glassmorphism esintili Dark ve Light modlu React Kanban Pano arayüzünün geliştirilmesi.",
      status: "todo",
      priority: "MEDIUM",
      orderIndex: 0,
      dueDate: "2026-08-29T18:00:00.000Z",
      tags: "Frontend,UI",
      assigneeId: "u3",
      createdById: "u2"
    },
    {
      id: "t4",
      projectId: "p1",
      title: "JWT ve Role-Based Auth Entegrasyonu",
      description: "Kullanıcı rollerinin doğrulanması, admin yetkilerinin kontrolü ve rate limit güvenlik ayarları.",
      status: "todo",
      priority: "URGENT",
      orderIndex: 1,
      dueDate: "2026-08-27T18:00:00.000Z",
      tags: "Backend,Güvenlik",
      assigneeId: "u1",
      createdById: "u2"
    }
  ]
};
