import { Service } from 'egg';
import { UserSchemaProps } from '../model/user';

export interface GiteeUserResp {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  email: string;
}

export default class User extends Service {
  async createByEmail(payload: UserSchemaProps) {
    const { ctx } = this;
    const { username, password } = payload;
    const hash = await ctx.genHash(password);
    const userCreatedData: Partial<UserSchemaProps> = {
      username,
      password: hash,
      email: username,
    };
    return ctx.model.User.create(userCreatedData);
  }

  async findById(_Id: string) {
    return this.ctx.model.User.findById(_Id);
  }

  async findByUserName(username: string) {
    return this.ctx.model.User.findOne({ username });
  }

  async loginByPhone(phoneNumber: string) {
    const { ctx, app } = this;
    let user = await this.findByUserName(phoneNumber);
    if (!user) {
      const userCreate: Partial<UserSchemaProps> = {
        username: phoneNumber,
        phoneNumber,
        nickname: `tiny-${phoneNumber.slice(-4)}`,
        type: 'cellPhone',
      };
      user = await ctx.model.User.create(userCreate);
    }
    return ctx.app.jwt.sign(
      { username: user.username, _id: user._id },
      app.config.jwt.secret,
      {
        expiresIn: ctx.app.config.jwtExpires,
      }
    );
  }

  async getAccessToken(code: string) {
    const { ctx, app } = this;
    const {
      giteeConfig: { clientId, authUrl, redirectUrl, clientSecret },
    } = app.config;
    const resposne = await ctx.curl(authUrl, {
      method: 'POST',
      contentType: 'json',
      dataType: 'json',
      data: {
        code,
        client_id: clientId,
        redirect_uri: redirectUrl,
        client_secret: clientSecret,
      },
    });
    ctx.logger.info(resposne.data);
    return resposne.data;
  }
  async getGiteeUserData(token: string) {
    const { ctx, app } = this;
    const {
      giteeConfig: { giteeUserApi },
    } = app.config;
    const { data } = await ctx.curl<GiteeUserResp>(
      `${giteeUserApi}?access_token=${token}`,
      {
        dataType: 'json',
      }
    );
    return data;
  }

  async loginByGitee(code: string) {
    const { ctx, app } = this;
    // 获取 access_token
    const { access_token } = await this.getAccessToken(code);
    // 获取 userInfo
    const data = await this.getGiteeUserData(access_token);

    const { id, name, avatar_url, email } = data;
    const stringId = id.toString();
    let user;
    user = await this.findByUserName(`Gitee_${stringId}`);
    if (!user) {
      const userCreate: Partial<UserSchemaProps> = {
        oauthID: stringId,
        provider: 'gitee',
        username: `Gitee_${stringId}`,
        nickname: `tiny-${name}`,
        type: 'oauth',
        picture: avatar_url,
        email,
      };
      user = await ctx.model.User.create(userCreate);
    }
    return ctx.app.jwt.sign(
      { username: user.username, _id: user._id },
      app.config.jwt.secret,
      {
        expiresIn: ctx.app.config.jwtExpires,
      }
    );
  }
}
