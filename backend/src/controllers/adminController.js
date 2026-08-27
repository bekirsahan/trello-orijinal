const prisma = require('../config/db');

class AdminController {
  // Sistem istatistiklerini getir (Sadece ADMIN)
  static async getStats(req, res, next) {
    try {
      const userCount = await prisma.user.count();
      const projectCount = await prisma.project.count();
      const taskCount = await prisma.task.count();

      // Görevlerin durum dağılımını gruplayarak çekelim
      const tasksByStatus = await prisma.task.groupBy({
        by: ['status'],
        _count: {
          id: true
        }
      });

      // Kolay okunması için formatlayalım
      const statusCounts = {
        todo: 0,
        doing: 0,
        done: 0
      };

      tasksByStatus.forEach(group => {
        if (statusCounts[group.status] !== undefined) {
          statusCounts[group.status] = group._count.id;
        }
      });

      // Son eklenen kullanıcılar
      const latestUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true }
      });

      res.json({
        success: true,
        stats: {
          totalUsers: userCount,
          totalProjects: projectCount,
          totalTasks: taskCount,
          tasksByStatus: statusCounts
        },
        latestUsers
      });
    } catch (error) {
      next(error);
    }
  }

  // Tüm kullanıcıları listele (Sadece ADMIN)
  static async getAllUsers(req, res, next) {
    try {
      const users = await prisma.user.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true
        }
      });

      res.json({
        success: true,
        users
      });
    } catch (error) {
      next(error);
    }
  }

  // Kullanıcı rolünü değiştir (Sadece ADMIN)
  static async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role || !['ADMIN', 'USER'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz rol belirtildi. Sadece ADMIN veya USER olabilir.'
        });
      }

      // Kendini downgrade etmesini engelleyelim
      if (id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Kendi rolünüzü değiştiremezsiniz.'
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role },
        select: { id: true, name: true, email: true, role: true }
      });

      res.json({
        success: true,
        message: 'Kullanıcı rolü başarıyla güncellendi.',
        user: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  // Kullanıcı sil (Sadece ADMIN)
  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      if (id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Kendi hesabınızı buradan silemezsiniz.'
        });
      }

      await prisma.user.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Kullanıcı hesabı başarıyla silindi.'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;
