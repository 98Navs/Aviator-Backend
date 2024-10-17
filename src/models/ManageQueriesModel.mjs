// src/models/ManageQueriesModel.mjs
import { Schema, model } from 'mongoose';

const ManageQueriesSchema = new Schema({
    manageQueryId: { type: Number, default: () => Math.floor(100000 + Math.random() * 900000), unique: true },
    userId: { type: Number, required: true},
    userName: { type: String, required: true },
    email: { type: String, required: true },
    assignedTo: { type: String, required: true },
    priority: { type: String, required: true },
    status: { type: String, default: 'New Query' },
    description: [{ type: String, required: true }]
}, { timestamps: true });

export default model('ManageQueries', ManageQueriesSchema);