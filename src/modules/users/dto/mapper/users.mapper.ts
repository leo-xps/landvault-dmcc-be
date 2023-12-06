import { UserOutput } from '../output/user.output';

export class UsersMapper {
  static displayOne(user: any): UserOutput {
    if (!user) {
      return undefined;
    }
    return {
      uid: user.id,
      id: user.id,
      email: user.email,
      username: user.username ?? user.email.split('@')[0],
      role: user.role ?? 'user',
    };
  }
  static displayAll(users: any[]): UserOutput[] {
    if (!users || users.length <= 0) {
      return [];
    }
    return users.map((user) => this.displayOne(user));
  }
}
