//src/routes/UserRoutes.mjs
import express from 'express';
import UserController from '../controllers/UserController.mjs';

const router = express.Router();

// POST /signUp - Create a new user
router.post('/signUp', UserController.createUser);

// POST /signIn - Login user
router.post('/signIn', UserController.signIn);

// POST /forgetPassword
router.post('/forgetPassword', UserController.forgetPassword);

// POST /otp
router.post('/otp', UserController.otp);

// POST /forgetPassword
router.post('/changePassword', UserController.changePassword);

// GET /users - Get all users
router.get('/users', UserController.getAllUsers);

// GET /users/:id - Get a user by ID
router.get('/users/:userId', UserController.getUserByUserId);

// PUT /users/:id - Update a user by ID
router.put('/users/:userId', UserController.updateUserByUserId);

// DELETE /users/:id - Delete a user by ID
router.delete('/users/:userId', UserController.deleteUserByUserId);

export default router;
