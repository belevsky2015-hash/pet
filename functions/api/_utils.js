// Общие утилиты для всех функций API.
// Файлы с именем, начинающимся на "_", не превращаются в маршруты —
// сюда складываем только вспомогательный код.

const enc = (s) => new TextEncoder().encode(s);

export const COOKIE = 'chognari_session';
const TTL_SECONDS = 60 * 60 * 12; // сессия живёт 12 часов

// ---- JSON-ответы ----
export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...extraHeaders },
  });
}
export const ok = (data = { ok: true }) => json(data, 200);
export const bad = (msg, status = 400) => json({ error: msg }, status);

// ---- секрет для подписи cookie ----
// Берём отдельную переменную, а если её нет — сам пароль админки.
function secretOf(env) {
  return env.SESSION_SECRET || env.ADMIN_PASSWORD || 'chognari-dev-secret';
}

function b64url(bytes) {
  let bin = '';
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(secret, value) {
  const key = await crypto.subtle.importKey(
    'raw', enc(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc(value));
  return b64url(sig);
}

// сравнение строк без раннего выхода (защита от тайминг-атак)
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ---- выпуск токена сессии ----
export async function issueToken(env) {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const payload = `admin|${exp}`;
  const sig = await hmac(secretOf(env), payload);
  return `${exp}.${sig}`;
}

export function sessionCookie(token, maxAge = TTL_SECONDS) {
  const parts = [
    `${COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ];
  return parts.join('; ');
}

export const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

function readCookie(request, name) {
  const raw = request.headers.get('Cookie') || '';
  for (const part of raw.split(/;\s*/)) {
    const i = part.indexOf('=');
    if (i > -1 && part.slice(0, i) === name) return part.slice(i + 1);
  }
  return null;
}

// ---- проверка авторизации ----
// Возвращает true, если в запросе валидная неистёкшая cookie.
export async function isAuthed(request, env) {
  const token = readCookie(request, COOKIE);
  if (!token) return false;
  const dot = token.lastIndexOf('.');
  if (dot < 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expNum = parseInt(exp, 10);
  if (!expNum || expNum < Math.floor(Date.now() / 1000)) return false;
  const expected = await hmac(secretOf(env), `admin|${exp}`);
  return safeEqual(sig, expected);
}

// Шлюз для защищённых методов: бросает 401-ответ, если не авторизован.
export async function requireAuth(request, env) {
  if (await isAuthed(request, env)) return null;
  return bad('unauthorized', 401);
}

// ---- работа с собакой: запись <-> объект ----
const JSON_FIELDS = ['character', 'breed', 'description', 'photos'];

// строка БД -> объект для фронтенда
export function rowToDog(row) {
  const d = { ...row };
  d.sterilized = !!row.sterilized;
  for (const f of JSON_FIELDS) {
    try { d[f] = JSON.parse(row[f] ?? (f === 'character' || f === 'photos' ? '[]' : '{}')); }
    catch { d[f] = (f === 'character' || f === 'photos') ? [] : {}; }
  }
  return d;
}

// объект с фронтенда -> поля для записи в БД (с нормализацией)
export function dogToColumns(body) {
  const arr = (v) => Array.isArray(v) ? v : [];
  const obj = (v) => (v && typeof v === 'object') ? v : {};
  return {
    name: String(body.name ?? '').slice(0, 200),
    sex: body.sex === 'girl' ? 'girl' : 'boy',
    sterilized: body.sterilized ? 1 : 0,
    weightKg: (body.weightKg === '' || body.weightKg == null) ? null : Number(body.weightKg),
    age: body.age == null ? '' : String(body.age),
    character: JSON.stringify(arr(body.character)),
    breed: JSON.stringify(obj(body.breed)),
    location: body.location == null ? '' : String(body.location),
    description: JSON.stringify(obj(body.description)),
    photos: JSON.stringify(arr(body.photos)),
    // статус: ищет дом / зарезервирована / пристроена
    status: ['searching', 'reserved', 'homed'].includes(body.status) ? body.status : 'searching',
    // размер: явный override s|m|l; null = считать автоматически из веса на фронте
    size: ['s', 'm', 'l'].includes(body.size) ? body.size : null,
  };
}
