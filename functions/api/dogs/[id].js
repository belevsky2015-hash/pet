// /api/dogs/:id
//   GET    — одна собака
//   PUT    — полное обновление (нужна авторизация)
//   DELETE — удалить (нужна авторизация)
import { json, bad, requireAuth, rowToDog, dogToColumns } from '../_utils.js';

export async function onRequestGet({ params, env }) {
  if (!env.DB) return bad('База данных не подключена', 500);
  const row = await env.DB.prepare('SELECT * FROM dogs WHERE id = ?').bind(params.id).first();
  if (!row) return bad('Собака не найдена', 404);
  return json(rowToDog(row));
}

export async function onRequestPut({ request, params, env }) {
  const denied = await requireAuth(request, env);
  if (denied) return denied;
  if (!env.DB) return bad('База данных не подключена', 500);

  const exists = await env.DB.prepare('SELECT id FROM dogs WHERE id = ?').bind(params.id).first();
  if (!exists) return bad('Собака не найдена', 404);

  let body = {};
  try { body = await request.json(); } catch { return bad('Некорректный JSON'); }
  const c = dogToColumns(body);

  await env.DB.prepare(
    `UPDATE dogs SET name=?, sex=?, sterilized=?, weightKg=?, size=?, age=?, character=?,
       breed=?, location=?, description=?, photos=?, status=? WHERE id=?`
  ).bind(
    c.name, c.sex, c.sterilized, c.weightKg, c.size, c.age, c.character,
    c.breed, c.location, c.description, c.photos, c.status, params.id
  ).run();

  const row = await env.DB.prepare('SELECT * FROM dogs WHERE id = ?').bind(params.id).first();
  return json(rowToDog(row));
}

export async function onRequestDelete({ request, params, env }) {
  const denied = await requireAuth(request, env);
  if (denied) return denied;
  if (!env.DB) return bad('База данных не подключена', 500);

  await env.DB.prepare('DELETE FROM dogs WHERE id = ?').bind(params.id).run();
  return json({ ok: true });
}
