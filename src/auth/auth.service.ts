import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from "bcrypt"; 
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly jwtService: JwtService
  ){}

  //Create user
  async create(createUserDto: CreateUserDto) {
    
    try {

      const {password, ...userData} = createUserDto;
      const user = await this.userModel.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      })

      return {
        user,
        token: this.getJwtToken({id:user._id})
      }
      
    } catch (error) {
      console.log(error);
      this.handleDbErrors(error);
    }
  }

  //Login
  async login(loginUserDto:LoginUserDto){
    
    const {password, email} = loginUserDto;

    const user = await this.userModel.findOne({email}, '_id email password').exec();

    if(!user){
      throw new UnauthorizedException('Credentials are not valid (email)');
    }

    if(!bcrypt.compareSync(password, user.password)){
      throw new UnauthorizedException('Credentials are not valid (password)');
    }

    return {
      id: user._id,
      email:user.email,
      password:user.password,
      token: this.getJwtToken({id:user._id})
    };
  }

  async checkAuthStatus(user:User){

    const {id, email, password, fullName} = user;

    return {
      id,
      email,
      password,
      fullName,
      token: this.getJwtToken({id:user._id})
    }
  }

  private getJwtToken(payload:JwtPayload){

    //generating the token
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDbErrors(error:any):never {
    
    if(error.code === 11000){
      throw new BadRequestException(error.detail);
    }

    throw new InternalServerErrorException('Please check server logs')
  }
}
