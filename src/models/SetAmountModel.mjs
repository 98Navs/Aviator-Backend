
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const settingSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required and it must not be blank or empty'],
        trim: true,
        unique: true,
        validate: {
            validator: function (value) {
                return value.trim().length > 0;
            },
            message: 'Name must not be blank or empty',
        },
    },
    value: {
        type: String,
        required: [true, 'Value is required and it must not be blank or empty'],
        trim: true,
        validate: {
            validator: function (value) {
                return typeof value === 'string' && value.trim().length > 0;
            },
            message: 'Value must not be blank or empty',
        },
    },
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.__v;
        }
    },
    timestamps: true
}

);

settingSchema.index({ name: 1 }, { unique: true });

const SetAmount = model('SetAmount', settingSchema);

export default SetAmount;
