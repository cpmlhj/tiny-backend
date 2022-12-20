import { Controller } from 'egg';
import { userCreateRules, sendCodeRules } from '../contants';

export type Oauth2 = 'gitee' | 'github' | 'wechat';

export default class User extends Controller {
  async createByEmail() {
    const { ctx, service } = this;
    const errors = await this.validateInput(userCreateRules);
    if (errors) {
      return ctx.helper.error({
        ctx,
        errorType: 'UserValidateFail',
        error: errors,
      });
    }
    const { username } = ctx.request.body;
    const user = await service.user.findByUserName(username);
    if (user) {
      return ctx.helper.error({
        ctx,
        errorType: 'createUserAlreadyExists',
      });
    }
    const userData = await service.user.createByEmail(ctx.request.body);
    ctx.helper.success({ ctx, resp: userData });
  }

  async show() {
    const { ctx, service } = this;
    // const { username } = ctx.session;
    console.log(ctx.state.user, '=======');
    const userData = await service.user.findByUserName(ctx.state.user.username);
    ctx.helper.success({ ctx, resp: userData?.toJSON() });
    // const username = ctx.cookies.get('username', { encrypt: true });
    // const userData = await service.user.findByUserName(username);
  }

  async validateInput(rules: any) {
    const { ctx } = this;
    const errors = ctx.app.validator.validate(rules, ctx.request.body);
    return errors;
  }

  async sendVeriCode() {
    const { ctx, app } = this;
    const errors = await this.validateInput(sendCodeRules);
    if (errors) {
      return ctx.helper.error({
        ctx,
        errorType: 'UserValidateFail',
        error: errors,
      });
    }
    // 获取redis 数据
    const { phoneNumber } = ctx.request.body;
    const preVeriCode = await app.redis.get(`phoneVeriCode-${phoneNumber}`);
    if (preVeriCode) {
      ctx.helper.error({
        ctx,
        errorType: 'sendVeriCodeFrequentlyFailInfo',
      });
    }
    const veriCode = Math.floor(Math.random() * 9000 + 1000).toString();
    // 发送短信
    const sendSms = await ctx.helper.thirdPartyVerifySMS({
      ctx,
      service: 'A',
      phoneNumber: '13242110384',
      code: veriCode,
      templateCode: 'verifyCode',
    });
    if (!sendSms) {
      return ctx.helper.error({
        ctx,
        errorType: 'sendVeriCodeFrequentlyFailInfo',
      });
    }
    await app.redis.set(`phoneVeriCode-${phoneNumber}`, veriCode, 'ex', 60);
    ctx.helper.success({ ctx, resp: '验证码发送成功' });
  }

  async loginByEmail() {
    const { ctx, service } = this;
    // 验证用户输入
    const errors = await this.validateInput(userCreateRules);
    if (errors) {
      return ctx.helper.error({
        ctx,
        errorType: 'UserValidateFail',
        error: errors,
      });
    }
    // 获取用户信息
    const { username, password } = ctx.request.body;
    const user = await service.user.findByUserName(username);
    if (!user) {
      return this.ctx.helper.error({ ctx, errorType: 'loginCheckFailInfo' });
    }
    // 验证密码
    const verifypwd = await ctx.compare(password, user.password);
    if (!verifypwd) {
      return this.ctx.helper.error({ ctx, errorType: 'loginCheckFailInfo' });
    }
    // ctx.cookies.set('username', user.username, { encrypt: true });
    // ctx.session.username = user.username;
    // Public claims 公共信息: should be unique like emial address or phone_number
    const token = ctx.app.jwt.sign(
      { username: user.username, _id: user._id },
      ctx.app.config.secret,
      {
        expiresIn: ctx.app.config.jwtExpires,
      }
    );
    ctx.helper.success({ ctx, resp: { token }, msg: '登录成功' });
  }

  async loginByCellPhone() {
    const { ctx, service } = this;
    // 验证用户输入
    const errors = await this.validateInput(sendCodeRules);
    if (errors) {
      return ctx.helper.error({
        ctx,
        errorType: 'UserValidateFail',
        error: errors,
      });
    }
    const { veriCode, phoneNumber } = ctx.request.body;
    const preVeriCode = await ctx.app.redis.get(`phoneVeriCode-${phoneNumber}`);
    if (veriCode !== preVeriCode) {
      return ctx.helper.error({
        ctx,
        errorType: 'loginVeriCodeIncorrectFailInfo',
      });
    }
    const token = await service.user.loginByPhone(phoneNumber);
    ctx.helper.success({ ctx, resp: { token }, msg: '登录成功' });
  }

  async oauth() {
    const { app, ctx } = this;
    const { oauth }: { oauth: Oauth2 } = ctx.params;
    const { giteeConfig, githubOauthConfig } = app.config;
    if (oauth === 'gitee') {
      return ctx.redirect(
        `https://gitee.com/oauth/authorize?client_id=${giteeConfig.clientId}&redirect_uri=${giteeConfig.redirectUrl}&response_type=code`
      );
    } else if (oauth === 'github') {
      ctx.redirect(
        `https://github.com/login/oauth/authorize?client_id=${githubOauthConfig.client_id}&redirect_uri=${githubOauthConfig.redirect_uri}&response_type=code`
      );
    }
  }
  async oauthByGitee() {
    const { ctx } = this;
    const { code } = ctx.request.query;
    try {
      const token = await ctx.service.user.loginByGitee(code);
      if (token) {
        ctx.helper.success({ ctx, resp: token });
      }
    } catch (e) {
      return ctx.helper.error({
        ctx,
        errorType: 'loginByOuathFailInfo',
        error: e,
      });
    }
  }
  async oauthByGithub() {
    const { ctx } = this;
    const { code } = ctx.request.query;
    try {
      // const token = await ctx.service.user.loginByGitee(code);
      if (code) {
        ctx.helper.success({ ctx, resp: code });
      }
    } catch (e) {
      return ctx.helper.error({
        ctx,
        errorType: 'loginByOuathFailInfo',
        error: e,
      });
    }
  }
  async testing() {
    this.ctx.helper.success({
      ctx: this.ctx,
      resp: { message: 'ok, 你猜对了' },
    });
  }
}
