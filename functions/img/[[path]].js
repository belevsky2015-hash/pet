// GET /img/<key> — отдаёт фото из R2 (бакет не публичный, раздаём сами).
export async function onRequestGet({ params, env }) {
  if (!env.PHOTOS) return new Response('R2 not bound', { status: 500 });

  const key = Array.isArray(params.path) ? params.path.join('/') : String(params.path || '');
  if (!key) return new Response('Not found', { status: 404 });

  const obj = await env.PHOTOS.get(key);
  if (!obj) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  if (!headers.get('content-type')) headers.set('content-type', 'image/jpeg');

  return new Response(obj.body, { headers });
}
