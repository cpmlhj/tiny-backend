import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;
  router.prefix('/api');
  // const jwt = app.middleware.jwt({ secret: app.config.jwt.secret });
  // const logger = app.middleware.tnLogger({
  //   allowedMethod: ['GET'],
  // });

  router.post('/user/create', controller.user.createByEmail); // 创建用户
  router.post('/user/loginByEmail', controller.user.loginByEmail); // 通过邮箱登录
  router.get('/user/getUserInfo', controller.user.show);
  router.post('/user/phoneVericode', controller.user.sendVeriCode);
  router.post('/user/loginByPhone', controller.user.loginByCellPhone);
  router.get('/user/passport/:oauth', controller.user.oauth);
  router.get('/user/passport/gitee/callback', controller.user.oauthByGitee);
  router.get('/user/passport/github/callback', controller.user.oauthByGithub);

  // works
  router.post('/works/add', controller.works.createWork);
  router.get('/works/list', controller.works.appList);
  router.get('/works/templatelist', controller.works.getTemplateList);
  router.get('/works/:id', controller.works.getSingleWork);
  router.patch('/works/:id', controller.works.updateApp);
  router.delete('/works/:id', controller.works.deleteApp);
  router.post('/works/publish/:id', controller.works.publishApp);
  router.post('/channel', controller.works.createChannel);
  router.get('/getWorksChannel/:id', controller.works.getWorksChannel);

  // router.post('/utils/fileUpload', controller.utils.fileUploadByStream);
  router.post('/utils/uploadToOSS', controller.utils.uploadToOSS);

  // renderer
  router.get('/pages/:id', controller.utils.renderH5Page);

  router.get('/test', controller.user.testing);
};
