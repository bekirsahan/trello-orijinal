const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

class AuthController {
  // Kayıt ol (Register)
  static async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Lütfen tüm alanları doldurun (isim, email, şifre).'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Şifre en az 6 karakter olmalıdır.'
        });
      }

      // E-posta kontrolü
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Bu e-posta adresi zaten kullanımda.'
        });
      }

      // Şifre hashleme
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      // Kullanıcı oluşturma
      // İlk kayıt olan kişiyi ADMIN yapalım (geliştirme ve yönetim kolaylığı için), sonrakileri USER
      const userCount = await prisma.user.count();
      const role = userCount === 0 ? 'ADMIN' : 'USER';

      // Varsayılan avatar oluştur (Dicebear)
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

      const user = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          passwordHash,
          role,
          avatar
        }
      });

      // Token oluşturma
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'trello_super_secret_key_12345',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Kayıt başarıyla tamamlandı.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Giriş Yap (Login)
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Lütfen email ve şifrenizi girin.'
        });
      }

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'E-posta adresi veya şifre hatalı.'
        });
      }

      // Şifre eşleşme kontrolü
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'E-posta adresi veya şifre hatalı.'
        });
      }

      // Token oluşturma
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'trello_super_secret_key_12345',
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Giriş başarılı.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Aktif kullanıcı bilgileri (Profile / Get Me)
  static async getMe(req, res, next) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Kullanıcı bulunamadı.'
        });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Profil Güncelle
  static async updateProfile(req, res, next) {
    try {
      const { name, avatar } = req.body;
      const dataToUpdate = {};

      if (name) dataToUpdate.name = name;
      if (avatar) dataToUpdate.avatar = avatar;

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: dataToUpdate
      });

      res.json({
        success: true,
        message: 'Profil başarıyla güncellendi.',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          avatar: updatedUser.avatar
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
