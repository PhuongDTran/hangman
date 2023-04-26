import { useEffect, useState } from "react";

import { Box, TextField, Button } from '@mui/material';

import './App.css';

import {returnWord} from './wordList.js'

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [wordPhrase, setWordPhrase] = useState('');
  const [correctGuess, setCorrectGuess] = useState('');
  const [wrongGuess, setWrongGuess] = useState('');

  const [currentGuess, setcurrentGuess] = useState('');
  const [lives, setLives] = useState(6);
  const [hangmanImage, setHangmanImage] = useState(process.env.PUBLIC_URL + '/images/hangman_life_6.jpeg');

  const [endGameMessage, setEndGameMessage] = useState(null);

  useEffect(() => {
    if (lives < 1) {
      endGame();
    }
  }, [lives]);
  
  const startGame = () => {
    setIsPlaying(true);
    setLives(6);
    setWrongGuess('');
    setCorrectGuess('');
    setHangmanImage(process.env.PUBLIC_URL + '/images/hangman_life_6.jpeg');
    setEndGameMessage(null);

    let word = "bug";

    if(sessionStorage.getItem("word")){
      word = sessionStorage.getItem('word').toUpperCase();
    } else {
      word = returnWord().toLocaleUpperCase();
      console.log(word); //Logs the word to the console for testing. Remove before going life, as useful for cheating.
    }
    setWordPhrase(word);
  }

  const endGame = () => {
    setIsPlaying(false);
    setWordPhrase('');

    if (lives > 1) {
      setEndGameMessage("You've won!")
    } else {
      setEndGameMessage("You've been hanged...")
    }
  }

  const handleGuessInput = e => {
    const upperCaseGuess = currentGuess.toUpperCase();
    if (wordPhrase.includes(upperCaseGuess)) {
      setCorrectGuess(correctGuess + upperCaseGuess);
    } else {
      setWrongGuess(wrongGuess + upperCaseGuess);
      setLives(prevState => prevState - 1);
      setHangmanImage(process.env.PUBLIC_URL + `/images/hangman_life_${lives-1}.jpeg`)
    }

    setcurrentGuess('');
  }

  return (
    <div className="App">
      <h1>Hangman</h1>
      {endGameMessage && <div>{endGameMessage}</div>}
      <img src={hangmanImage} width="200"></img>
      {!isPlaying ? <div>
        <h2>Click button to play hangman</h2>
        <button onClick={startGame}>Start Game</button>
      </div>
        :
        <div>
          
        </div>}

      {isPlaying && (
        <Box sx={{ width: '200px', display: 'flex', flexDirection: 'column' }}>
          <label> {`Incorrect guesses: ${wrongGuess.split('').toString()}`}</label>
          <TextField id="outlined-basic" label="Your Guess" variant="outlined" value={currentGuess} onChange={e => setcurrentGuess(e.target.value)} inputProps={{ maxLength: 1 }} />
          <Button variant="outlined" onClick={handleGuessInput}>Make a guess</Button>
        </Box>
      )}

      <div style={{ display: "flex", flexDirection: "row" }}>
        {
          wordPhrase && wordPhrase.split("").map((char, idx) => {
            if (char === ' ') {
              return (
                <Box key={idx} sx={{
                  width: 40,
                  height: 40,
                }} />)
            } else {
              return (
                <Box
                  key={idx}
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: 'primary.dark',
                    m: 0.2,
                    textAlign: 'center',
                    justify: 'center'
                  }}>
                  <label>{correctGuess.includes(char) ? char : ''}</label>
                </Box>)
            }
          })
        }
      </div>
    </div>
  );
}

export default App;
