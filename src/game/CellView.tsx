import { bgColor } from "./color";
import { Cell, CellType, FusionDirection } from "./Engine";
import { slowMobileBrowser } from "./system";

export function CellView({
  cell,
  x,
  y,
  isInteractive,
  transitionDuration,
  finished,
}: {
  cell: Cell;
  x: number;
  y: number;
  isInteractive?: boolean;
  transitionDuration: number;
  finished: boolean;
}) {
  const cursorClass = isInteractive ? "cursor-grab active:cursor-grabbing" : "";
  const finishedClasses = finished
    ? "scale-50 opacity-5 blur-md"
    : "scale-100 ease-spring";

  const styles = {
    top: cell.type === CellType.Spawning ? -75 + 2 : y * 75 + 2,
    left: finished ? cell.color * 75 + 2 : x * 75 + 2,
    transitionDuration: transitionDuration + "ms",
  };

  if (cell.type === CellType.Spawning) {
    return (
      <div
        data-id={cell.id}
        className={`absolute ${bgColor(
          cell.color
        )} rounded-xl w-[70px] h-[70px] transition-all ease-spring transform ${
          slowMobileBrowser() ? "" : "opacity-0"
        }`}
        style={styles}
      ></div>
    );
  } else if (cell.type === CellType.Dropped || cell.type === CellType.Idle) {
    return (
      <div
        data-id={cell.id}
        className={`absolute ${bgColor(
          cell.color
        )} rounded-xl w-[70px] h-[70px] ${cursorClass} opacity-1 transform transition-all ${finishedClasses}`}
        style={styles}
      ></div>
    );
  } else if (cell.type === CellType.Clicked) {
    return (
      <div
        data-id={cell.id}
        className={`absolute ${bgColor(
          cell.color
        )} rounded-xl w-[70px] h-[70px] opacity-0 scale-0 transition-all transform ease-spring`}
        style={styles}
      ></div>
    );
  } else if (cell.type === CellType.Fusion) {
    return (
      <div
        data-id={cell.id}
        className={`absolute ${bgColor(cell.color)} transform rounded-xl ${
          cell.direction === FusionDirection.Horizontal
            ? "w-[90px] h-[0px] ml-[-10px] mt-[35px]"
            : "w-[0px] h-[90px] ml-[35px] mt-[-10px]"
        } opacity-1 scale-100 transition-all ease-spring`}
        style={styles}
      ></div>
    );
  } else if (cell.type === CellType.ScoreEnter) {
    return (
      <div
        data-id={cell.id}
        className={`absolute ${bgColor(
          cell.color
        )} bg-transparent text-4xl font-bold rounded-xl transform w-[70px] h-[70px] scale-1 transition-all ease-spring`}
        style={styles}
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
        )} bg-transparent text-8xl font-bold transform rounded-xl w-[70px] h-[70px] opacity-0 transition-all ease-spring`}
        style={styles}
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
        )} rounded-full w-[70px] h-[70px] ${cursorClass} transition-all ease-spring transform`}
        style={styles}
      ></div>
    );
  } else if (cell.type === CellType.BombIgnited) {
    return (
      <div
        data-id={cell.id}
        className={`absolute ${bgColor(
          cell.color
        )} rounded-full w-[70px] h-[70px] opacity-1 transition-all ease-spring scale-50 animate-pulse transform`}
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
        )} rounded-sm w-[70px] h-[70px] opacity-1 transition-all ease-spring opacity-0 scale-[3] transform`}
        style={styles}
      ></div>
    );
  } else {
    return <></>;
  }
}
