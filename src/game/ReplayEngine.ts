import { useCallback, useEffect, useState } from "react";
import { Move, useEngine } from "./Engine";

export default function useReplayEngine({ moves, interval, dateString }: { moves: Move[], interval: number, dateString?: string }): ReturnType<typeof useEngine> & { userPhase: boolean } {

  const {
    cells,
    finished,
    isInteractive,
    movesLeft,
    onCellClick,
    onCellSwipe,
    previousMoves,
    restart,
    score,
  } = useEngine({ interval, dateString });

  const [futureMoves, setFutureMoves] = useState<Move[]>(moves);

  const onRestart = useCallback(() => {
    setFutureMoves(moves);
    restart();
  }, [moves, restart]);

  useEffect(() => {
    if (isInteractive && futureMoves.length > 0) {
      const move = futureMoves.shift();
      setFutureMoves(futureMoves);
      if (!move) return;
      const result = cells.find(({ x, y }) => x === move.x && y === move.y);
      if (!result) return;
      if (move.direction) {
        onCellSwipe(result.cell.id, move.direction);
      } else {
        onCellClick(result.cell.id);
      }
    }
  }, [isInteractive, futureMoves, cells, onCellClick, onCellSwipe, setFutureMoves]);

  return {
    cells,
    finished,
    isInteractive: false,
    movesLeft,
    onCellClick: () => { },
    onCellSwipe: () => { },
    previousMoves,
    restart: onRestart,
    score,
    userPhase: isInteractive
  }

}