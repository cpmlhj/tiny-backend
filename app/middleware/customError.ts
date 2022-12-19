import { Context } from 'egg';

export default () => {
  return async (ctx: Context, next: () => Promise<any>) => {
    try {
      await next();
    } catch (e) {
      const error = e as any;
      if (error && error.status === 401) {
        return ctx.helper.error({ ctx, errorType: 'loginCheckFailInfo' });
      } else if (ctx.path.includes('/api/utils/upload')) {
        if (error && error.status === 400) {
          return ctx.helper.error({
            ctx,
            errorType: 'imageUpLoadFormatFialInfo',
            error: error.message,
          });
        }
      }
      throw error;
    }
  };
};
