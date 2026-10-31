import { FastifyPluginAsync, FastifyReply } from 'fastify'

declare module 'fastify' {

  interface RouteSpecificOptions {
    layout?: string;
  }

  interface FastifyReply {
    view<T extends { [key: string]: any; }>(page: string, data: T, opts?: RouteSpecificOptions): FastifyReply;
    view(page: string, data?: object, opts?: RouteSpecificOptions): FastifyReply;
    viewAsync<T extends { [key: string]: any; }>(page: string, data: T, opts?: RouteSpecificOptions): Promise<string>;
    viewAsync(page: string, data?: object, opts?: RouteSpecificOptions): Promise<string>;
  }

  interface FastifyInstance {
    view<T extends { [key: string]: any; }>(page: string, data: T, opts?: RouteSpecificOptions): Promise<string>;
    view(page: string, data?: object, opts?: RouteSpecificOptions): Promise<string>;
  }
}

type FastifyView = FastifyPluginAsync<fastifyView.FastifyViewOptions>

declare namespace fastifyView {
  export interface FastifyViewRouteSpecificOptions {
    layout?: string;
  }

  export interface FastifyViewReplyDecorator {
    <T extends object>(page: string, data: T, opts?: FastifyViewRouteSpecificOptions): FastifyReply;
    (page: string, data?: object, opts?: FastifyViewRouteSpecificOptions): FastifyReply;
  }

  export interface FastifyViewAsyncReplyDecorator {
    <T extends object>(page: string, data: T, opts?: FastifyViewRouteSpecificOptions): Promise<string>;
    (page: string, data?: object, opts?: FastifyViewRouteSpecificOptions): Promise<string>;
  }

  export interface FastifyViewInstanceDecorator {
    <T extends object>(page: string, data: T, opts?: FastifyViewRouteSpecificOptions): Promise<string>;
    (page: string, data?: object, opts?: FastifyViewRouteSpecificOptions): Promise<string>;
    clearCache(): void;
  }

  export type FastifyViewDecorators<
    PropertyName extends string = 'view',
    AsyncPropertyName extends string = `${PropertyName}Async`
  > = {
    instance: { [K in PropertyName]: FastifyViewInstanceDecorator }
    reply: { [K in PropertyName]: FastifyViewReplyDecorator } & {
      [K in AsyncPropertyName]: FastifyViewAsyncReplyDecorator
    }
  }

  export type FastifyViewInstanceProperty<PropertyName extends string = 'view'> =
    FastifyViewDecorators<PropertyName>['instance']

  export type FastifyViewReplyProperty<
    PropertyName extends string = 'view',
    AsyncPropertyName extends string = `${PropertyName}Async`
  > = FastifyViewDecorators<PropertyName, AsyncPropertyName>['reply']

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
