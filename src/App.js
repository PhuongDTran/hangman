import { useEffect, useState } from "react";

import { Box, TextField, Button } from '@mui/material';

import './App.css';

import { returnWord } from './wordList.js'

import { addPlayer, deletePlayer, updatePlayerHighestScore, getAllPlayers } from './playerDal';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [wordPhrase, setWordPhrase] = useState('');
  const [correctGuess, setCorrectGuess] = useState('');
  const [wrongGuess, setWrongGuess] = useState('');

  const [currentGuess, setcurrentGuess] = useState('');
  const [lives, setLives] = useState(6);
  
  const [points, setPoints] = useState(0);
  const [hangmanImage, setHangmanImage] = useState(window.location.origin + '/images/hangman_life_6.jpeg');
  
  const [hasWon, setHasWon] = useState(false);
  const [endGameMessage, setEndGameMessage] = useState(null);

  const [username, setUsername] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  //Sets leaderboard
  useEffect(() => {
    getAllPlayers(function (err, data) {
      if (err) {
        console.log(err);
      }
      setLeaderboard(() => {
        let items = data.Items;
        items.sort((a,b) => (a.highestScore < b.highestScore) ? 1 : ((b.highestScore < a.highestScore) ? -1 : 0));
        return items;
      });
    })

  }, [])

  //figures out if user has lost game
  useEffect(() => {
    if (lives < 1) {
      endGame();
    }
  }, [lives]);

  //figures out if user has won game
  useEffect(() => {
    let Won = true;
    wordPhrase.split('').forEach((char) => {
      if (!(correctGuess + " ").includes(char)) { Won = false }
    }
    )
    if (Won) {
      endGame();
      setHasWon(true);
    }
  });

  const startGame = () => {
    setHasSubmitted(false);
    setHasWon(false);
    setIsPlaying(true);
    setPoints(100);
    setLives(6);
    setWrongGuess('');
    setCorrectGuess('');
    setHangmanImage(window.location.origin + '/images/hangman_life_6.jpeg');
    setEndGameMessage(null);

    let word = "bug";

    if (sessionStorage.getItem("word")) {
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
      setPoints(prevState => prevState + (wordPhrase.length * Math.random() * 10));
    } else {
      setWrongGuess(wrongGuess + upperCaseGuess);
      setLives(prevState => prevState - 1);
      setHangmanImage(window.location.origin + `/images/hangman_life_${lives - 1}.jpeg`)
      setPoints(prevState => prevState - (wordPhrase.length * Math.random() * 10));
    }

    setcurrentGuess('');
  }

  const submitScore = () => {
    const newPlayer = {
      playerName: username,
      highestScore: points
    }

    let updatedLeaderboard = [...leaderboard];
    //if leaderboard is less than 10 and does not exists, add a new player
    //if player's name exists on leaderboard and player's score is higher than previous, update
    //if player's name exists but did not beat previous score, do nothing
    //if player score is higher than lowest score on the leaderboard, add to DB
    if (leaderboard.length < 10 && !leaderboard.find(player => player.playerName === newPlayer.playerName)) {
      addPlayer(newPlayer, function (err, data) {
        if (err) {
          console.log(err);
        }
        console.log(data, 'added');
      })

      updatedLeaderboard.push(newPlayer);
    } else if (leaderboard.find(player => player.playerName === newPlayer.playerName && newPlayer.highestScore > player.highestScore)) {
      updatePlayerHighestScore(newPlayer.playerName, newPlayer.highestScore, function(err, data) {
        if (err) {
          console.log(err);
        }
        console.log(data);
      })
      const replacePlayerIndex = updatedLeaderboard.findIndex(player => player.playerName === newPlayer.playerName)
      updatedLeaderboard[replacePlayerIndex] = newPlayer;

    } else if (leaderboard.find(player => player.playerName === newPlayer.playerName)) {
      //Do nothing since didn't beat previous score
    } else if (newPlayer.highestScore > leaderboard[9].highestScore) {
      addPlayer(newPlayer, function (err, data) {
        if (err) {
          console.log(err);
        }
        console.log(data, 'added');
      })

      deletePlayer(leaderboard[9].playerName, function (err, data) {
        if (err) {
          console.log(err);
        }
        console.log(data, 'deleted');
      })

      updatedLeaderboard = updatedLeaderboard.filter(player => player.playerName !== leaderboard[9].playerName);
      updatedLeaderboard.push(newPlayer);
    }
    setLeaderboard(() => {
      return updatedLeaderboard.sort((a,b) => (a.highestScore < b.highestScore) ? 1 : ((b.highestScore < a.highestScore) ? -1 : 0))
    });
    setHasSubmitted(true);
}

const leaderboardElements = leaderboard.map(item => {
  return <div>
    {item.playerName}: {Math.floor(item.highestScore)}
  </div>
})

return (
  <div className="App">
    <h1>Hangman</h1>
    <h2>Leaderboard</h2>
    {leaderboardElements}
    {endGameMessage &&
      <div>
        {endGameMessage}
        <div>You've earned {Math.floor(points)} points</div>
      </div>}
    <img src={hangmanImage} width="200"></img>
    {!isPlaying && <div>
      <h2>Click button to play hangman</h2>
      <button onClick={startGame}>Start Game</button>
    </div>}

    {hasWon &&
      <div>
        <h2>Submit score to leaderboard</h2>
        {!hasSubmitted ?
        <div>
        <TextField id="outlined-basic" label="Username" variant="outlined" onChange={e => setUsername(e.target.value)} />
        <Button variant="outlined" onClick={submitScore}>Submit</Button>
        </div>
        :
        <div>Submission sent!</div>}
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
