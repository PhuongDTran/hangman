import { useState } from "react";
import './App.css';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);

  const startGame = () => {
    setIsPlaying(true);
  }

  const endGame = () => {
    setIsPlaying(false);
  }

  return (
    <div className="App">
      <h1>Hangman</h1>

      {!isPlaying ? <div>
          <h2>Click button to play hangman</h2>
          <button onClick={startGame}>Start Game</button>
        </div>
        :
        <div>
          <h2>(Game of hangman)</h2>
          <button onClick={endGame}>game over button</button>
        </div>}

    </div>
  );
}

export default App;
