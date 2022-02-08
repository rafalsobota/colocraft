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
      return "bg-blue-500 hover:bg-blue-600 text-blue-600";
    case Color.Green:
      return "bg-green-500 hover:bg-green-600 text-green-600";
    case Color.Yellow:
      return "bg-yellow-500 hover:bg-yellow-600 text-yellow-600";
    case Color.Pink:
      return "bg-pink-500 hover:bg-pink-600 text-pink-600";
    case Color.Purple:
      return "bg-purple-500 hover:bg-purple-600 text-purple-600";
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
  | { type: CellType.Bomb; color: Color; id: string };

function clickCell(cell: Cell): Cell {
  if (cell.type === CellType.Idle || cell.type === CellType.Bomb) {
    return {
      ...cell,
      type: CellType.Clicked,
    };
  } else {
    return cell;
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
    cell.type !== CellType.Bomb
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
      const newMatrix = fillGaps(mapCells(matrixRef.current, mutateCell));
      setMatrix(newMatrix);
      const newDirty = isDirty(newMatrix);
      console.log("tick", { newDirty });
      setDirty(newDirty);
    }, 100);
    return () => {
      console.log("cleanup");
      clearInterval(interval);
    };
  }, [dirty, setMatrix]);

  const onClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const id = event.currentTarget.dataset.id;
      if (!id) return;
      setMatrix(
        matrixRef.current.map((col, x) =>
          col.map((cell, y) => {
            return cell.id === id ? clickCell(cell) : cell;
          })
        )
      );
      setDirty(true);
    },
    [matrixRef, setMatrix]
  );

  const onTap = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      const id = event.currentTarget.dataset.id;
      if (!id) return;
      setMatrix(
        matrixRef.current.map((col, x) =>
          col.map((cell, y) => {
            return cell.id === id ? clickCell(cell) : cell;
          })
        )
      );
      setDirty(true);
    },
    [matrixRef, setMatrix]
  );

  return (
    <div className="relative w-[375px] h-[700px] mx-auto acceleration overflow-hidden select-none dark:bg-slate-900">
      {matrix.map((col, x) =>
        col.map((cell, y) => {
          if (cell.type === CellType.Spawning) {
            return (
              <div
                key={cell.id}
                data-id={cell.id}
                className={`absolute ${bgColor(
                  cell.color
                )} rounded-xl w-[70px] h-[70px] transition-all cursor-pointer opacity-1 ease-spring duration-300`}
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
                onTouchStart={onTap}
                onMouseDown={onClick}
                className={`absolute ${bgColor(
                  cell.color
                )} rounded-xl w-[70px] h-[70px] transition-all cursor-pointer opacity-1 ease-spring duration-300 scale-100`}
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
                )} rounded-xl w-[70px] h-[70px] transition-all cursor-pointer opacity-0 scale-0 ease-spring duration-300`}
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
                } transition-all cursor-pointer opacity-1 ease-spring duration-300 scale-100`}
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
                )} bg-transparent text-4xl font-bold rounded-xl w-[70px] h-[70px] transition-all cursor-pointer opacity- scale-1 ease-spring duration-300`}
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
                )} bg-transparent text-8xl font-bold rounded-xl w-[70px] h-[70px] transition-all cursor-pointer opacity-0 ease-spring duration-300`}
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
                onTouchStart={onTap}
                onMouseDown={onClick}
                className={`absolute ${bgColor(
                  cell.color
                )} rounded-full w-[70px] h-[70px] transition-all cursor-pointer opacity-1 ease-spring duration-300 scale-100`}
                style={{
                  top: y * 75 + 2,
                  left: x * 75 + 2,
                }}
              ></div>
            );
          } else {
            return <></>;
          }
        })
      )}
    </div>
  );
}

export default FunctionalUniphaser;
