import { bgColor } from "./color";
import { Cell, CellType, FusionDirection } from "./Engine";
import { slowMobileBrowser } from "./system";
import "./CellView.css";

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
  const finishedClasses = finished ? "scale-50" : "";

  const styles = {
    "--tw-translate-y": `${
      cell.type === CellType.Spawning ? -75 + 2 : y * 75 + 2
    }px`,
    "--tw-translate-x": `${finished ? cell.color * 75 + 2 : x * 75 + 2}px`,
    transitionDuration: transitionDuration + "ms",
  };

  if (cell.type === CellType.Spawning) {
    return (
      <div
        data-id={cell.id}
        className={`cell ${bgColor(cell.color)}  ${
          slowMobileBrowser() ? "" : "opacity-0"
        }`}
        style={styles}
      ></div>
    );
  } else if (cell.type === CellType.Dropped || cell.type === CellType.Idle) {
    return (
      <div
        data-id={cell.id}
        className={`cell ${bgColor(cell.color)} ${finishedClasses}`}
        style={styles}
      ></div>
    );
  } else if (cell.type === CellType.Clicked) {
    return (
      <div
        data-id={cell.id}
        className={`cell ${bgColor(cell.color)} opacity-0 scale-0`}
        style={styles}
      ></div>
    );
  } else if (cell.type === CellType.Fusion) {
    return (
      <div
        data-id={cell.id}
        className={`cell ${bgColor(cell.color)} ${
          cell.direction === FusionDirection.Horizontal
            ? "scale-x-125 scale-y-0"
            : "scale-x-0 scale-y-125"
        }`}
        style={
          {
            ...styles,
            "--tw-scale-x":
              cell.direction === FusionDirection.Horizontal ? 1.25 : 0,
            "--tw-scale-y":
              cell.direction === FusionDirection.Horizontal ? 0 : 1.25,
          } as any
        }
      ></div>
    );
  } else if (cell.type === CellType.ScoreEnter) {
    return (
      <div
        data-id={cell.id}
        className={`cell ${bgColor(cell.color)} bg-opacity-0`}
        style={styles}
      >
        {cell.score}
      </div>
    );
  } else if (cell.type === CellType.ScoreExit) {
    return (
      <div
        data-id={cell.id}
        className={`cell ${bgColor(cell.color)} opacity-0 scale-150`}
        style={styles}
      >
        {cell.score}
      </div>
    );
  } else if (cell.type === CellType.Bomb) {
    return (
      <div
        data-id={cell.id}
        className={`cell ${bgColor(cell.color)} !rounded-full`}
        style={styles}
      ></div>
    );
  } else if (cell.type === CellType.BombIgnited) {
    return (
      <div
        data-id={cell.id}
        className={`cell ${bgColor(
          cell.color
        )} !rounded-full scale-50 animate-pulse`}
        style={styles}
      ></div>
    );
  } else if (cell.type === CellType.BombDetonated) {
    return (
      <div
        data-id={cell.id}
        className={`cell ${bgColor(cell.color)} opacity-0 scale-[3]`}
        style={styles}
      ></div>
    );
  } else {
    return <></>;
  }
}
