const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const crypto = require('crypto');

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
    verificationCode: {
        type: String
    },
    verificationCodeExpires: {
        type: Date
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

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const user = await this.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        verificationCode,
        verificationCodeExpires
    });

    return user;
};

userSchema.statics.signin = async function (email, password) {
    let errors = [];

    if (!email) errors.push({ field: "email", message: "Email is required." });
    if (!password) errors.push({ field: "password", message: "Password is required." });

    if (errors.length) throw new Error(JSON.stringify(errors));

    const user = await this.findOne({ email });
    if (!user) {
        errors.push({ field: "email", message: "Invalid email or password." });
        throw new Error(JSON.stringify(errors));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        errors.push({ field: "password", message: "Invalid email or password." });
        throw new Error(JSON.stringify(errors));
    }

    return user;
}

userSchema.statics.verifyEmail = async function (email, verificationCode) {
    let errors = [];

    if (!email) {
        errors.push({ field: "email", message: "Email is required." });
    }
    if (!verificationCode) {
        errors.push({ field: "code", message: "Verification code is required." });
    }

    if (errors.length) throw new Error(JSON.stringify(errors));

    const user = await this.findOne({ email });
    if (!user) {
        errors.push({ field: "email", message: "User not found." });
        throw new Error(JSON.stringify(errors));
    }

    if (user.isVerified) {
        errors.push({ field: "code", message: "Email is already verified." });
        throw new Error(JSON.stringify(errors));
    }

    if (!user.verificationCode || user.verificationCode !== verificationCode) {
        errors.push({ field: "code", message: "Invalid verification code." });
        throw new Error(JSON.stringify(errors));
    }

    if (user.verificationCodeExpires && user.verificationCodeExpires < new Date()) {
        errors.push({ field: "code", message: "Verification code has expired. Please request a new one." });
        throw new Error(JSON.stringify(errors));
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    return user;
}

userSchema.statics.generateNewVerificationCode = async function (email) {
    let errors = [];

    if (!email) {
        errors.push({ field: "email", message: "Email is required." });
        throw new Error(JSON.stringify(errors));
    }

    const user = await this.findOne({ email });
    if (!user) {
        errors.push({ field: "email", message: "User not found." });
        throw new Error(JSON.stringify(errors));
    }

    if (user.isVerified) {
        errors.push({ field: "email", message: "Email is already verified." });
        throw new Error(JSON.stringify(errors));
    }

    // Generate new 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();

    return user;
}

module.exports = mongoose.model('User', userSchema);