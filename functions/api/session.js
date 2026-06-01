// GET /api/session — { authed: true|false }. Админка проверяет при загрузке.
import { json, isAuthed } from './_utils.js';

export async function onRequestGet({ request, env }) {
  return json({ authed: await isAuthed(request, env) });
}
