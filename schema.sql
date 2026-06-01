-- Chognari Dogs — схема базы D1 и начальные данные.
-- JSON-поля (photos, character, breed, description) хранятся как TEXT с JSON внутри.

DROP TABLE IF EXISTS dogs;
CREATE TABLE dogs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL DEFAULT '',
  sex         TEXT NOT NULL DEFAULT 'boy',      -- 'boy' | 'girl'
  sterilized  INTEGER NOT NULL DEFAULT 0,       -- 0 | 1
  weightKg    REAL,
  size        TEXT,                             -- 's'|'m'|'l' или NULL (тогда считается из веса)
  age         TEXT,                             -- ключ из options.age
  character   TEXT NOT NULL DEFAULT '[]',       -- JSON-массив ключей
  breed       TEXT NOT NULL DEFAULT '{}',       -- JSON {ka,ru}
  location    TEXT,                             -- ключ из locations
  description TEXT NOT NULL DEFAULT '{}',       -- JSON {ka,ru}
  photos      TEXT NOT NULL DEFAULT '[]',       -- JSON-массив URL
  status      TEXT NOT NULL DEFAULT 'searching',-- 'searching' | 'reserved' | 'homed'
  sort_order  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_dogs_sort ON dogs(sort_order);

-- МИГРАЦИЯ существующей базы (без пересоздания): выполнить один раз
--   ALTER TABLE dogs ADD COLUMN size TEXT;
-- Колонка status уже есть; новые значения 'reserved'/'homed' пишутся как обычный текст.

INSERT INTO dogs (name,sex,sterilized,weightKg,age,character,breed,location,description,photos,status,sort_order)
VALUES ('Красавчик', 'boy', 1, 18, 'young', '["balanced", "affectionate", "playful"]', '{"ka": "მეტისი", "ru": "Метис"}', 'chognari', '{"ka": "ახალგაზრდა, მშვიდი და ძალიან მოსიყვარულე.", "ru": "Молодой, спокойный и очень ласковый. Вес около 18 кг."}', '["https://placedog.net/600/450?id=190", "https://placedog.net/600/450?id=191", "https://placedog.net/600/450?id=192"]', 'searching', 0);
INSERT INTO dogs (name,sex,sterilized,weightKg,age,character,breed,location,description,photos,status,sort_order)
VALUES ('Кнопа', 'girl', 1, 12, 'adult', '["calm", "guard"]', '{"ka": "მეტისი", "ru": "Метис"}', 'samtredia', '{"ka": "მშვიდი, ღირსეული გოგო კეთილი გულით. სტერილიზებულია.", "ru": "Спокойная девочка с достоинством и добрым сердцем. Стерилизована. Около 12 кг."}', '["https://placedog.net/600/450?id=200", "https://placedog.net/600/450?id=201", "https://placedog.net/600/450?id=202", "https://placedog.net/600/450?id=203"]', 'searching', 1);
INSERT INTO dogs (name,sex,sterilized,weightKg,age,character,breed,location,description,photos,status,sort_order)
VALUES ('Рыжик', 'boy', 0, 27, 'young', '["active", "dog_friendly", "playful"]', '{"ka": "მეტისი (დიდი)", "ru": "Метис (крупный)"}', 'chognari', '{"ka": "ენერგიული და მხიარული, უყვარს გრძელი სეირნობა. დიდი ძაღლი, 25 კგ-ზე მეტი.", "ru": "Энергичный непоседа, обожает долгие прогулки. Крупный, больше 25 кг."}', '["https://placedog.net/600/450?id=210", "https://placedog.net/600/450?id=211", "https://placedog.net/600/450?id=212"]', 'searching', 2);
INSERT INTO dogs (name,sex,sterilized,weightKg,age,character,breed,location,description,photos,status,sort_order)
VALUES ('Маля', 'girl', 0, 8, 'puppy', '["affectionate", "calm", "kids"]', '{"ka": "მეტისი (პატარა)", "ru": "Метис (мелкий)"}', 'samtredia', '{"ka": "პატარა სინაზე, თბილ კალთებზე ოცნებობს. ბავშვებთან კარგად. ჯერ არ არის სტერილიზებული.", "ru": "Маленькая нежность, мечтает о тёплых коленях. Ладит с детьми. Пока не стерилизована. До 10 кг."}', '["https://placedog.net/600/450?id=220", "https://placedog.net/600/450?id=221", "https://placedog.net/600/450?id=222", "https://placedog.net/600/450?id=223", "https://placedog.net/600/450?id=224"]', 'searching', 3);
INSERT INTO dogs (name,sex,sterilized,weightKg,age,character,breed,location,description,photos,status,sort_order)
VALUES ('Граф', 'boy', 1, 30, 'adult', '["calm", "balanced", "guard", "dog_friendly"]', '{"ka": "მეტისი (დიდი)", "ru": "Метис (крупный)"}', 'chognari', '{"ka": "მშვიდი, ზრდასრული ძაღლი კეთილშობილური მანერებით. კარგი დარაჯი.", "ru": "Спокойный взрослый пёс с благородными манерами. Хороший сторож. Больше 25 кг."}', '["https://placedog.net/600/450?id=230", "https://placedog.net/600/450?id=231", "https://placedog.net/600/450?id=232"]', 'searching', 4);
INSERT INTO dogs (name,sex,sterilized,weightKg,age,character,breed,location,description,photos,status,sort_order)
VALUES ('Звёздочка', 'girl', 1, 16, 'young', '["active", "affectionate", "kids", "playful"]', '{"ka": "მეტისი", "ru": "Метис"}', 'samtredia', '{"ka": "აქტიური და ცნობისმოყვარე, მზადაა სამყაროს გასაცნობად. სტერილიზებული. ბავშვებთან კარგად.", "ru": "Активная и любопытная, готова исследовать мир. Стерилизована. Ладит с детьми. Около 16 кг."}', '["https://placedog.net/600/450?id=240", "https://placedog.net/600/450?id=241", "https://placedog.net/600/450?id=242"]', 'searching', 5);
