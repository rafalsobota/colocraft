import {
  CubeTransparentIcon,
  ExternalLinkIcon,
  StarIcon,
} from "@heroicons/react/solid";
import { useEffect, useRef } from "react";
import QRCode from "react-qr-code";

type SummaryProps = {
  isOpen: boolean;
  score: number;
  onPlay: () => void;
  onWatchReplay: () => void;
  onCopyReplayLink: () => void;
  link: string;
  dateString: string;
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
        isOpen ? "" : `opacity-0`,
        `transition-all ease-in-out transform w-full text-slate-700 dark:text-slate-400`
      )}
    >
      <div className="p-2 text-left text-sky-200 dark:text-sky-500 w-[110px] absolute top-[445px] left-[45px] text-xs">
        {dateString}
      </div>

      {/* <div className="p-2 text-sky-200 dark:text-sky-500 absolute top-[0px] text-6xl font-extralight w-full text-center opacity-10">
        {dateString}
      </div> */}

      {/* <div className="p-2 text-sky-200 dark:text-sky-500 absolute top-[260px] left-[-250px] text-8xl font-semibold w-[600px] text-center opacity-10 -rotate-90">
        {dateString}
      </div> */}

      <div className="flex flex-col items-center justify-center pt-[80px]">
        <div className="text-6xl font-semibold opacity-90 text-slate-800 dark:text-slate-100">
          {scoreRef.current}
        </div>
        <div className="flex flex-row items-center">
          <div>
            <StarIcon className="h-5 mr-2 text-green-500" />
          </div>
          <div className="text-green-500">Score</div>
        </div>
      </div>

      <div className="flex flex-row p-2 pt-[60px] opacity-90">
        <div className="pl-8">
          <div className="flex flex-row items-center">
            <div className="w-4 h-4 rounded-sm bg-sky-500"></div>
            <div className="pl-2">x 10</div>
          </div>
          <div className="flex flex-row items-center">
            <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
            <div className="pl-2">x 18</div>
          </div>
          <div className="flex flex-row items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-sm"></div>
            <div className="pl-2">x 35</div>
          </div>
          <div className="flex flex-row items-center">
            <div className="w-4 h-4 bg-pink-500 rounded-sm"></div>
            <div className="pl-2">x 15</div>
          </div>
          <div className="flex flex-row items-center">
            <div className="w-4 h-4 bg-purple-500 rounded-sm"></div>
            <div className="pl-2">x 2</div>
          </div>
        </div>
        <div className="pl-8">
          <div className="flex flex-row items-center">
            <div className="w-4 h-4 rounded-full bg-sky-500"></div>
            <div className="pl-2">x 10</div>
          </div>
          <div className="flex flex-row items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <div className="pl-2">x 18</div>
          </div>
          <div className="flex flex-row items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <div className="pl-2">x 35</div>
          </div>
          <div className="flex flex-row items-center opacity-30">
            <div className="w-4 h-4 bg-pink-500 rounded-full"></div>
            <div className="pl-2">&nbsp;</div>
          </div>
          <div className="flex flex-row items-center">
            <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
            <div className="pl-2">x 2</div>
          </div>
        </div>
        <div className="pl-8">
          <div className="flex flex-row items-center opacity-30">
            <div className="w-4 h-4 border-2 rounded-sm border-sky-500"></div>
            <div className="pl-2">&nbsp;</div>
          </div>
          <div className="flex flex-row items-center opacity-30">
            <div className="w-4 h-4 border-2 border-green-500 rounded-sm"></div>
            <div className="pl-2">&nbsp;</div>
          </div>
          <div className="flex flex-row items-center opacity-30">
            <div className="w-4 h-4 border-2 border-yellow-500 rounded-sm"></div>
            <div className="pl-2">&nbsp;</div>
          </div>
          <div className="flex flex-row items-center opacity-30">
            <div className="w-4 h-4 border-2 border-pink-500 rounded-sm"></div>
            <div className="pl-2">&nbsp;</div>
          </div>
          <div className="flex flex-row items-center opacity-30">
            <div className="w-4 h-4 border-2 border-purple-500 rounded-sm"></div>
            <div className="pl-2">&nbsp;</div>
          </div>
        </div>
        <div className="pl-8">
          <div className="flex flex-row items-center opacity-30">
            <div className="w-3 h-3 rotate-45 rounded-sm bg-sky-500"></div>
            <div className="pl-2">&nbsp;</div>
          </div>
          <div className="flex flex-row items-center opacity-30">
            <div className="w-3 h-3 rotate-45 bg-green-500 rounded-sm"></div>
            <div className="pl-2">&nbsp;</div>
          </div>
          <div className="flex flex-row items-center opacity-30">
            <div className="w-3 h-3 rotate-45 bg-yellow-500 rounded-sm"></div>
            <div className="pl-2">&nbsp;</div>
          </div>
          <div className="flex flex-row items-center opacity-30">
            <div className="w-3 h-3 rotate-45 bg-pink-500 rounded-sm"></div>
            <div className="pl-2">&nbsp;</div>
          </div>
          <div className="flex flex-row items-center opacity-30">
            <div className="w-3 h-3 rotate-45 bg-purple-500 rounded-sm"></div>
            <div className="pl-2">&nbsp;</div>
          </div>
        </div>
      </div>
      <div className="flex flex-row items-center justify-center text-green-500">
        <CubeTransparentIcon className="h-4 mr-2" />
        <div>Collected Items</div>
      </div>

      <div className="flex flex-row px-4 mt-[80px]">
        <a href={link} target="_blank" rel="noopener noreferrer">
          <div className="p-4">
            {/* <a href={link} target="_blank" rel="noopener noreferrer"> */}
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
        <div className="flex flex-col p-4 space-y-4">
          <button
            className="px-8 py-4 border rounded-xl border-sky-500 text-sky-500"
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
