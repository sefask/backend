const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
}, { timestamps: true });

userSchema.statics.signup = async function (firstName, lastName, email, password) {
    let errors = [];

    // Basic field validation
    if (!firstName) errors.push({ field: "firstName", message: "First name is required." });
    if (!lastName) errors.push({ field: "lastName", message: "Last name is required." });
    if (!email) errors.push({ field: "email", message: "Email is required." });
    if (!password) errors.push({ field: "password", message: "Password is required." });

    if (email && !validator.isEmail(email)) {
        errors.push({ field: "email", message: "Invalid email format." });
    }

    if (password && password.length < 6) {
        errors.push({ field: "password", message: "Password must be at least 6 characters long." });
    }

    if (errors.length) throw new Error(JSON.stringify(errors));

    const exists = await this.findOne({ email });
    if (exists) errors.push({ field: "email", message: "Email is already taken." });

    if (errors.length) throw new Error(JSON.stringify(errors));

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.create({ firstName, lastName, email, password: hashedPassword });
    
    return user;
};

userSchema.statics.signin = async function (email, password) {
    let errors = [];

    // Basic field validation
    if (!email) errors.push({ field: "email", message: "Email is required." });
    if (!password) errors.push({ field: "password", message: "Password is required." });

    if (errors.length) throw new Error(JSON.stringify(errors));

    // Find user by email
    const user = await this.findOne({ email });
    if (!user) {
        errors.push({ field: "email", message: "Invalid email or password." });
        throw new Error(JSON.stringify(errors));
    }

    // Compare password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        errors.push({ field: "password", message: "Invalid email or password." });
        throw new Error(JSON.stringify(errors));
    }

    return user;
}

module.exports = mongoose.model('User', userSchema);