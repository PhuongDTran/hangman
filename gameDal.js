
import { v4 as uuidv4 } from 'uuid';

import * as dbClient from './src/dynamodbClient';

const GAME_TABLE_NAME = 'hangman-game'

export const addGame = (game, callback) => {
  const gameId = uuidv4();
  let newGame = { ...game };

  newGame.gameId = gameId;

  const params = {
    TableName: GAME_TABLE_NAME,
    Item: newGame
  }

  dbClient.addItem(params, callback);
}

export const getGame = (gameId, callback) => {
  const params = {
    TableName: GAME_TABLE_NAME,
    Key: {
      gameId: gameId
    },
  }

  dbClient.getItem(params, callback);
}

// wrongGuess, correctGuess are strings
export const updateGuess = (gameId, wrongGuess, correctGuess, callback) => {
  const params = {
    TableName: GAME_TABLE_NAME,
    Key: {
      gameId: gameId
    },
    UpdateExpression: 'set wrongGuess = :wrongGuess, correctGuess = :correctGuess',
    ExpressionAttributeValues: {
      ":wrongGuess": wrongGuess.toUpperCase(),
      ":correctGuess": correctGuess.toUpperCase(),
    }
  }

  dbClient.updateItem(params, callback);
}

export const setGameOver = (gameId, isGameOver, callback) => {
  const params = {
    TableName: GAME_TABLE_NAME,
    Key: {
      gameId: gameId
    },
    UpdateExpression: 'set isGameOver = :isGameOver',
    ExpressionAttributeValues: {
      ":isGameOver": isGameOver,
    }
  }

  dbClient.updateItem(params, callback);
}
