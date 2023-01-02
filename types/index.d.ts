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

type FastifyView = FastifyPluginCallback<fastifyView.FastifyViewOptions>

declare namespace fastifyView {
  export interface FastifyViewOptions {
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
    templates?: string | string[];
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

  /**
   * @deprecated Use FastifyViewOptions
   */
  export type PointOfViewOptions = FastifyViewOptions

  export const fastifyView: FastifyView
  export { fastifyView as default }
}

declare function fastifyView(...params: Parameters<FastifyView>): ReturnType<FastifyView>
export = fastifyView
