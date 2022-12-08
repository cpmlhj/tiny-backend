import { Service } from 'egg';
import { UserSchemaProps } from '../model/user';

export default class User extends Service {
  async createByEmail(payload: UserSchemaProps) {
    const { ctx } = this;
    const { username, password } = payload;
    const userCreatedData: Partial<UserSchemaProps> = {
      username,
      password,
      email: username,
    };
    return ctx.model.User.create(userCreatedData);
  }

  async findById(_Id: string) {
    return this.ctx.model.User.findById(_Id);
  }
}
