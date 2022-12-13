import { Service } from 'egg';
import { Types } from 'mongoose';
import { Works as Work } from '../model/work';
import { nanoid } from 'nanoid';
import { IndexCondition } from '../controller/works';

const defaultIndexCondition: Required<IndexCondition> = {
  pageIndex: 0,
  pageSize: 10,
  select: '',
  populate: '',
  customSort: { createdAt: -1 },
  find: {},
};

export default class Works extends Service {
  async createWorks(data: Record<string, any>) {
    const { ctx } = this;
    // 获取用户ID
    const { _id, username } = ctx.state.user;
    // 创建唯一ID
    const uuid = nanoid(6);
    const originWork: Partial<Work> = {
      ...data,
      uuid,
      user: Types.ObjectId(_id),
      author: username,
    };
    return ctx.model.Work.create(originWork);
  }

  /**
   * 获取作品列表
   */
  async getappList(condition: IndexCondition) {
    const newCondition = { ...defaultIndexCondition, ...condition };
    const { find, pageIndex, pageSize, populate, customSort, select } =
      newCondition;
    const skip = pageIndex * pageSize;
    const res = await this.ctx.model.Work.find(find)
      .select(select)
      .populate(populate)
      .skip(skip)
      .limit(pageIndex)
      .sort(customSort)
      .lean();
    const count = await this.ctx.model.Work.find(find).count();
    return {
      count,
      list: res,
      pageIndex,
      pageSize,
    };
  }

  // 发布作品
  async publishApp(id: number, isTemplate = false) {
    const { ctx } = this;
    const payload: Partial<Work> = {
      status: 2,
      lastPublishAt: new Date(),
      ...(isTemplate && { isTemplate }),
    };
    const res = await ctx.model.Work.findOneAndUpdate({ id }, payload, {
      new: true,
    }).lean();
    if (res) {
      const { uuid } = res;
      return `http://127.0.0.1/api/pages/p/${id}-${uuid}`;
    }
  }
}
