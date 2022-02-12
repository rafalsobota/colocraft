import { Dialog, Transition } from "@headlessui/react";
import { LightningBoltIcon, StarIcon } from "@heroicons/react/solid";
import { Fragment, useEffect, useRef } from "react";
import ReplayMenu from "./ReplayMenu";

type SummaryProps = {
  isOpen: boolean;
  score: number;
  onPlay: () => void;
  onWatchReplay: () => void;
  onCopyReplayLink: () => void;
};

export default function Summary({
  isOpen,
  score,
  onPlay,
  onWatchReplay,
  onCopyReplayLink,
}: SummaryProps) {
  const scoreRef = useRef(score);
  useEffect(() => {
    if (score > 0) {
      scoreRef.current = score;
    }
  }, [score]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={() => {}}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md p-4 my-8 text-left align-middle transition-all transform bg-white shadow-xl overflow-show dark:bg-slate-700 rounded-2xl">
              <Dialog.Title
                as="h3"
                className="flex items-center text-lg font-medium leading-6 text-gray-900"
              >
                <StarIcon className="mr-2 -mt-1 text-green-500 h-14" />
                <div className="mr-1 text-5xl font-semibold text-slate-800 dark:text-slate-100">
                  {scoreRef.current}
                </div>
              </Dialog.Title>
              <div className="mt-2 text-gray-500 text-md dark:text-slate-400">
                <span>
                  Run out of
                  <span className="whitespace-nowrap">
                    <LightningBoltIcon className="inline h-4 mx-1 -mt-1 text-yellow-500" />
                    moves.
                  </span>{" "}
                  Scored
                  <span className="whitespace-nowrap">
                    <StarIcon className="inline h-5 mx-1 -mt-1 text-green-500" />
                    {scoreRef.current}.
                  </span>
                </span>
              </div>
              <div className="mt-4 space-x-2 text-right">
                <ReplayMenu
                  onWatchReplay={onWatchReplay}
                  onCopyReplayLink={onCopyReplayLink}
                />
                <button
                  type="button"
                  className="inline-flex justify-center px-8 py-4 text-sm font-medium text-white border border-transparent rounded-md bg-sky-500 active:bg-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                  onMouseUp={onPlay}
                  onTouchEnd={onPlay}
                >
                  Play
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
