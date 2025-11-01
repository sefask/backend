const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['multiple-choice', 'true-false', 'short-answer'],
        required: true
    },
    text: {
        type: String,
        required: [true, 'Question text is required']
    },
    points: {
        type: Number,
        required: true,
        min: [1, 'Points must be at least 1']
    },
    options: {
        type: [String],
        validate: {
            validator: function (options) {
                return this.type !== 'multiple-choice' || (options && options.length >= 2);
            },
            message: 'Multiple choice questions must have at least 2 options'
        }
    },
    correctAnswer: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Correct answer is required'],
        validate: {
            validator: function (value) {
                switch (this.type) {
                    case 'multiple-choice':
                        return Number.isInteger(value) && value >= 0 && value < (this.options?.length || 0);
                    case 'true-false':
                        return typeof value === 'string' && ['true', 'false'].includes(value);
                    case 'short-answer':
                        return typeof value === 'string';
                    default:
                        return false;
                }
            },
            message: 'Invalid correct answer for question type'
        }
    }
});

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Assignment title is required']
    },
    description: {
        type: String,
        required: [true, 'Assignment description is required']
    },
    type: {
        type: String,
        required: [true, 'Assignment type is required'],
    },
    startTime: {
        type: Date,
        required: function () {
            return this.type === 'live';
        }
    },
    endTime: {
        type: Date,
        required: function () {
            return this.type === 'live';
        },
    },
    isActive: {
        type: Boolean,
        default: true
    },
    duration: {
        type: Number,
    },
    deadline: {
        type: Date,
    },
    questions: {
        type: [questionSchema],
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });