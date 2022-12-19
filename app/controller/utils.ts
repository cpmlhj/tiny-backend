import { Controller } from 'egg';
import sharp from 'sharp';
import { parse, join, extname } from 'path';
import { nanoid } from 'nanoid';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import streamWormhole from 'stream-wormhole';
import { MultipartFileStream } from 'egg-multipart';
import BusBoy from 'busboy';

export default class UtilsController extends Controller {
  async fileUploadWithLocal() {
    const { ctx } = this;
    const file = ctx.request.files[0];
    // 使用 sharp 剪切图片
    const imageSource = sharp(file.filepath);
    const metaData = await imageSource.metadata();
    let thumbnailFilePath;
    // 检测图片宽度
    if (metaData.width && metaData.width > 300) {
      // generate a new file path
      // uploads/**/abc.png  ==> /uploads/**/abc-thumbnail.png
      const { name, ext, dir } = parse(file.filepath);
      thumbnailFilePath = join(dir, `${name}-thumbnail${ext}`);
      await imageSource.resize({ width: 300 }).toFile(thumbnailFilePath);
      thumbnailFilePath = this.pathToURL(thumbnailFilePath);
    }
    const filePath = this.pathToURL(file.filepath);
    ctx.helper.success({
      ctx,
      resp: {
        filePath,
        thumbnailFilePath: thumbnailFilePath ? thumbnailFilePath : filePath,
      },
    });
  }

  pathToURL(path: string) {
    const { app } = this;
    const replaePath = path.replace(app.config.baseDir, app.config.baseUrl);
    return replaePath;
  }

  async fileUploadByStream() {
    const { ctx, app } = this;
    const fileStream = await ctx.getFileStream();
    // uploads/***.[ext]
    // uploads/***_thumbnail.[ext]
    const uid = nanoid(6);
    const timestamps = Date.now();
    const filePath = join(
      app.config.baseDir,
      'uploads',
      `${timestamps}_${uid}${extname(fileStream.filename)}`
    );
    const thumbnailFilePath = join(
      app.config.baseDir,
      'uploads',
      `${timestamps}_${uid}_thumbnail${extname(fileStream.filename)}`
    );
    const fileWriteStream = createWriteStream(filePath);
    const thumbnailWriteStream = createWriteStream(thumbnailFilePath);
    const transformStream = sharp().resize({ width: 300 });
    try {
      // 也可以使用pipeline
      await Promise.all([
        pipeline(fileStream, fileWriteStream),
        new Promise((resolve, reject) => {
          fileStream
            .on('error', reject)
            .pipe(transformStream)
            .on('error', reject)
            .pipe(thumbnailWriteStream)
            .on('finish', resolve)
            .on('error', reject);
        }),
      ]);
      const resp = {
        url: this.pathToURL(filePath),
        thumbnailFilePath: this.pathToURL(thumbnailFilePath),
      };
      ctx.helper.success({ ctx, resp });
    } catch (e) {
      ctx.helper.error({ ctx, errorType: 'imageUpLoadFialInfo', error: e });
    }
  }

  async uploadToOSS() {
    const { ctx } = this;
    const fileStream = await ctx.getFileStream();
    const env = ctx.app.env;
    // endpoint/tiny/[env]/**.ext
    const filePath = `${Date.now()}_${nanoid(6)}${extname(
      fileStream.filename
    )}`;
    const ossPath = join(env, filePath);
    try {
      const resp = await ctx.oss.put(ossPath, fileStream);
      const { name, url } = resp;
      ctx.helper.success({ ctx, resp: { name, url } });
    } catch (e) {
      await streamWormhole(fileStream);
      ctx.helper.error({ ctx, errorType: 'imageUpLoadFialInfo', error: e });
    }
  }

  async testBusBoy() {
    const { ctx } = this;
    const results = await this.uploadFileWithBusBoy();
    ctx.helper.success({ ctx, resp: results });
  }

  async uploadFileWithBusBoy() {
    const { ctx, app } = this;
    return new Promise<string[]>((resolve) => {
      const busboy = BusBoy({ headers: ctx.req.headers as any });
      const results: string[] = [];
      busboy.on('file', (_, file, filename) => {
        const filePath = join(
          app.config.baseDir,
          'uploads',
          `${Date.now()}_${nanoid(6)}${extname(filename.filename)}`
        );
        file.pipe(createWriteStream(filePath));
        file.on('end', () => results.push(filePath));
      });
      busboy.on('field', (fieldname, val) => {
        app.logger.info(fieldname, val);
      });
      busboy.on('finish', () => {
        app.logger.info('success');
        resolve(results);
      });
      ctx.req.pipe(busboy);
    });
  }

  async uploadMulitFiles() {
    const { ctx } = this;
    const { fileSize } = ctx.app.config.multipart;
    const multipartOptions = {
      limits: { fileSize: fileSize as number },
    };
    const parts = ctx.multipart(multipartOptions);
    const urls: string[] = [];
    let part: MultipartFileStream | string[];
    while ((part = await parts())) {
      if (Array.isArray(part)) continue;
      try {
        const env = ctx.app.env;
        // endpoint/tiny/[env]/**.ext
        const filePath = `tiny/${Date.now()}_${nanoid(6)}${extname(
          part.filename
        )}`;
        const ossPath = join(env, filePath);
        const resp = await ctx.oss.put(ossPath, part);
        const { url } = resp;
        urls.push(url);
        if (part.truncated) {
          await ctx.oss.delete(ossPath);
          return ctx.helper.error({
            ctx,
            errorType: 'imageUpLoadSizeFialInfo',
          });
        }
      } catch (e) {
        await streamWormhole(part);
        ctx.helper.error({ ctx, errorType: 'imageUpLoadFialInfo', error: e });
      }
    }
    ctx.helper.success({ ctx, resp: urls });
  }

  splitIdAnduuid(str = '') {
    const result = { id: '', uuid: '' };
    if (!str) return result;
    const firstDashIndex = str.indexOf('-');
    if (firstDashIndex < 0) return result;
    result.id = str.slice(0, firstDashIndex);
    result.uuid = str.slice(firstDashIndex + 1);
    return result;
  }

  async renderH5Page() {
    const { ctx } = this;
    const { id } = ctx.params;
    const query = this.splitIdAnduuid(id);
    console.log(query);
    try {
      const { html, title, desc, bodyStyle } =
        await ctx.service.utils.renderH5PageData(query);
      // ctx.helper.success({ ctx, resp: content });
      await ctx.render('renderer.nj', { html, title, desc, bodyStyle });
    } catch (e) {
      ctx.helper.error({
        ctx,
        errorType: 'workRenderFail',
        error: (e as any).message,
      });
    }
  }
}
