import { defineAbility } from '@casl/ability';
import { UserSchemaProps } from './model/user';
import { Document } from 'mongoose';

export type CaslModelType = 'User' | 'Work' | 'Channel';

export default (user: UserSchemaProps & Document<any, any, UserSchemaProps>) =>
  defineAbility((can) => {
    if (user) {
      if (user.role === 'admin') {
        can('manage', 'all');
      } else {
        // normal user
        can('read', 'User', { _id: user._id });
        can('update', 'User', ['nickName', 'picture'], { _id: user._id });
        // 可以更新 删除，创建自己的works
        can('create', 'Work', ['title', 'desc', 'content', 'coverImg']);
        can('read', 'Work', { user: user._id });
        can('update', 'Work', ['title', 'desc', 'content', 'coverImg'], {
          user: user._id,
        });
        can('delete', 'Work', { user: user._id });
        can('publish', 'Work', { user: user._id });

        can('create', 'Channel', ['name', 'workId'], { user: user._id });
        can('read', 'Channel', { user: user._id });
        can('update', 'Channel', ['name'], {
          user: user._id,
        });
        can('delete', 'Channel', ['name'], { user: user._id });
      }
    }
  });
