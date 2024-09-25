import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieSession from 'cookie-session';
import cookieParser from 'cookie-parser';

import initDB from './database/init.js';
import  { errorHandler, notFound, logError } from './middleware/errorMiddleware.js';
import { init, send } from './middleware/inOutMiddleware.js';

import testRoutes from './routes/testRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import toDoListRoutes from './routes/toDoListRoutes.js';

dotenv.config();
const app = express();

const port = process.env.NODE_API_DOCKER_PORT || 3000;

const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || "http://localhost:8080",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Origin", "Content-Type", "Accept"],
  credentials: true // Autorise l'envoi de cookies et informations d'authentification
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// Dans ton middleware d'application
app.use(cookieParser(process.env.COOKIE_SECRET));
// Set up cookie session
app.use(
  cookieSession({
    name: `${process.env.PROJECT_NAME}-session`,
    keys: [process.env.COOKIE_SECRET],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict'
  })
);

// serve the `backend/public` folder for public resources
app.use(express.static('public'));
// Test Routes
app.use(init);
app.use('', testRoutes);
// Auth Routes
app.use('/api/auth', authRoutes);
// User Routes
app.use('/api/user', userRoutes);
// Tutorial Routes
app.use('/api/product', productRoutes);
// ToDoList && ToDoItem Routes
app.use('/api/todolist', toDoListRoutes);
// Send middleware
app.use(send);

// Error handling middleware
app.use(logError);
app.use(notFound);
app.use(errorHandler);

app.listen(port, async () => {
  console.log(`Serveur démarré sur le port ${port}`);
  try {
    // Replace true by false when sync isn't needed
    // Replace force by alter to keep data
    await initDB(true, 'force');
    console.log(`Server is running on port ${port}`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});
