// const CLICK = ["/sounds/Hover over button sound 17.wav", "/sounds/Hover over button sound 18.wav", "/sounds/Hover over button sound 19.wav", "/sounds/Hover over button sound 20.wav"];
// const MUSIC = ["/sounds/music/beats/FAM_Dark California.wav"];
// const FUSION = ["/sounds/Bio gun Shot 3.wav", "/sounds/Bio gun Shot 4.wav", "/sounds/Bio gun Shot 7.wav"];
// const FUSION = ["/sounds/Notification sound 5.wav", "/sounds/Notification sound 16.wav"];
const FUSION = ["1", "3", "4"].map((n) => `/sounds/collect/Collect star ${n}.mp3`); //, "/sounds/collect/Collect star 2.mp3", "/sounds/collect/Collect star 3.mp3", "/sounds/collect/Collect star 4.mp3", "/sounds/collect/Collect star 5.mp3"];
const BOMB = ["/sounds/notifications/Notification sound 15.mp3"];
// const AMAZING = ["Amazing"].map((value) => `/sounds/amy/${value}.wav`);
// const AMAZING = ["Amazing", "Awesome", "Bingo", "Bravo", "Brutal", "Easy", "Great job", "Headshot", "Hot", "I Dont Believe It", "Perfect", "This is great", "This is too easy", "Woah", "Yeah 1", "Yes 1"].map((value) => `/sounds/amy/${value}.wav`);
// const BOMB_EXPLOSION = ["1", "2", "3", "4", "5"].map((n) => `/sounds/balloon/Balloon sound (Balloon pop) ${n}.mp3`);
const BOMB_EXPLOSION = ["1", "2", "3"].map((n) => `/sounds/balloon/Balloon sound (Balloon pop) ${n}.mp3`);

function selectRandom(array: string[]): string {
  return array[Math.floor(Math.random() * array.length)]
}


async function preload(path: string) {
  const a = new Audio(path);
  a.preload = "auto";
  a.load();
  return new Promise((resolve) => {
    a.onload = resolve;
  });
}

async function preloadMany(paths: string[]) {
  for (const path of paths) {
    await preload(path);
  }
}

export async function preloadAll() {
  // await preloadMany(CLICK);
  // await preloadMany(MUSIC);
  await preloadMany(FUSION);
  await preloadMany(BOMB);
  // await preloadMany(AMAZING);
  await preloadMany(BOMB_EXPLOSION);
}

export async function click() {
  return;
  // return new Audio(selectRandom(CLICK)).play();
}

let fusionLock: any = null;

export function fusion() {
  if (!fusionLock) {
    new Audio(selectRandom(FUSION)).play();
    fusionLock = setTimeout(() => {
      fusionLock = null;
    }, 0);
  }
}

// const a = new Audio(MUSIC[0]);
// a.loop = true;

// let played = false;

export function music() {
  return;
  // if (!played) {
  //   played = true;
  //   a.play();
  // }
}

export function bombCreated() {
  return new Audio(selectRandom(BOMB)).play();
}

// let amazingAudio = new Audio(selectRandom(AMAZING));

export function amazing() {
  return;
  // if (amazingAudio.paused || amazingAudio.ended) {
  //   if (Math.random() < 0.01) {
  //     amazingAudio = new Audio(selectRandom(AMAZING));
  //     amazingAudio.play();
  //   }
  // }
}

export function bombExplosion() {
  const a = new Audio(selectRandom(BOMB_EXPLOSION));
  a.play();
}