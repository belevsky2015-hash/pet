// POST /api/login  { password }
// Сверяет пароль с переменной окружения ADMIN_PASSWORD (на сервере).
// При успехе выдаёт подписанную HttpOnly-cookie сессии.
import { json, bad, issueToken, sessionCookie } from './_utils.js';

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD) {
    return bad('ADMIN_PASSWORD не задан в настройках проекта', 500);
  }
  let body = {};
  try { body = await request.json(); } catch { /* пустое тело */ }
  const pw = String(body.password ?? '');

  if (pw !== env.ADMIN_PASSWORD) {
    return bad('Неверный пароль', 401);
  }

  const token = await issueToken(env);
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(token) });
}
