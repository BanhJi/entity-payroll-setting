'use strict'

const AWS = require('aws-sdk')
const code = require('../../config/code.js')
const message = require('../../config/message.js')
const json = require('../../config/response.js')
const uuid = require('uuid')
const dynamoDb = new AWS.DynamoDB.DocumentClient()

module.exports.index = async (event) => {
  const timestamp = new Date().toJSON()
  const data = JSON.parse(event.body)
  const table = process.env.item_table
  
  const instituteId = event.pathParameters.institute_id
  let head = 'sfw-' // payroll bank

  if (data.id === undefined || data.id === '') {
    head = 'sfw-' + uuid.v1()
  } else {
    head = data.id
  }
  const pk = head
  const history = {
    id: pk,
    name: data.name,
    typeOfWork: data.typeOfWork,
    nature: data.nature
  }
  const params = [
    {
      PutRequest: { //  todo: supplier type
        Item: {
          pk: pk,
          sk: instituteId,
          name: data.name,
          typeOfWork: data.typeOfWork,
          nature:     data.nature,
          createdAt: timestamp,
          updatedAt: timestamp
        }
      }
    },
    {
      PutRequest: { //  todo: supplier type account receivable
        Item: {
          sk: data.typeOfWork.id,
          pk: pk,
          specificWork: history,
        }
      }
    }
  ]
  //  todo: write to the database
  try {
    await dynamoDb
      .batchWrite({
        RequestItems: {
          [table]: params
        }
      })
      .promise()
    // response back
    const response = {
      id: pk,
      name: data.name,
      typeOfWork: data.typeOfWork,
      nature: data.nature,
    }

    return {
      statusCode: code.httpStatus.Created,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // to allow cross origin access
      },
      body: json.responseBody(code.httpStatus.Created, response, message.msg.ItemCreatedSuccessed, '', 1)
    }
  } catch (err) {
    return {
      statusCode: code.httpStatus.BadRequest,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // to allow cross origin access
      },
      body: json.responseBody(code.httpStatus.BadRequest, [], message.msg.ItemCreatedFailed, err, 0)
    }
  }
}
