import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { PlayIcon, ClipboardCopyIcon } from "@heroicons/react/solid";

type ReplayMenuProps = {
  onWatchReplay: () => void;
  onCopyReplayLink: () => void;
};

export default function ReplayMenu({
  onWatchReplay,
  onCopyReplayLink,
}: ReplayMenuProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex justify-center w-full px-8 py-4 text-sm font-medium bg-white border rounded-xl text-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 border-sky-500 active:border-sky-600">
          Replay
          <ChevronDownIcon
            className="w-5 h-5 ml-2 -mr-1 text-sky-500 active:text-sky-600"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 w-40 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-1 py-1 ">
            <Menu.Item>
              {({ active }) => (
                <button
                  onMouseDown={onWatchReplay}
                  onTouchStart={onWatchReplay}
                  className={`${
                    active ? "bg-sky-500 text-white" : "text-gray-900"
                  } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                >
                  <PlayIcon
                    className="w-5 h-5 mr-2 opacity-70"
                    aria-hidden="true"
                  />
                  Watch
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onMouseDown={onCopyReplayLink}
                  onTouchStart={onCopyReplayLink}
                  className={`${
                    active ? "bg-sky-500 text-white" : "text-gray-900"
                  } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                >
                  <ClipboardCopyIcon
                    className="w-5 h-5 mr-2 opacity-70"
                    aria-hidden="true"
                  />
                  Copy Link
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
