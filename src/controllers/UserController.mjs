//scr/controllers/UserController.mjs
import UserRepository from "../repositories/UserRepository.mjs";
    
class UserController {
    static async createUser(req, res) {
        try {
            const userData = req.body;
            const user = await UserRepository.createUser(userData);
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async getAllUsers(req, res) {
        try {
            const users = await UserRepository.getAllUsers();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getUserById(req, res) {
        try {
            const userId = req.params.id;
            const user = await UserRepository.getUserById(userId);
            res.json(user);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    static async updateUserById(req, res) {
        try {
            const userId = req.params.id;
            const userData = req.body;
            const user = await UserRepository.updateUserById(userId, userData);
            res.json(user);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    static async deleteUserById(req, res) {
        try {
            const userId = req.params.id;
            const user = await UserRepository.deleteUserById(userId);
            res.json(user);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
}

export default UserController;
