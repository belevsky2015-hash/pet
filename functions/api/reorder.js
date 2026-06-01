// POST /api/reorder  { ids: [3,1,2,...] }
// Записывает новый порядок собак по позиции в массиве. Нужна авторизация.
import { json, bad, requireAuth } from './_utils.js';

export async function onRequestPost({ request, env }) {
  const denied = await requireAuth(request, env);
  if (denied) return denied;
  if (!env.DB) return bad('База данных не подключена', 500);

  let body = {};
  try { body = await request.json(); } catch { return bad('Некорректный JSON'); }
  const ids = Array.isArray(body.ids) ? body.ids : null;
  if (!ids) return bad('Ожидался массив ids');

  const stmt = env.DB.prepare('UPDATE dogs SET sort_order = ? WHERE id = ?');
  const batch = ids.map((id, i) => stmt.bind(i, id));
  if (batch.length) await env.DB.batch(batch);

  return json({ ok: true });
}
