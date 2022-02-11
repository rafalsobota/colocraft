import { useCallback, useEffect, useRef, useState } from "react";

export enum Color {
  Blue,
  Green,
  Yellow,
  Pink,
  Purple,
}

export const cols = 5;
export const rows = 8;

function randomColor(): Color {
  return Math.round(Math.random() * 4);
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

function clickCell(matrix: Matrix, id: string): Matrix {
  const target = findCellById(matrix, id);
  if (!target) {
    return matrix;
  }

  const { cell, x, y } = target;

  if (cell.type === CellType.Idle) {
    matrix[x][y] = {
      ...cell,
      type: CellType.Clicked,
    };
    return [...matrix];
  } else {
    return matrix;
  }
}

enum Direction {
  Up,
  Down,
  Left,
  Right,
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

function swipeCell(matrix: Matrix, id: string, direction: Direction): Matrix {
  const target = findCellById(matrix, id);
  if (!target) return matrix;
  const { cell, x, y } = target;
  if (direction === Direction.Up) {
    if (y === 0) return matrix;
    matrix[x][y] = matrix[x][y - 1];
    matrix[x][y - 1] = cell;
    return [...matrix];
  } else if (direction === Direction.Down) {
    if (y === rows - 1) return matrix;
    matrix[x][y] = matrix[x][y + 1];
    matrix[x][y + 1] = cell;
    return [...matrix];
  } else if (direction === Direction.Left) {
    if (x === 0) return matrix;
    matrix[x][y] = matrix[x - 1][y];
    matrix[x - 1][y] = cell;
    return [...matrix];
  } else if (direction === Direction.Right) {
    if (x === cols - 1) return matrix;
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

function fillGaps(matrix: Matrix): Matrix {
  return matrix.map((col) => {
    const filteredRows = col.filter(
      (cell) =>
        cell.type !== CellType.Clicked && cell.type !== CellType.ScoreExit
    );
    const lackingCellsCount = rows - filteredRows.length;
    return [
      ...Array(lackingCellsCount)
        .fill(null)
        .map(() => createCell()),
      ...filteredRows,
    ];
  });
}

function isDirty(matrix: Matrix): boolean {
  return matrix.some((col) =>
    col.some((cell) => {
      return cell.type !== CellType.Idle && cell.type !== CellType.Bomb;
    })
  );
}

function createCell(): Cell {
  return {
    type: CellType.Spawning,
    color: randomColor(),
    id: Math.round(Math.random() * 100000000).toString(),
  };
}

export type Matrix = Cell[][];

function createMatrix(): Matrix {
  const matrix: Matrix = [];
  for (let i = 0; i < cols; i++) {
    matrix.push([]);
    for (let j = 0; j < rows; j++) {
      matrix[i].push(createCell());
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

export function useEngine(): {
  cells: CellWithPosition[];
  onCellSwipe(id: string, direction: Direction): void;
  onCellClick(id: string): void;
  score: number;
  isInteractive: boolean;
} {
  const [matrix, setMatrix] = useState(createMatrix());
  const [dirty, setDirty] = useState(true);
  const matrixRef = useRef<Matrix>(matrix);
  const [score, setScore] = useState(0);

  useEffect(() => {
    matrixRef.current = matrix;
  }, [matrix]);

  useEffect(() => {
    if (!dirty) return;
    const interval = setInterval(() => {
      const newMatrix = detonateBombs(
        fillGaps(mapCells(matrixRef.current, mutateCell))
      );
      setMatrix(newMatrix);
      const newDirty = isDirty(newMatrix);
      console.log("tick", { newDirty });
      setDirty(newDirty);
    }, 150);
    return () => {
      console.log("cleanup");
      clearInterval(interval);
    };
  }, [dirty, setMatrix]);

  const onCellSwipe = useCallback((id: string, direction: Direction) => {
    setMatrix(swipeCell(matrixRef.current, id, direction));
    setDirty(true);
  }, []);

  const onCellClick = useCallback((id: string) => {
    setMatrix(clickCell(matrixRef.current, id));
    setDirty(true);
  }, []);

  return {
    cells: cellsWithPosition(matrix),
    onCellSwipe,
    onCellClick,
    score,
    isInteractive: !dirty,
  };
}
