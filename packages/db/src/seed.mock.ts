import { config } from 'dotenv';
config({ path: '.env.local' });

import { initDb, db } from './client.js';
import { colonias, pets } from './schema/index.js';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';

initDb(process.env.DATABASE_URL!);

function slug(name: string, suffix: string): string {
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') +
    '-' +
    suffix
  );
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const MOCK_PETS = [
  {
    name: 'Luna',
    type: 'dog' as const,
    breed: 'Mestiza',
    color: 'Negra con manchas blancas',
    sex: 'female' as const,
    size: 'medium' as const,
    coloniaSlug: 'centro-historico',
    lastSeenAt: daysAgo(2),
    description: 'Collar rojo, muy cariñosa. Responde a Luna.',
    contactWhatsapp: '+529671234567',
    contactName: 'María',
    anonymous: 'false'
  },
  {
    name: 'Manchas',
    type: 'cat' as const,
    breed: 'Doméstico',
    color: 'Blanco con manchas naranjas',
    sex: 'male' as const,
    size: 'small' as const,
    coloniaSlug: 'barrio-de-mexicanos',
    lastSeenAt: daysAgo(5),
    description: 'Gato castrado, tiene chip. Muy asustadizo.',
    contactWhatsapp: '+529679876543',
    contactName: 'Carlos',
    anonymous: 'false'
  },
  {
    name: 'Toby',
    type: 'dog' as const,
    breed: 'Labrador',
    color: 'Amarillo',
    sex: 'male' as const,
    size: 'large' as const,
    coloniaSlug: 'col-linda-vista',
    lastSeenAt: daysAgo(1),
    description: 'Lleva collar azul. Es muy juguetón y se acerca a la gente.',
    contactWhatsapp: '+529670001111',
    contactName: 'Roberto',
    anonymous: 'false'
  },
  {
    name: 'Mimi',
    type: 'cat' as const,
    breed: 'Siamés',
    color: 'Beige con puntas oscuras',
    sex: 'female' as const,
    size: 'small' as const,
    coloniaSlug: 'barrio-de-cuxtitali',
    lastSeenAt: daysAgo(8),
    description: 'Ojos azules, muy vocal. Nunca había salido de casa.',
    contactWhatsapp: null,
    contactName: null,
    anonymous: 'true'
  },
  {
    name: 'Rocky',
    type: 'dog' as const,
    breed: 'Pitbull',
    color: 'Café con blanco',
    sex: 'male' as const,
    size: 'large' as const,
    coloniaSlug: 'col-morelos',
    lastSeenAt: daysAgo(3),
    description: 'Tatuaje en la oreja izquierda. Es manso a pesar de su aspecto.',
    contactWhatsapp: '+529672223333',
    contactName: 'Javier',
    anonymous: 'false'
  },
  {
    name: 'Canela',
    type: 'dog' as const,
    breed: 'Salchicha',
    color: 'Canela',
    sex: 'female' as const,
    size: 'small' as const,
    coloniaSlug: 'col-las-palmas',
    lastSeenAt: daysAgo(12),
    description: 'Patas cortas, cuerpo largo. Tiene un lunar negro en la espalda.',
    contactWhatsapp: '+529674445555',
    contactName: 'Ana',
    anonymous: 'false'
  },
  {
    name: 'Sombra',
    type: 'cat' as const,
    breed: 'Doméstico',
    color: 'Negro',
    sex: 'unknown' as const,
    size: 'medium' as const,
    coloniaSlug: 'barrio-del-cerrillo',
    lastSeenAt: daysAgo(15),
    description: 'Completamente negro, sin collar. Desapareció después del temblor.',
    contactWhatsapp: null,
    contactName: null,
    anonymous: 'true'
  },
  {
    name: 'Kira',
    type: 'dog' as const,
    breed: 'Border Collie',
    color: 'Blanco y negro',
    sex: 'female' as const,
    size: 'medium' as const,
    coloniaSlug: 'fraccionamiento-la-joya',
    lastSeenAt: daysAgo(4),
    description: 'Ojos de diferente color (heterocromía). Collar con placa pero sin datos legibles.',
    contactWhatsapp: '+529676667777',
    contactName: 'Sofía',
    anonymous: 'false'
  },
  {
    name: null,
    type: 'dog' as const,
    breed: null,
    color: 'Gris oscuro',
    sex: 'unknown' as const,
    size: 'medium' as const,
    coloniaSlug: 'ejido-san-francisco',
    lastSeenAt: daysAgo(7),
    description: 'Perro sin nombre conocido, encontrado en la periferia. Muy asustado.',
    contactWhatsapp: '+529678889999',
    contactName: 'Vecino',
    anonymous: 'false'
  },
  {
    name: 'Piolín',
    type: 'other' as const,
    breed: 'Canario',
    color: 'Amarillo',
    sex: 'unknown' as const,
    size: 'small' as const,
    coloniaSlug: 'centro-historico',
    lastSeenAt: daysAgo(10),
    description: 'Canario doméstico, voló por la ventana. Canta mucho.',
    contactWhatsapp: '+529670002222',
    contactName: 'Don Ernesto',
    anonymous: 'false'
  }
];

async function seedMock() {
  // Seed colonias first
  const { default: seedColonias } = await import('./seed.js');
  await seedColonias?.();

  console.log('Seeding mock pets…');

  const allColonias = await db.select().from(colonias);
  const coloniaMap = Object.fromEntries(allColonias.map((c) => [c.slug, c.id]));

  let inserted = 0;
  for (const pet of MOCK_PETS) {
    const coloniaId = coloniaMap[pet.coloniaSlug];
    if (!coloniaId) {
      console.warn(`Colonia not found: ${pet.coloniaSlug}, skipping`);
      continue;
    }

    const petSlug = slug(pet.name ?? 'mascota', randomBytes(4).toString('hex'));
    const editToken = randomBytes(16).toString('hex');

    await db
      .insert(pets)
      .values({
        slug: petSlug,
        editToken,
        type: pet.type,
        name: pet.name,
        breed: pet.breed,
        color: pet.color,
        sex: pet.sex,
        size: pet.size,
        coloniaId,
        lastSeenAt: pet.lastSeenAt,
        description: pet.description,
        contactWhatsapp: pet.contactWhatsapp,
        contactName: pet.contactName,
        anonymous: pet.anonymous
      })
      .onConflictDoNothing({ target: pets.slug });

    inserted++;
  }

  console.log(`Inserted ${inserted} mock pets.`);
}

seedMock().catch((err) => {
  console.error(err);
  process.exit(1);
});
