// import { Context, EggAppConfig } from 'egg';

// function getTokenValue(ctx: Context) {
//   const {
//     header: { authorization },
//   } = ctx;

//   if (!authorization) return false;
//   if (typeof authorization === 'string') {
//     const parts = authorization.trim().split(' ');
//     if (parts.length === 2) {
//       const schema = parts[0];
//       const credentials = parts[1];
//       if (/^Bearer$/i.test(schema)) {
//         return credentials;
//       }
//       return false;
//     }
//   } else {
//     return false;
//   }
// }

// export default (options: EggAppConfig['jwt']) => {
//   return async (ctx: Context, next: () => Promise<any>) => {
//     // 从 header获取对应的token
//     console.log('working???');
//     const token = getTokenValue(ctx);
//     if (!token) {
//       return ctx.helper.error({ ctx, errorType: 'loginCheckFailInfo' });
//     }
//     const { secret } = options;
//     if (!secret) {
//       throw new Error('secret not provided');
//     }
//     try {
//       const decoded = ctx.app.jwt.verify(token, secret);
//       console.log(decoded, '===========');
//       ctx.state.user = decoded;
//       await next();
//     } catch (e) {
//       return ctx.helper.error({ ctx, errorType: 'loginCheckFailInfo' });
//     }
//   };
// };
