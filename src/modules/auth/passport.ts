import passportJwt, { ExtractJwt } from 'passport-jwt';
import passportLocal from 'passport-local';

import { ConfigService } from '../../common/config';
import { AdminModel } from '../admin/schemas/admin.schema';

const configService = new ConfigService('.env');

const LocalStrategy = passportLocal.Strategy;
const JwtStrategy = passportJwt.Strategy;

module.exports = function (passport: any) {
  /**
   *  ADMIN JWT STRATEGY
   */
  passport.use(
    'admin-jwt',
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: configService.get('WEBTOKEN_SECRET_KEY')
      },
      async (payload, done) => {
        try {
          const admin = await AdminModel.findById(payload.id).select(
            '-password'
          );
          if (!admin) {
            return done({
              error: 401,
              message: 'Unauthorized',
              description: 'Unauthorized token.'
            });
          }
          return done(null, admin);
        } catch (error) {
          return done({
            error: 401,
            message: 'Unauthorized',
            description: 'Unauthorized token.'
          });
        }
      }
    )
  );

  /**
   *  ADMIN LOCAL STRATEGY
   */

  passport.use(
    'admin-local',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email: string, password: string, done: any) => {
        try {
          const admin = await AdminModel.findOne({ email }).select('-password');
          if (!admin)
            return done({
              error: 401,
              message: 'Unauthorized',
              description: 'Please enter a valid email address.'
            });

          if (!admin.activated) {
            return done({
              error: 401,
              message: 'Unauthorized',
              description: `Please Activate your email by then Link sent to your email ${admin.email}`
            });
          }

          const match = await admin.isPasswordValid(password);

          if (!match)
            return done({
              error: 401,
              message: 'Unauthorized',
              description: 'Please enter a valid password.'
            });

          done(null, admin);
        } catch (error) {
          return done({
            error: 401,
            message: 'Unauthorized',
            description: 'Unauthorized'
          });
        }
      }
    )
  );
};
