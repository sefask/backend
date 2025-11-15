const Assignment = require('../models/assignment.model');

exports.createAssignment = async (req, res) => {
    try {
        const {
            title,
            description,
            type,
            startTime,
            endTime,
            duration,
            deadline,
            questions
        } = req.body;

        if (!title || !description || !type || !questions || !Array.isArray(questions)) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                errors: {
                    title: !title ? 'Title is required' : null,
                    description: !description ? 'Description is required' : null,
                    type: !type ? 'Type is required' : null,
                    questions: !questions || !Array.isArray(questions) ? 'Questions array is required' : null
                }
            });
        }

        if (type === 'live') {
            if (!startTime || !endTime) {
                return res.status(400).json({
                    success: false,
                    message: 'Live assignments require start and end times',
                    errors: {
                        startTime: !startTime ? 'Start time is required for live assignments' : null,
                        endTime: !endTime ? 'End time is required for live assignments' : null
                    }
                });
            }

            const start = new Date(startTime);
            const end = new Date(endTime);

            if (end <= start) {
                return res.status(400).json({
                    success: false,
                    message: 'End time must be after start time',
                    errors: {
                        endTime: 'End time must be after start time'
                    }
                });
            }
        }

        const questionErrors = [];
        questions.forEach((question, index) => {
            const errors = {};

            if (!question.type || !['multiple-choice', 'true-false', 'short-answer'].includes(question.type)) {
                errors.type = 'Invalid question type';
            }

            if (!question.text) {
                errors.text = 'Question text is required';
            }

            if (!question.points || question.points < 1) {
                errors.points = 'Points must be at least 1';
            }

            // Validate multiple choice questions
            if (question.type === 'multiple-choice') {
                if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
                    errors.options = 'Multiple choice questions must have at least 2 options';
                }

                if (!Number.isInteger(question.correctAnswer) ||
                    question.correctAnswer < 0 ||
                    question.correctAnswer >= (question.options?.length || 0)) {
                    errors.correctAnswer = 'Invalid correct answer index for multiple choice';
                }
            }

            // Validate true/false questions
            if (question.type === 'true-false' &&
                (!['true', 'false'].includes(question.correctAnswer))) {
                errors.correctAnswer = 'True/False questions must have true or false as answer';
            }

            // Validate short answer questions
            if (question.type === 'short-answer' &&
                (typeof question.correctAnswer !== 'string' || !question.correctAnswer)) {
                errors.correctAnswer = 'Short answer questions must have a string answer';
            }

            if (Object.keys(errors).length > 0) {
                questionErrors.push({
                    index,
                    errors
                });
            }
        });

        if (questionErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid questions data',
                errors: questionErrors
            });
        }

        // Create the assignment
        const assignment = new Assignment({
            title,
            description,
            type,
            startTime: type === 'live' ? new Date(startTime) : undefined,
            endTime: type === 'live' ? new Date(endTime) : undefined,
            duration,
            deadline: deadline ? new Date(deadline) : undefined,
            questions,
            author: req.user._id // Assuming user is attached by auth middleware
        });

        await assignment.save();

        res.status(201).json({
            success: true,
            message: 'Assignment created successfully',
            data: {
                id: assignment._id,
                title: assignment.title,
                type: assignment.type,
                questionCount: assignment.questions.length,
                totalPoints: assignment.questions.reduce((sum, q) => sum + q.points, 0)
            }
        });

    } catch (error) {
        console.error('Assignment creation error:', error);

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const errors = {};
            for (let field in error.errors) {
                errors[field] = error.errors[field].message;
            }

            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating assignment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({ author: req.user._id })
            .select('title type startTime endTime isActive questionCount totalPoints createdAt')
            .sort('-createdAt');

        res.json({
            success: true,
            data: assignments
        });

    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching assignments'
        });
    }
};

exports.getAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findOne({
            _id: req.params.id,
            author: req.user._id
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        res.json({
            success: true,
            data: assignment
        });

    } catch (error) {
        console.error('Error fetching assignment:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching assignment'
        });
    }
};

exports.deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findOneAndDelete({
            _id: req.params.id,
            author: req.user._id
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        res.json({
            success: true,
            message: 'Assignment deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting assignment:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting assignment'
        });
    }
};
