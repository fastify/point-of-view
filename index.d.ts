import { Plugin } from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';

declare module "fastify" {
  interface FastifyReply<HttpResponse> {
    view(page: string, data?: object): FastifyReply<HttpResponse>;
  }
}

interface PointOfViewOptions {
  engine: object;
  templates?: string;
  includeViewExtension?: boolean;
  options?: object;
  charset?: string;
  maxCache?: number;
  production?: boolean;
  defaultContext?: object;
  layout?: string;
}

declare const pointOfView: Plugin<
  Server,
  IncomingMessage,
  ServerResponse,
  PointOfViewOptions
>;

export = pointOfView;
