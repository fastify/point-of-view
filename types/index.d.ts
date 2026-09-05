import { FastifyPluginAsync } from 'fastify'

declare module 'fastify' {

  interface RouteSpecificOptions {
    layout?: string;
  }

  // The plugin decorates with a configurable name (default `view`, see the
  // `propertyName` / `asyncPropertyName` options). String-index signatures
  // keep the types correct for any custom property name while preserving
  // typed autocompletion for the default one.
  interface FastifyViewFn {
    <T extends { [key: string]: any; }>(page: string, data: T, opts?: RouteSpecificOptions): FastifyReply;
    (page: string, data?: object, opts?: RouteSpecificOptions): FastifyReply;
    clearCache(): void;
  }

  interface FastifyViewAsyncFn {
    <T extends { [key: string]: any; }>(page: string, data: T, opts?: RouteSpecificOptions): Promise<string>;
    (page: string, data?: object, opts?: RouteSpecificOptions): Promise<string>;
  }

  interface FastifyReply {
    view: FastifyViewFn;
    viewAsync: FastifyViewAsyncFn;
    [key: string]: any;
  }

  interface FastifyInstance {
    view: FastifyViewAsyncFn;
    [key: string]: any;
  }
}

type FastifyView = FastifyPluginAsync<fastifyView.FastifyViewOptions>

declare namespace fastifyView {
  export interface FastifyViewOptions {
    engine: {
      ejs?: any;
      eta?: any;
      nunjucks?: any;
      pug?: any;
      handlebars?: any;
      mustache?: any;
      twig?: any;
      liquid?: any;
      dot?: any;
      edge?: any;
      squirrelly?: any;
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
    asyncPropertyName?: string;
  }

  export const fastifyView: FastifyView
  export { fastifyView as default }
  export const fastifyViewCache: Symbol
}

declare function fastifyView (...params: Parameters<FastifyView>): ReturnType<FastifyView>
export = fastifyView
