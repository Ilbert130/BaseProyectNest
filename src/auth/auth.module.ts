import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    ConfigModule,

    //Mongoose
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema
      }
    ]),

    //JWT 
    PassportModule.register({defaultStrategy:'jwt'}),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory:(configService:ConfigService) => {

        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn:'2h'
          }
        }
      }
    })
  ],
  exports:[MongooseModule, JwtStrategy, PassportModule, JwtModule]
})
export class AuthModule {}
