export const adminProtect = (req, res, next) => {
  const user = req.user;

  if (!user) return res.status(401).json({ success: false, message: 'No autorizado' });
  if (user.role !== 'admin') return res.status(403).json({ success: false, message: 'Acceso restringido a admins' });

  next();
};
