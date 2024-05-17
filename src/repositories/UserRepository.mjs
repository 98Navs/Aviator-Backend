// src/repositories/UserRepository.mjs
import bcrypt from 'bcrypt';
import User from '../models/UserModel.mjs';

class UserRepository {
    static async createUser(userData) {
        try {
            return await User.create(userData);
        } catch (error) {
            throw new Error('Error creating user: ' + error.message);
        }
    }

    static async getAllUsers() {
        try {
            return await User.find();
        } catch (error) {
            throw new Error('Error getting all users: ' + error.message);
        }
    }

    static async updateUserByUserId(userId, userData) {
        try {
            const user = await User.findOneAndUpdate({ userId }, userData, { new: true });
            if (!user) { throw new Error('User not found'); }
            return user;
        } catch (error) {
            throw new Error('Error updating user by userId: ' + error.message);
        }
    }

    static async deleteUserByUserId(userId) {
        try {
            const user = await User.findOneAndDelete({ userId });
            if (!user) { throw new Error('User not found'); }
            return user;
        } catch (error) {
            throw new Error('Error deleting user by userId: ' + error.message);
        }
    }

    static async getUserByEmail(email) {
        try {
            return await User.findOne({ email });
        } catch (error) {
            throw new Error('Error getting user by email: ' + error.message);
        }
    }

    static async getUserByMobile(mobile) {
        try {
            return await User.findOne({ mobile });
        } catch (error) {
            throw new Error('Error getting user by mobile: ' + error.message);
        }
    }

    static async getUserByPromoCode(promoCode) {
        try {
            return await User.findOne({ promoCode });
        } catch (error) {
            throw new Error('Error getting user by promo code: ' + error.message);
        }
    }

    static async getUserByReferenceCode(promoCode) {
        try {
            return await User.findOne({ promoCode });
        } catch (error) {
            throw new Error('Error getting user by reference code: ' + error.message);
        }
    }

    static async getUserByUserId(userId) {
        try {
            return await User.findOne({ userId });
        } catch (error) {
            throw new Error('Error getting user by userId: ' + error.message);
        }
    }

    static async hashPassword(password) {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }
    
}

export default UserRepository;