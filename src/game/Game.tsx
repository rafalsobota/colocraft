import { useCallback, useState } from "react";
import { LightningBoltIcon, StarIcon } from "@heroicons/react/solid";
import { positionDeltaToDirection, useEngine } from "./Engine";
import Summary from "./Summary";
import { CellView } from "./CellView";
import { movesToReplayId } from "./encoding";
import { formatDate } from "./random";
import { makeReplayMessage, makeReplayPath } from "./Replay";
import { useNavigate } from "react-router-dom";

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

  const navigate = useNavigate();

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
    },
    [onPressStart]
  );

  const onTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      onPressMove(event.touches[0].clientX, event.touches[0].clientY);
    },
    [onPressMove]
  );
  const onTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      onPressEnd(
        event.changedTouches[0].clientX,
        event.changedTouches[0].clientY
      );
    },
    [onPressEnd]
  );

  const onReplay = useCallback(() => {
    const replayId = movesToReplayId(previousMoves);
    navigate(makeReplayPath(formatDate(new Date()), replayId));
  }, [previousMoves, navigate]);

  const onCopyReplayLink = useCallback(() => {
    const message = makeReplayMessage(
      formatDate(new Date()),
      movesToReplayId(previousMoves),
      score
    );
    navigator.clipboard.writeText(message);
  }, [previousMoves, score]);

  return (
    <div className="flex flex-col justify-center w-full h-full text-center">
      <div
        className="relative w-[375px] h-[700px] mx-auto transform-gpu select-none"
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

        {cells.map(({ cell, x, y }) => {
          return (
            <CellView
              key={cell.id}
              cell={cell}
              x={x}
              y={y}
              isInteractive={isInteractive}
              transitionDuration={300}
              finished={finished}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Game;
