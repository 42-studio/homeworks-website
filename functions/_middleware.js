export function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.pathname !== '/') {
    return Response.redirect(new URL('/', url), 302);
  }

  return context.next();
}
