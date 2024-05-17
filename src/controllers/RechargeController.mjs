//scr/controllers/UserController.mjs
import RechargeRepository from "../repositories/RechargeRepository.mjs";
import { Parser } from 'json2csv';
import { format } from 'date-fns';


class RechargeController {
    static async createRecharge(req, res) {
        try {
            const adminBnakId = req.params.id
            const userId = req.user.objectId

            if (!adminBnakId) {
                return res.status(404).json({ success: false, message: "Admin bankID  Not Found!" });
            }

            if (!userId) {
                return res.status(404).json({ success: false, message: "User Not Found!" });
            }

            const { amount, transactionId, bankName, accountNumber, accountHolderName, ifscCode, upiId } = req.body;

            if (!amount || !transactionId || !accountHolderName || !bankName || !accountNumber || !upiId || !ifscCode) {
                return res.status(400).json({ success: false, message: "Please provide valid Amount ,Transaction_ID and all required Information. " });
            }

            const userInputs = { amount, transactionId, bankName, accountNumber, accountHolderName, ifscCode, upiId }


            const data = await RechargeRepository.createRechargeMangement(userId, userInputs, adminBnakId)

            if (data) {
                return res.json(data);
            } else {
                return res.status(404).json({ success: false, message: "Data not found!" });
            }

        } catch (error) {
            res.status(500).json({ error: error.message });
        }

    }

    static async getAllRecharge(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const data = await RechargeRepository.getTransactionList(req, page, limit);
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
            const { status } = req.body;
            const adminId = req.user.objectId
            const tranId = req.params.id

            if (!tranId) {
                return res.status(404).json({ success: false, message: "Transaction Id Not Found!" });
            }
            const data = await RechargeRepository.rechargeStatus(tranId, adminId, status)

            if (data) {
                return res.json(data);
            } else {
                return res.status(404).json({ success: false, message: "Data Not Found!" });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async downloadData(req, res) {
        try {
            // fetch the all data in database.
            const data = await RechargeRepository.downloadData()

            if (data.length === 0) {
                return res.status(404).send('No data found');
            }

            // Prepare the list of transactions for CSV
            const transactionList = data.map(({ Id, paymentType, amount, transactionId, status, createdAt, updatedAt }) => ({
                Id,
                paymentType,
                amount,
                transactionId,
                status,
                createdAt: format(new Date(createdAt), 'yyyy-MM-dd HH:mm:ss'),
                updatedAt: format(new Date(updatedAt), 'yyyy-MM-dd HH:mm:ss'),
            }));

            // Define the CSV fields
            const csvFields = ['Id', 'paymentType', 'amount', 'transactionId', 'status', 'createdAt', 'updatedAt'];
            const json2csvParser = new Parser({ fields: csvFields });
            const csv = json2csvParser.parse(transactionList);

            // Set the headers for the response
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=Transaction_List.csv');

            // Send the CSV data
            res.status(200).end(csv);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


    static async createBankAccount(req, res) {
        try {
            const Id = req.user.objectId
            const { bankName, accountNumber, accountHolderName, ifscCode, upiId } = req.body;

            if (!bankName || !accountNumber || !accountHolderName || !ifscCode || !upiId) {
                return res.status(400).json({ success: false, message: "Please provide valid BankName, AccountNumber, AccountHolderName, IFScCode and upiId  " });
            }
            const userInputs = { bankName, accountNumber, accountHolderName, ifscCode, upiId }

            const data = await RechargeRepository.createBankAccount(Id, userInputs);
            if (data) {
                return res.json(data);
            } else {
                return res.status(404).json({ success: false, message: "Data  not found" })
            }

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteBankDetails(req, res) {
        try {
            const userId = req.user.objectId;
            const bankId = req.params.id;

            if (!bankId) {
                return res.status(400).json({ success: false, message: "Please provide a valid bankId." });
            }

            const result = await RechargeRepository.deleteBankAccount(userId, bankId);

            if (result.success) {
                return res.json(result);
            } else {
                return res.status(404).json(result);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default RechargeController;