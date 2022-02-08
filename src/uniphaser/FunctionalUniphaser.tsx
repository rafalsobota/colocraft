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
  // const colors = Object.values(Color);
  // return colors[Math.round(Math.random() * (colors.length - 1))] as Color;
}

function bgColor(color: Color): string {
  switch (color) {
    case Color.Blue:
      return "bg-blue-500 hover:bg-blue-600";
    case Color.Green:
      return "bg-green-500 hover:bg-green-600";
    case Color.Yellow:
      return "bg-yellow-500 hover:bg-yellow-600";
    case Color.Pink:
      return "bg-pink-500 hover:bg-pink-600";
    case Color.Purple:
      return "bg-purple-500 hover:bg-purple-600";
  }
}

enum CellType {
  Spawning,
  Idle,
  Clicked,
}

type Cell =
  | { type: CellType.Spawning; color: Color; id: string }
  | { type: CellType.Idle; color: Color; id: string }
  | { type: CellType.Clicked; color: Color; id: string };

function clickCell(cell: Cell): Cell {
  if (cell.type === CellType.Idle) {
    return {
      ...cell,
      type: CellType.Clicked,
    };
  } else {
    return cell;
  }
}

function mutateCell(cell: Cell, x: number, y: number, matrix: Matrix): Cell {
  if (cell.type === CellType.Spawning) {
    return {
      ...cell,
      type: CellType.Idle,
    };
  }

  return cell;
}

function fillGaps(matrix: Matrix): Matrix {
  return matrix.map((col) => {
    const filteredRows = col.filter((cell) => cell.type !== CellType.Clicked);
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
      return cell.type === CellType.Clicked || cell.type === CellType.Spawning;
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
    <div className="relative w-[375px] h-[700px] mx-auto acceleration overflow-hidden select-none">
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
          } else if (cell.type === CellType.Idle) {
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
          }
        })
      )}
    </div>
  );
}

export default FunctionalUniphaser;
