//src/routes/UserRoutes.mjs
import express from 'express';
import UserController from '../controllers/UserController.mjs';

const router = express.Router();

// POST /api/users - Create a new user
router.post('/users', UserController.createUser);

// GET /api/users - Get all users
router.get('/users', UserController.getAllUsers);

// GET /api/users/:id - Get a user by ID
router.get('/users/:id', UserController.getUserById);

// PUT /api/users/:id - Update a user by ID
router.put('/users/:id', UserController.updateUserById);

// DELETE /api/users/:id - Delete a user by ID
router.delete('/users/:id', UserController.deleteUserById);

export default router;
