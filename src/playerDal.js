
import * as dbClient from './dynamodbClient';

const TABLE_NAME = 'hangman-player';

// player's attr: playerName (partition key), highestScore
export const addPlayer = (player, callback) => {
  const params = {
    TableName: TABLE_NAME,
    Item: player
  }

  dbClient.addItem(params, callback);
}

export const getPlayer = (playerName, callback) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      playerName: playerName
    },
  }

  dbClient.getItem(params, callback);
}

export const getAllPlayers = (callback) => {
  const params = {
    TableName: TABLE_NAME,
  }

  dbClient.scanItems(params, callback);
}

export const updatePlayerHighestScore = (playerName, score, callback) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      playerName: playerName
    },
    UpdateExpression: 'set highestScore = :highestScore',
    ExpressionAttributeValues: {
      ":highestScore": score,
    }
  }

  dbClient.updateItem(params, callback);
}

export const deletePlayer = (playerName, callback) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      playerName: playerName
    }
  }

  dbClient.deleteItem(params, callback);
}
