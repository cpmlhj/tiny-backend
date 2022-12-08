import { Context } from 'egg';

interface ResponeType {
  ctx: Context;
  resp?: any;
  msg?: string;
}

export default {
  success: ({ ctx, resp, msg }: ResponeType) => {
    ctx.body = {
      errno: 0,
      data: resp || null,
      msg: msg || '请求成功',
    };
    ctx.status = 200;
  },
};
