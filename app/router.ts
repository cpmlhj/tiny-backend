import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;
  // const jwt = app.middleware.jwt({ secret: app.config.jwt.secret });
  // const logger = app.middleware.tnLogger({
  //   allowedMethod: ['GET'],
  // });
  app.jwt;
  // router.get('/api/user/:id', controller.user.show); // 获取用户信息
  router.post('/api/user/create', controller.user.createByEmail); // 创建用户
  router.post('/api/user/loginByEmail', controller.user.loginByEmail); // 通过邮箱登录
  router.get('/api/user/show', app.jwt as any, controller.user.show);
  router.post('/api/user/phoneVericode', controller.user.sendVeriCode);
  router.post('/api/user/loginByPhone', controller.user.loginByCellPhone);
  router.get('/api/user/passport/:oauth', controller.user.oauth);
  router.get('/api/user/passport/gitee/callback', controller.user.oauthByGitee);
  router.get(
    '/api/user/passport/github/callback',
    controller.user.oauthByGithub
  );

  // works
  router.post('/api/works/add', app.jwt as any, controller.works.createWork);
  router.get('/api/works/list', app.jwt as any, controller.works.appList);
  router.get('/api/works/templatelist', controller.works.getTemplateList);
  router.patch('/api/works/:id', app.jwt as any, controller.works.updateApp);
  router.delete('/api/works/:id', app.jwt as any, controller.works.deleteApp);
  router.post(
    '/api/works/publish/:id',
    app.jwt as any,
    controller.works.publishApp
  );
};
