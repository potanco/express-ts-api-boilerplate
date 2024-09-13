import {
  Body,
  Get,
  Path,
  Post,
  Route,
  Tags,
  Request,
  Security,
  Response,
  SuccessResponse
} from 'tsoa';

import { ConfigService } from '../../common/config';
import { EmailService } from '../../common/email';

import { AdminModel } from '../admin/schemas/admin.schema';

import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { BadRequestException } from '../../exceptions/bad-request-exception';

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const configService = new ConfigService('.env');
const emailService = new EmailService();

/**
 * Authentication Controller
 */
@Route('auth')
@Tags('Auth')
export class AuthController {
  //login
  @Response<any>(400, 'Bad Request Exception', {
    success: false,
    error: 400,
    message: 'sample message',
    description: 'Bad Request Exception',
    data: {}
  }) // error response
  @Response<any>(401, 'Unauthorized Exeption', {
    success: false,
    error: 401,
    message: 'Sample message',
    description: 'Unauthorized',
    data: {}
  }) // error response
  @SuccessResponse(201, 'Created')
  @Post('/login')
  async login(@Body() loginDto: LoginDto): Promise<String> {
    const admin = await AdminModel.findOne({ email: loginDto.email });

    const token = await jwt.sign(
      {
        id: admin.id,
        isAdmin: true,
        email: admin.email
      },
      configService.get('WEBTOKEN_SECRET_KEY'),
      {
        expiresIn: configService.get('WEBTOKEN_EXPIRATION_TIME')
      }
    );

    return token;
  }

  //Register

  @Security('bearerAuth')
  @Response<any>(400, 'Bad Request Exception', {
    success: false,
    error: 400,
    message: 'sample message',
    description: 'Bad Request Exception',
    data: {}
  }) // error response
  @Response<any>(401, 'Unauthorized Exeption', {
    success: false,
    error: 401,
    message: 'Sample message',
    description: 'Unauthorized',
    data: {}
  }) // error response
  @SuccessResponse(201, 'Created')
  @Post('/register')
  async register(
    @Body() registerDto: RegisterDto,
    @Request() req: any
  ): Promise<String> {
    let admin = await AdminModel.create(registerDto);

    // Generate Account Activation Link
    const activationToken = admin.createAccountActivationLink();

    admin.save({ validateBeforeSave: false });

    // 4 Send it to Users Email
    // const activationURL = `http://localhost:5000/api/v1/users/confirmMail/${activationToken}`;
    let activationURL;
    if (process.env.NODE_ENV === 'dev')
      activationURL = `${req.protocol}://${req.get(
        'host'
      )}/auth/confirm-mail${activationToken}`;
    else
      activationURL = `${req.protocol}://${req.get(
        'host'
      )}/auth/confirm-mail/${activationToken}`;

    const message = `GO to this link to activate your  Account : ${activationURL} .`;

    emailService.sendMail({
      email: admin.email,
      message,
      subject: 'Your Account Activation Link for dashboard !',
      user: admin,
      template: 'registerEmail.ejs',
      url: activationURL
    });

    return `Account activation link successfully sent to your email : ${admin.email}`;
  }

  //Confirm email
  @Get('/confirm-mail/:activationLink')
  async confirmMail(@Path() activationLink: string): Promise<String> {
    // 1 Hash The Avtivation Link
    const hashedToken = crypto
      .createHash('sha256')
      .update(activationLink)
      .digest('hex');

    const admin = await AdminModel.findOne({
      activationLink: hashedToken
    });
    // 3 Activate the Account
    admin.activated = true;
    admin.activationLink = undefined;
    await admin.save({ validateBeforeSave: false });

    return 'Account has been Activated Successfully !';
  }

  //Forgot passowrd
  @Post('/forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Request() req: any
  ): Promise<String> {
    const email = forgotPasswordDto.email;

    // 2 Check If Admin Exists with this email
    const admin = await AdminModel.findOne({
      email: email.toLowerCase()
    });

    // 3 Create Password Reset Token
    const resetToken = admin.createPasswordResetToken();

    await admin.save();

    // 4 Send it to Users Email
    // const resetURL = `localhost:5000/api/v1/users/resetPassword/${resetToken}`;

    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/auth/reset-password/${resetToken}`;

    const message = `Forgot Password . Update your Password at this link ${resetURL} if you actually request it
   . If you did NOT forget it , simply ignore this Email`;

    emailService.sendMail({
      email,
      message,
      subject: 'Your Password reset token (will expire in 20 minutes)',
      user: admin,
      template: 'forgotPasswordEmail.ejs',
      url: resetURL
    });

    return `Forget password link successfully sent to your email : ${email}`;
  }

  @Post('/reset-password')
  async resetPassword(
    @Body() resetpasswordDto: ResetPasswordDto
  ): Promise<String> {
    const resetToken = resetpasswordDto.resetToken;

    const admin = await AdminModel.findOne({
      passwordResetToken: resetToken,
      passwordResetExpires: {
        $gt: Date.now()
      }
    });

    if (!admin) new BadRequestException(`No Admin Found with that reset token`);

    if (resetpasswordDto.password !== resetpasswordDto.passwordConfirm)
      new BadRequestException(`Password and Confirm Password do not match`);

    // 3 Change Password and Log the User in
    admin.password = resetpasswordDto.password;

    await admin.save();
    return 'Password was resetted successfully';
  }

  //    Update Password for only logged in user
  @Security('bearerAuth')
  @Post('/update-password')
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Request() req: any
  ): Promise<String> {
    // 1) get user from collection
    const admin = await AdminModel.findById(req.user.admin._id).select(
      '+password'
    );

    // 3) if so update the  password
    admin.password = updatePasswordDto.password;

    await admin.save();
    return `Your password was updated successfully`;
  }
}
