export interface IAdmin {
  name: string;
  email: string;
  photo: String;
  password: string;
  activationLink: string;
  passwordResetToken: string;
  passwordResetExpires: Date;
  activated: boolean;
}
