import { Application } from 'egg';
import { Schema, Types } from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';

export interface Channel {
  id: string;
  name: string;
}

export interface Works {
  uuid: string;
  title: string;
  desc: string;
  coverImg?: string;
  content: Record<string, any>;
  isTemplate?: boolean;
  isPublish?: boolean;
  author: string;
  copiedCount: number;
  status?: 0 | 1 | 2;
  user: Types.ObjectId;
  lastPublishAt?: Date;
  channels: Channel[];
}

export default (app: Application) => {
  const autoIncrement = AutoIncrementFactory(app.mongoose);
  const WorksSchema = new Schema<Works>(
    {
      uuid: { type: String, unique: true },
      title: { type: String },
      desc: { type: String },
      coverImg: { type: String },
      content: { type: Object },
      isTemplate: { type: Boolean },
      isPublish: { type: Boolean },
      author: { type: String },
      copiedCount: { type: Number, default: 0 },
      status: { type: Number, default: 1 },
      lastPublishAt: { type: Date },
      user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    },
    { timestamps: true }
  );
  WorksSchema.plugin(autoIncrement, {
    inc_field: 'id',
    id: 'Works_id_counter',
  });
  return app.mongoose.model<Works>('works', WorksSchema);
};
