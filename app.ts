import { IBoot, Application } from 'egg';

export default class AppBoot implements IBoot {
  private readonly app: Application;
  constructor(app: Application) {
    this.app = app;
  }

  configWillLoad(): void {
    // 修改全局配置 的最后时刻
    console.log('enable mid', this.app.config.coreMiddleware);
    this.app.config.coreMiddleware.unshift('tnLogger');
  }
  async didReady(): Promise<void> {
    const ctx = this.app.createAnonymousContext();
    ctx.logger.info('context ready');
  }
}
