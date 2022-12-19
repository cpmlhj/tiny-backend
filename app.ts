import { IBoot, Application } from 'egg';

export default class AppBoot implements IBoot {
  private readonly app: Application;
  constructor(app: Application) {
    this.app = app;
  }

  configWillLoad(): void {
    this.app.config.coreMiddleware.push('customError');
    console.log('enable mid', this.app.config.coreMiddleware);
  }
  async didReady(): Promise<void> {
    const ctx = this.app.createAnonymousContext();
    ctx.logger.info('context ready');
  }
}
