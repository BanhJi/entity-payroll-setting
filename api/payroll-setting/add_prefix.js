'use strict'

const AWS = require('aws-sdk')
const code = require('../../config/code.js')
const message = require('../../config/message.js')
const json = require('../../config/response.js')
const uuid = require('uuid')
const dynamoDb = new AWS.DynamoDB.DocumentClient()

module.exports.index = async (event) => {
  const timestamp   = new Date().toJSON()
  const data        = JSON.parse(event.body)
  const table       = process.env.item_table
  const instituteId = event.pathParameters.institute_id
  let head = 'ppx-' // payroll bank

  if (data.id === undefined || data.id === '') {
    head = 'ppx-' + uuid.v1()
  } else {
    head = data.id
  }
  const pk = head
  const params = {
    TableName: table,
      Item: {
        pk:         pk,
        sk:         instituteId,
        abbr:       data.abbr,
        name:       data.name,
        format:     data.format,
        preview:    data.preview,
        separator:  data.separator,
        createdAt:  timestamp,
        updatedAt:  timestamp
      }
  };
  //  todo: write to the database
  try {
    await dynamoDb
      .put( params)
      .promise()
    // response back
    const response = {
      id:         pk,
      abbr:       data.abbr || '',
      name:       data.name || '',
      format:     data.format || '',
      separator:  data.separator || '',
      preview:    data.preview || '',
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
