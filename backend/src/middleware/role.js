const role = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Yetkisiz erişim: Kullanıcı oturumu bulunamadı.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Erişim engellendi: Bu işlem için yetkiniz yetersiz.'
      });
    }

    next();
  };
};

module.exports = role;
