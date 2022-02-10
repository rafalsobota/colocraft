import { useCallback, useEffect, useRef, useState } from "react";

enum Color {
  Blue,
  Green,
  Yellow,
  Pink,
  Purple,
}

const cols = 5;
const rows = 8;

function randomColor(): Color {
  return Math.round(Math.random() * 4);
}

function bgColor(color: Color): string {
  switch (color) {
    case Color.Blue:
      return "bg-blue-500 active:bg-blue-600 text-blue-600";
    case Color.Green:
      return "bg-green-500 active:bg-green-600 text-green-600";
    case Color.Yellow:
      return "bg-yellow-500 active:bg-yellow-600 text-yellow-600";
    case Color.Pink:
      return "bg-pink-500 active:bg-pink-600 text-pink-600";
    case Color.Purple:
      return "bg-purple-500 active:bg-purple-600 text-purple-600";
  }
}

enum CellType {
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

enum FusionDirection {
  Horizontal,
  Vertical,
}

type Cell =
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
  } else if (cell.type === CellType.Bomb) {
    matrix[x][y] = {
      ...cell,
      type: CellType.BombIgnited,
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

function positionDeltaToDirection(dx: number, dy: number): Direction {
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
  } else if (cell.type === CellType.Idle || cell.type === CellType.Dropped) {
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

    if (horizontalFusion && verticalFusion) {
      return {
        ...cell,
        type: CellType.Bomb,
      };
    } else if (horizontalFusion) {
      return {
        ...cell,
        type: CellType.Fusion,
        direction: FusionDirection.Horizontal,
        score: 1,
      };
    } else if (verticalFusion) {
      return {
        ...cell,
        type: CellType.Fusion,
        direction: FusionDirection.Vertical,
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

type Matrix = Cell[][];

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

type CellWithPosition = { cell: Cell; x: number; y: number };

function cellsWithPosition(matrix: Matrix): CellWithPosition[] {
  let acc: CellWithPosition[] = [];

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      acc.push({
        cell: matrix[i][j],
        x: i,
        y: j,
      });
    }
  }

  return acc.sort((a, b) => (a.cell.id < b.cell.id ? -1 : 1));
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

function FunctionalUniphaser() {
  const [matrix, setMatrix] = useState(createMatrix());
  const [dirty, setDirty] = useState(true);
  const matrixRef = useRef<Matrix>(matrix);

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

  const [touchState, setTouchState] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);

  const onPressStart = useCallback(
    (id: string, x: number, y: number) => {
      console.log("onPressStart", { id, x, y });
      setTouchState({ id, x, y });
    },
    [setTouchState]
  );

  const onPressMove = useCallback(
    (x: number, y: number) => {
      console.log("onPressMove", { x, y });
      if (!touchState) return;
      const id = touchState.id;
      const dx = x - touchState.x;
      const dy = y - touchState.y;
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
        return;
      } else {
        setMatrix(
          swipeCell(matrixRef.current, id, positionDeltaToDirection(dx, dy))
        );
        setDirty(true);
        setTouchState(null);
      }
    },
    [touchState, setMatrix, setDirty]
  );

  const onPressEnd = useCallback(
    (x: number, y: number) => {
      console.log("onPressEnd", { x, y });
      if (!touchState) return;
      const id = touchState.id;
      const dx = x - touchState.x;
      const dy = y - touchState.y;
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
        setMatrix(clickCell(matrixRef.current, id));
        setDirty(true);
      } else {
        setMatrix(
          swipeCell(matrixRef.current, id, positionDeltaToDirection(dx, dy))
        );
        setDirty(true);
      }
      setTouchState(null);
    },
    [touchState, setMatrix, setDirty, setTouchState]
  );

  const onMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLDivElement;
      const id = target.dataset.id;
      if (!id) return;
      onPressStart(id, event.clientX, event.clientY);
    },
    [onPressStart]
  );

  const onMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onPressMove(event.clientX, event.clientY);
    },
    [onPressMove]
  );

  const onMouseUp = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onPressEnd(event.clientX, event.clientY);
    },
    [onPressEnd]
  );

  const onTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      console.log("onTouchStart", { event });
      const target = event.target as HTMLDivElement;
      const id = target.dataset.id;
      console.log("onTouchStart", { id, touches: event.touches });
      if (!id) return;
      onPressStart(id, event.touches[0].clientX, event.touches[0].clientY);
    },
    [onPressStart]
  );

  const onTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      console.log("onTouchMove", { touches: event.touches });
      onPressMove(event.touches[0].clientX, event.touches[0].clientY);
    },
    [onPressMove]
  );
  const onTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      console.log("onTouchEnd", {
        touches: event.touches,
        changedTouches: event.changedTouches,
      });
      onPressEnd(
        event.changedTouches[0].clientX,
        event.changedTouches[0].clientY
      );
    },
    [onPressEnd]
  );

  return (
    <div
      className="relative w-[375px] h-[700px] mx-auto transform-gpu select-none overflow-hidden lg:overflow-visible"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {cellsWithPosition(matrix).map(({ cell, x, y }) => {
        if (cell.type === CellType.Spawning) {
          return (
            <div
              key={cell.id}
              data-id={cell.id}
              className={`absolute ${bgColor(
                cell.color
              )} rounded-xl w-[70px] h-[70px] transition-all ease-spring duration-300 lg:opacity-0`}
              style={{
                top: -75 + 2,
                left: x * 75 + 2,
              }}
            ></div>
          );
        } else if (
          cell.type === CellType.Dropped ||
          cell.type === CellType.Idle
        ) {
          return (
            <div
              key={cell.id}
              data-id={cell.id}
              className={`absolute ${bgColor(
                cell.color
              )} rounded-xl w-[70px] h-[70px] cursor-pointer opacity-1 scale-100 transition-all ease-spring duration-300`}
              style={{
                top: y * 75 + 2,
                left: x * 75 + 2,
              }}
            ></div>
          );
        } else if (cell.type === CellType.Clicked) {
          return (
            <div
              key={cell.id}
              data-id={cell.id}
              className={`absolute ${bgColor(
                cell.color
              )} rounded-xl w-[70px] h-[70px] cursor-pointer opacity-0 scale-0 transition-all ease-spring duration-300`}
              style={{
                top: y * 75 + 2,
                left: x * 75 + 2,
              }}
            ></div>
          );
        } else if (cell.type === CellType.Fusion) {
          return (
            <div
              key={cell.id}
              data-id={cell.id}
              className={`absolute ${bgColor(cell.color)} rounded-xl ${
                cell.direction === FusionDirection.Horizontal
                  ? "w-[90px] h-[0px] ml-[-10px] mt-[35px]"
                  : "w-[0px] h-[90px] ml-[35px] mt-[-10px]"
              } cursor-pointer opacity-1 scale-100 transition-all ease-spring duration-300`}
              style={{
                top: y * 75 + 2,
                left: x * 75 + 2,
              }}
            ></div>
          );
        } else if (cell.type === CellType.ScoreEnter) {
          return (
            <div
              key={cell.id}
              data-id={cell.id}
              className={`absolute ${bgColor(
                cell.color
              )} bg-transparent text-4xl font-bold rounded-xl w-[70px] h-[70px] cursor-pointer scale-1 transition-all ease-spring duration-300`}
              style={{
                top: y * 75 + 2,
                left: x * 75 + 2,
              }}
            >
              {cell.score}
            </div>
          );
        } else if (cell.type === CellType.ScoreExit) {
          return (
            <div
              key={cell.id}
              data-id={cell.id}
              className={`absolute ${bgColor(
                cell.color
              )} bg-transparent text-8xl font-bold rounded-xl w-[70px] h-[70px] cursor-pointer opacity-0 transition-all ease-spring duration-300`}
              style={{
                top: y * 75 + 2,
                left: x * 75 + 2,
              }}
            >
              {cell.score}
            </div>
          );
        } else if (cell.type === CellType.Bomb) {
          return (
            <div
              key={cell.id}
              data-id={cell.id}
              className={`absolute ${bgColor(
                cell.color
              )} rounded-full w-[70px] h-[70px] cursor-pointer transition-all ease-spring duration-300`}
              style={{
                top: y * 75 + 2,
                left: x * 75 + 2,
              }}
            ></div>
          );
        } else if (cell.type === CellType.BombIgnited) {
          return (
            <div
              key={cell.id}
              data-id={cell.id}
              className={`absolute ${bgColor(
                cell.color
              )} rounded-full w-[70px] h-[70px] opacity-1 transition-all ease-spring duration-300 scale-50 animate-pulse`}
              style={{
                top: y * 75 + 2,
                left: x * 75 + 2,
              }}
            ></div>
          );
        } else if (cell.type === CellType.BombDetonated) {
          return (
            <div
              key={cell.id}
              data-id={cell.id}
              className={`absolute ${bgColor(
                cell.color
              )} rounded-sm w-[70px] h-[70px] opacity-1 transition-all ease-spring duration-300 opacity-0 scale-[3]`}
              style={{
                top: y * 75 + 2,
                left: x * 75 + 2,
              }}
            ></div>
          );
        } else {
          return <></>;
        }
      })}
    </div>
  );
}

export default FunctionalUniphaser;
