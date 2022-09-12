import { FastifyPluginCallback } from 'fastify';

declare module "fastify" {

  interface RouteSpecificOptions {
    layout?: string;
  }

  interface FastifyReply {
    view<T extends { [key: string]: any; }>(page: string, data: T, opts?: RouteSpecificOptions): FastifyReply;
    view(page: string, data?: object, opts?: RouteSpecificOptions): FastifyReply;
  }

  interface FastifyInstance {
    view<T extends { [key: string]: any; }>(page: string, data: T, opts?: RouteSpecificOptions): Promise<string>;
    view(page: string, data?: object, opts?: RouteSpecificOptions): Promise<string>;
  }
}

export interface PointOfViewOptions {
  engine: {
    ejs?: any;
    eta?: any;
    nunjucks?: any;
    pug?: any;
    handlebars?: any;
    mustache?: any;
    'art-template'?: any;
    twig?: any;
    liquid?: any;
    dot?: any;
  };
  templates?: string;
  includeViewExtension?: boolean;
  options?: object;
  charset?: string;
  maxCache?: number;
  production?: boolean;
  defaultContext?: object;
  layout?: string;
  root?: string;
  viewExt?: string;
  propertyName?: string;
}

declare const pointOfView: FastifyPluginCallback<PointOfViewOptions>;
export default pointOfView;
