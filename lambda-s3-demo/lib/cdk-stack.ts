import * as sns from '@aws-cdk/aws-sns';
import * as subs from '@aws-cdk/aws-sns-subscriptions';
import * as sqs from '@aws-cdk/aws-sqs';
import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, 'CdkQueue', {
      visibilityTimeout: cdk.Duration.seconds(300)
    });

    const topic = new sns.Topic(this, 'CdkTopic');

    topic.addSubscription(new subs.SqsSubscription(queue));

    // 建立一個apigateway
    const api = new apigateway.RestApi(this, 'Api', {
      defaultCorsPreflightOptions: {
        allowMethods: ['OPTIONS', 'GET'],
        allowHeaders: ['Content-Type'],
        allowOrigins: ['*'],
      },
    });

    // 建立一個s3
    const bucket = new s3.Bucket(this, 'CdkS3Bucket', {
      cors: [{
        allowedHeaders: ['*'],
        allowedMethods: [
          s3.HttpMethods.GET,
          s3.HttpMethods.PUT,
          s3.HttpMethods.POST,
          s3.HttpMethods.DELETE,
          s3.HttpMethods.HEAD,
        ],
        allowedOrigins: ['*'],
      }],
      publicReadAccess: true,
    });

    // 建立一個lambda, 這邊範例用nodejs來寫upload
    // 要用golang, 可以參考 https://medium.com/faun/golang-build-and-deploy-an-aws-lambda-using-cdk-b484fe99304b
    const uploadFunction = new lambda.Function(this, 'UploaderFunction', {
      code: lambda.Code.asset('resources/s3-uploader-function'),
      handler: 'app.handler',
      runtime: lambda.Runtime.NODEJS_12_X,
      environment: {
        'UploadBucket': bucket.bucketName,
      },
      timeout: cdk.Duration.seconds(5),
      memorySize: 128,
    });

    // 建立基本的policy
    const s3CrudPolicy = new iam.PolicyStatement({
      actions: [
        's3:GetObject',
        's3:PutObject',
      ],
      resources: [
        `${bucket.bucketArn}/*`,
      ],
    });

    // 把這個policy給lambda
    uploadFunction.addToRolePolicy(s3CrudPolicy);

    // apigateway 給予 lambda
    const uploadIntegration = new apigateway.LambdaIntegration(uploadFunction, {});
    api.root.addMethod('GET', uploadIntegration);

  }
}
