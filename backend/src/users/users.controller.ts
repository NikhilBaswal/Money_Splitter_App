import { Controller, Get, Post, Body, Param, Req, UseGuards, HttpException, HttpStatus, Delete } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Friend } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Friend) private friendRepo: Repository<Friend>,
  ) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    const existing = await this.userRepo.findOne({ where: { email: body.email } });
    if (existing) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }
    const user = this.userRepo.create(body);
    return this.userRepo.save(user);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.userRepo.findOne({ where: { email: body.email, password: body.password } });
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  @Get(':userId/friends')
  async getFriends(@Param('userId') userId: number) {
    return this.friendRepo.find({ where: { user: { id: userId } } });
  }

  @Post(':userId/friends')
  async addFriend(@Param('userId') userId: number, @Body() body: { name: string }) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const friend = this.friendRepo.create({ name: body.name, user });
    return this.friendRepo.save(friend);
  }

}
