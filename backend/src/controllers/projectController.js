const prisma = require('../config/db');

class ProjectController {
  // Kullanıcının katıldığı veya sahibi olduğu tüm projeleri listele
  static async getProjects(req, res, next) {
    try {
      const userId = req.user.id;

      // Kullanıcının üyesi olduğu proje ID'lerini çekelim
      const memberships = await prisma.projectMember.findMany({
        where: { userId },
        select: { projectId: true }
      });

      const projectIds = memberships.map(m => m.projectId);

      // Bu projelere ait bilgileri çekelim
      const projects = await prisma.project.findMany({
        where: {
          id: { in: projectIds }
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        },
        orderBy: { updatedAt: 'desc' }
      });

      res.json({
        success: true,
        projects
      });
    } catch (error) {
      next(error);
    }
  }

  // Yeni proje oluştur
  static async createProject(req, res, next) {
    try {
      const { title, description, color } = req.body;
      const userId = req.user.id;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Proje başlığı zorunludur.'
        });
      }

      // Projeyi ve ilk OWNER üyelik kaydını transaction ile yapalım
      const result = await prisma.$transaction(async (tx) => {
        const newProject = await tx.project.create({
          data: {
            title,
            description,
            color: color || '#4f46e5',
            ownerId: userId
          }
        });

        await tx.projectMember.create({
          data: {
            projectId: newProject.id,
            userId: userId,
            role: 'OWNER'
          }
        });

        return newProject;
      });

      res.status(201).json({
        success: true,
        message: 'Proje başarıyla oluşturuldu.',
        project: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Proje detaylarını çek (Görevler, Sütunlar ve Üyeler dahil)
  static async getProjectById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Kullanıcının bu projeye erişim yetkisi var mı?
      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: id,
            userId
          }
        }
      });

      if (!member) {
        return res.status(403).json({
          success: false,
          message: 'Bu projeyi görüntüleme yetkiniz yok.'
        });
      }

      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          tasks: {
            include: {
              assignee: {
                select: { id: true, name: true, email: true, avatar: true }
              },
              creator: {
                select: { id: true, name: true }
              }
            },
            orderBy: { orderIndex: 'asc' }
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatar: true }
              }
            }
          },
          owner: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Proje bulunamadı.'
        });
      }

      res.json({
        success: true,
        project
      });
    } catch (error) {
      next(error);
    }
  }

  // Projeyi Güncelle (Sadece OWNER)
  static async updateProject(req, res, next) {
    try {
      const { id } = req.params;
      const { title, description, color } = req.body;
      const userId = req.user.id;

      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: id,
            userId
          }
        }
      });

      if (!member || member.role !== 'OWNER') {
        return res.status(403).json({
          success: false,
          message: 'Sadece proje sahibi projeyi güncelleyebilir.'
        });
      }

      const updatedProject = await prisma.project.update({
        where: { id },
        data: {
          title,
          description,
          color
        }
      });

      res.json({
        success: true,
        message: 'Proje başarıyla güncellendi.',
        project: updatedProject
      });
    } catch (error) {
      next(error);
    }
  }

  // Projeyi Sil (Sadece OWNER)
  static async deleteProject(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: id,
            userId
          }
        }
      });

      if (!member || member.role !== 'OWNER') {
        return res.status(403).json({
          success: false,
          message: 'Sadece proje sahibi projeyi silebilir.'
        });
      }

      await prisma.project.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Proje başarıyla silindi.'
      });
    } catch (error) {
      next(error);
    }
  }

  // Projeye Ekip Üyesi Ekle
  static async addMember(req, res, next) {
    try {
      const { id } = req.params; // projectId
      const { email, role } = req.body;
      const userId = req.user.id;

      // İstek gönderen proje OWNER'ı mı?
      const requester = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: id,
            userId
          }
        }
      });

      if (!requester || requester.role !== 'OWNER') {
        return res.status(403).json({
          success: false,
          message: 'Sadece proje sahibi yeni üye ekleyebilir.'
        });
      }

      // Davet edilmek istenen kullanıcı var mı?
      const targetUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'Belirtilen e-posta adresine sahip bir kullanıcı bulunamadı.'
        });
      }

      // Kullanıcı zaten projede üye mi?
      const existingMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: id,
            userId: targetUser.id
          }
        }
      });

      if (existingMember) {
        return res.status(400).json({
          success: false,
          message: 'Bu kullanıcı zaten projenin üyesi.'
        });
      }

      const newMember = await prisma.projectMember.create({
        data: {
          projectId: id,
          userId: targetUser.id,
          role: role || 'MEMBER'
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      });

      res.status(201).json({
        success: true,
        message: 'Üye projeye eklendi.',
        member: newMember
      });
    } catch (error) {
      next(error);
    }
  }

  // Projeden Ekip Üyesi Çıkar
  static async removeMember(req, res, next) {
    try {
      const { id, memberUserId } = req.params; // id: projectId
      const userId = req.user.id;

      // İstek gönderen proje OWNER'ı mı? Yoksa üyenin kendisi mi (ayrılmak için)?
      const requester = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: id,
            userId
          }
        }
      });

      if (!requester) {
        return res.status(403).json({
          success: false,
          message: 'Bu projede yetkiniz yok.'
        });
      }

      const isOwner = requester.role === 'OWNER';
      const isSelf = userId === memberUserId;

      if (!isOwner && !isSelf) {
        return res.status(403).json({
          success: false,
          message: 'Projeden üye çıkarma yetkiniz yok.'
        });
      }

      // Proje sahibini kendisinden çıkaramayız
      if (isSelf && isOwner) {
        return res.status(400).json({
          success: false,
          message: 'Proje sahibi projeden ayrılamaz. Önce mülkiyeti devredin veya projeyi silin.'
        });
      }

      await prisma.projectMember.delete({
        where: {
          projectId_userId: {
            projectId: id,
            userId: memberUserId
          }
        }
      });

      res.json({
        success: true,
        message: 'Üye projeden başarıyla çıkarıldı.'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProjectController;
