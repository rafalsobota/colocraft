import { ReactElement, useCallback, useEffect, useRef, useState } from "react";

enum CellColor {
  Blue,
  Green,
  Yellow,
  Pink,
  Purple,
}

function bgColor(color: CellColor): string {
  switch (color) {
    case CellColor.Blue:
      return "bg-blue-500 hover:bg-blue-600";
    case CellColor.Green:
      return "bg-green-500 hover:bg-green-600";
    case CellColor.Yellow:
      return "bg-yellow-500 hover:bg-yellow-600";
    case CellColor.Pink:
      return "bg-pink-500 hover:bg-pink-600";
    case CellColor.Purple:
      return "bg-purple-500 hover:bg-purple-600";
  }
}

function colorToString(color: CellColor): string {
  switch (color) {
    case CellColor.Blue:
      return "blue";
    case CellColor.Green:
      return "green";
    case CellColor.Yellow:
      return "yellow";
    case CellColor.Pink:
      return "pink";
    case CellColor.Purple:
      return "purple";
  }
}

type Matrix = Cell[][];

interface Cell {
  id: string;
  render(x: number, y: number, matrix: Matrix): ReactElement;
  tick(x: number, y: number, matrix: Matrix): Cell | null;
  canProgress: boolean;
  onClick(): Cell;
  consumableColor?: CellColor;
}

interface Context {
  addScore: (score: number) => void;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}

type ContextRef = React.MutableRefObject<Context | null>;

const cellClassName = `absolute w-[80px] h-[80px] rounded-md transition-all ease-in hover:scale-105`;

class SpawningCell implements Cell {
  constructor(context: ContextRef) {
    this.context = context;
    this.color = Math.round(Math.random() * 4);
    this.id = `${colorToString(this.color)}-${Math.round(
      Math.random() * 100000000
    )}`;
  }

  public id: string;
  private color: CellColor;
  private context: ContextRef;

  render(x: number, y: number, matrix: Matrix): ReactElement {
    return (
      <div
        className={`${cellClassName} ${bgColor(this.color)} opacity-0`}
        style={{ top: -100, left: x * 100 }}
      />
    );
  }

  tick(x: number, y: number, matrix: Matrix): Cell | null {
    return new IdleCell(this.context, this.color, this.id);
  }

  canProgress: boolean = true;

  onClick(): Cell {
    return this;
  }
}

class IdleCell implements Cell {
  constructor(context: ContextRef, color: CellColor, id: string) {
    this.context = context;
    this.color = color;
    this.id = id;
  }

  public id: string;
  private color: CellColor;
  private context: ContextRef;

  render(x: number, y: number, matrix: Matrix): ReactElement {
    return (
      <div
        key={this.id}
        className={`${cellClassName} ${bgColor(this.color)}`}
        style={{ top: y * 100, left: x * 100 }}
        onClick={this.context.current?.onClick}
        data-id={this.id}
      />
    );
  }

  tick(x: number, y: number, matrix: Matrix): Cell | null {
    // detect combo
    return this;
  }

  canProgress: boolean = false;

  onClick(): Cell {
    return new DeletedCell(this.context, this.color, this.id);
  }
}

class DeletedCell implements Cell {
  constructor(context: ContextRef, color: CellColor, id: string) {
    this.context = context;
    this.color = color;
    this.id = id;
  }

  public id: string;

  private color: CellColor;
  private context: ContextRef;

  render(x: number, y: number, matrix: Matrix): ReactElement {
    return (
      <div
        className={`${cellClassName} ${bgColor(
          this.color
        )} opacity-0 rounded-full rotate-180 scale-50`}
        style={{ top: y * 100, left: x * 100 }}
      />
    );
  }

  tick(x: number, y: number, matrix: Matrix): Cell | null {
    this.context.current?.addScore(1);
    return null;
  }

  canProgress: boolean = true;

  onClick(): Cell {
    return this;
  }
}

function createMatrix(contextRef: ContextRef) {
  const matrix: Matrix = [];
  for (let i = 0; i < 10; i++) {
    matrix.push([]);
    for (let j = 0; j < 10; j++) {
      matrix[i].push(new SpawningCell(contextRef));
    }
  }
  return matrix;
}

function Uniphaser() {
  const [score, setScore] = useState(0);
  const contextRef = useRef<Context | null>(null);

  const [matrix, setMatrix] = useState<Matrix>(createMatrix(contextRef));

  const addScore = useCallback(
    (newScore: number) => {
      setScore(score + newScore);
    },
    [score, setScore]
  );

  const onClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const id = event.currentTarget.dataset.id;
      if (!id) return;
      setMatrix(
        matrix.map((col, x) =>
          col.map((cell, y) => {
            return cell.id === id ? cell.onClick() : cell;
          })
        )
      );
    },
    [matrix, setMatrix]
  );

  useEffect(() => {
    if (!contextRef.current) {
      contextRef.current = {} as any;
    }
    contextRef.current!.addScore = addScore;
    (contextRef.current as any)._onClick = onClick;

    if (!contextRef.current!.onClick) {
      contextRef.current!.onClick = (
        event: React.MouseEvent<HTMLDivElement>
      ) => {
        (contextRef.current as any)?._onClick(event);
      };
    }
  }, [score, setScore, matrix, setMatrix]);

  useEffect(() => {}, []);

  return (
    <div className="relative">
      {matrix.map((col, x) => {
        return col.map((cell, y) => {
          return <div key={cell.id}>{cell.render(x, y, matrix)}</div>;
        });
      })}
    </div>
  );
}

export default Uniphaser;
