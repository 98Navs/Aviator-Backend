//src/repositories/BankFileRepository.mjs
import BankAccount from '../models/BankFileModel.mjs';
import {generatePaginationUrls} from '../project_setup/Utils.mjs'

class BankRepository {
    static async createBank(req, res, { bankName, accountNumber, accountHolderName, ifscCode, upiId, imageBarcode }) {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).json({ success: false, message: 'No image in the request' });
            }

            const fileName = file.filename
            const basePath = `${req.protocol}://${req.get('host')}/uploads/`;

            const bank = new BankAccount({
                bankName,
                accountNumber,
                accountHolderName,
                ifscCode,
                upiId,
                imageBarcode: `${basePath}${fileName}`
            });
            const bankResult = await bank.save();
            if (bankResult) {
                return bankResult;
            } else {
                return { success: false, message: 'Failed to save bank details.' };
            }
        } catch (error) {
            throw new Error('Error creating user: ' + error.message);
        }
    }

    static async bankAllList(req, page, limit) {
        try {
            const skip = (page - 1) * limit;
            const totalItems = await BankAccount.countDocuments();
            const totalPages = Math.ceil(totalItems / limit);
            const list = await BankAccount.find().skip(skip).limit(limit);



            if (list.length > 0) {
                const { prepage, nextpage } = generatePaginationUrls(req, page, totalPages, limit);
                return {
                    success: true, message: "Bank Account Details Retrieved Successfully!",
                    data: list,
                    totalPages: totalPages,
                    currentPage: page,
                    totalItems,
                    perpageItem: limit,
                    prepage,
                    nextpage
                };
            } else {
                return { success: false, message: "No Bank Account Details Found." };
            }
        } catch (error) {
            throw new Error('Error getting all Bank: ' + error.message);
        }
    }

    static async getActiveBankAll(){
        try {
           const query = {status:"Active"}

            const data = await BankAccount.find(query)

            if (data.length > 0) {
                return {
                    success: true, message: "Active Bank Details Retrieved Successfully!",
                    data
                };
            } else {
                return { success: false, message: "No Bank Account Active  Details Found." };
            } 
        } catch (error) {
            throw new Error('Error getting all Bank: ' + error.message);
        }
    }

    static async getBankById(BankId) {
        try {
            const Bank = await BankAccount.findById(BankId)
            if (Bank) {
                return { success: true, data: Bank }
            } else {
                return { success: false, message: "Bank details not found." }
            }
        } catch (error) {
            throw new Error('Error getting user by ID: ' + error.message);
        }
    }

    static async UpdateBankFile(req,res,{ bankName, accountNumber, accountHolderName, ifscCode, upiId, imageBarcode },id) {
        try {
           
            const file = req.file;
            if (!file) return res.status(400).json('No image in the request')

            const fileName = file.filename
            const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

            const bank = await BankAccount.findByIdAndUpdate(id, {
                bankName,
                accountNumber,
                accountHolderName,
                ifscCode,
                upiId,
                imageBarcode: `${basePath}${fileName}`
            },
                { new: true });
            if (bank) {
                return { success: true, message: "Update Successfully!", data: bank };
            } else {
                return { success: false, message: "Failed to Update Bank Account Details!" }
            }
        } catch (error) {
            throw new Error('Error updating Bank by ID: ' + error.message);
        }
    }

    static async deleteBankById(bankId) {
        try {
            const Bank = await BankAccount.findByIdAndDelete(bankId);
            if (!Bank) {
                return { success: false, message: 'Data not found',Id:bankId }
            }
            return { success: true, message: 'Bank account deleted successfully', data: Bank };
        } catch (error) {
            throw new Error('Error deleting Bank by ID: ' + error.message);
        }
    }

    static async changeStatusBankById(bankId){
        try {
            const bankAccount = await BankAccount.findById(bankId) 

            if (!bankAccount) {
                throw new Error('Bank account not found');
            }

            // Toggle the status
            bankAccount.status = bankAccount.status === 'Active' ? 'inActive' : 'Active';

            // Save the updated bank account
            const updatedBankAccount = await bankAccount.save();

            return updatedBankAccount;
        } catch (error) {
            throw new Error('Error deleting Bank by ID: ' + error.message); 
        }
    }
}

export default BankRepository;