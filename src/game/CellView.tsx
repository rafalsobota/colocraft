import { Cell, CellType, Color, FusionDirection } from "./Engine";
import { slowMobileBrowser } from "./system";

function bgColor(color: Color): string {
  switch (color) {
    case Color.Blue:
      return "bg-sky-500 active:bg-sky-600 text-sky-600";
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

export function CellView({
  cell,
  x,
  y,
  isInteractive,
  transitionDuration,
}: {
  cell: Cell;
  x: number;
  y: number;
  isInteractive?: boolean;
  transitionDuration: number;
}) {
  const cursorClass = isInteractive ? "cursor-grab active:cursor-grabbing" : "";

  if (cell.type === CellType.Spawning) {
    return (
      <div
        data-id={cell.id}
        className={`absolute ${bgColor(
          cell.color
        )} rounded-xl w-[70px] h-[70px] transition-all ease-spring ${
          slowMobileBrowser() ? "" : "opacity-0"
        }`}
        style={{
          top: -75 + 2,
          left: x * 75 + 2,
          transitionDuration: transitionDuration + "ms",
        }}
      ></div>
    );
  } else if (cell.type === CellType.Dropped || cell.type === CellType.Idle) {
    return (
      <div
        data-id={cell.id}
        className={`absolute ${bgColor(
          cell.color
        )} rounded-xl w-[70px] h-[70px] ${cursorClass} opacity-1 scale-100 transition-all ease-spring`}
        style={{
          top: y * 75 + 2,
          left: x * 75 + 2,
          transitionDuration: transitionDuration + "ms",
        }}
      ></div>
    );
  } else if (cell.type === CellType.Clicked) {
    return (
      <div
        data-id={cell.id}
        className={`absolute ${bgColor(
          cell.color
        )} rounded-xl w-[70px] h-[70px] opacity-0 scale-0 transition-all ease-spring`}
        style={{
          top: y * 75 + 2,
          left: x * 75 + 2,
          transitionDuration: transitionDuration + "ms",
        }}
      ></div>
    );
  } else if (cell.type === CellType.Fusion) {
    return (
      <div
        data-id={cell.id}
        className={`absolute ${bgColor(cell.color)} rounded-xl ${
          cell.direction === FusionDirection.Horizontal
            ? "w-[90px] h-[0px] ml-[-10px] mt-[35px]"
            : "w-[0px] h-[90px] ml-[35px] mt-[-10px]"
        } opacity-1 scale-100 transition-all ease-spring`}
        style={{
          top: y * 75 + 2,
          left: x * 75 + 2,
          transitionDuration: transitionDuration + "ms",
        }}
      ></div>
    );
  } else if (cell.type === CellType.ScoreEnter) {
    return (
      <div
        data-id={cell.id}
        className={`absolute ${bgColor(
          cell.color
        )} bg-transparent text-4xl font-bold rounded-xl w-[70px] h-[70px] scale-1 transition-all ease-spring`}
        style={{
          top: y * 75 + 2,
          left: x * 75 + 2,
          transitionDuration: transitionDuration + "ms",
        }}
      >
        {cell.score}
      </div>
    );
  } else if (cell.type === CellType.ScoreExit) {
    return (
      <div
        data-id={cell.id}
        className={`absolute ${bgColor(
          cell.color
        )} bg-transparent text-8xl font-bold rounded-xl w-[70px] h-[70px] opacity-0 transition-all ease-spring`}
        style={{
          top: y * 75 + 2,
          left: x * 75 + 2,
          transitionDuration: transitionDuration + "ms",
        }}
      >
        {cell.score}
      </div>
    );
  } else if (cell.type === CellType.Bomb) {
    return (
      <div
        data-id={cell.id}
        className={`absolute ${bgColor(
          cell.color
        )} rounded-full w-[70px] h-[70px] ${cursorClass} transition-all ease-spring`}
        style={{
          top: y * 75 + 2,
          left: x * 75 + 2,
          transitionDuration: transitionDuration + "ms",
        }}
      ></div>
    );
  } else if (cell.type === CellType.BombIgnited) {
    return (
      <div
        data-id={cell.id}
        className={`absolute ${bgColor(
          cell.color
        )} rounded-full w-[70px] h-[70px] opacity-1 transition-all ease-spring scale-50 animate-pulse`}
        style={{
          top: y * 75 + 2,
          left: x * 75 + 2,
        }}
      ></div>
    );
  } else if (cell.type === CellType.BombDetonated) {
    return (
      <div
        data-id={cell.id}
        className={`absolute ${bgColor(
          cell.color
        )} rounded-sm w-[70px] h-[70px] opacity-1 transition-all ease-spring opacity-0 scale-[3]`}
        style={{
          top: y * 75 + 2,
          left: x * 75 + 2,
          transitionDuration: transitionDuration + "ms",
        }}
      ></div>
    );
  } else {
    return <></>;
  }
}
