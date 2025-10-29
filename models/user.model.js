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
    let errors = {};

    // Basic field validation
    if (!firstName) errors.firstName = "First name is required.";
    if (!lastName) errors.lastName = "Last name is required.";
    if (!email) errors.email = "Email is required.";
    if (!password) errors.password = "Password is required.";

    if (email && !validator.isEmail(email)) {
        errors.email = "Invalid email format.";
    }

    if (password && password.length < 6) {
        errors.password = "Password must be at least 6 characters long.";
    }

    if (Object.keys(errors).length > 0) throw new Error(JSON.stringify(errors));

    const exists = await this.findOne({ email });
    if (exists) errors.email = "Email is already taken.";

    if (Object.keys(errors).length > 0) throw new Error(JSON.stringify(errors));

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
    let errors = {};

    if (!email) errors.email = "Email is required.";
    if (!password) errors.password = "Password is required.";

    if (Object.keys(errors).length > 0) throw new Error(JSON.stringify(errors));

    const user = await this.findOne({ email });
    if (!user) {
        errors.email = "No user with such email.";
        throw new Error(JSON.stringify(errors));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        errors.password = "Incorrect password.";
        throw new Error(JSON.stringify(errors));
    }

    return user;
}

userSchema.statics.verifyEmail = async function (email, verificationCode) {
    let errors = {};

    if (!email) {
        errors.email = "Email is required.";
    }
    if (!verificationCode) {
        errors.code = "Verification code is required.";
    }

    if (Object.keys(errors).length > 0) throw new Error(JSON.stringify(errors));

    const user = await this.findOne({ email });
    if (!user) {
        errors.email = "User not found.";
        throw new Error(JSON.stringify(errors));
    }

    if (user.isVerified) {
        errors.code = "Email is already verified.";
        throw new Error(JSON.stringify(errors));
    }

    if (!user.verificationCode || user.verificationCode !== verificationCode) {
        errors.code = "Invalid verification code.";
        throw new Error(JSON.stringify(errors));
    }

    if (user.verificationCodeExpires && user.verificationCodeExpires < new Date()) {
        errors.code = "Verification code has expired. Please request a new one.";
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
    let errors = {};

    if (!email) {
        errors.email = "Email is required.";
        throw new Error(JSON.stringify(errors));
    }

    const user = await this.findOne({ email });
    if (!user) {
        errors.email = "User not found.";
        throw new Error(JSON.stringify(errors));
    }

    if (user.isVerified) {
        errors.email = "Email is already verified.";
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