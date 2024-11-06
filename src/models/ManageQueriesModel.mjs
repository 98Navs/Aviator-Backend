// src/models/ManageQueriesModel.mjs
import { Schema, model } from 'mongoose';

const ManageQueriesSchema = new Schema({
    manageQueryId: { type: Number, default: () => Math.floor(100000 + Math.random() * 900000), unique: true },
    userId: { type: Number, required: true },
    userName: { type: String, required: true },
    email: { type: String, required: true },
    assignedTo: { type: String, required: true },
    priority: { type: String, required: true },
    status: { type: String, default: 'New Query' },
    description: [{
        user: { type: String },
        admin: { type: String }
    }]
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            if (ret.description) {
                ret.description.forEach(item => {
                    delete item._id;
                    delete item.id; 
                });
            }
            return ret;
        }
    }
});

ManageQueriesSchema.path('description').options.type[0]._id = false;

export default model('ManageQueries', ManageQueriesSchema);
