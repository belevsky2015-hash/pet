// POST /api/upload — приём фото (multipart form-data, поле "file") и запись в R2.
// Возвращает { url: "/img/<key>" }. Нужна авторизация.
import { json, bad, requireAuth } from './_utils.js';

const MAX_BYTES = 8 * 1024 * 1024; // 8 МБ на файл
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

export async function onRequestPost({ request, env }) {
  const denied = await requireAuth(request, env);
  if (denied) return denied;
  if (!env.PHOTOS) return bad('Хранилище фото (R2) не подключено', 500);

  let form;
  try { form = await request.formData(); } catch { return bad('Ожидалась форма с файлом'); }
  const file = form.get('file');
  if (!file || typeof file === 'string') return bad('Файл не передан');

  const type = file.type || 'image/jpeg';
  if (!EXT[type]) return bad('Поддерживаются только JPG, PNG, WEBP, GIF');
  if (file.size > MAX_BYTES) return bad('Файл больше 8 МБ');

  const rand = crypto.randomUUID().slice(0, 8);
  const key = `dogs/${Date.now()}-${rand}.${EXT[type]}`;

  await env.PHOTOS.put(key, file.stream(), { httpMetadata: { contentType: type } });

  return json({ url: `/img/${key}` }, 201);
}
