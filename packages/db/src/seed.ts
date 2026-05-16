import { db } from './client.js';
import { colonias } from './schema/index.js';

const SANCRIS_COLONIAS = [
  'Barrio de Cuxtitali',
  'Barrio de Mexicanos',
  'Barrio de San Antonio',
  'Barrio de San Ramón',
  'Barrio del Cerrillo',
  'Barrio del Santuario',
  'Centro Histórico',
  'Col. Jardines del Pedregal',
  'Col. Las Palmas',
  'Col. Linda Vista',
  'Col. Los Pinos',
  'Col. Morelos',
  'Col. Niños Héroes',
  'Col. Nueva Maravilla',
  'Col. Primero de Agosto',
  'Col. San Sebastián',
  'Ejido San Francisco',
  'Fraccionamiento La Joya',
  'Fraccionamiento Los Laureles',
  'Periferia Norte'
];

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function seed() {
  console.log('Seeding colonias…');
  const rows = SANCRIS_COLONIAS.map((name) => ({ name, slug: toSlug(name) }));
  await db
    .insert(colonias)
    .values(rows)
    .onConflictDoNothing({ target: colonias.slug });
  console.log(`Inserted ${rows.length} colonias.`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
