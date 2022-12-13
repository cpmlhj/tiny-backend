import { errorType } from '../contants';
import { Controller } from 'egg';
export default function validInput(rules: any, errType: errorType) {
  return function (_, _b: string, descriptor: PropertyDescriptor) {
    const originMethod = descriptor.value;
    descriptor.value = function inputValid(...args: any[]) {
      const that = this as Controller;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { app, ctx } = that;
      const errors = app.validator.validate(rules, ctx.request.body);
      if (errors) {
        return ctx.helper.error({
          ctx,
          errorType: errType,
          error: errors,
        });
      }
      return originMethod.apply(this, args);
    };
  };
}
