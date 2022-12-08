import { Application } from 'egg';
import axios, { AxiosInstance } from 'axios';
const AXIOS = Symbol('APPLICTION#AXIOS');
export default {
  echo(msg: string) {
    const that = this as Application;
    return 'echo:' + msg + that.config.name;
  },
  get axiosInstance(): AxiosInstance {
    if (!this[AXIOS]) {
      this[AXIOS] = axios.create({
        baseURL: 'https://dog.ceo/',
        timeout: 5000,
      });
    }
    return this[AXIOS];
  },
};
