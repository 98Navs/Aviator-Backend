//scr/controllers/UserController.mjs
import UserService from "../services/UserService.mjs";
    
class UserController {
    static async createUser(req, res) {
        try {
            const userData = req.body;
            const user = await UserService.createUser(userData);
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async getAllUsers(req, res) {
        try {
            const users = await UserService.getAllUsers();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getUserById(req, res) {
        try {
            const userId = req.params.id;
            const user = await UserService.getUserById(userId);
            res.json(user);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    static async updateUserById(req, res) {
        try {
            const userId = req.params.id;
            const userData = req.body;
            const user = await UserService.updateUserById(userId, userData);
            res.json(user);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    static async deleteUserById(req, res) {
        try {
            const userId = req.params.id;
            const user = await UserService.deleteUserById(userId);
            res.json(user);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
}

export default UserController;
