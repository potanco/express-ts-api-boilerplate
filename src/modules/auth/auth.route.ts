import passport from 'passport';

import { type NextFunction, type Request, type Response, Router } from 'express';

import { validationMiddleware } from '../../middlewares/validator.middleware';

import { AuthController } from './auth.controller';
import { AdminController } from '../admin/admin.controller';

import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';

import { BadRequestException } from '../../exceptions/bad-request-exception';
import { HttpException } from '../../exceptions/http-exception';

import type { AdminDocument } from '../admin/schemas/admin.schema';

const crypto = require('crypto');


const authController = new AuthController();
const adminController = new AdminController();

/**
 * Authentication Route
 */
export class AuthRoute {
  public path = '/auth';
  public router = Router();

  adminJwt = passport.authenticate('admin-jwt', { session: false });
  adminLocal = passport.authenticate('admin-local', {
    session: false
  });

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/confirm-mail/:activationLink`,
      this.confirmMail
    );

    this.router.post(
      `${this.path}/register`,
      [validationMiddleware(RegisterDto)],
      this.regsiter
    );

    this.router.post(
      `${this.path}/login`,
      [this.adminLocal, validationMiddleware(LoginDto)],
      this.login
    );

    this.router.post(
      `${this.path}/forgot-password`,
      validationMiddleware(ForgotPasswordDto),
      this.forgotPassword
    );

    this.router.post(
      `${this.path}/reset-password`,
      validationMiddleware(ResetPasswordDto),
      this.resetPassword
    );

    this.router.post(
      `${this.path}/update-password`,
      [this.adminJwt, validationMiddleware(UpdatePasswordDto)],
      this.updatePassword
    );
  }

  async login(request: Request, response: Response, next: NextFunction) {
    const token = await authController.login(request.body);
    response.status(201).json({
      success: true,
      token: token,
      data: {},
      message: null
    });
  }

  async regsiter(request: Request, response: Response, next: NextFunction) {
    const adminExists = await adminController.findOne({
      email: request.body.email
    });
    if (adminExists) {
      next(
        new HttpException(
          422,
          'Dublicate Entity',
          `Admin with the email address ${request.body.email} already exists.`
        )
      );
    } else {
      const message = await authController.register(request.body, request);
      response.status(200).json({
        success: true,
        data: {},
        message: message
      });
    }
  }

  async confirmMail(request: Request, response: Response, next: NextFunction) {
    // 1 Hash The Avtivation Link
    const hashedToken = crypto
      .createHash('sha256')
      .update(request.params.activationLink)
      .digest('hex');

    const admin = await adminController.findOne({
      activationLink: hashedToken
    });

    if (!admin) {
      next(new BadRequestException(`Activation Link Invalid or Expired !`));
    } else {
      const message = await authController.confirmMail(
        request.params.activationLink
      );
      response.status(200).json({
        success: true,
        data: {},
        message: message
      });
    }
  }

  async forgotPassword(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    const admin = await adminController.findOne({
      email: request.body.email.toLowerCase()
    });

    if (!admin) {
      next(new BadRequestException(`Activation Link Invalid or Expired !`));
    } else {
      const message = await authController.forgotPassword(
        request.body,
        request
      );
      response.status(200).json({
        success: true,
        data: {},
        message: message
      });
    }
  }

  async resetPassword(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(request.body.resetToken)
      .digest('hex');

    const admin = await adminController.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        $gt: Date.now()
      }
    });

    // 2 Check if user still exists and token is NOT Expired
    if (!admin)
      throw new BadRequestException(`No Admin Found with that reset token`);
    const message = await authController.resetPassword(request.body);
    response.status(200).json({
      success: true,
      data: {},
      message: message
    });
  }

  async updatePassword(request: any, response: Response, next: NextFunction) {
    // 1) get user from collection

    const admin: AdminDocument = await adminController.getById(
      request.user.admin._id
    );
    if (!admin) {
      next(new BadRequestException('Wrong email'));
    } else {
      // 2) check if posted current Password is Correct
      const isPasswordValid = await admin.isPasswordValid(
        request.body.passwordCurrent
      );
      if (!isPasswordValid) {
        next(new BadRequestException(`Your current password is wrong;`));
      } else {
        const message = await authController.updatePassword(
          request.body,
          request
        );
        response.status(200).json({
          success: true,
          data: {},
          message: message
        });
      }
    }
  }
}
