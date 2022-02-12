import { useCallback, useState } from "react";
import { LightningBoltIcon, StarIcon } from "@heroicons/react/solid";
import { positionDeltaToDirection, useEngine } from "./Engine";
import Summary from "./Summary";
import { CellView } from "./CellView";
import { movesToReplayId } from "./encoding";
import { formatDate } from "./random";

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
    previousMoves,
  } = useEngine({ interval: 100 });

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
      event.preventDefault();
      event.stopPropagation();
    },
    [onPressStart]
  );

  const onMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onPressMove(event.clientX, event.clientY);
      event.preventDefault();
      event.stopPropagation();
    },
    [onPressMove]
  );

  const onMouseUp = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onPressEnd(event.clientX, event.clientY);
      event.preventDefault();
      event.stopPropagation();
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

  const preventDefault = useCallback((event: any) => {
    event.preventDefault();
    event.stopPopagation();
  }, []);

  const onReplay = useCallback(() => {
    const replayId = movesToReplayId(previousMoves);
    window.location.pathname = `/replay/${formatDate(new Date())}/${replayId}`;
  }, [previousMoves]);

  const onCopyReplayLink = useCallback(() => {
    const replayId = movesToReplayId(previousMoves);
    navigator.clipboard.writeText(
      `${window.location.href}/replay/${formatDate(new Date())}/${replayId}`
    );
  }, [previousMoves]);

  return (
    <div className="flex flex-col justify-center w-full h-full text-center">
      <div
        className="relative w-[375px] h-[700px] mx-auto transform-gpu select-none overflow-x-clip"
        onTouchStartCapture={preventDefault}
        onTouchEndCapture={preventDefault}
        onTouchMoveCapture={preventDefault}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <Summary
          isOpen={finished}
          onPlay={restart}
          score={score}
          onWatchReplay={onReplay}
          onCopyReplayLink={onCopyReplayLink}
        />
        <div className="absolute top-[600px] left-0 p-1 w-full flex flex-row text-slate-500 dark:text-slate-400 antialiased items-center">
          <StarIcon className="h-5 mx-1 text-green-500" />
          <div className="flex-grow text-left text-slate-800 dark:text-slate-100">
            {score}
          </div>
          <LightningBoltIcon className={`h-4 text-yellow-500`} />
          <div>
            <span className="mx-1 text-slate-800 dark:text-slate-100">
              {movesLeft}
            </span>{" "}
          </div>
        </div>

        {/* <div className="absolute top-[650px] left-0 p-1 w-full flex flex-row text-slate-500 dark:text-slate-400 antialiased items-center">
          <ul>
            {[...previousMoves].map((move, i) => (
              <li key={i}>
                {move.x}:{move.y}{" "}
                {move.direction
                  ? ["tap", "up", "down", "left", "right"][move.direction]
                  : "tap"}
              </li>
            ))}
          </ul>
        </div> */}

        {cells.map(({ cell, x, y }) => {
          return (
            <CellView
              key={cell.id}
              cell={cell}
              x={x}
              y={y}
              isInteractive={isInteractive}
              transitionDuration={300}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Game;
