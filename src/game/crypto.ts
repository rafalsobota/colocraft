// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript

function xmur3(str: string): () => any {
  for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = h << 13 | h >>> 19;
  } return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  }
}

function mulberry32(a: number): () => number {
  return function () {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export function makeRandomGenerator(seed: string): () => number {
  const seedGenerator = xmur3(seed);
  return mulberry32(seedGenerator());
}

export function formatDate(date: Date): string {
  return `${date.getFullYear}-${date.getMonth() + 1}-${date.getDate()}`;
}