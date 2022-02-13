export enum Color {
  Blue,
  Green,
  Yellow,
  Pink,
  Purple,
}

export function randomColor(random: () => number): Color {
  return Math.round(random() * 4);
}

export function bgColor(color: Color): string {
  switch (color) {
    case Color.Blue:
      return "bg-sky-500 active:bg-sky-600 text-sky-600";
    case Color.Green:
      return "bg-green-500 active:bg-green-600 text-green-600";
    case Color.Yellow:
      return "bg-yellow-500 active:bg-yellow-600 text-yellow-600";
    case Color.Pink:
      return "bg-pink-500 active:bg-pink-600 text-pink-600";
    case Color.Purple:
      return "bg-purple-500 active:bg-purple-600 text-purple-600";
  }
}