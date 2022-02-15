import { ExternalLinkIcon } from "@heroicons/react/solid";
import { useEffect, useRef } from "react";
import QRCode from "react-qr-code";
import { bgColor } from "./color";
import { Graveyard, graveyardStats } from "./graveyard";
import "./Summary2.css";

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
        isOpen
          ? "bg-opacity-90 dark:bg-opacity-90 z-10"
          : `opacity-0 bg-opacity-0 dark:bg-opacity-0`,
        `transition-all ease-in-out w-full text-slate-700 dark:text-slate-400 absolute h-[630px] bg-white dark:bg-slate-900`
      )}
    >
      <div className="flex flex-col items-center justify-center absolute top-[340px] z-20 w-full">
        <div
          className="font-semibold text-black text-7xl dark:text-white score"
          style={{ "--num": isOpen ? scoreRef.current : 0 } as any}
        ></div>
        <div className="text-sm text-left text-sky-500">{dateString}</div>
      </div>

      {!isOpen ? null : (
        <>
          <div className="px-4 absolute bottom-[290px] w-full opacity-100">
            <div className="flex flex-row justify-center">
              {graveyardStats(graveyard).map(({ type, color, count }, j) => {
                return count < 1 ? null : (
                  <div className="flex flex-col-reverse">
                    {Array(Math.min(count, 25))
                      .fill(null)
                      .map((el, i) => (
                        <div
                          key={`${j}-${i}`}
                          className={`${
                            type === "bomb" ? "rounded-full" : ""
                          } ${bgColor(
                            color
                          )} w-2 h-2 m-1 animate-[drop_300ms_cubic-bezier(.48,1.6,.63,1.01)] opacity-0`}
                          style={{
                            animationDelay: `${i * 100 + j * 60}ms`,
                            animationFillMode: "forwards",
                          }}
                        ></div>
                      ))}
                  </div>
                );
              })}
            </div>
          </div>

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
        </>
      )}
    </div>
  );
}
