import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [

    //Configuring .env
    ConfigModule.forRoot(),

    //static content
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),

    //Configuring the db
    MongooseModule.forRoot(process.env.MONGODB),

    AuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
