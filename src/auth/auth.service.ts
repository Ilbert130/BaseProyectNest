import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from "bcrypt"; 
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>
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
        user
      }
      
    } catch (error) {
      console.log(error);
      this.handleDbErrors(error);
    }
  }

  //Login
  async login(loginUserDto:LoginUserDto){
    
    const {password, email} = loginUserDto;

    const user = await this.userModel.findOne({email});

    if(!user){
      throw new UnauthorizedException('Credentials are not valid (email)');
    }

    if(!bcrypt.compareSync(password, user.password)){
      throw new UnauthorizedException('Credentials are not valid (password)');
    }

    return {
      email:user.email,
      password:user.password
    };
  }

  private handleDbErrors(error:any):never {
    
    if(error.code === 11000){
      throw new BadRequestException(error.detail);
    }

    throw new InternalServerErrorException('Please check server logs')
  }
}
