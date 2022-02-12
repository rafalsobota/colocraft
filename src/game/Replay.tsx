import React, { useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LightningBoltIcon, PlayIcon, StarIcon } from "@heroicons/react/solid";
import { CellView } from "./CellView";
import useReplayEngine from "./ReplayEngine";
import { replayIdToMoves } from "./encoding";
import ReplaySummary from "./Summary";
import { formatDate } from "./random";

export function makeReplayHref(dateString: string, movesId: string) {
  return `${window.location.protocol}//${window.location.host}${makeReplayPath(
    dateString,
    movesId
  )}`.replace("//", "/");
}

export function makeReplayPath(dateString: string, movesId: string) {
  return `/replay/${dateString}/${movesId}`;
}

export function makeReplayMessage(
  dateString: string,
  movesId: string,
  score: number
) {
  const replayLink = makeReplayHref(dateString, movesId);
  return `⭐ ${score} - ${replayLink}`;
}

function Replay() {
  const { movesId, dateString } = useParams();
  const { cells, score, isInteractive, movesLeft, finished, restart } =
    useReplayEngine({
      moves: movesId ? replayIdToMoves(movesId) : [],
      interval: 300,
      dateString,
    });

  const navigate = useNavigate();

  const onRestart = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const onCopyReplayLink = useCallback(() => {
    if (!movesId) return;
    const message = makeReplayMessage(
      dateString || formatDate(new Date()),
      movesId,
      score
    );
    navigator.clipboard.writeText(message);
  }, [movesId, score, dateString]);

  return (
    <div className="flex flex-col justify-center w-full h-full text-center">
      <div className="relative w-[375px] h-[700px] mx-auto transform-gpu select-none">
        <ReplaySummary
          isOpen={finished}
          onWatchReplay={restart}
          onPlay={onRestart}
          score={score}
          onCopyReplayLink={onCopyReplayLink}
        />
        <div className="absolute top-[600px] left-0 p-1 w-full flex flex-row text-slate-500 dark:text-slate-400 antialiased items-center">
          <StarIcon className="h-5 mx-1 text-green-500" />
          <div className="text-left text-slate-800 dark:text-slate-100">
            {score}
          </div>
          <div className="flex-grow"></div>
          <PlayIcon
            className={`h-5 mx-1 text-pink-500 ${
              finished ? "opacity-0" : "animate-pulse"
            }`}
          />
          <div
            className={`font-semibold text-pink-500 ${
              finished ? "opacity-0" : "animate-pulse"
            }`}
          >
            Replay
          </div>
          <div className="flex-grow"></div>
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
              finished={finished}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Replay;
