import { useCallback, useState } from "react";
import { HeartIcon, LightningBoltIcon } from "@heroicons/react/solid";
import {
  CellType,
  Color,
  FusionDirection,
  positionDeltaToDirection,
  useEngine,
} from "./Engine";
import Summary from "./Summary";

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

function Game() {
  const {
    cells,
    onCellSwipe,
    onCellClick,
    score,
    isInteractive,
    movesLeft,
    finished,
    restart,
  } = useEngine();

  console.log({ score, movesLeft });

  const [touchState, setTouchState] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);

  const onPressStart = useCallback(
    (id: string, x: number, y: number) => {
      setTouchState({ id, x, y });
    },
    [setTouchState]
  );

  const onPressMove = useCallback(
    (x: number, y: number) => {
      if (!touchState) return;
      const id = touchState.id;
      const dx = x - touchState.x;
      const dy = y - touchState.y;
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
        return;
      } else {
        onCellSwipe(id, positionDeltaToDirection(dx, dy));
        setTouchState(null);
      }
    },
    [touchState, onCellSwipe]
  );

  const onPressEnd = useCallback(
    (x: number, y: number) => {
      if (!touchState) return;
      const id = touchState.id;
      const dx = x - touchState.x;
      const dy = y - touchState.y;
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
        onCellClick(id);
      } else {
        onCellSwipe(id, positionDeltaToDirection(dx, dy));
      }
      setTouchState(null);
    },
    [touchState, setTouchState, onCellClick, onCellSwipe]
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
      const target = event.target as HTMLDivElement;
      const id = target.dataset.id;
      if (!id) return;
      onPressStart(id, event.touches[0].clientX, event.touches[0].clientY);
      event.preventDefault();
      event.stopPropagation();
    },
    [onPressStart]
  );

  const onTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      onPressMove(event.touches[0].clientX, event.touches[0].clientY);
      event.preventDefault();
      event.stopPropagation();
    },
    [onPressMove]
  );
  const onTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      onPressEnd(
        event.changedTouches[0].clientX,
        event.changedTouches[0].clientY
      );
      event.preventDefault();
      event.stopPropagation();
    },
    [onPressEnd]
  );

  const cursorClass = isInteractive ? "cursor-grab active:cursor-grabbing" : "";

  return (
    <div
      className="relative w-[375px] h-[700px] mx-auto transform-gpu select-none overflow-hidden sm:overflow-visible"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <Summary isOpen={finished} onRestart={restart} score={score} />
      <div className="absolute top-[600px] left-0 p-1 w-full flex flex-row text-slate-500 dark:text-slate-400 antialiased items-center">
        <HeartIcon className="h-5 mx-1 text-pink-500" />
        <div className="flex-grow text-left text-slate-800 dark:text-slate-100">
          {score}
        </div>
        <LightningBoltIcon className="h-4 text-yellow-500" />
        <div>
          <span className="mx-1 text-slate-800 dark:text-slate-100">
            {movesLeft}
          </span>{" "}
        </div>
      </div>

      {cells.map(({ cell, x, y }) => {
        if (cell.type === CellType.Spawning) {
          return (
            <div
              key={cell.id}
              data-id={cell.id}
              className={`absolute ${bgColor(
                cell.color
              )} rounded-xl w-[70px] h-[70px] transition-all ease-spring duration-300 opacity-0`}
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
              )} rounded-xl w-[70px] h-[70px] ${cursorClass} opacity-1 scale-100 transition-all ease-spring duration-300`}
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
              )} rounded-xl w-[70px] h-[70px] opacity-0 scale-0 transition-all ease-spring duration-300`}
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
              } opacity-1 scale-100 transition-all ease-spring duration-300`}
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
              )} bg-transparent text-4xl font-bold rounded-xl w-[70px] h-[70px] scale-1 transition-all ease-spring duration-300`}
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
              )} bg-transparent text-8xl font-bold rounded-xl w-[70px] h-[70px] opacity-0 transition-all ease-spring duration-300`}
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
              )} rounded-full w-[70px] h-[70px] ${cursorClass} transition-all ease-spring duration-300`}
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

export default Game;
