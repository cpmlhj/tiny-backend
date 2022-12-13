import { Controller } from 'egg';
import { errorType } from '../contants';
export default function checkAppPermission(
  modelName: string,
  errType: errorType,
  userKey = 'user'
) {
  return function permission(_, _a, descriptor: PropertyDescriptor) {
    const oldMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const that = this as Controller;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { ctx } = that;
      // 获取当前用户ID
      const { _id: userId } = ctx.state.user;
      const { id } = ctx.params;
      const certianRecord = await ctx.model[modelName].findOne({ id });
      if (!certianRecord || certianRecord[userKey].toString() !== userId) {
        return ctx.helper.error({ ctx, errorType: errType });
      }
      await oldMethod.apply(that, args);
    };
  };
}
