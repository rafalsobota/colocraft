import React, { useCallback } from "react";
import { useParams } from "react-router-dom";
import { LightningBoltIcon, StarIcon } from "@heroicons/react/solid";
import { CellView } from "./CellView";
import useReplayEngine from "./ReplayEngine";
import { replayIdToMoves } from "./encoding";
import ReplaySummary from "./Summary";

function Replay() {
  const { movesId, dateString } = useParams();
  const { cells, score, isInteractive, movesLeft, finished, restart } =
    useReplayEngine({
      moves: movesId ? replayIdToMoves(movesId) : [],
      interval: 300,
      dateString,
    });

  const onRestart = useCallback(() => {
    window.location.pathname = "/";
  }, []);

  const onCopyReplayLink = useCallback(() => {
    navigator.clipboard.writeText(`${window.location.href}`);
  }, []);

  return (
    <div className="flex flex-col justify-center w-full h-full text-center">
      <div className="relative w-[375px] h-[700px] mx-auto transform-gpu select-none overflow-x-clip">
        <ReplaySummary
          isOpen={finished}
          onWatchReplay={restart}
          onPlay={onRestart}
          score={score}
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
              transitionDuration={400}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Replay;
