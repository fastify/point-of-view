declare module "fastify" {
  interface FastifyReply<HttpResponse> {
    view(page: string, data?: object): FastifyReply<HttpResponse>;
  }
}

declare function pointOfView(): void;

declare namespace pointOfView {
  interface PointOfViewOptions {
    engine: object;
    templates?: string;
    includeViewExtension?: boolean;
    options?: object;
  }
}

export = pointOfView;
