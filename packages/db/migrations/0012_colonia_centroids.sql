-- Seed approximate centroids for San Cristóbal de las Casas neighborhoods.
-- Idempotent: inserts missing colonias, fills centroid for ones that have it NULL,
-- and preserves any centroid that has already been manually corrected.
--
-- These coordinates are reasonable starting points distributed around the city
-- center (16.7370, -92.6376) but are NOT surveyed boundaries. Refine against
-- OSM data in a follow-up data migration if precision matters.

INSERT INTO "colonias" ("name", "slug", "centroid") VALUES
  ('Barrio de Cuxtitali',          'barrio-de-cuxtitali',          'SRID=4326;POINT(-92.6275 16.7440)'),
  ('Barrio de Mexicanos',          'barrio-de-mexicanos',          'SRID=4326;POINT(-92.6440 16.7430)'),
  ('Barrio de San Antonio',        'barrio-de-san-antonio',        'SRID=4326;POINT(-92.6440 16.7290)'),
  ('Barrio de San Ramón',          'barrio-de-san-ramon',          'SRID=4326;POINT(-92.6310 16.7300)'),
  ('Barrio del Cerrillo',          'barrio-del-cerrillo',          'SRID=4326;POINT(-92.6390 16.7430)'),
  ('Barrio del Santuario',         'barrio-del-santuario',         'SRID=4326;POINT(-92.6385 16.7305)'),
  ('Centro Histórico',             'centro-historico',             'SRID=4326;POINT(-92.6376 16.7370)'),
  ('Col. Jardines del Pedregal',   'col-jardines-del-pedregal',    'SRID=4326;POINT(-92.6300 16.7250)'),
  ('Col. Las Palmas',              'col-las-palmas',               'SRID=4326;POINT(-92.6300 16.7500)'),
  ('Col. Linda Vista',             'col-linda-vista',              'SRID=4326;POINT(-92.6250 16.7480)'),
  ('Col. Los Pinos',               'col-los-pinos',                'SRID=4326;POINT(-92.6360 16.7220)'),
  ('Col. Morelos',                 'col-morelos',                  'SRID=4326;POINT(-92.6230 16.7450)'),
  ('Col. Niños Héroes',            'col-ninos-heroes',             'SRID=4326;POINT(-92.6310 16.7340)'),
  ('Col. Nueva Maravilla',         'col-nueva-maravilla',          'SRID=4326;POINT(-92.6420 16.7520)'),
  ('Col. Primero de Agosto',       'col-primero-de-agosto',        'SRID=4326;POINT(-92.6300 16.7180)'),
  ('Col. San Sebastián',           'col-san-sebastian',            'SRID=4326;POINT(-92.6420 16.7470)'),
  ('Ejido San Francisco',          'ejido-san-francisco',          'SRID=4326;POINT(-92.6200 16.7600)'),
  ('Fraccionamiento La Joya',      'fraccionamiento-la-joya',      'SRID=4326;POINT(-92.6500 16.7250)'),
  ('Fraccionamiento Los Laureles', 'fraccionamiento-los-laureles', 'SRID=4326;POINT(-92.6260 16.7270)'),
  ('Periferia Norte',              'periferia-norte',              'SRID=4326;POINT(-92.6350 16.7600)')
ON CONFLICT ("slug") DO UPDATE SET
  "centroid" = COALESCE("colonias"."centroid", EXCLUDED."centroid");
