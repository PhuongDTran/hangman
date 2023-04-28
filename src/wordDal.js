import * as dbClient from './dynamodbClient';

const SHARE_TABLE_NAME = 'hangman-share';

export const addWord = (word, callback) => {
    
    const params = {
        TableName: SHARE_TABLE_NAME,
        Item: word,
    }

    dbClient.addItem(params, callback);
}

export const getWordUrl = (url, callback) => {
    const params = {
        TableName: SHARE_TABLE_NAME,
        Key: {
            'url': url
        },
    }

    dbClient.getItem(params, callback);
}

export const deleteWord = (url, callback) => {
    const params = {
        TableName: SHARE_TABLE_NAME,
        Key: {
            'url': url
        }
    }

    dbClient.deleteItem(params, callback)
}
