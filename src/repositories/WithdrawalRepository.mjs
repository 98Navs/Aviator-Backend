
import { generatePaginationUrls } from '../utils/index.mjs'
import User from '../models/UserModel.mjs';
import Withdrawal from '../models/WithdrawaModel.mjs';

class WithdrawalRepository {
    static async CreateWithdrawal(userId, userInputs) {
        try {
            const { amount, bankName, accountNumber, accountHolderName, ifscCode, upiId } = userInputs

            const user = await User.findById(userId);

            if (!user || user.depositAmount < amount) {
                return { success: false, message: 'Insufficient funds in the user wallet.' };
            }

            // Create withdrawal document
            const withdrawal = new Withdrawal({
                userId,
                amount,
                bankName,
                accountNumber,
                accountHolderName,
                ifscCode,
                upiId,
            });
            const withdrawalResult = await withdrawal.save();
            if (withdrawalResult) {

                user.depositAmount -= amount;
                await user.save();

                return { success: true, message: 'Request Send Successfully!', data: withdrawalResult };
            } else {
                return { success: false, message: 'Failed to Save Withdrawal Details.' };
            }

        } catch (error) {
            throw new Error('Error creating user: ' + error.message);
        }
    }

    static async getAllWithdrawal(req, page, limit, status) {
        try {
            const query = {}
            if (status) {
                query.status = status
            }

            const skip = (page - 1) * limit;
            const totalItems = await Withdrawal.countDocuments();
            const totalPages = Math.ceil(totalItems / limit);
            const list = await Withdrawal.find(query).populate('userId').populate('userAccountId').skip(skip).limit(limit)
            if (list.length > 0) {
                //pagination function
                const { prepage, nextpage } = generatePaginationUrls(req, page, totalPages, limit);
                return {
                    success: true, message: "Withdrawal Details retrieved successfully!",
                    data: list,
                    totalPages: totalPages,
                    currentPage: page,
                    totalItems,
                    perpageItem: limit,
                    prepage,
                    nextpage

                };
            } else {
                return { success: false, message: "No Withdrawal Details found." };
            }
        } catch (error) {
            throw new Error('Error creating user: ' + error.message);
        }
    }

    static async withdrawalStatus(adminId, withdrawalId, userInputs) {
        try {

            const { accountId, transactionId, status } = userInputs;

            if (!['Approved', 'Rejected'].includes(status)) {
                return { success: false, message: "Invalid status provided. Status must be 'Approved' or 'Rejected'." };
            }

            const withdrawal = await Withdrawal.findById(withdrawalId);
            const admin = await User.findById(adminId);

            if (!withdrawal || !admin) {
                return { success: false, message: "Invalid Id" };
            }

            if (withdrawal.status !== 'Pending') {
                return { success: false, message: "Withdrawal is not in Pending status" };
            }

            if (withdrawal.status === 'Pending') {
                if (status === 'Approved') {
                    withdrawal.status = 'Approved';
                    withdrawal.transactionId = transactionId;
                    withdrawal.userAccountId = accountId;
                    await withdrawal.save();

                    return { success: true, message: "Withdrawal status updated to Approved successfully" };
                } else if (status === 'Rejected') {
                    withdrawal.status = 'Rejected';
                    await withdrawal.save();

                    return { success: true, message: "Withdrawal status updated to Rejected successfully" };
                } else {
                    return { success: false, message: "Invalid status provided" };
                }
            } else {
                return { success: false, message: "Withdrawal is not in Pending status" };
            }

        } catch (error) {
            throw new Error('Error creating user: ' + error.message);
        }
    }

    static async downloadData() {
        try {
            const Data = await Withdrawal.find()
            return Data;
        } catch (error) {
            throw new Error('Error creating user: ' + error.message);
        }
    }

}


export default WithdrawalRepository;