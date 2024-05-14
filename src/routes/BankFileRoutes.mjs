import express from 'express';
import BankController from '../controllers/BankfileController.mjs';

const router = express.Router();

// POST /api/users - Create a new user
router.post('/bankAccount', BankController.createBank);

// GET /api/users - Get all users
router.get('/bankAccount', BankController.getAllBank);

// GET /api/users/:id - Get a user by ID
router.get('/bankAccount/:id', BankController.getBankById);

// PUT /api/users/:id - Update a user by ID
router.put('/bankAccount/:id', BankController.updateBankById);

// DELETE /api/users/:id - Delete a user by ID
router.delete('/bankAccount/:id', BankController.deleteBankById);

export default router;
