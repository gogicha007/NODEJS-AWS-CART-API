import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { User } from '../models';

@Injectable()
export class UsersService {
  private readonly users: Record<string, User>;

  constructor() {
    this.users = {
      "1": { id: 'a', name: "john", password: 'doe' },
      "2": { id: 'b', name: "jane", password: 'dae' }
    };
  }

  findOne(name: string): User | undefined {
    for (const id in this.users) {
      if (this.users[id].name === name) {
        return this.users[id];
      }
    }
    return undefined;
  }

  createOne({ name, password }: User): User {
    const id = randomUUID();
    const newUser = { id, name, password };

    this.users[id] = newUser;

    return newUser;
  }
}
