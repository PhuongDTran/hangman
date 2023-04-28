import { useEffect, useState } from "react";

import { Box, TextField, Button } from '@mui/material';

import './App.css';

import { returnWord } from './wordList.js'

import { addPlayer, deletePlayer, updatePlayerHighestScore, getAllPlayers} from './playerDal';

import { addWord,getWord, getWordUrl, deleteWord } from './wordDal';

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

  let passcode;
  if(window.location.pathname !== "/"){
    //console.log(window.location.pathname);
    passcode = window.location.pathname.toString().substring(1);
  } else {
    passcode = null;
  }
  let url = "";
  let sessionWord = "";
  
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

  }, []);  

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
    if (Won && wordPhrase.length != 0) {
      endGame();
      setHasWon(true);
    }
  }, [correctGuess]);

  function checkUrl () {
    console.log(passcode)
    getWordUrl(passcode, function (err, data) {
      if (err) {
        console.log(err);
      }

      if (data.Item) {
        sessionWord = data.Item.wordshared;
        console.log(sessionWord);
      }
    }
    );
  }

  if(passcode !== null){
    checkUrl();
  }

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

    console.log(sessionWord);

    console.log(sessionWord + " " + sessionWord.length);

    if (sessionWord.length > 0) {
      word = sessionWord.toUpperCase();
      deleteCustomWordUrl(passcode);
    } else {
      word = returnWord().toLocaleUpperCase();
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

  const createCustomWordUrl = (word) => {
    let letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");

    for (let index = 0; index < 35; index++) {
        url=url+letters[Math.floor(Math.random() * letters.length)]        
    }

    let submitObject = {
      'url': url,
      'wordshared': word
    }

    addWord(submitObject, function (err, data) {
      if (err) {
        console.log(err);
      }
      console.log(url);
    })
  }

  const deleteCustomWordUrl = (url) => {
    deleteWord(url , function (err, data) {
      if(err){
        console.log(err);
      }
      console.log(data, "deleted");
    }) 
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
    <div class="form-popup" id="wordForm">
      <form action="/action_page.php" class="form-container">
        <h1>Create a word for a Friend</h1>

        <label for="chosenWord"><b>Chosen Word</b></label>
        <input type="text" placeholder="Type Word" name="chosenWord" id="chosenWord" required></input>

        <label for="url"><b>Your Url</b></label>
        <input type="text" name="url" id="url" value={"Url will go here"} readOnly></input>

        <button type="button" class="btn" onClick={(()=>{
          createCustomWordUrl(document.getElementById("chosenWord").value);
          document.getElementById("url").value = window.location.origin + "/" + url;
        })}>Create Url</button>
        <button type="button" class="btn cancel" onClick={(() => {
          document.getElementById("wordForm").style.display = "none";
          document.getElementById("queryButton").style.display = "block";
        })}>Cancel</button>
      </form>
    </div>
    <div class="queryButton" id="queryButton">
      <button className="btn" onClick={(() => {
        document.getElementById("wordForm").style.display = "block";
        document.getElementById("queryButton").style.display = "none";
      })}>Send Word</button>
    </div>
  </div>
);
}

export default App;
