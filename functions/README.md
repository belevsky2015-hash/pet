# API (Cloudflare Pages Functions)

Каждый файл — отдельный маршрут. Файлы с именем на `_` маршрутами не становятся.

| Маршрут | Метод | Что делает | Авторизация |
|---|---|---|---|
| `/api/dogs` | GET | список всех собак | нет |
| `/api/dogs` | POST | создать собаку | да |
| `/api/dogs/:id` | GET | одна собака | нет |
| `/api/dogs/:id` | PUT | обновить собаку | да |
| `/api/dogs/:id` | DELETE | удалить собаку | да |
| `/api/reorder` | POST | новый порядок `{ ids: [...] }` | да |
| `/api/upload` | POST | загрузить фото в R2 (form-data, поле `file`) | да |
| `/api/login` | POST | вход `{ password }` → cookie сессии | нет |
| `/api/logout` | POST | выход | нет |
| `/api/session` | GET | `{ authed: bool }` | нет |
| `/img/<key>` | GET | отдаёт фото из R2 | нет |

Фото сжимаются в браузере и загружаются в R2; в базе хранятся только ссылки `/img/...`.

Биндинги (заданы в Cloudflare / `wrangler.toml`):
- `DB` — база данных D1
- `PHOTOS` — R2-бакет с фото
- `ADMIN_PASSWORD` — пароль админки (секрет, не в коде)
- `SESSION_SECRET` — необязательно; если не задан, для подписи cookie используется `ADMIN_PASSWORD`
