import React, { useState } from "react";

function generateLetterMatrix(x: number, y: number) {
  const matrix: string[][] = [];
  for (let i = 0; i < x; i++) {
    matrix.push([]);
    for (let j = 0; j < y; j++) {
      matrix[i].push(
        `${String.fromCharCode(65 + Math.round(Math.random() * 25))}`
      );
    }
  }
  return matrix;
}

function renderMatrix(matrix: string[][]) {
  return matrix.map((row, y) =>
    row.map((letter, x) => (
      <Letter key={y * 10 + x} value={letter} x={x} y={y} />
    ))
  );
}

function Letters() {
  const [state, setState] = useState(generateLetterMatrix(8, 8));

  return (
    <div className="relative mx-auto w-[500px]">{renderMatrix(state)}</div>
  );
}

function Letter(props: { value: string; x: number; y: number }) {
  return (
    <div
      style={{ left: props.x * 80, top: props.y * 80 }}
      className="absolute w-[70px] h-[70px] bg-blue-50 m-[5px] text-center text-5xl leading-normal text-blue-900 rounded-lg cursor-move"
    >
      {props.value}
    </div>
  );
}

export default Letters;
