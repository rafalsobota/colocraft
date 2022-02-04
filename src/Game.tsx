import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const margin = 10;
const size = 80;
const rows = 10;
const cols = 10;

const marginTop = (y: number) => {
  return y * (size + margin);
};

const marginLeft = (x: number) => {
  return x * (size + margin);
};

const colors = ["purple", "green", "blue", "yellow", "pink"] as const;

function bg(color: Color): string {
  // bg-purple-500 bg-green-500 bg-blue-500 bg-yellow-500 bg-pink-500
  return `bg-${color}-500`;
}

type Color = typeof colors[number];

function randomElement<T>(elements: readonly T[]): T {
  return elements[Math.round(Math.random() * (elements.length - 1))];
}

function randomColor(): Color {
  return randomElement(colors);
}

type Cell = { id: string; color: Color };

type Matrix = Cell[][];

function createCell(): Cell {
  return {
    id: Math.round(Math.random() * 1000000).toString(),
    color: randomColor(),
  };
}

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

function CellView({
  cell,
  x,
  y,
  onClick,
}: {
  cell: Cell;
  x: number;
  y: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        top: -marginTop(1),
        left: marginLeft(x),
        width: size,
        height: size,
      }}
      onClick={onClick}
      animate={{
        opacity: 1,
        left: marginLeft(x),
        top: marginTop(y),
        width: size,
        height: size,
        scale: 1,
        borderRadius: "20%",
      }}
      whileHover={{
        scale: 0.95,
      }}
      exit={{ opacity: 1, scale: 0.5 }}
      className={`absolute text-5xl leading-normal text-center text-blue-900 rounded-lg cursor-pointer ${bg(
        cell.color
      )}`}
    >
      {/* {props.color} */}
    </motion.div>
  );
}

function refill(matrix: Matrix): Matrix {
  return matrix.map((col) => {
    const lackingCellsCount = cols - col.length;
    return [...Array(lackingCellsCount).fill(createCell()), ...col];
  });
}

function deleteCell(matrix: Matrix, id: string): Matrix {
  return refill(matrix.map((row, y) => row.filter((cell) => cell.id !== id)));
}

const Game = () => {
  const [matrix, setMatrix] = useState(createMatrix());

  const onDeleteCell = (id: string) => {
    setMatrix(deleteCell(matrix, id));
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {matrix.map((col, x) =>
          col.map((cell, y) => (
            <CellView
              key={cell.id}
              cell={cell}
              x={x}
              y={y}
              onClick={() => onDeleteCell(cell.id)}
            />
          ))
        )}
      </AnimatePresence>
    </div>
  );
};

export default Game;
