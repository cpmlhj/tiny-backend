/// <reference types="egg-validate" />
/// <reference types="egg-redis" />
/// <reference types="egg-jwt" />

import 'egg';
import { UserSchemaProps } from '../app/model/user';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import * as OSS from 'ali-oss';
import type { Options } from 'ali-oss';

declare module 'egg' {
  type MongooseModels = {
    [key in keyof Egg.IModel]: IModel[key];
  };
  interface Context {
    model: MongooseModels;
    genHash(plainText: string): Promise<string>;
    compare(plainText: string, hash: string): Promise<boolean>;
    oss: OSS;
  }
  interface Application {
    model: MongooseModels;
    mongoose: typeof mongoose;
    sessionMap: {
      [key: string]: any;
    };
    sessionStore: any;
  }

  interface EggAppConfig {
    bcrypt: {
      saltRounds: number;
    };
    oss: {
      client?: Options;
    };
  }
}
