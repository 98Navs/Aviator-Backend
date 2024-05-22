//src/routes/UserRoutes.mjs
import express from 'express';
import UserController from '../controllers/UserController.mjs';
import Middleware from '../project_setup/Middleware.mjs'

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

// GET /users/:userId - Get a user by userId
router.get('/users/:userId', UserController.getUserByUserId);

// GET /wallet/:userId - Get a user wallet details by userId
router.get('/wallet/:userId', UserController.getWalletByUserId);

// PUT /users/:userId - Update a user by userId
router.put('/users/:userId', UserController.updateUserByUserId);

// DELETE /users/:userId - Delete a user by userId
router.delete('/users/:userId', UserController.deleteUserByUserId);

// POST /deductMoney -  Deducting amount from userWallet
router.post('/deductAmount', Middleware.admin, UserController.deductAmount);

// GET //users/filter - Filter user data on the basis of email, mobile, userId, or 
router.get('/usersData/filter', UserController.filterUsers);

export default router;
