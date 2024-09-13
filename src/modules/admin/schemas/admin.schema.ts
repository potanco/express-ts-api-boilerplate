import mongoose from 'mongoose';
import argon2 from 'argon2';
import crypto from 'crypto';
import validator from 'validator';

import { IAdmin } from '../interfaces/admin.interface';
import { NextFunction } from 'express';

interface AdminDocument extends IAdmin, mongoose.Document {
  isPasswordValid(password: string): Awaited<Promise<boolean>>;
  createAccountActivationLink(): string;
  createPasswordResetToken(): string;
}

// Create a simple schema for Admin
const adminSchema = new mongoose.Schema<AdminDocument>(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name!'],
      unique: true,
      trim: true,
      maxlength: [20, 'must be less than or equal to 20'],
      minlength: [3, 'must be greater than 3']
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: String,
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: true
    },
    activationLink: {
      type: String,
      select: false
    },
    passwordResetToken: {
      type: String,
      select: false
    },
    passwordResetExpires: {
      type: Date,
      select: false
    },
    activated: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

adminSchema.pre('save', async function (next: NextFunction) {
  try {
    if (!this.isModified('password')) return next();
    const passwordHash = await argon2.hash(this.password);
    this.password = passwordHash;
    next();
  } catch (err) {
    next(err);
  }
});

adminSchema.methods.createAccountActivationLink = function () {
  const activationToken = crypto.randomBytes(32).toString('hex');
  this.activationLink = crypto
    .createHash('sha256')
    .update(activationToken)
    .digest('hex');
  return activationToken;
};

adminSchema.methods.isPasswordValid = async function (password) {
  try {
    return await argon2.verify(this.password, password);
  } catch (error) {
    throw new Error(error);
  }
};

adminSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  return resetToken;
};

// export the module
const AdminModel = mongoose.model('Admin', adminSchema);

export { AdminModel, AdminDocument };
