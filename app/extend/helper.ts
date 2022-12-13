import { Context } from 'egg';
import { userErrorMessage, worksErrorMessage, errorType } from '../contants';
import { AliYunClient } from '../utils/sms';
interface ResponeType {
  ctx: Context;
  resp?: any;
  msg?: string;
}

interface ErrorResponseType {
  ctx: Context;
  errorType: errorType;
  error?: any;
}

// 暂时先支持阿里云
export type ThiryPartyServer = 'A' | 'T';

const ErrorMessage = {
  ...userErrorMessage,
  ...worksErrorMessage,
};

export default {
  success: ({ ctx, resp, msg }: ResponeType) => {
    ctx.body = {
      errno: 0,
      data: resp || null,
      msg: msg || '请求成功',
    };
    ctx.status = 200;
  },
  error: ({ ctx, errorType, error }: ErrorResponseType) => {
    const { errno, message } = ErrorMessage[errorType];
    ctx.body = {
      errno,
      msg: message || '请求错误',
      ...(error && { error }),
    };
    ctx.status = 200;
  },
  thirdPartyVerifySMS: async ({
    ctx,
    service,
    phoneNumber,
    code,
    templateCode,
  }: {
    ctx: Context;
    service: ThiryPartyServer;
    phoneNumber: string;
    code: string;
    templateCode: string;
  }) => {
    const {
      config: { thirdParty },
    } = ctx.app;
    if (service === 'A') {
      const { accessKeyId, accessKeySecret, endPoint, SMS_CONFIG } =
        thirdParty.A;
      const client = new AliYunClient({
        accessKeyId,
        accessKeySecret,
        endPoint,
      });
      return await client.sendSms({
        phoneNumber,
        code,
        templateCode: SMS_CONFIG.templateCode[templateCode],
        signName: SMS_CONFIG.signName,
      });
    }
  },
};
