import { Context, EggAppConfig } from 'egg';
import { appendFileSync } from 'fs';

export default (options: Partial<EggAppConfig>) => {
  return async (ctx: Context, next: () => Promise<void>) => {
    const startTime = Date.now();
    const requestTime = new Date();
    await next();
    const endTime = Date.now() - startTime;
    const logTime = `${requestTime} -- ${ctx.method}--${ctx.url} -- ${endTime}ms`;
    if (options.allowedMethod.includes(ctx.method)) {
      appendFileSync('./log.txt', logTime + '\n');
    }
  };
};
