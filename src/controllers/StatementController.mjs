// src/controllers/StatementController.mjs
import StatementRepository from '../repositories/StatementRepository.mjs';
import UserRepository from '../repositories/UserRepository.mjs';
import { CommonHandler, ValidationError, NotFoundError } from './CommonHandler.mjs';

class StatementController{
    static async createStatementByUserId(req, res) {
        try {
            const statementData = await StatementController.statementValidation(req);
            const statement = await StatementRepository.createStatement(statementData);
            res.status(201).json({ status: 201, success: true, message: 'Statement created successfully', data: statement });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getAllStatements(req, res) {
        try {
            const { status, search, startDate, endDate, pageNumber = 1, perpage = 10 } = req.query;
            const options = { page: Number(pageNumber), limit: Number(perpage) };
            const filterParams = { status, search, startDate, endDate };
            const statements = Object.keys(filterParams).length > 0 ?
                await StatementRepository.filterStatements(filterParams, options, req) :
                await StatementRepository.getAllStatement(options, req);
            res.status(200).json({ status: 200, success: true, message: 'All statements fetched successfully', data: statements });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getStatementById(req, res) {
        try {
            const { id } = req.params;
            const statement = await StatementController.validateAndFetchStatementById(id);
            res.status(200).json({ status: 200, success: true, message: 'Statement fetched successfully', data: statement });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async updateStatementById(req, res) {
        try {
            await StatementController.validateAndFetchStatementById(id);
            const statement = await StatementRepository.updateStatementById(id, req.body);
            res.status(200).json({ status: 200, success: true, message: 'Statement status updated successfully', data: statement });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async deleteStatementById(req, res) {
        try {
            const { id } = req.params;
            await StatementController.validateAndFetchStatementById(id);
            const deletedStatement = await StatementRepository.deleteStatementById(id);
            res.status(200).json({ status: 200, success: true, message: 'Statement deleted successfully', data: deletedStatement });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }
    
    // Static Methods Only For This Class (Not To Be Used In Routes)
    static async validateAndFetchStatementById(id) {
        await CommonHandler.validateObjectIdFormat(id);
        const statement = await StatementRepository.getStatementById(id);
        if (!statement) { throw new NotFoundError(`Statement with statementId ${id} not found`); }
        return statement;
    }

    static async statementValidation(data) {
        const { userId } = data.params;
        const { message, amount, category, type, status } = data.body;
        
        const user = await UserRepository.getUserByUserId(userId);
        if (!user) { throw new NotFoundError(`User with userId: ${userId} does not exist`); }

        await CommonHandler.validateRequiredFields({ message, amount, category, type, status });
        await CommonHandler.validateCreditDebit(type);
        await CommonHandler.validateRechargeAndWithdrawalStatus(status);
        await CommonHandler.validateStatementCategory(category)
        if (typeof message !== 'string') { throw new ValidationError('Message must be a string'); }
        if (typeof amount !== 'number') { throw new ValidationError('Amount must be a number'); }
        data.body.userId = user.userId;

        return data.body;
    }
}
export default StatementController;