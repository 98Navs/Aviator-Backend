//src/routes/UserRoutes.mjs
import express from 'express';
import UserController from '../controllers/UserController.mjs';

const router = express.Router();

// POST /signUp - Create a new user
router.post('/signUp', UserController.createUser);

// POST /signIn - Login 
router.post('/signIn', UserController.signIn);

// GET /users - Get all users
router.get('/users', UserController.getAllUsers);

// GET /users/:id - Get a user by ID
router.get('/users/:id', UserController.getUserById);

// PUT /users/:id - Update a user by ID
router.put('/users/:id', UserController.updateUserById);

// DELETE /users/:id - Delete a user by ID
router.delete('/users/:id', UserController.deleteUserById);

export default router;
