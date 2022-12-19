import { Controller } from 'egg';
import { subject } from '@casl/ability';
import { permittedFieldsOf } from '@casl/ability/extra';
import { difference, assign } from 'lodash/fp';
import { errorType } from '../contants';
import defineRoles, { CaslModelType } from '../roles';

interface Options {
  // custom action
  action?: string;
  // 查找记录时候的key, 默认是ID
  key?: string;
  // 查找记录时候的value, 默认是 ctx.params
  // valueKey 数据来源的键值
  value?: {
    type: 'params' | 'body';
    valueKey: string;
  };
}

export type ModelType = {
  [k in keyof Egg.IModel]: string;
};

interface ModelMapping {
  mongoose: keyof ModelType;
  casl: CaslModelType;
}

const caslMapping: Record<string, string> = {
  GET: 'read',
  POST: 'create',
  PATCH: 'update',
  DELETE: 'delete',
};

const caslOptions = { fieldsFrom: (rule: any) => rule.fields || [] };
const defaultOptions = {
  key: 'id',
  value: { type: 'params', valueKey: 'id' },
};
/**
 *
 * @param modelName model名称， 可以是string、cals 和 mongoose的映射关系
 * @param errType 返回的错误类型
 * @param options 配置选项，可以自定义action 、查询条件
 * @return
 */
export default function checkAppPermission(
  modelName: string | ModelMapping,
  errType: errorType,
  options?: Options
) {
  return function permission(_, _a, descriptor: PropertyDescriptor) {
    const oldMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const that = this as Controller;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { ctx } = that;
      const { method } = ctx.request;
      const caslAction =
        options && options.action ? options.action : caslMapping[method];
      if (!ctx.state && !ctx.state.user) {
        return ctx.helper.error({ ctx, errorType: errType });
      }
      const searchOptions = assign(defaultOptions, options || {});
      const {
        key,
        value: { type, valueKey },
      } = searchOptions;
      const source = type === 'params' ? ctx.params : ctx.request.body;
      const query = {
        [key]: source[valueKey],
      };
      // 构建modelname
      const mongooseModelName =
        typeof modelName === 'string' ? modelName : modelName.mongoose;
      const caslModelName =
        typeof modelName === 'string' ? modelName : modelName.casl;
      let permission = false;
      let attrsPermission = true;
      // 获取定义的 roles
      const ability = defineRoles(ctx.state.user);
      // 获取 角色条件
      const rule = ability.relevantRuleFor(caslAction, caslModelName);
      if (rule && rule.conditions) {
        // 若存在conditions， 查询对应的数据
        const certianRecord = await ctx.model[mongooseModelName]
          .findOne(query)
          .lean();
        permission = ability.can(
          caslAction,
          subject(caslModelName, certianRecord)
        );
        console.log(permission, '+++++++++');
      } else {
        permission = ability.can(caslAction, caslModelName);
      }
      // 判断 rule 中是否有对应的受限字段
      if (rule && rule.fields) {
        const fields = permittedFieldsOf(
          ability,
          caslAction,
          caslModelName,
          caslOptions
        );
        console.log(fields, 'fieldsfieldsfields');
        if (fields.length > 0) {
          // 将受限字段 与 request.body 相比较 找出是否有不同点
          const payload = Object.keys(ctx.request.body);
          const diffkeys = difference(payload, fields);
          attrsPermission = diffkeys.length === 0;
          console.log(diffkeys, 'diffkeysdiffkeysdiffkeys');
        }
      }
      if (!permission || !attrsPermission) {
        return ctx.helper.error({ ctx, errorType: errType });
      }
      await oldMethod.apply(that, args);
    };
  };
}
