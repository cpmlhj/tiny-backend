import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
import * as $OpenApi from '@alicloud/openapi-client';
import Util, * as $Util from '@alicloud/tea-util';

export default class AliYunClient {
  accessKeyId: string;
  accessKeySecret: string;
  endPoint: string;
  client: Dysmsapi20170525;
  constructor({
    accessKeyId,
    accessKeySecret,
    endPoint,
  }: {
    accessKeyId: string;
    accessKeySecret: string;
    endPoint: string;
  }) {
    this.accessKeyId = accessKeyId;
    this.accessKeySecret = accessKeySecret;
    this.endPoint = endPoint;
    this.createClient();
  }

  private createClient() {
    const config = new $OpenApi.Config({
      accessKeyId: this.accessKeyId,
      accessKeySecret: this.accessKeySecret,
    });
    config.endpoint = this.endPoint;
    this.client = new Dysmsapi20170525(config);
  }

  async sendSms({
    phoneNumber,
    code,
    signName,
    templateCode,
  }: {
    phoneNumber: string;
    code: string;
    signName: string;
    templateCode: string;
  }): Promise<$Dysmsapi20170525.SendSmsResponse | void> {
    const smsRequest = new $Dysmsapi20170525.SendSmsRequest({
      signName,
      templateCode,
      phoneNumbers: phoneNumber,
      templateParam: JSON.stringify({ code }),
    });
    const runtime = new $Util.RuntimeOptions({});
    try {
      const response = await this.client.sendSmsWithOptions(
        smsRequest,
        runtime
      );
      console.log(response);
      return response;
    } catch (err) {
      Util.assertAsString((err as any).message);
    }
  }
}
