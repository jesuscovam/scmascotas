const GROUPS: string[][] = [
  ['negro', 'negra', 'oscuro', 'oscura', 'prieto'],
  ['blanco', 'blanca', 'claro', 'clara'],
  ['cafe', 'marron', 'castano', 'castana', 'chocolate', 'canela', 'miel', 'tierra', 'pardo', 'parda'],
  ['gris', 'grisaceo', 'plata', 'plateado', 'cenizo'],
  ['naranja', 'anaranjado'],
  ['amarillo', 'amarilla', 'dorado', 'dorada', 'rubio', 'rubia', 'crema', 'beige'],
  ['rojo', 'roja', 'rojizo', 'bermejo'],
  ['manchas', 'manchado', 'manchada', 'moteado'],
  ['rayas', 'rayado', 'rayada', 'tigre', 'atigrado', 'tabby'],
  ['tricolor', 'bicolor'],
];

const WORD_TO_GROUP = new Map<string, number>();
GROUPS.forEach((g, i) => g.forEach(w => WORD_TO_GROUP.set(w, i)));

function strip(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function colorGroupsFor(text: string | null | undefined): Set<number> {
  if (!text) return new Set();
  const groups = new Set<number>();
  for (const word of strip(text).split(/[\s,/]+/)) {
    const g = WORD_TO_GROUP.get(word);
    if (g !== undefined) groups.add(g);
  }
  return groups;
}

export function colorsOverlap(a: string | null | undefined, b: string | null | undefined): boolean {
  const ga = colorGroupsFor(a);
  if (ga.size === 0) return false;
  const gb = colorGroupsFor(b);
  for (const g of ga) if (gb.has(g)) return true;
  return false;
}
