//scr/controllers/UserController.mjs
import BankFileRepository from "../repositories/BankFileRepository.mjs";
import { uploadOptions } from "../project_setup/Utils.mjs";

class BankController {
    static async createBank(req, res) {
        try {
            uploadOptions.single('imageBarcode')(req, res, async function (err) {
              
            const { bankName, accountNumber, accountHolderName, ifscCode, upiId, imageBarcode } = req.body;
            const file = req.file;

            if (!bankName || !accountNumber || !accountHolderName || !ifscCode || !upiId || !file) {
                return res.status(400).json({ success: false, message: "Please provide valid BankName, AccountNumber, AccountHolderName, IFScCode,upiId and ImageBarcode " });
            }
            const userInputs = { bankName, accountNumber, accountHolderName, ifscCode, upiId, imageBarcode }

                const data = await BankFileRepository.createBank(req, res, userInputs);
            if (data) {
                return res.json(data);
            } else {
                return res.status(404).json({ success: false, message: "Data  not found" })
            }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    
    }

    static async getAllBank(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const data = await BankFileRepository.bankAllList(req, page, limit);
            if (data) {
                return res.json(data);
            } else {
                return res.status(404).json({ success: false, message: "Data not found" });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getActiveBank(req,res){
        try {
            const data = await BankFileRepository.getActiveBankAll();
            if (data) {
                return res.json(data);
            } else {
                return res.status(404).json({ success: false, message: "Data not found" });
            } 
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getBankById(req, res) {
        try {
            const BankId = req.params.id;
            const data = await BankFileRepository.getBankById(BankId);
            if (data) {
                return res.json(data);
            } else {
                return res.status(404).json({ success: false, message: "Bank details not found" });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateBankById(req, res) {
        try {

            uploadOptions.single('imageBarcode')(req, res, async function (err) {
            const id = req.params.id;

            const { bankName, accountNumber, accountHolderName, ifscCode, upiId, imageBarcode } = req.body;
            const file = req.file;


            if (!bankName || !accountNumber || !accountHolderName || !ifscCode || !upiId || !file) {
                return res.status(400).json({ success: false, message: "Please provide valid BankName, AccountNumber, AccountHolderName, IFScCode,upiId and imageBarcode " });
            }
            const userInputs = { bankName, accountNumber, accountHolderName, ifscCode, upiId, imageBarcode }

                const data = await BankFileRepository.UpdateBankFile(req, res, { bankName, accountNumber, accountHolderName, ifscCode, upiId, imageBarcode }, id);
            if (data) {
                return res.json(data);
            } else {
                return res.status(404).json({ success: false, message: "Data  not found" })
            }
        });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteBankById(req, res) {
        try {
            const BankId = req.params.id;
            const data = await BankFileRepository.deleteBankById(BankId);
            if (data) {
                return res.json({ success: true, message: "Data is deleted Successfully",data });
            } else {
                return res.status(404).json({ success: false, message: "Data not found" });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async changeStatusById(req,res){
        try {
            const BankId = req.params.id;
            const data = await BankFileRepository.changeStatusBankById(BankId);
            if (data) {
                return res.json({ success: true, message: "Data is deleted Successfully", data });
            } else {
                return res.status(404).json({ success: false, message: "Data not found" });
            }
        } catch (error) {
            res.status(500).json({ error: error.message }); 
        }
    }
}

export default BankController;
