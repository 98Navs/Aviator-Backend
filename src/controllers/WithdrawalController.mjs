//scr/controllers/UserController.mjs
import WithdrawalRepository from "../repositories/WithdrawalRepository.mjs";
import { Parser } from 'json2csv';
import { format } from 'date-fns';
import mongoose from 'mongoose';


class WithdrawalController {
    static async createWithdrawal(req, res) {
        try {
            const userId = req.user.objectId
            if (!userId) {
                return res.status(404).json({ success: false, message: "User Not Found!" });
            }

            const { amount, bankName, accountNumber, accountHolderName, ifscCode, upiId } = req.body;

            if (!amount || isNaN(amount) || amount <= 0 ||
                !bankName || !accountNumber || !accountHolderName || !ifscCode || !upiId) {
                return res.status(400).json({ success: false, message: "Invalid input parameters. Please provide valid values for all required fields." });
            }

            const userInputs = { amount, bankName, accountNumber, accountHolderName, ifscCode, upiId }

            const data = await WithdrawalRepository.CreateWithdrawal(userId, userInputs)
            if (data) {
                return res.json(data);
            } else {
                return res.status(404).json({ success: false, message: "Data  not found" })
            }

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getAllWithdrawal(req, res) {
        try {
            const status = req.query.status; 
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const data = await WithdrawalRepository.getAllWithdrawal(req, page, limit, status);
            if (data) {
                return res.json(data);
            } else {
                return res.status(404).json({ success: false, message: "Data not found!" });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async changeStatus(req, res) {
        try {
            const { accountId, transactionId, status } = req.body;
            const userInputs = { accountId, transactionId, status }
            const withdrawalId = req.params.id;

            if (!mongoose.Types.ObjectId.isValid(withdrawalId)) {
                return res.status(400).json({ success: false, message: "Invalid ID format" });
            }
           
            if (!mongoose.Types.ObjectId.isValid(accountId)) {
                return res.status(400).json({ success: false, message: "Invalid account ID format" });
            }
            const adminId = req.user.objectId

            if (!withdrawalId) {
                return res.status(400).json({ success: false, message: "Withdrawal ID not provided." });
            }

            if (!adminId) {
                return res.status(403).json({ success: false, message: "Unauthorized: Admin ID not found." });
            }

            if (!accountId || !transactionId || !status) {
                return res.status(400).json({ success: false, message: "Required inputs (accountId, transactionId, status) not provided." });
            }
            const data = await WithdrawalRepository.withdrawalStatus(adminId, withdrawalId, userInputs)
            
            if (data) {
                return res.status(200).json(data);
            } else {
                return res.status(404).json({ success: false, message: "Data not found!" });
            }
        } catch (error) {

            res.status(500).json({ error: error.message });
        }
    }

    static async downloadData(req, res) {
        try {
            // fetch the all data in database.
            const data = await WithdrawalRepository.downloadData()

            if (data.length === 0) {
                return res.status(404).send('No data found');
            }

            // Prepare the list of withdrawals for CSV
            const withdrawalList = data.map(({ id, userId, amount, bankName, accountNumber, accountHolderName, ifscCode, upiId, status, paymentType, createdAt, updatedAt, transactionId, userAccountId }) => ({
                id,
                userId,
                amount,
                bankName,
                accountNumber,
                accountHolderName,
                ifscCode,
                upiId,
                status,
                paymentType,
                createdAt: format(new Date(createdAt), 'yyyy-MM-dd HH:mm:ss'),
                updatedAt: format(new Date(updatedAt), 'yyyy-MM-dd HH:mm:ss'),
                transactionId,
                userAccountId
            }));

            // Define the CSV fields
            const csvFields = ['id', 'userId', 'amount', 'bankName', 'accountNumber', 'accountHolderName', 'ifscCode', 'upiId', 'status', 'paymentType', 'createdAt', 'updatedAt', 'transactionId', 'userAccountId'];
            const json2csvParser = new Parser({ fields: csvFields });
            const csv = json2csvParser.parse(withdrawalList);

            // Set the headers for the response
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=Withdrawal_List.csv');

            // Send the CSV data
            res.status(200).end(csv);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

}

export default WithdrawalController;