import { Color } from "./color";

export type ColorGraveyard = {
  [key: number]: number;
}

export type Graveyard = {
  squares: ColorGraveyard,
  bombs: ColorGraveyard,
}

export function createColorGraveyard(): ColorGraveyard {
  return {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0
  };
}

export function createGraveyard(): Graveyard {
  return {
    squares: createColorGraveyard(),
    bombs: createColorGraveyard(),
  }
}

export type GraveyardStat = { type: 'square' | 'bomb', color: Color, count: number };

export function graveyardStats(graveyard: Graveyard): GraveyardStat[] {
  let acc: GraveyardStat[] = [];
  for (let color = 0; color < 5; color++) {
    let count = graveyard.bombs[color];
    while (count > 0) {
      const countInCurrentSegment = Math.min(count, 25);
      acc.push({ type: 'bomb', color, count: countInCurrentSegment });
      count -= countInCurrentSegment;
    }
  }
  for (let color = 0; color < 5; color++) {
    let count = graveyard.squares[color];
    while (count > 0) {
      const countInCurrentSegment = Math.min(count, 25);
      acc.push({ type: 'square', color, count: countInCurrentSegment });
      count -= countInCurrentSegment;
    }
  }
  return acc;
}

export function mapGraveyard<T>(graveyard: Graveyard, mapper: (type: 'square' | 'bomb', color: Color) => T): T[] {
  let acc: T[] = [];
  for (let color = 0; color < 5; color++) {
    const mappedBomb = mapper('bomb', color);
    acc.push(...Array(graveyard.bombs[color]).fill(mappedBomb));
  }
  for (let color = 0; color < 5; color++) {
    const mappedSquare = mapper('square', color);
    acc.push(...Array(graveyard.squares[color]).fill(mappedSquare));
  }
  return acc;
}