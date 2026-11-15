# Security Policy

`@fastify/view` follows the [Fastify Security Policy](https://github.com/fastify/.github/blob/main/SECURITY.md),
including its [threat model](https://github.com/fastify/.github/blob/main/SECURITY.md#threat-model) and its
[process for reporting vulnerabilities](https://github.com/fastify/.github/blob/main/SECURITY.md#reporting-vulnerabilities).
To report a vulnerability, use the [GitHub Security page](../../security/advisories/new) of this repository.

This document explains how that threat model applies to `@fastify/view`. Please read it before submitting a report.

## Threat model

`@fastify/view` loads a template, hands it to the configured template engine together with an object of data,
and sends the result. It is not a sandbox. It does not validate template names, template sources or template data.

### Trusted

- **Plugin configuration**: every option passed when registering the plugin, including `engine`, `root`,
  `options`, `defaultContext`, `layout`, `includeViewExtension`, `viewExt` and the engine-specific settings.
- **Template engines**: the engine instance passed in `engine`, and its behavior.
- **Template names**: the first argument of `reply.view()`, `reply.viewAsync()` and `fastify.view()`, as well as
  layout and partial names.
- **Template sources**: the template files, raw templates (`{ raw }`), precompiled templates and template functions.
- **The shape of the template data**: the object passed as the second argument of `reply.view()`,
  `reply.viewAsync()` and `fastify.view()`, and `reply.locals`. The application decides which keys it contains.

### Untrusted

- **Values inside the template data**: strings and other values that originate from the request and that the
  application places under keys it chose, for example `reply.view('profile', { name: request.body.name })`.

The template engine and the template are responsible for escaping those values. Whether output is escaped depends on
the engine, its configuration and the syntax used in the template.

## Not vulnerabilities

The following are application-level issues and are not considered vulnerabilities in `@fastify/view`:

- **Untrusted template names.** Passing request-derived input as a template, layout or partial name, for example
  `reply.view(request.query.page)`. The configured `root` is used to resolve file names; it is not a security
  boundary. Path traversal, local file inclusion and code execution that follow from this are out of scope.
- **Untrusted template sources.** Rendering a template whose source comes from untrusted input, including
  `reply.view({ raw: untrustedString })`. This is server-side template injection, and for most engines it allows
  remote code execution.
- **Untrusted template data objects.** Passing a request-derived object as the template data without building it
  explicitly, for example `reply.view('form', request.body)` or `reply.view('form', { ...request.body })`. The data
  object is forwarded to the template engine, and engines may give special meaning to some keys, such as
  configuration, locals or helpers. An attacker who controls the keys can change how the engine behaves.
  Build the data object from the fields you need, or validate the request with a schema that sets
  `additionalProperties: false`.
- **Missing output escaping.** XSS caused by an engine configured without escaping, or by template syntax that outputs
  raw values (for example `<%- %>` in EJS or `{{{ }}}` in Handlebars).
- **Vulnerabilities in template engines.** Please report these to the maintainers of the engine. If `@fastify/view`
  makes an engine vulnerability reachable in a way the engine alone would not, report it here.
- **Information available to templates.** Templates are trusted, so data exposed to them through `defaultContext`,
  `reply.locals` or engine options is not a vulnerability by itself.

`@fastify/view` may still add hardening for some of these cases. Such changes are released as regular fixes, without
a CVE.

## Examples of vulnerabilities

The following are in scope:

- A value inside the template data, placed under a key chosen by the application, being executed as template code
  or used as a file path by `@fastify/view`.
- A bypass of a validation or containment check that `@fastify/view` documents.
- A crash or hang in `@fastify/view` itself caused by untrusted values inside the template data, when the template
  name, the template source and the shape of the data are trusted.
