import User from "../models/userModel.js";
import { errorHandler } from "../utils/error.js";

export const getAllUsers = async (req, res, next) => {
  try {
    // Obtener todos los usuarios, excluyendo la contraseña
    const users = await User.find({}, { password: 0, refreshToken: 0 });
    
    res.status(200).json(users);
  } catch (error) {
    // Log del error para debugging y monitoreo
    console.error('Error al obtener usuarios:', error.message);
    
    // Pasar el error original al middleware de manejo de errores
    next(errorHandler(500, "Error al obtener usuarios", error.message));
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    // Usar Promise.all para optimizar las consultas paralelas
    const [totalUsers, totalVendors, totalAdmins, recentUsers] = await Promise.all([
      User.countDocuments({ isAdmin: false, isVendor: false }),
      User.countDocuments({ isVendor: true }),
      User.countDocuments({ isAdmin: true }),
      User.find(
        { isAdmin: false, isVendor: false },
        { username: 1, email: 1, createdAt: 1, profilePicture: 1 }
      )
      .sort({ createdAt: -1 })
      .limit(5)
      .lean() // Optimización: devuelve objetos JavaScript planos
    ]);

    res.status(200).json({
      totalUsers,
      totalVendors,
      totalAdmins,
      recentUsers
    });
  } catch (error) {
    // Log del error para debugging y monitoreo
    console.error('Error al obtener estadísticas del dashboard:', error.message);
    
    // Pasar el error original al middleware de manejo de errores
    next(errorHandler(500, "Error al obtener estadísticas", error.message));
  }
};