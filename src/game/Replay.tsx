import React, { useCallback } from "react";
import { useParams } from "react-router-dom";
import { LightningBoltIcon, StarIcon } from "@heroicons/react/solid";
import Summary from "./Summary";
import { CellView } from "./CellView";
import useReplayEngine from "./ReplayEngine";
import { replayIdToMoves } from "./encoding";

function Replay() {
  const { replay } = useParams();
  const {
    cells,
    score,
    isInteractive,
    movesLeft,
    finished,
    restart,
    previousMoves,
  } = useReplayEngine({
    moves: replay ? replayIdToMoves(replay) : [],
  });

  const onRestart = useCallback(() => {
    window.location.pathname = "/";
  }, []);

  return (
    <div className="flex flex-col justify-center w-full h-full text-center">
      <div className="relative w-[375px] h-[700px] mx-auto transform-gpu select-none">
        <Summary
          isOpen={finished}
          onReplay={restart}
          onRestart={onRestart}
          score={score}
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

        <div className="absolute top-[650px] left-0 p-1 w-full flex flex-row text-slate-500 dark:text-slate-400 antialiased items-center">
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
        </div>

        {cells.map(({ cell, x, y }) => {
          return (
            <CellView
              key={cell.id}
              cell={cell}
              x={x}
              y={y}
              isInteractive={isInteractive}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Replay;
