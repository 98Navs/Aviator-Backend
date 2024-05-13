//src/repositories/UserRepository.mjs
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

    static async getUserById(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw new Error('Error getting user by ID: ' + error.message);
        }
    }

    static async updateUserById(userId, userData) {
        try {
            const user = await User.findByIdAndUpdate(userId, userData, { new: true });
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw new Error('Error updating user by ID: ' + error.message);
        }
    }

    static async deleteUserById(userId) {
        try {
            const user = await User.findByIdAndDelete(userId);
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw new Error('Error deleting user by ID: ' + error.message);
        }
    }
}

export default UserRepository;