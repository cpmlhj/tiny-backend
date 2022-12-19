import { Application } from 'egg';
import { Schema } from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';

export type Roles = 'admin' | 'normal';

export interface UserSchemaProps {
  username: string;
  password: string;
  email?: string;
  nickname?: string;
  picture?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  type: 'email' | 'cellPhone' | 'oauth';
  provider?: 'gitee' | 'github' | 'wechat';
  oauthID?: string;
  role?: Roles;
}

function UserModel(app: Application) {
  const autoIncrement = AutoIncrementFactory(app.mongoose);
  const userSchema = new Schema<UserSchemaProps>(
    {
      username: { type: String, upique: true, required: true },
      password: { type: String },
      nickname: { type: String },
      email: { type: String },
      pictrue: { type: String },
      phoneNumber: { type: String },
      type: { type: String, default: 'email' },
      provider: { type: String },
      oauthID: { type: String },
      role: { type: String, default: 'normal' },
    },
    {
      timestamps: true,
      toJSON: {
        transform(_, ret) {
          delete ret.password;
          delete ret.__v;
        },
      },
    }
  );
  userSchema.plugin(autoIncrement, { inc_field: 'id', id: 'users_id_counter' });
  return app.mongoose.model<UserSchemaProps>('User', userSchema);
}

export default UserModel;
