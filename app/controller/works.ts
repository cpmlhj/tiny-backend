import { Controller } from 'egg';
import { worksCreateRules } from '../contants';
import { validInput, checkAppPermission } from '../decorator';

export interface IndexCondition {
  pageIndex?: number;
  pageSize?: number;
  select?: string | string[];
  populate: { path?: string; select?: string } | string;
  customSort?: Record<string, any>;
  find?: Record<string, any>;
}

export default class Works extends Controller {
  @validInput(worksCreateRules, 'worksValidateFail')
  async createWork() {
    const { ctx, service } = this;
    await service.works.createWorks(ctx.request.body);
    ctx.helper.success({ ctx, resp: '创建成功' });
  }

  /**
   * 获取用户作品列表
   * @param {title: String} 标题
   * @param {pageIndex: Number} 页码
   * @param {pageSize: Number} 间隔
   * @param {isTemplate: Boolean} 是否为模板
   */
  async appList() {
    const { ctx } = this;
    const { title, pageIndex, pageSize, isTemplate } = ctx.query;
    const { _id: userId } = ctx.state.user;
    const findCondition = {
      user: userId,
      ...(title && {
        title: {
          $regex: title,
          $options: 'i',
        },
      }),
      ...(isTemplate && {
        isTemplate: parseInt(isTemplate),
      }),
    };
    const condition: IndexCondition = {
      select: 'id author copiedCount coverImg desc title user isHot createdAt',
      populate: {
        path: 'user',
        select: 'username nickname _id picture',
      },
      find: findCondition,
      ...(pageIndex && {
        pageIndex: parseInt(pageIndex),
      }),
      ...(pageSize && {
        pageSize: parseInt(pageSize),
      }),
    };
    const res = await ctx.service.works.getappList(condition);
    ctx.helper.success({ ctx, resp: res });
  }

  /**
   * 获取模板作品列表
   * @param {pageIndex: Number} 页码
   * @param {pageSize: Number} 间隔
   */
  async getTemplateList() {
    const { ctx } = this;
    const { pageIndex, pageSize } = ctx.query;
    const condition: IndexCondition = {
      select: 'id author copiedCount coverImg desc title user isHot createdAt',
      populate: { path: 'user', select: 'username nickname _id picture' },
      find: {
        isPublic: true,
        isTemplate: true,
      },
      ...(pageIndex && {
        pageIndex: parseInt(pageIndex),
      }),
      ...(pageSize && {
        pageSize: parseInt(pageSize),
      }),
    };
    const res = await ctx.service.works.getappList(condition);
    ctx.helper.success({ ctx, resp: res });
  }

  // async checkPermission(id: number) {
  //   const { ctx } = this;
  //   // 获取当前用户ID
  //   const { _id: userId } = ctx.state.user;
  //   // 查询作品信息
  //   const work = await ctx.model.Work.findOne({ id });
  //   if (!work) return false;
  //   // 转换为字符串  比较
  //   return work.user.toString() === userId;
  // }

  @checkAppPermission('Work', 'workPermissionFail')
  async updateApp() {
    const { ctx } = this;
    const { id } = ctx.params;
    const payload = ctx.request.body;
    const res = await ctx.model.Work.findOneAndUpdate({ id }, payload, {
      new: true,
    }).lean();
    ctx.helper.success({ ctx, resp: res });
  }

  @checkAppPermission('Work', 'workPermissionFail')
  async deleteApp() {
    const { ctx } = this;
    const { id } = ctx.params;
    const res = await ctx.model.Work.findOneAndDelete({ id })
      .select('_id id title')
      .lean();
    ctx.helper.success({ ctx, resp: res });
  }
  @checkAppPermission('Work', 'workPermissionFail')
  async publishApp() {
    const { ctx } = this;
    const url = await ctx.service.works.publishApp(ctx.params.id);
    ctx.helper.success({ ctx, resp: { url } });
  }
}
