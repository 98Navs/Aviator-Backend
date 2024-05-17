//src/repositories/UserRepository.mjs
import Transaction from '../models/RechargeModel.mjs';
import { generatePaginationUrls } from '../project_setup/Utils.mjs'
import User from '../models/UserModel.mjs';
import UserBankAccount from '../models/UserBankFileModel.mjs'
class RechargeRepository {
    static async createRechargeMangement(userId, userInputs, adminBankId) {
        try {
            const { amount, transactionId, bankName, accountNumber, accountHolderName, ifscCode, upiId } = userInputs;
            const date = new Date();

            const newTransaction = new Transaction({
                adminBankId,
                userId,
                amount,
                date,
                transactionId,
                bankName,
                accountNumber,
                accountHolderName,
                ifscCode,
                upiId,

            });
            const data = await newTransaction.save();
            if (data) {
                return { success: true, message: "Transaction added Successfully!", data };
            } else {
                return { success: false, message: "No User Details found." };
            }
        } catch (error) {
            throw new Error('Error creating user: ' + error.message);
        }
    }

    static async getTransactionList(req, page, limit){
        try {
            const skip = (page - 1) * limit;
            const totalItems = await Transaction.countDocuments();
            const totalPages = Math.ceil(totalItems / limit);
            const list = await Transaction.find().populate('userId').populate('adminBankId').skip(skip).limit(limit);
            if (list.length > 0) {
                //pagination call function
                const { prepage, nextpage } = generatePaginationUrls(req, page, totalPages, limit);
                return {
                    success: true, message: "User Details retrieved successfully!",
                    data: list,
                    totalPages: totalPages,
                    currentPage: page,
                    totalItems,
                    perpageItem: limit,
                    prepage,
                    nextpage
                };
            } else {
                return { success: false, message: "No User Details found." };
            }
        } catch (error) {
            throw new Error('Error creating user: ' + error.message); 
        }
    }

    static async rechargeStatus(tranId, adminId, status){
        try {
            console.log('tranId',tranId)
            const transaction =  await Transaction.findById(tranId);
            const admin = await User.findById(adminId);
            console.log("transId", transaction)
            console.log("admin", admin)
            if (!transaction || !admin) {
                return { success: false, message: "Invalid Id" };
            }
            if (transaction.status === 'Pending') {
                if (status === '1') {
                    // Update the status of the transaction to 'approved'
                    transaction.status = 'Approved';
                    await transaction.save();

                    // Transfer the amount to the user's wallet
                    console.log("userId", transaction.Id);
                    const user = await User.findById(transaction.Id);

                    console.log("user", user);
                    if (user) {
                        user.depositAmount += transaction.amount;
                        user.lastrecharge = new Date();
                        await user.save();
                        return { success: true, message: "Transaction status updated Approved successfully" };
                    } else {
                        return { success: false, message: "User not found for the transaction" };
                    }
                } else if (status === '0') {
                    // If the status is 'cancel', update the transaction status to 'cancel'
                    transaction.status = 'Rejected';
                    await transaction.save();
                    return { success: true, message: "Transaction status updated Cancel successfully" };
                } else {
                    return { success: false, message: "Invalid status provided" };
                }
            } else {
                return { success: false, message: "Transaction is not pending for approval" };
            }
        } catch (error) {
            throw new Error('Error creating user: ' + error.message); 
        }
    }

    static async downloadData(){
        try {
            const Data = await Transaction.find()
            return Data;
        } catch (error) {
            throw new Error('Error creating user: ' + error.message);  
        }
    }

    static async createBankAccount(Id,bankDetails){
        try {
            const { bankName, accountNumber, accountHolderName, ifscCode, upiId } = bankDetails;

            const user = await User.findById(Id)

            if (!user) {
                throw new Error('User not found');
            }

            const bank = new UserBankAccount({
                bankName,
                accountNumber,
                accountHolderName,
                ifscCode,
                upiId
               
            });
            const bankData = await bank.save();
           

            if (bankData) {
                user.bankDetails.push(bankData._id);
                await user.save()
                return bankData;
            } else {
                return { success: false, message: 'Failed to save bank details.' };
            } 
        } catch (error) {
            throw new Error('Error creating user: ' + error.message);  
        }
    }

    static async deleteBankAccount(userId,bankId){
        try {
            const user = await User.findById(userId);

            if (!user) {
                throw new Error('User not found');
            }

            // Remove the bank account from the user's bank array
            user.bankDetails = user.bankDetails.filter(bankDetails => bankDetails.toString() !== bankId);

            await user.save();

            // Remove the bank account from the UserBankAccount collection
            const deletedBank = await UserBankAccount.findByIdAndDelete(bankId);

            if (deletedBank) {
                return { success: true, message: 'Bank account deleted successfully.' };
            } else {
                return { success: false, message: 'Failed to delete bank account.' };
            }
        } catch (error) {
            throw new Error('Error creating user: ' + error.message);   
        }
    }
}
export default RechargeRepository;