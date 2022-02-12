import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatDate, makeRandomGenerator } from "./random";

export enum Color {
  Blue,
  Green,
  Yellow,
  Pink,
  Purple,
}

export const cols = 5;
export const rows = 8;
export const moves = 30;

function randomColor(random: () => number): Color {
  return Math.round(random() * 4);
}

export enum CellType {
  Spawning,
  Dropped,
  Idle,
  Clicked,
  Fusion,
  ScoreEnter,
  ScoreExit,
  Bomb,
  BombDetonated,
  BombIgnited,
}

export enum FusionDirection {
  Horizontal,
  Vertical,
}

export type Cell =
  | { type: CellType.Spawning; color: Color; id: string }
  | { type: CellType.Dropped; color: Color; id: string }
  | { type: CellType.Idle; color: Color; id: string }
  | { type: CellType.Clicked; color: Color; id: string }
  | {
      type: CellType.Fusion;
      color: Color;
      id: string;
      score: number;
      direction: FusionDirection;
    }
  | { type: CellType.ScoreEnter; color: Color; id: string; score: number }
  | { type: CellType.ScoreExit; color: Color; id: string; score: number }
  | { type: CellType.Bomb; color: Color; id: string }
  | { type: CellType.BombIgnited; color: Color; id: string }
  | { type: CellType.BombDetonated; color: Color; id: string; score: number };

function findCellById(
  matrix: Matrix,
  id: string
): { cell: Cell; x: number; y: number } | undefined {
  return findCell(matrix, (cell) => cell.id === id);
}

function findCell(
  matrix: Matrix,
  predicate: (cell: Cell, x: number, y: number) => boolean
): { cell: Cell; x: number; y: number } | undefined {
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const cell = matrix[x][y];
      if (predicate(cell, x, y)) {
        return { cell, x, y };
      }
    }
  }
}

function isWaitForDetonation(matrix: Matrix): boolean {
  const busy = findCell(
    matrix,
    (cell) =>
      cell.type === CellType.Fusion ||
      cell.type === CellType.ScoreEnter ||
      cell.type === CellType.ScoreExit ||
      cell.type === CellType.Spawning ||
      cell.type === CellType.Dropped ||
      cell.type === CellType.BombDetonated
  );
  return !!busy;
}

function detonateBombs(matrix: Matrix): Matrix {
  const bombIgnited = findCell(
    matrix,
    (cell) => cell.type === CellType.BombIgnited
  );
  if (!bombIgnited) {
    return matrix;
  }
  if (isWaitForDetonation(matrix)) {
    return matrix;
  }
  return detonateBomb(matrix, bombIgnited.x, bombIgnited.y);
}

function detonateBomb(matrix: Matrix, x: number, y: number): Matrix {
  if (matrix[x][y].type !== CellType.BombIgnited) {
    return matrix;
  }

  return mapCells(matrix, (cell, cx, cy) => {
    if (cx >= x - 1 && cx <= x + 1 && cy >= y - 1 && cy <= y + 1) {
      if (cx === x && cy === y) {
        return {
          ...cell,
          type: CellType.BombDetonated,
          score: 100,
        };
      } else if (
        cell.type === CellType.Idle ||
        cell.type === CellType.Dropped
      ) {
        return {
          ...cell,
          type: CellType.ScoreEnter,
          score: 10,
        };
      } else if (cell.type === CellType.Bomb) {
        return {
          ...cell,
          type: CellType.BombIgnited,
        };
      } else {
        return cell;
      }
    } else {
      return cell;
    }
  });
}

function clickCell(matrix: Matrix, id: string, previousMoves: Move[]): Matrix {
  const target = findCellById(matrix, id);
  if (!target) {
    return matrix;
  }

  const { cell, x, y } = target;

  if (cell.type === CellType.Idle) {
    previousMoves.push({ x, y });
    matrix[x][y] = {
      ...cell,
      type: CellType.Clicked,
    };
    return [...matrix];
  } else {
    return matrix;
  }
}

export enum Direction {
  Up = 1,
  Down = 2,
  Left = 3,
  Right = 4,
}

export function positionDeltaToDirection(dx: number, dy: number): Direction {
  return Math.abs(dx) > Math.abs(dy)
    ? dx > 0
      ? Direction.Right
      : Direction.Left
    : dy > 0
    ? Direction.Down
    : Direction.Up;
}

function swipeCell(
  matrix: Matrix,
  id: string,
  direction: Direction,
  previousMoves: Move[]
): Matrix {
  const target = findCellById(matrix, id);
  if (!target) return matrix;
  const { cell, x, y } = target;
  if (direction === Direction.Up) {
    if (y === 0) return matrix;
    previousMoves.push({ x, y, direction });
    matrix[x][y] = matrix[x][y - 1];
    matrix[x][y - 1] = cell;
    return [...matrix];
  } else if (direction === Direction.Down) {
    if (y === rows - 1) return matrix;
    previousMoves.push({ x, y, direction });
    matrix[x][y] = matrix[x][y + 1];
    matrix[x][y + 1] = cell;
    return [...matrix];
  } else if (direction === Direction.Left) {
    if (x === 0) return matrix;
    previousMoves.push({ x, y, direction });
    matrix[x][y] = matrix[x - 1][y];
    matrix[x - 1][y] = cell;
    return [...matrix];
  } else if (direction === Direction.Right) {
    if (x === cols - 1) return matrix;
    previousMoves.push({ x, y, direction });
    matrix[x][y] = matrix[x + 1][y];
    matrix[x + 1][y] = cell;
    return [...matrix];
  } else {
    return matrix;
  }
}

function canFuse(matrix: Matrix, x: number, y: number, color: Color): boolean {
  if (x < 0 || x >= cols || y < 0 || y >= rows) {
    return false;
  }

  const cell = matrix[x][y];

  if (
    cell.type !== CellType.Idle &&
    cell.type !== CellType.Dropped &&
    cell.type !== CellType.Bomb &&
    cell.type !== CellType.BombIgnited
  ) {
    return false;
  }

  if (cell.color !== color) {
    return false;
  }

  return true;
}

function mutateCell(cell: Cell, x: number, y: number, matrix: Matrix): Cell {
  if (cell.type === CellType.Spawning) {
    return {
      ...cell,
      type: CellType.Dropped,
    };
  } else if (
    cell.type === CellType.Idle ||
    cell.type === CellType.Dropped ||
    cell.type === CellType.Bomb
  ) {
    const color = cell.color;

    const h = [
      canFuse(matrix, x - 2, y, color),
      canFuse(matrix, x - 1, y, color),
      canFuse(matrix, x + 1, y, color),
      canFuse(matrix, x + 2, y, color),
    ];
    const v = [
      canFuse(matrix, x, y - 2, color),
      canFuse(matrix, x, y - 1, color),
      canFuse(matrix, x, y + 1, color),
      canFuse(matrix, x, y + 2, color),
    ];

    const verticalFusion = (v[0] && v[1]) || (v[1] && v[2]) || (v[2] && v[3]);
    const horizontalFusion = (h[0] && h[1]) || (h[1] && h[2]) || (h[2] && h[3]);

    if (cell.type === CellType.Bomb) {
      if (verticalFusion || horizontalFusion) {
        return {
          ...cell,
          type: CellType.BombIgnited,
        };
      } else {
        return cell;
      }
    } else if (horizontalFusion && verticalFusion) {
      return {
        ...cell,
        type: CellType.Bomb,
      };
    } else if (horizontalFusion || verticalFusion) {
      return {
        ...cell,
        type: CellType.Fusion,
        direction: horizontalFusion
          ? FusionDirection.Horizontal
          : FusionDirection.Vertical,
        score: 1,
      };
    } else {
      return { ...cell, type: CellType.Idle };
    }
  } else if (cell.type === CellType.Fusion) {
    return { ...cell, type: CellType.ScoreEnter };
  } else if (cell.type === CellType.ScoreEnter) {
    return {
      ...cell,
      type: CellType.ScoreExit,
    };
  } else if (cell.type === CellType.BombDetonated) {
    return { ...cell, type: CellType.ScoreEnter };
  }

  return cell;
}

function fillGaps(matrix: Matrix, random: () => number): Matrix {
  return matrix.map((col) => {
    const filteredRows = col.filter(
      (cell) =>
        cell.type !== CellType.Clicked && cell.type !== CellType.ScoreExit
    );
    const lackingCellsCount = rows - filteredRows.length;
    return [
      ...Array(lackingCellsCount)
        .fill(null)
        .map(() => createCell(random)),
      ...filteredRows,
    ];
  });
}

function collectScore(matrix: Matrix): number {
  return matrix.reduce((acc, col) => {
    return (
      acc +
      col.reduce((acc, cell) => {
        if (cell.type === CellType.ScoreExit) {
          return acc + cell.score;
        } else {
          return acc;
        }
      }, 0)
    );
  }, 0);
}

function isDirty(matrix: Matrix): boolean {
  return matrix.some((col) =>
    col.some((cell) => {
      return cell.type !== CellType.Idle && cell.type !== CellType.Bomb;
    })
  );
}

function igniteAllBombs(matrix: Matrix): Matrix {
  return mapCells(matrix, (cell) => {
    if (cell.type === CellType.Bomb) {
      return { ...cell, type: CellType.BombIgnited };
    } else {
      return cell;
    }
  });
}

function createCell(random: () => number): Cell {
  return {
    type: CellType.Spawning,
    color: randomColor(random),
    id: Math.round(random() * 100000000).toString(),
  };
}

export type Matrix = Cell[][];

function createMatrix(random: () => number): Matrix {
  const matrix: Matrix = [];
  for (let i = 0; i < cols; i++) {
    matrix.push([]);
    for (let j = 0; j < rows; j++) {
      matrix[i].push(createCell(random));
    }
  }
  return matrix;
}

function mapCells(
  matrix: Matrix,
  mapper: (cell: Cell, x: number, y: number, matrix: Matrix) => Cell
): Matrix {
  return matrix.map((col, x) =>
    col.map((cell, y) => {
      return mapper(cell, x, y, matrix);
    })
  );
}

export type CellWithPosition = { cell: Cell; x: number; y: number };

function cellsWithPosition(matrix: Matrix): CellWithPosition[] {
  let acc: CellWithPosition[] = [];

  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      acc.push({
        cell: matrix[i][j],
        x: i,
        y: j,
      });
    }
  }

  return acc.sort((a, b) => (a.cell.id < b.cell.id ? -1 : 1));
}

export type Move = { x: number; y: number; direction?: Direction };

type EngineOptions = {
  interval: number;
  dateString?: string;
};

export function useEngine(options: EngineOptions): {
  cells: CellWithPosition[];
  onCellSwipe(id: string, direction: Direction): void;
  onCellClick(id: string): void;
  score: number;
  movesLeft: number;
  isInteractive: boolean;
  restart: () => void;
  finished: boolean;
  previousMoves: Move[];
} {
  const [iteration, setIteration] = useState(1);

  const today = options.dateString || formatDate(new Date());

  const random = useMemo(() => {
    return makeRandomGenerator(today);
    // iteration is used only to reset the random generator
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [today, iteration]);

  const [matrix, setMatrix] = useState<Matrix>([]);
  const [dirty, setDirty] = useState(true);
  const matrixRef = useRef<Matrix>(matrix);
  const scoreRef = useRef<number>(0);
  const [movesLeft, setMovesLeft] = useState(moves);
  const [finished, setFinished] = useState(false);
  const previousMoves = useRef<Move[]>([]);

  useEffect(() => {
    setMatrix(createMatrix(random));
    setDirty(true);
    scoreRef.current = 0;
    setMovesLeft(moves);
    setFinished(false);
    previousMoves.current = [];
  }, [setMatrix, setDirty, setMovesLeft, random]);

  const restart = useCallback(() => {
    setIteration(iteration + 1);
  }, [iteration, setIteration]);

  useEffect(() => {
    matrixRef.current = matrix;
  }, [matrix]);

  const addScore = useCallback((score: number) => {
    scoreRef.current += score;
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const interval = setInterval(() => {
      let newMatrix = mapCells(matrixRef.current, mutateCell);
      addScore(collectScore(newMatrix));
      newMatrix = fillGaps(newMatrix, random);
      newMatrix = detonateBombs(newMatrix);
      if (movesLeft < 1) {
        newMatrix = igniteAllBombs(newMatrix);
      }
      setMatrix(newMatrix);
      const newDirty = isDirty(newMatrix);
      setDirty(newDirty);
      if (movesLeft < 1 && !newDirty) {
        setTimeout(() => {
          setFinished(true);
        }, 1000);
      }
    }, options.interval);
    return () => {
      clearInterval(interval);
    };
  }, [dirty, movesLeft, setMatrix, addScore, random, options.interval]);

  const onCellSwipe = useCallback(
    (id: string, direction: Direction) => {
      if (dirty || movesLeft < 1) return;
      setMatrix(
        swipeCell(matrixRef.current, id, direction, previousMoves.current)
      );
      setDirty(true);
      setMovesLeft(movesLeft - 1);
    },
    [dirty, movesLeft, setMovesLeft]
  );

  const onCellClick = useCallback(
    (id: string) => {
      if (dirty || movesLeft < 1) return;
      setMatrix(clickCell(matrixRef.current, id, previousMoves.current));
      setDirty(true);
      setMovesLeft(movesLeft - 1);
    },
    [dirty, movesLeft, setMovesLeft]
  );

  return {
    cells: cellsWithPosition(matrix),
    onCellSwipe,
    onCellClick,
    score: scoreRef.current,
    movesLeft,
    isInteractive: !dirty && movesLeft > 0,
    restart,
    finished,
    previousMoves: previousMoves.current,
  };
}
