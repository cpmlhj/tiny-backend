import { Service } from 'egg';
import { createSSRApp } from 'vue';
import { renderToString } from '@vue/server-renderer';
import TN from '@cpm-tiny/component';

export default class Utils extends Service {
  propsToStyle(props = {}) {
    const key = Object.keys(props);
    const styleArr = key.map((k) => {
      const formatKey = k.replace(/[A-Z]/g, (c) => `-${c.toLocaleLowerCase()}`);
      const value = props[k];
      return `${formatKey}:${value}`;
    });
    return styleArr.join(';');
  }

  px2vw(components = []) {
    // '10px  8.5px'
    components.forEach((component: any) => {
      const props = component.props || {};
      // 遍历组件属性
      Object.keys(props).forEach((key) => {
        const val = props[key];
        if (typeof val !== 'string') return;
        const vm = this.caclAndMatchVW(val);
        if (!vm) return;
        props[key] = `${vm}vw`;
      });
    });
  }

  caclAndMatchVW(content: string) {
    const reg = /^(\d+(\.\d+)?)px$/;
    if (reg.test(content) === false) return;
    const arr = content.match(reg) || [];
    const str = arr[1];
    const num = parseFloat(str);
    // 计算vw
    const vwNum = ((num / 375) * 100).toFixed(2);
    return vwNum;
  }

  async renderH5PageData(query: { id: string; uuid: string }) {
    const work = await this.ctx.model.Work.findOne(query).lean();
    if (!work) throw new Error('page no exists');
    const { title, content, desc } = work;
    this.px2vw(content && content.components);
    const vueApp = createSSRApp({
      data: () => {
        return {
          data: {
            components: (content && content.components) || [],
          },
        };
      },
      template: '<TnPage :="data">12333</TnPage>',
    }).use(TN);
    const html = await renderToString(vueApp);
    const bodyStyle = this.propsToStyle(content && content.props);
    return {
      html,
      title,
      desc,
      bodyStyle,
    };
  }
}
