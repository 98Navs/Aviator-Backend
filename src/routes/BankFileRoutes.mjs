//src/routes/BankFileRoutes.mjs
import express from 'express';
import BankController from '../controllers/BankFileController.mjs';

const router = express.Router();


router.post('/bankAccount', authAdminMiddleware, BankController.createBank);


router.get('/bankAccountAll', authAdminMiddleware, BankController.getAllBank);


router.get('/bankAccountActive',authAdminMiddleware,BankController.getActiveBank)

router.get('/bankAccount/:id', authAdminMiddleware, BankController.getBankById);


router.put('/bankAccount/:id', authAdminMiddleware, BankController.updateBankById);


router.delete('/bankAccount/:id', authAdminMiddleware, BankController.deleteBankById);

router.get('/changeStatus/:id', authAdminMiddleware, BankController.changeStatusById)

export default router;
