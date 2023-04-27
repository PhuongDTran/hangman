import * as AWS from 'aws-sdk'

const configuration = {
  region: process.env.REACT_APP_REGION,
  secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,
  accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID
}

AWS.config.update(configuration)

const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const USER_TASKS_TABLE_NAME = 'team57-user-tasks';

export const addItem = (params, callback) => {
  docClient.put(params, function (err, data) {
    callback(err, data);
  })
}

export const updateItem = (params, callback) => {
  docClient.update(params, function(err, data) {
    callback(err, data);
  })
}

export const deleteItem = (params, callback) => {
  docClient.delete(params, function(err, data) {
    callback(err, data);
  })
}

export const getItem = (params, callback) => {
  docClient.get(params, function(err, data) {
    callback(err, data);
  })
}

export const queryItems = (params, callback) => {
  return docClient.query(params, function (err, data) {
    callback(err, data);
  });
}

export const scanItems = (params, callback) => {
  return docClient.scan(params, function (err, data) {
    callback(err, data);
  });
}