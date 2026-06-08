import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User as UserRepo } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepo)
    private readonly userRepository: Repository<UserRepo>,
  ) {}

  async findOne(name: string): Promise<UserRepo | undefined> {
    const user = await this.userRepository.findOne({
      where: { name },
    });

    if (user) return user;

    return undefined;
  }

  async createOne({ name, password }: CreateUserDto): Promise<UserRepo> {
    const newUser = this.userRepository.create({
      name,
      password,
    });

    const savedUser = await this.userRepository.save(newUser);

    return savedUser;
  }
}
