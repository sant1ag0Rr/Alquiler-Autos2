import User from "../../models/userModel.js";
import bcryptjs from "bcryptjs";
import Jwt from "jsonwebtoken";
import { errorHandler } from "../../utils/error.js";

const expireDate = new Date(Date.now() + 3600000);

// Regex más eficiente y segura para email
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Constantes para evitar números mágicos
const BCRYPT_SALT_ROUNDS = 10;
const RANDOM_STRING_LENGTH = 8;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const USERNAME_MAX_LENGTH = 50;
const PASSWORD_MIN_LENGTH = 6;

// Función para validar y sanitizar email
const validateAndSanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return null;
  }
  
  const sanitizedEmail = email.toString().trim().toLowerCase();
  
  // Validación de longitud para prevenir ataques
  if (sanitizedEmail.length > 254) {
    return null;
  }
  
  if (!EMAIL_REGEX.test(sanitizedEmail)) {
    return null;
  }
  
  return sanitizedEmail;
};

// Función para validar string simple con longitud máxima
const validateString = (input, maxLength = 255) => {
  if (!input || typeof input !== 'string') {
    return null;
  }
  
  const trimmed = input.toString().trim();
  
  if (trimmed.length === 0 || trimmed.length > maxLength) {
    return null;
  }
  
  return trimmed;
};

// Función para validar password con requisitos mínimos
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return null;
  }
  
  const trimmed = password.trim();
  
  if (trimmed.length < PASSWORD_MIN_LENGTH) {
    return null;
  }
  
  return trimmed;
};

// Función para validar y sanitizar photo URL
const validateAndSanitizePhoto = (photo) => {
  if (!photo) {
    return null;
  }
  
  const photoString = validateString(photo, 2048); // URLs pueden ser más largas
  if (!photoString) {
    return null;
  }
  
  try {
    const url = new URL(photoString);
    // Validar que sea HTTP o HTTPS
    if (!['http:', 'https:'].includes(url.protocol)) {
      return null;
    }
    return photoString;
  } catch {
    return null;
  }
};

// Función para generar string aleatorio seguro
const generateRandomString = (length = RANDOM_STRING_LENGTH) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Función para generar username único
const generateUniqueUsername = (sanitizedName) => {
  const baseUsername = sanitizedName
    .split(" ")
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20); // Limitar longitud base
  
  const randomSuffix = generateRandomString(8) + generateRandomString(8);
  
  return baseUsername + randomSuffix;
};

// Función para crear respuesta con cookie y token
const createAuthResponse = (res, user, token) => {
  const { password, ...rest } = user;
  
  return res
    .cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS en producción
      sameSite: 'strict',
      expires: expireDate,
    })
    .status(200)
    .json(rest);
};

// Función para manejar usuario existente
const handleExistingVendor = (res, user) => {
  if (!process.env.ACCESS_TOKEN) {
    throw new Error('ACCESS_TOKEN environment variable is required');
  }
  
  const token = Jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN);
  return createAuthResponse(res, user, token);
};

// Función para crear nuevo vendor
const createNewVendor = async (sanitizedEmail, sanitizedName, sanitizedPhoto) => {
  const generatedPassword = generateRandomString(16); // Password más largo
  const hashedPassword = bcryptjs.hashSync(generatedPassword, BCRYPT_SALT_ROUNDS);
  
  const newUser = new User({
    profilePicture: sanitizedPhoto,
    password: hashedPassword,
    username: generateUniqueUsername(sanitizedName),
    email: sanitizedEmail,
    isVendor: true,
  });
  
  return await newUser.save();
};

// Función para manejar la creación de nuevo vendor
const handleNewVendor = async (res, next, sanitizedEmail, sanitizedName, sanitizedPhoto) => {
  try {
    const savedUser = await createNewVendor(sanitizedEmail, sanitizedName, sanitizedPhoto);
    const userObject = savedUser.toObject();
    
    if (!process.env.ACCESS_TOKEN) {
      throw new Error('ACCESS_TOKEN environment variable is required');
    }
    
    const token = Jwt.sign({ id: savedUser._id }, process.env.ACCESS_TOKEN);
    
    return createAuthResponse(res, userObject, token);
  } catch (error) {
    if (error.code === 11000) {
      return next(errorHandler(409, "Email already in use"));
    }
    throw error;
  }
};

export const vendorSignup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    // Validar y sanitizar inputs
    const sanitizedUsername = validateString(username, USERNAME_MAX_LENGTH);
    const sanitizedEmail = validateAndSanitizeEmail(email);
    const sanitizedPassword = validatePassword(password);
    
    if (!sanitizedUsername) {
      return next(errorHandler(400, 'Valid username is required (max 50 characters)'));
    }
    
    if (!sanitizedEmail) {
      return next(errorHandler(400, 'Valid email is required'));
    }
    
    if (!sanitizedPassword) {
      return next(errorHandler(400, `Password is required (min ${PASSWORD_MIN_LENGTH} characters)`));
    }
    
    const hashedPassword = bcryptjs.hashSync(sanitizedPassword, BCRYPT_SALT_ROUNDS);
    
    const user = new User({
      username: sanitizedUsername,
      password: hashedPassword,
      email: sanitizedEmail,
      isVendor: true,
    });
    
    await user.save();
    res.status(200).json({ message: "Vendor created successfully" });
  } catch (error) {
    next(error);
  }
};

export const vendorSignin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validar y sanitizar email
    const sanitizedEmail = validateAndSanitizeEmail(email);
    const sanitizedPassword = validateString(password);
    
    if (!sanitizedEmail) {
      return next(errorHandler(400, 'Valid email is required'));
    }
    
    if (!sanitizedPassword) {
      return next(errorHandler(400, 'Password is required'));
    }
    
    // Usar query object explícito para prevenir NoSQL injection
    const query = { 
      email: sanitizedEmail, // Mongoose ya maneja la sanitización
      isVendor: true
    };
    
    const validVendor = await User.findOne(query).lean();
    
    if (!validVendor) {
      return next(errorHandler(401, "Invalid credentials"));
    }
    
    const validPassword = bcryptjs.compareSync(sanitizedPassword, validVendor.password);
    if (!validPassword) {
      return next(errorHandler(401, "Invalid credentials"));
    }
    
    if (!process.env.ACCESS_TOKEN) {
      throw new Error('ACCESS_TOKEN environment variable is required');
    }
   
    const token = Jwt.sign({ id: validVendor._id }, process.env.ACCESS_TOKEN);
    
    // Crear respuesta sin password
    const { password: _, ...rest } = validVendor;
    
    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: THIRTY_DAYS_MS,
      })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const vendorSignout = async (req, res, next) => {
  try {
    res
      .clearCookie("access_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      })
      .status(200)
      .json({ message: "Vendor signed out successfully" });
  } catch (error) {
    next(error);
  }
};

// vendor login or signup with google - Refactorizada para reducir complejidad
export const vendorGoogle = async (req, res, next) => {
  try {
    const { email, photo, name } = req.body;
    
    // Validar y sanitizar inputs
    const sanitizedEmail = validateAndSanitizeEmail(email);
    const sanitizedName = validateString(name, 100);
    const sanitizedPhoto = validateAndSanitizePhoto(photo);
    
    if (!sanitizedEmail) {
      return next(errorHandler(400, "Invalid email provided"));
    }
    
    // Usar query object explícito para prevenir NoSQL injection
    const query = { 
      email: sanitizedEmail
    };
    
    const user = await User.findOne(query).lean();
    
    // Si el usuario ya existe y es vendor
    if (user?.isVendor) {
      return handleExistingVendor(res, user);
    }
    
    // Si necesita crear nuevo vendor
    if (!sanitizedName) {
      return next(errorHandler(400, "Invalid name provided"));
    }
    
    return await handleNewVendor(res, next, sanitizedEmail, sanitizedName, sanitizedPhoto);
    
  } catch (error) {
    next(error);
  }
};