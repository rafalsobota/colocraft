import React from "react";
import Game from "./game/Game";
import Summary from "./game/Summary";

function App() {
  return (
    <div className="flex flex-col w-full h-full text-center lg:justify-center">
      <Game />
    </div>
  );
}

export default App;
