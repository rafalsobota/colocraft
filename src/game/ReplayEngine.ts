import { useCallback, useEffect, useState } from "react";
import { Move, useEngine } from "./Engine";

export default function useReplayEngine({ moves }: { moves: Move[] }): ReturnType<typeof useEngine> {

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
  } = useEngine();

  const [futureMoves, setFutureMoves] = useState<Move[]>(moves);

  const onRestart = useCallback(() => {
    setFutureMoves(moves);
    restart();
  }, [moves, restart]);

  useEffect(() => {
    if (isInteractive && futureMoves.length > 0) {
      const move = futureMoves.shift();
      if (!move) return;
      const result = cells.find(({ x, y }) => x === move.x && y === move.y);
      if (!result) return;

      setTimeout(() => {
        if (move.direction) {
          onCellSwipe(result.cell.id, move.direction);
        } else {
          onCellClick(result.cell.id);
        }
        setFutureMoves(futureMoves);
      }, 1000);
    }
  }, [isInteractive, futureMoves, cells, onCellClick, onCellSwipe]);

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
  }

}