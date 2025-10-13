const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '3d'
    });
}

exports.signup = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    try {
        const user = await User.signup(firstName, lastName, email, password);
        res.status(201).json({ user: user._id, email: user.email });
    } catch (err) {
        const errors = JSON.parse(err.message);
        res.status(400).json({ errors });
    }
}

exports.signin = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.signin(email, password);
        const token = createToken(user._id);
        res.status(201).json({ user: user._id, email: user.email, token });
    } catch (err) {
        const errors = JSON.parse(err.message);
        res.status(400).json({ errors });
    }
}