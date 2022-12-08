import { Application } from 'egg';
import { Schema } from 'mongoose';

export interface UserSchemaProps {
  username: string;
  password: string;
  email?: string;
  nickname?: string;
  picture?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

function UserModel(app: Application) {
  const userSchema = new Schema<UserSchemaProps>(
    {
      username: { type: String, upique: true, required: true },
      password: { type: String, required: true },
      nickanem: { type: String },
      emial: { type: String },
      pictrue: { type: String },
      phoneNumber: { type: String },
    },
    { timestamps: true }
  );
  return app.mongoose.model<UserSchemaProps>('User', userSchema);
}

export default UserModel;
