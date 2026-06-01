// /api/dogs
//   GET  — список всех собак (публичный, для сайта и админки)
//   POST — создать новую собаку (нужна авторизация)
import { json, bad, requireAuth, rowToDog, dogToColumns } from './_utils.js';

export async function onRequestGet({ env }) {
  if (!env.DB) return bad('База данных не подключена', 500);
  const { results } = await env.DB
    .prepare('SELECT * FROM dogs ORDER BY sort_order ASC, id ASC')
    .all();
  return json((results || []).map(rowToDog));
}

export async function onRequestPost({ request, env }) {
  const denied = await requireAuth(request, env);
  if (denied) return denied;
  if (!env.DB) return bad('База данных не подключена', 500);

  let body = {};
  try { body = await request.json(); } catch { return bad('Некорректный JSON'); }
  const c = dogToColumns(body);

  // новый порядок — в конец списка
  const max = await env.DB.prepare('SELECT MAX(sort_order) AS m FROM dogs').first();
  const sortOrder = ((max && max.m != null) ? max.m : -1) + 1;

  const res = await env.DB.prepare(
    `INSERT INTO dogs (name,sex,sterilized,weightKg,size,age,character,breed,location,description,photos,status,sort_order)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    c.name, c.sex, c.sterilized, c.weightKg, c.size, c.age, c.character,
    c.breed, c.location, c.description, c.photos, c.status, sortOrder
  ).run();

  const id = res.meta.last_row_id;
  const row = await env.DB.prepare('SELECT * FROM dogs WHERE id = ?').bind(id).first();
  return json(rowToDog(row), 201);
}
