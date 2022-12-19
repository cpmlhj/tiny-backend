import { Controller } from 'egg';
import { worksCreateRules, channelCreateRules } from '../contants';
import { validInput, checkAppPermission } from '../decorator';
import { nanoid } from 'nanoid';
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
  @checkAppPermission('Work', 'workPermissionFail')
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

  @checkAppPermission('Work', 'workPermissionFail')
  async getSingleWork() {
    const { ctx } = this;
    const { id } = ctx.params;
    const res = await ctx.model.Work.findOne({ id }).lean();
    ctx.helper.success({ ctx, resp: res });
  }

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
  @checkAppPermission('Work', 'workPermissionFail', { action: 'publish' })
  async publishApp() {
    const { ctx } = this;
    const url = await ctx.service.works.publishApp(ctx.params.id);
    ctx.helper.success({ ctx, resp: { url } });
  }

  /**
   * 创建渠道
   * @param {name: string}  渠道名称
   * @param {workId: string} 作品ID
   */
  @validInput(channelCreateRules, 'workCreateChannelFail')
  @checkAppPermission(
    { mongoose: 'Work', casl: 'Channel' },
    'workPermissionFail',
    {
      value: {
        type: 'body',
        valueKey: 'workId',
      },
    }
  )
  async createChannel() {
    const { ctx } = this;
    const { name, workId } = ctx.request.body;
    const newChannel = {
      name,
      id: nanoid(6),
    };
    await ctx.model.Work.findOneAndUpdate(
      { id: workId },
      {
        $push: { channels: newChannel },
      }
    );
    ctx.helper.success({ ctx, resp: newChannel });
  }

  /**
   * 查找渠道
   * @param {id: string}  作品ID
   */
  @checkAppPermission(
    { mongoose: 'Work', casl: 'Channel' },
    'workPermissionFail'
  )
  async getWorksChannel() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { channels } = (await ctx.model.Work.findOne({ id }).lean()) || {};
    ctx.helper.success({ ctx, resp: { channels, count: channels?.length } });
  }

  @checkAppPermission(
    { mongoose: 'Work', casl: 'Channel' },
    'workPermissionFail',
    {
      key: 'channels.id',
      value: {
        type: 'params',
        valueKey: 'channelId',
      },
    }
  )
  async updateChannelName() {
    const { ctx } = this;
    const { channelId } = ctx.params;
    const { name } = ctx.request.body;
    const resp = await ctx.model.Work.findOneAndUpdate(
      {
        'channels.id': channelId,
      },
      {
        $set: { 'channels.$.name': name },
      }
    );
    if (resp) return ctx.helper.success({ ctx, resp: name });
    return ctx.helper.error({ ctx, errorType: 'workUpdateChannelFail' });
  }

  @checkAppPermission(
    { mongoose: 'Work', casl: 'Channel' },
    'workPermissionFail',
    {
      key: 'channels.id',
      value: {
        type: 'params',
        valueKey: 'channelId',
      },
    }
  )
  async deleteChannel() {
    const { ctx } = this;
    const { channelId } = ctx.params;
    const resp = await ctx.model.Work.findOneAndUpdate(
      {
        'channels.id': channelId,
      },
      {
        $pull: { channels: { id: channelId } },
      }
    );
    if (resp) return ctx.helper.success({ ctx, resp });
    return ctx.helper.error({ ctx, errorType: 'workDeleteChannelFail' });
  }
}
