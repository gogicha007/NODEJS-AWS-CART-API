import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async findOne(name: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: { name }
    })

    if (user) return user

    return undefined;
  }

  async createOne({ name, password }: User): Promise<User> {
    const newUser = this.userRepository.create({
      name,
      password
    });

    const savedUser = await this.userRepository.save(newUser)

    return savedUser;
  }
}
