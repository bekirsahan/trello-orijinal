const prisma = require('../config/db');

class TaskController {
  // Yeni Görev oluştur
  static async createTask(req, res, next) {
    try {
      const { projectId, title, description, priority, dueDate, assigneeId, tags } = req.body;
      const userId = req.user.id;

      if (!projectId || !title) {
        return res.status(400).json({
          success: false,
          message: 'Proje ID ve Görev Başlığı zorunludur.'
        });
      }

      // Projeye erişim kontrolü
      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId
          }
        }
      });

      if (!member) {
        return res.status(403).json({
          success: false,
          message: 'Bu projede görev oluşturma yetkiniz yok.'
        });
      }

      // Aynı sütundaki (varsayılan: todo) en yüksek orderIndex değerini bulalım
      const lastTask = await prisma.task.findFirst({
        where: {
          projectId,
          status: 'todo'
        },
        orderBy: {
          orderIndex: 'desc'
        }
      });

      const orderIndex = lastTask ? lastTask.orderIndex + 1 : 0;

      const task = await prisma.task.create({
        data: {
          projectId,
          title,
          description,
          priority: priority || 'MEDIUM',
          dueDate: dueDate ? new Date(dueDate) : null,
          assigneeId: assigneeId || null,
          tags: tags || null,
          createdById: userId,
          orderIndex
        },
        include: {
          assignee: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          creator: {
            select: { id: true, name: true }
          }
        }
      });

      // Aktivite logu ekle
      await prisma.taskLog.create({
        data: {
          taskId: task.id,
          userId,
          action: 'CREATED',
          details: `Görev '${title}' oluşturuldu.`
        }
      });

      res.status(201).json({
        success: true,
        message: 'Görev başarıyla oluşturuldu.',
        task
      });
    } catch (error) {
      next(error);
    }
  }

  // Görev Detaylarını Güncelle
  static async updateTask(req, res, next) {
    try {
      const { id } = req.params;
      const { title, description, priority, dueDate, assigneeId, tags } = req.body;
      const userId = req.user.id;

      const existingTask = await prisma.task.findUnique({
        where: { id }
      });

      if (!existingTask) {
        return res.status(404).json({
          success: false,
          message: 'Görev bulunamadı.'
        });
      }

      // Projeye erişim kontrolü
      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: existingTask.projectId,
            userId
          }
        }
      });

      if (!member) {
        return res.status(403).json({
          success: false,
          message: 'Bu projede görev düzenleme yetkiniz yok.'
        });
      }

      const updatedTask = await prisma.task.update({
        where: { id },
        data: {
          title: title !== undefined ? title : existingTask.title,
          description: description !== undefined ? description : existingTask.description,
          priority: priority !== undefined ? priority : existingTask.priority,
          dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : existingTask.dueDate,
          assigneeId: assigneeId !== undefined ? assigneeId : existingTask.assigneeId,
          tags: tags !== undefined ? tags : existingTask.tags
        },
        include: {
          assignee: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          creator: {
            select: { id: true, name: true }
          }
        }
      });

      // Aktivite logu ekle
      await prisma.taskLog.create({
        data: {
          taskId: id,
          userId,
          action: 'UPDATED',
          details: `Görev detayları güncellendi.`
        }
      });

      res.json({
        success: true,
        message: 'Görev başarıyla güncellendi.',
        task: updatedTask
      });
    } catch (error) {
      next(error);
    }
  }

  // Görev Sürükle-Bırak Durum ve Sıralama Güncelleme (PATCH)
  static async updateTaskStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, orderIndex } = req.body;
      const userId = req.user.id;

      if (!status || orderIndex === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Görev durumu (status) ve sıra indeksi (orderIndex) gereklidir.'
        });
      }

      const task = await prisma.task.findUnique({
        where: { id }
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Görev bulunamadı.'
        });
      }

      // Proje erişim kontrolü
      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: task.projectId,
            userId
          }
        }
      });

      if (!member) {
        return res.status(403).json({
          success: false,
          message: 'Bu projede işlem yapma yetkiniz yok.'
        });
      }

      const oldStatus = task.status;

      // Durum ve Sıralama güncellemesi
      const updatedTask = await prisma.task.update({
        where: { id },
        data: {
          status,
          orderIndex
        },
        include: {
          assignee: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      });

      // Log oluştur
      if (oldStatus !== status) {
        await prisma.taskLog.create({
          data: {
            taskId: id,
            userId,
            action: 'STATUS_CHANGE',
            details: `Görev durumu değiştirildi: '${oldStatus}' -> '${status}'`
          }
        });
      }

      res.json({
        success: true,
        message: 'Görev konumu başarıyla güncellendi.',
        task: updatedTask
      });
    } catch (error) {
      next(error);
    }
  }

  // Görev Sil
  static async deleteTask(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const task = await prisma.task.findUnique({
        where: { id }
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Görev bulunamadı.'
        });
      }

      // Proje erişim kontrolü
      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: task.projectId,
            userId
          }
        }
      });

      if (!member) {
        return res.status(403).json({
          success: false,
          message: 'Bu projede görev silme yetkiniz yok.'
        });
      }

      await prisma.task.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Görev başarıyla silindi.'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TaskController;
