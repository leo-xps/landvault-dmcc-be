import { UserOutput } from '../output/user.output';

export class UsersMapper {
  static displayOne(user: any): UserOutput {
    if (!user) {
      return undefined;
    }
    let canMatch = true;
    if (
      !user.position ||
      !user.company ||
      !user.TagsInUser ||
      user.TagsInUser.length <= 0
    ) {
      canMatch = false;
    }

    return {
      uid: user.id,
      id: user.id,
      email: user.email,
      username: user.username ?? user.email.split('@')[0],
      role: user.role ?? 'user',
      isGuest: user.isGuest ?? false,
      iat: user.iat,
      exp: user.exp,
      firstName: user.firstName,
      lastName: user.lastName,
      company: user.company,
      phoneNumber: user.phoneNumber,
      position: user.position,
      tags: user.TagsInUser?.map((tag) => tag.tag.tag) ?? [],
      dmccMember: user.dmccMember,
      dmccID: user.dmccID,
      dmccEmail: user.dmccEmail,
      canMatch,
    };
  }
  static displayAll(users: any[]): UserOutput[] {
    if (!users || users.length <= 0) {
      return [];
    }
    return users.map((user) => this.displayOne(user));
  }
}
