import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

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

function colorClass(cell: Cell): string {
  // bg-purple-500 bg-green-500 bg-blue-500 bg-yellow-500 bg-pink-500
  // text-purple-500 text-green-500 text-blue-500 text-yellow-500 text-pink-500
  // bg-purple-50 bg-green-50 bg-blue-50 bg-yellow-50 bg-pink-50
  return cell.score > 0
    ? `bg-${cell.color}-100 text-${cell.color}-500`
    : `bg-${cell.color}-500`;
}

type Color = typeof colors[number];

function randomElement<T>(elements: readonly T[]): T {
  return elements[Math.round(Math.random() * (elements.length - 1))];
}

function randomColor(): Color {
  return randomElement(colors);
}

type Cell = { id: string; color: Color; deleted?: true; score: number };

type Matrix = Cell[][];

function createCell(): Cell {
  return {
    id: Math.round(Math.random() * 100000000).toString(),
    color: randomColor(),
    score: 0,
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
      animate={
        cell.score > 0
          ? {
              opacity: 0,
              left: marginLeft(x),
              top: marginTop(y),
              width: size,
              height: size,
              // scale: 2,
            }
          : {
              opacity: 1,
              left: marginLeft(x),
              top: marginTop(y),
              width: size,
              height: size,
              scale: cell.deleted ? 0 : 1,
              borderRadius: cell.deleted ? "50%" : "20%",
              rotate: cell.deleted ? 90 : 0,
            }
      }
      whileHover={{
        scale: cell.deleted ? 0 : 0.95,
        rotate: cell.deleted ? 90 : 0,
        borderRadius: cell.deleted ? "50%" : "20%",
        opacity: cell.deleted ? 0 : 1,
      }}
      exit={
        cell.score > 0
          ? {
              opacity: 0,
              left: marginLeft(x),
              top: marginTop(y),
              width: size,
              height: size,
              // scale: 2,
            }
          : {
              opacity: 0,
              scale: 0,
              rotate: 90,
              borderRadius: "50%",
              left: marginLeft(x),
              top: marginTop(y),
              width: size,
              height: size,
            }
      }
      className={`absolute text-5xl leading-normal text-center rounded-lg cursor-pointer ${colorClass(
        cell
      )}`}
    >
      {cell.score > 0 ? cell.score : ""}
    </motion.div>
  );
}

function refill(matrix: Matrix): Matrix {
  return matrix.map((col) => {
    const lackingCellsCount = cols - col.length;
    return [
      ...Array(lackingCellsCount)
        .fill(null)
        .map(() => createCell()),
      ...col,
    ];
  });
}

function applyDeletions(matrix: Matrix): Matrix {
  return matrix.map((col) => {
    return col.filter((cell) => {
      return !cell.deleted;
    });
  });
}

function deleteCell(matrix: Matrix, id: string): Matrix {
  return matrix.map((row, y) =>
    row.map((cell) => (cell.id === id ? { ...cell, deleted: true } : cell))
  );
}

function score4x1(matrix: Matrix): Matrix {
  for (let x = 0; x < cols - 3; x++) {
    for (let y = 0; y < rows; y++) {
      const cell = matrix[x][y];
      const color = cell.color;
      const matchingCell = (c: Cell): boolean => {
        return c.color === color;
      };

      if (
        matchingCell(matrix[x + 1][y]) &&
        matchingCell(matrix[x + 2][y]) &&
        matchingCell(matrix[x + 3][y])
      ) {
        matrix[x][y].score += 1;
        matrix[x + 1][y].score += 1;
        matrix[x + 2][y].score += 1;
        matrix[x + 3][y].score += 1;
      }
    }
  }
  return [...matrix];
}

function score1x4(matrix: Matrix): Matrix {
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows - 3; y++) {
      const cell = matrix[x][y];
      const color = cell.color;
      const matchingCell = (c: Cell): boolean => {
        return c.color === color;
      };

      if (
        matchingCell(matrix[x][y + 1]) &&
        matchingCell(matrix[x][y + 2]) &&
        matchingCell(matrix[x][y + 3])
      ) {
        matrix[x][y].score += 1;
        matrix[x][y + 1].score += 1;
        matrix[x][y + 2].score += 1;
        matrix[x][y + 3].score += 1;
      }
    }
  }
  return [...matrix];
}

function calculateScore(matrix: Matrix): number {
  return matrix.reduce((acc, row) => {
    return (
      acc +
      row.reduce((acc, cell) => {
        return acc + cell.score;
      }, 0)
    );
  }, 0);
}

function deleteScored(matrix: Matrix): Matrix {
  return matrix.map((col) => {
    return col.map((cell) => {
      return cell.score > 0 ? { ...cell, deleted: true } : cell;
    });
  });
}

type GameState =
  | { type: "intro" }
  | { type: "finished"; score: number }
  | { type: "play"; startedAt: number };

const PlayMode = ({
  startedAt,
  onFinish,
}: {
  startedAt: number;
  onFinish: (score: number) => void;
}) => {
  const [matrix, setMatrix] = useState(createMatrix());
  const [score, setScore] = useState(0);

  const loop = useCallback(() => {
    const newMatrix = score1x4(
      score4x1(refill(applyDeletions(deleteScored(matrix))))
    );
    const newScore = calculateScore(newMatrix);
    setScore(score + newScore);
    setMatrix(newMatrix);
  }, [matrix, setMatrix, score, setScore]);

  useEffect(() => {
    const interval = setInterval(() => loop(), 100);
    return () => clearInterval(interval);
  }, [loop]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onFinish(score);
    }, startedAt + 60000 - Date.now());
    return () => clearTimeout(timeout);
  }, [score, onFinish, startedAt]);

  const onDeleteCell = (id: string) => {
    setMatrix(deleteCell(matrix, id));
  };

  const secondsLeft = Math.round((startedAt + 60000 - Date.now()) / 1000);

  return (
    <div className="relative">
      <motion.div
        animate={{ opacity: secondsLeft > 1 ? 1 : 0 }}
        transition={{ duration: 1, ease: "easeIn" }}
      >
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
      </motion.div>
      <div className="absolute text-5xl top-[900px] w-full text-center text-green-500">
        {score}
      </div>
      {secondsLeft > 5 ? (
        <div className="absolute text-3xl top-[950px] w-full text-center text-gray-200">
          {secondsLeft} s
        </div>
      ) : (
        <div className="absolute text-3xl top-[950px] w-full text-center text-red-500">
          {secondsLeft} s
        </div>
      )}
    </div>
  );
};

const Game = () => {
  const [state, setState] = useState<GameState>({
    type: "play",
    startedAt: Date.now(),
  });

  const onStart = useCallback(() => {
    setState({ type: "play", startedAt: Date.now() });
  }, [setState]);

  if (state.type === "intro") {
    return (
      <div className="text-center">
        <button
          onClick={onStart}
          className="px-4 py-2 m-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 active:bg-blue-700"
        >
          Start
        </button>
      </div>
    );
  } else if (state.type === "play") {
    return (
      <PlayMode
        startedAt={state.startedAt}
        onFinish={(score) => {
          setState({ type: "finished", score });
        }}
      />
    );
  } else {
    return (
      <div className="relative text-center">
        <div className="text-2xl absolute top-[860px] text-green-500 text-center w-full">
          Congratulations, you finished with {state.score} points!
        </div>
        <div className="text-5xl absolute top-[900px] text-green-500 text-center w-full">
          {state.score}
        </div>
        <div className="absolute top-[1000px] text-center w-full">
          <button
            onClick={onStart}
            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 active:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
};

export default Game;
