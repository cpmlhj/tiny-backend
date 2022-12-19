/**
 * 错误码
 * 统一格式: A-BB-CCC
 * A: 错误级别， 1代表系统级错误，2代表服务级错误
 * B: 项目或模块名称， 01代表用户模块
 * C: 错误码具体编号，自增即可
 */

/** ---------   userError ---------    */
export const userErrorMessage = {
  UserValidateFail: {
    errno: 1010001,
    message: '用户信息校验失败',
  },
  createUserAlreadyExists: {
    errno: 1010002,
    message: '邮箱已被注册！',
  },
  loginCheckFailInfo: {
    errno: 1010003,
    message: '用户不存在或账户密码错误',
  },
  sendVeriCodeFrequentlyFailInfo: {
    errno: 1010004,
    message: '请勿频繁获取短信验证码',
  },
  loginVeriCodeIncorrectFailInfo: {
    errno: 1010005,
    message: '验证码错误',
  },
  loginVerCoideSendFailInfo: {
    errno: 1010006,
    message: '验证码发送失败，请稍后重试',
  },
  loginByOuathFailInfo: {
    errno: 1010007,
    message: '第三方验证登录失败',
  },
};

/** ---------   worksError ---------    */
export const worksErrorMessage = {
  worksValidateFail: {
    errno: 1020001,
    message: '输入信息验证失败',
  },
  workPermissionFail: {
    errno: 1020002,
    message: '没有权限操作',
  },
  workRenderFail: {
    errno: 1020003,
    message: '作品渲染错误',
  },
  workCreateChannelFail: {
    errno: 1020004,
    message: '作品创建渠道失败',
  },
  workUpdateChannelFail: {
    errno: 1020005,
    message: '作品渠道名称更新失败',
  },
  workDeleteChannelFail: {
    errno: 1020005,
    message: '作品渠道名删除失败',
  },
};

/** ---------   utilsError ---------    */

export const utilsErrorMessage = {
  imageUpLoadFialInfo: {
    errno: 103001,
    message: '图片上传失败',
  },
  imageUpLoadSizeFialInfo: {
    errno: 103002,
    message: '上传文件大小已超出限制',
  },
  imageUpLoadFormatFialInfo: {
    errno: 103003,
    message: '上传文件格式错误',
  },
};

export const userCreateRules = {
  username: 'email',
  password: { type: 'password', min: 8 },
};

export const worksCreateRules = {
  title: 'string',
};

export const channelCreateRules = {
  name: 'string',
  workdId: 'string',
};

export const sendCodeRules = {
  phoneNumber: {
    type: 'string',
    format: /^1[3-9]\d{9}$/,
    message: '手机号码格式错误',
  },
};

export type errorType =
  | keyof typeof userErrorMessage
  | keyof typeof worksErrorMessage
  | keyof typeof utilsErrorMessage;
