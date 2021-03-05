'use strict'

const AWS = require('aws-sdk')
AWS.config.update({ region: process.env.AWS_REGION || 'ap-southeast-1' })
const s3 = new AWS.S3()

// Main Lambda entry point
exports.handler = async (event) => {
    const result = await getUploadURL(event)
    console.log('Result: ', result)
    return result
}

const getUploadURL = async function(event) {

    // 這邊可以先拿參數決定後面處理, 目前不需要
    // let requestObject = JSON.parse(event["body"]);
    // const fileName = requestObject.fileName;
    // const fileType = requestObject.fileType;
    // const myBucket = 'jobobo-resumes';

    // 隨機產生檔名
    const actionId = parseInt(Math.random()*10000000)

    // Bucket 吃env, cdk有指定
    const s3Params = {
        Bucket: process.env.UploadBucket,
        Key:  `${actionId}.jpg`,
        ContentType: 'image/jpeg', // Update to match whichever content type you need to upload
        // ACL: 'public-read'      // Enable this setting to make the object publicly readable - only works if the bucket can support public objects
    }

    console.log('getUploadURL: ', s3Params)
    return new Promise((resolve, reject) => {
        // Get signed URL
        resolve({
            "statusCode": 200,
            "isBase64Encoded": false,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "body": JSON.stringify({
                "uploadURL": s3.getSignedUrl('putObject', s3Params),
                "photoFilename": `${actionId}.jpg`
            })
        })
    })
}
