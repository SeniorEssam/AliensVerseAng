import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import { getContext } from '@netlify/angular-runtime/context.mjs';

let angularAppEngine: AngularAppEngine;

export async function netlifyAppEngineHandler(request: Request): Promise<Response> {
  if (!angularAppEngine) {
    angularAppEngine = new AngularAppEngine();
  }
  const context = getContext();

  const result = await angularAppEngine.handle(request, context);
  if (result) {
    result.headers.set('x-ssr-processed', 'true');
    return result;
  }
  return new Response('Not found', { status: 404 });
}

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createRequestHandler(netlifyAppEngineHandler);
