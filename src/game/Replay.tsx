import React, { useCallback, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LightningBoltIcon, PlayIcon, StarIcon } from "@heroicons/react/solid";
import { CellView } from "./CellView";
import useReplayEngine from "./ReplayEngine";
import { replayIdToMoves } from "./encoding";
import { formatDate } from "./random";
import Summary2 from "./Summary2";

export function makeReplayHref(dateString: string, movesId: string) {
  return `${window.location.protocol}//${window.location.host}${makeReplayPath(
    dateString,
    movesId
  )}`;
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

  const [slowmo, setSlowmo] = useState(false);

  const {
    cells,
    score,
    isInteractive,
    movesLeft,
    finished,
    restart,
    graveyard,
  } = useReplayEngine({
    moves: movesId ? replayIdToMoves(movesId) : [],
    interval: slowmo ? 300 : 150,
    dateString,
  });

  const navigate = useNavigate();

  const onRestart = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const replayLink = useMemo(() => {
    if (!movesId) return "";
    return makeReplayHref(dateString || formatDate(new Date()), movesId);
  }, [movesId, dateString]);

  const onCopyReplayLink = useCallback(() => {
    if (!movesId) return;
    const message = makeReplayMessage(
      dateString || formatDate(new Date()),
      movesId,
      score
    );
    navigator.clipboard.writeText(message);
  }, [movesId, score, dateString]);

  const onPressStart = useCallback(() => {
    setSlowmo(true);
  }, []);

  const onPressEnd = useCallback(() => {
    setSlowmo(false);
  }, []);

  return (
    <div className="flex flex-col justify-center w-full h-full text-center">
      <div
        className="relative w-[375px] h-[700px] mx-auto transform-gpu select-none"
        onMouseDown={onPressStart}
        onMouseUp={onPressEnd}
        onTouchStart={onPressStart}
        onTouchEnd={onPressEnd}
      >
        <Summary2
          isOpen={finished}
          onWatchReplay={restart}
          onPlay={onRestart}
          score={score}
          onCopyReplayLink={onCopyReplayLink}
          link={replayLink}
          dateString={dateString || formatDate(new Date())}
          graveyard={graveyard}
        />
        <div
          className={`absolute top-[600px] left-0 p-1 w-full flex flex-row text-slate-500 dark:text-slate-400 antialiased items-center ${
            finished ? "opacity-0" : ""
          }`}
        >
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
              transitionDuration={slowmo ? 600 : 300}
              finished={finished}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Replay;
