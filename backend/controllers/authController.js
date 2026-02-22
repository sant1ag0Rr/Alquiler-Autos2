import { errorHandler } from "../utils/error.js";
import User from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import Jwt from "jsonwebtoken";

const REFRESH_COOKIE_NAME = "__refresh_fdbfd9LP";

const createTokens = (userId) => {
  const accessToken = Jwt.sign({ id: userId }, process.env.ACCESS_TOKEN, {
    expiresIn: "15m",
  });
  const refreshToken = Jwt.sign({ id: userId }, process.env.REFRESH_TOKEN, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const validateExistingUser = (existingUser, email, username) => {
  if (!existingUser) return null;

  if (existingUser.email === email) {
    return "El email ya esta registrado";
  }

  if (existingUser.username === username) {
    return "El nombre de usuario ya esta en uso";
  }

  return null;
};

const createUserData = (username, email, hashedPassword, phoneNumber) => {
  const userData = {
    username,
    email,
    password: hashedPassword,
    isUser: true,
  };

  if (phoneNumber && phoneNumber.trim() !== "") {
    userData.phoneNumber = phoneNumber.trim();
  }

  return userData;
};

const handleDuplicateError = (error) => {
  const field = Object.keys(error.keyPattern || {})[0];
  const messages = {
    email: "El email ya esta registrado",
    username: "El nombre de usuario ya esta en uso",
  };

  return messages[field] || "Error de duplicado en el sistema";
};

export const signUp = async (req, res, next) => {
  const { username, email, password, phoneNumber } = req.body;

  try {
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    const validationError = validateExistingUser(existingUser, email, username);
    if (validationError) {
      return next(errorHandler(400, validationError));
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);
    const userData = createUserData(username, email, hashedPassword, phoneNumber);

    const newUser = new User(userData);
    await newUser.save();

    res.status(200).json({ message: "Usuario creado exitosamente" });
  } catch (error) {
    if (error.code === 11000) {
      const message = handleDuplicateError(error);
      return next(errorHandler(400, message));
    }

    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const validUser = await User.findOne({ email }).lean();
    if (!validUser) {
      return next(errorHandler(404, "User not found!"));
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(401, "Wrong credentials!"));
    }

    if (!process.env.ACCESS_TOKEN || !process.env.REFRESH_TOKEN) {
      return next(errorHandler(500, "Missing auth token configuration"));
    }

    const { accessToken, refreshToken } = createTokens(validUser._id);
    await User.updateOne({ _id: validUser._id }, { refreshToken });

    const { password: _, ...rest } = validUser;
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({ ...rest, accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  try {
    const { email, photo, name } = req.body;

    const user = await User.findOne({ email }).lean();

    if (user) {
      if (!process.env.ACCESS_TOKEN || !process.env.REFRESH_TOKEN) {
        return next(errorHandler(500, "Missing auth token configuration"));
      }

      const { accessToken, refreshToken } = createTokens(user._id);
      await User.updateOne({ _id: user._id }, { refreshToken });

      const { password: _, ...rest } = user;
      setAuthCookies(res, accessToken, refreshToken);
      return res.status(200).json({ ...rest, accessToken, refreshToken });
    }

    const generatedPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

    const generatedUsername = `${(name || "user")
      .split(" ")
      .join("")
      .toLowerCase()}${Math.random().toString(36).slice(-4)}`;

    const newUser = new User({
      username: generatedUsername,
      email,
      password: hashedPassword,
      profilePicture: photo,
      isUser: true,
    });

    const savedUser = await newUser.save();

    if (!process.env.ACCESS_TOKEN || !process.env.REFRESH_TOKEN) {
      return next(errorHandler(500, "Missing auth token configuration"));
    }

    const { accessToken, refreshToken } = createTokens(savedUser._id);
    await User.updateOne({ _id: savedUser._id }, { refreshToken });

    const userObject = savedUser.toObject();
    const { password: _, ...rest } = userObject;
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({ ...rest, accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const incomingRefreshToken =
      req.body?.refreshToken ||
      req.cookies?.[REFRESH_COOKIE_NAME] ||
      req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
      return next(errorHandler(401, "You are not authenticated"));
    }

    if (!process.env.ACCESS_TOKEN || !process.env.REFRESH_TOKEN) {
      return next(errorHandler(500, "Missing auth token configuration"));
    }

    const decoded = Jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN);
    const user = await User.findById(decoded.id).lean();

    if (!user || user.refreshToken !== incomingRefreshToken) {
      return next(errorHandler(403, "Invalid refresh token"));
    }

    const { accessToken, refreshToken } = createTokens(user._id);
    await User.updateOne({ _id: user._id }, { refreshToken });

    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};
