import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;
  // const logger = app.middleware.tnLogger({
  //   allowedMethod: ['GET'],
  // });
  router.get('/api/user/:id', controller.user.show);
  router.post('/api/user/create', controller.user.createByEmail);
};
