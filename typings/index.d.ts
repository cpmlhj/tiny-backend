import 'egg';
import { UserSchemaProps } from '../app/model/user';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

declare module 'egg' {
  type MongooseModels = {
    [key in keyof Egg.IModel]: IModel[key];
  };
  interface Context {
    model: MongooseModels;
  }
  interface Application {
    model: MongooseModels;
    mongoose: typeof mongoose;
  }
}
