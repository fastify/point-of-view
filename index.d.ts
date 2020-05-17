import { FastifyPlugin, FastifyReply, RawServerBase } from 'fastify';

declare module "fastify" {
  interface FastifyReplyInterface {
    view(page: string, data?: object): FastifyReply;
  }
}

export interface PointOfViewOptions {
  engine: {
    ejs?: any;
    nunjucks?: any;
    pug?: any;
    handlebars?: any;
    marko?: any;
    mustache?: any;
    'art-template'?: any;
    twig?: any
  };
  templates?: string;
  includeViewExtension?: boolean;
  options?: object;
  charset?: string;
  maxCache?: number;
  production?: boolean;
  defaultContext?: object;
  layout?: string;
}

declare const pointOfView: FastifyPlugin<PointOfViewOptions>;
export default pointOfView;
