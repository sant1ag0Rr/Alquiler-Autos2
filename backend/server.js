import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import userRoute from "./routes/userRoute.js";
import authRoute from "./routes/authRoute.js";
import adminRoute from './routes/adminRoute.js'
import vendorRoute from './routes/venderRoute.js'
import aiRoute from './routes/ai.routes.js'
import cors from 'cors'
import cookieParser from "cookie-parser";
import { cloudinaryConfig } from "./utils/cloudinaryConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carga .env tanto desde backend/.env como desde ../.env (raiz del repo).
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, "..", ".env"), override: false });

const App = express();

// Configurar CORS PRIMERO
const allowedOrigins = ['http://localhost:5173'];
App.use(
  cors({
    origin: allowedOrigins,
    methods:['GET', 'PUT', 'POST' ,'PATCH','DELETE'],
    credentials: true,
  })
);

// Middleware básicos
App.use(express.json());
App.use(cookieParser());

const port = process.env.PORT || 5000;

// Conectar a MongoDB
mongoose
  .connect(process.env.mongo_uri)
  .then(console.log("connected"))
  .catch((error) => console.error(error));

// Configurar Cloudinary solo para rutas que lo necesiten
App.use('/api/admin/*', cloudinaryConfig);
App.use('/api/vendor/*', cloudinaryConfig);

// Definir rutas
App.use("/api/user", userRoute);
App.use("/api/auth", authRoute);
App.use("/api/admin", adminRoute);
App.use("/api/vendor", vendorRoute);
App.use("/api/ai", aiRoute);

// Middleware de manejo de errores
App.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "internal server error";
  return res.status(statusCode).json({
    succes: false,
    message,
    statusCode,
  });
});

// Iniciar servidor
App.listen(port, () => {
  console.log("server listening !");
});
