import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
    });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(user);

    return this.usersRepository.save(newUser);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, data);

    const user = await this.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
