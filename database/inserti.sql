INSERT INTO categories (name) VALUES
('Clothing'),
('Accessories'),
('Home Decor'),
('Amigurumi'),
('Baby Projects'),
('Bags'),
('Holiday Projects'),
('Gifts'),
('Kitchen Items'),
('Bathroom Items');

UPDATE categories
SET name = 'Odjeća'
WHERE name = 'Clothing';

UPDATE categories
SET name = 'Modni dodaci'
WHERE name = 'Accessories';

UPDATE categories
SET name = 'Dekoracija doma'
WHERE name = 'Home Decor';

UPDATE categories
SET name = 'Projekti za bebe'
WHERE name = 'Baby Projects';

UPDATE categories
SET name = 'Torbe'
WHERE name = 'Bags';

UPDATE categories
SET name = 'Praznični projekti'
WHERE name = 'Holiday Projects';

UPDATE categories
SET name = 'Pokloni'
WHERE name = 'Gifts';

UPDATE categories
SET name = 'Kuhinjski predmeti'
WHERE name = 'Kitchen Items';

UPDATE categories
SET name = 'Predmeti za kupatilo'
WHERE name = 'Bathroom Items';

UPDATE difficulty_levels
SET name = 'početni'
WHERE name = 'beginner';

UPDATE difficulty_levels
SET name = 'srednji'
WHERE name = 'intermediate';

UPDATE difficulty_levels
SET name = 'napredni'
WHERE name = 'advanced';

INSERT INTO materials (name) VALUES
('Pamučna pređa'),
('Vunena pređa'),
('Akrilna pređa'),
('Mješavina pamuka i akrila'),
('Plišana pređa'),
('Debela pređa'),
('Tanka pređa'),
('Heklica 2 mm'),
('Heklica 2.5 mm'),
('Heklica 3 mm'),
('Heklica 3.5 mm'),
('Heklica 4 mm'),
('Heklica 4.5 mm'),
('Heklica 5 mm'),
('Heklica 5.5 mm'),
('Heklica 6 mm'),
('Heklica 6.5 mm'),
('Heklica 7 mm'),
('Heklica 8 mm'),
('Heklica 9 mm'),
('Heklica 10 mm'),
('Heklica 12 mm'),
('Dugmad'),
('Rajsferšlus'),
('Punjenje za igračke'),
('Sigurnosne oči'),
('Igla za pređu'),
('Makaze'),
('Markeri za petlje'),
('Krojački metar'),
('Ukrasna traka'),
('Konac za šivenje'),
('Igla za šivenje'),
('Čičak traka'),
('Drvena dugmad'),
('Metalna kopča');

INSERT INTO tags (name) VALUES
('poklon'),
('dom'),
('bebe'),
('djeca'),
('zima'),
('ljeto'),
('jesen'),
('proljeće'),
('udobno'),
('šareno'),
('minimalističko'),
('moderno'),
('klasično'),
('slatko'),
('cvjetno'),
('životinje'),
('praznično'),
('praktično'),
('dekorativno'),
('nosivo'),
('mali projekat'),
('veliki projekat'),
('brza izrada'),
('projekat za početnike'),
('projekat za napredne'),
('mekano'),
('toplo'),
('ručni rad'),
('igračka'),
('odjeća'),
('aksesoar'),
('za kuću'),
('za kuhinju'),
('za kupatilo'),
('personalizovano'),
('jednobojno'),
('višebojno'),
('amigurumi'),
('heklanje'),
('pletenje');

INSERT INTO materials (name) VALUES
('Petljasta pređa');
INSERT INTO materials (name) VALUES
('Žica');