import { Move } from "./Engine";

export function movesToReplayId(moves: Move[]): string {
  return moves.map((m) => `${m.x}${m.y}${m.direction || 0}`).join("-");
}

export function replayIdToMoves(replayId: string): Move[] {
  return replayId.split("-").map((m) => {
    const d = parseInt(m[2]);
    return { x: parseInt(m[0]), y: parseInt(m[1]), direction: d ? d : undefined };
  });
}