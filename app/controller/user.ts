import { Controller } from 'egg';

export default class User extends Controller {
  async createByEmail() {
    const { ctx, service } = this;
    const userData = await service.user.createByEmail(ctx.request.body);
    ctx.helper.success({ ctx, resp: userData });
  }
  async show() {
    const { ctx, service } = this;
    const userData = await service.user.findById(ctx.params.id);
    ctx.helper.success({ ctx, resp: userData });
  }
}
