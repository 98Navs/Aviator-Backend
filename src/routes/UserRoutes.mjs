//src/routes/UserRoutes.mjs
import express from 'express';
import UserController from '../controllers/UserController.mjs';
import UserRegistrationController from '../controllers/UserRegistrationController.mjs';
import Middleware from '../project_setup/Middleware.mjs'

const router = express.Router();

// POST /signUp - Create a new user
router.post('/signUp', UserRegistrationController.createUser);

// POST /signIn - Login user
router.post('/signIn', UserRegistrationController.signIn);

// POST /forgetPassword
router.post('/forgetPassword', UserRegistrationController.forgetPassword);

// POST /otp
router.post('/otp', UserRegistrationController.otp);

// POST /forgetPassword
router.post('/changePassword', UserRegistrationController.changePassword);

// POST /deductMoney -  Deducting amount from userWallet
router.post('/deductAmountByUserId/:userId', Middleware.admin, UserController.deductAmountByUserId);

// GET /users - Get all users
router.get('/users', Middleware.admin, UserController.getAllUsers);

// GET /users/:userId - Get a user by userId
router.get('/users/:userId', Middleware.admin, UserController.getUserByUserId);

// GET /wallet/:userId - Get a user wallet details by userId
router.get('/wallet/:userId', Middleware.admin, UserController.getWalletByUserId);

// PUT /users/:userId - Update a user by userId
router.put('/users/:userId', Middleware.admin, UserController.updateUserByUserId);

// DELETE /users/:userId - Delete a user by userId
router.delete('/users/:userId', Middleware.admin, UserController.deleteUserByUserId);

export default router;