'use strict'

const AWS = require('aws-sdk')
const code = require('../../config/code.js')
const message = require('../../config/message.js')
const json = require('../../config/response.js')
const dynamoDb = new AWS.DynamoDB.DocumentClient()
module.exports.get = async (event, context) => {
  const table = process.env.item_table
  const instituteId = event.pathParameters.institute_id
  const location_id = event.queryStringParameters.location_id
  let params = {}
  if(location_id !== ''){
    params = {
      TableName: table,
      IndexName: 'GSI1',
      KeyConditionExpression: 'sk = :sk AND begins_with(pk, :type)',
      ExpressionAttributeValues: {
        ':sk': instituteId,
        ':type': 'dpm-',
        ':locationId': location_id
      },
      FilterExpression: '#locationId = :locationId',
      ExpressionAttributeNames: {
        '#locationId':      'locationId', 
      },
    }
  }else {
    params = {
      TableName: table,
      IndexName: 'GSI1',
      KeyConditionExpression: 'sk = :sk AND begins_with(pk, :type)',
      ExpressionAttributeValues: {
        ':sk': instituteId,
        ':type': 'dpm-'
      },
    }
  }
  try {
    const data = await dynamoDb.query(params).promise()
    const results = data.Items.map(item => {
      return {
        id: item.pk,
        name: item.name,
        location: item.location,
        segment: item.segment
      }
    })
    return {
      statusCode: code.httpStatus.OK,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // to allow cross origin access
      },
      body: json.responseBody(code.httpStatus.OK, results, message.msg.FetchSuccessed, '', 1)
    }
  } catch (error) {
    return {
      statusCode: code.httpStatus.Created,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // to allow cross origin access
      },
      body: json.responseBody(code.httpStatus.BadRequest, [], message.msg.FetchFailed, error, 0)
    }
  }
}
