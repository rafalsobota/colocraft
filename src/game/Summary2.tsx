import { ExternalLinkIcon } from "@heroicons/react/solid";
import { useEffect, useRef } from "react";
import QRCode from "react-qr-code";
import { bgColor } from "./color";
import { Graveyard, graveyardStats } from "./graveyard";

type SummaryProps = {
  isOpen: boolean;
  score: number;
  onPlay: () => void;
  onWatchReplay: () => void;
  onCopyReplayLink: () => void;
  link: string;
  dateString: string;
  graveyard: Graveyard;
};

function classNames(...args: string[]) {
  return args.filter(Boolean).join(" ");
}

export default function Summary2({
  link,
  isOpen,
  score,
  onPlay,
  onWatchReplay,
  onCopyReplayLink,
  dateString,
  graveyard,
}: SummaryProps) {
  const scoreRef = useRef(score);
  useEffect(() => {
    if (score > 0) {
      scoreRef.current = score;
    }
  }, [score]);

  return (
    <div
      className={classNames(
        isOpen ? "block" : `opacity-0 hidden`,
        `transition-all ease-in-out transform w-full text-slate-700 dark:text-slate-400 absolute z-10 h-[630px]`
      )}
    >
      {/* <div className="p-2 text-sky-200 dark:text-sky-500 absolute top-[0px] text-6xl font-extralight w-full text-center opacity-10">
        {dateString}
      </div> */}

      {/* <div className="p-2 text-sky-200 dark:text-sky-500 absolute top-[260px] left-[-250px] text-8xl font-semibold w-[600px] text-center opacity-10 -rotate-90">
        {dateString}
      </div> */}

      <div className="flex flex-col items-center justify-center absolute top-[340px] z-20 left-0 right-0 py-3">
        {/* <div className="flex flex-row items-center"> */}
        {/* <StarIcon className="h-16 mt-1 mr-1 text-green-500 " /> */}
        <div className="font-semibold text-black bg-white bg-opacity-50 text-7xl dark:bg-opacity-50 dark:bg-slate-900 dark:text-white backdrop-blur-sm">
          {scoreRef.current}
        </div>
        <div className="text-sm text-left text-sky-200 dark:text-sky-500">
          {dateString}
        </div>
        {/* </div> */}
        {/* 
        <div className="flex flex-row items-center px-2 bg-white rounded-md bg-opacity-70 dark:bg-slate-900 backdrop-blur-sm">
          <div>
            <StarIcon className="h-5 mr-2 text-green-500" />
          </div>
          <div className="text-black dark:text-white">Score</div>
        </div> */}
      </div>

      {isOpen ? (
        <div className="px-4 absolute bottom-[280px] w-full opacity-100">
          <div
            className="flex flex-row justify-center origin-bottom"
            // style={{
            //   transform: "perspective(1000px) rotateX(45deg)",
            // }}
          >
            {graveyardStats(graveyard).map(({ type, color, count }) => {
              return count < 1 ? null : (
                <div className="flex flex-col-reverse">
                  {Array(count).fill(
                    <div
                      className={`${
                        type === "bomb" ? "rounded-full" : ""
                      } ${bgColor(color)} ${"w-2 h-2 m-1"}`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="flex flex-row p-4 space-x-4 mt-[290px] absolute bottom-0 w-full">
        <a href={link} target="_blank" rel="noreferrer">
          <div className="">
            <QRCode
              bgColor="#0f172a"
              // fgColor="#ec4899"
              fgColor="#fff"
              size={110}
              title="Replay"
              value={link}
            />

            <div className="flex flex-row items-center pt-1 text-sm text-sky-500">
              <ExternalLinkIcon className="h-4 mr-1" />
              Link to replay
            </div>
          </div>
        </a>
        <div className="flex flex-col flex-grow space-y-4">
          <button
            className="px-8 py-4 border rounded-xl border-sky-500 text-sky-500 backdrop-blur-md"
            onClick={onWatchReplay}
          >
            Watch Replay
          </button>
          <button
            className="px-8 py-4 text-white bg-sky-500 rounded-xl"
            onClick={onPlay}
          >
            Play
          </button>
        </div>
      </div>
    </div>
  );
}
