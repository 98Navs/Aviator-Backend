import express from 'express';
import BankController from '../controllers/BankfileController.mjs';

const router = express.Router();


router.post('/bankAccount', BankController.createBank);


router.get('/bankAccountAll', BankController.getAllBank);


router.get('/bankAccountActive',BankController.getActiveBank)

router.get('/bankAccount/:id', BankController.getBankById);


router.put('/bankAccount/:id', BankController.updateBankById);


router.delete('/bankAccount/:id', BankController.deleteBankById);

router.get('/changeStatus/:id', BankController.changeStatusById)

export default router;
