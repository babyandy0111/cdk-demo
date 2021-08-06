import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam';

export class nodeLambda extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // 建立一個apigateway
        const node_apigateway = new apigateway.RestApi(this, 'Api', {
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
        const uploadFunction = new lambda.Function(this, 's3-uploader-function', {
            code: lambda.Code.fromAsset('resources/s3-uploader-function'),
            handler: 'app.handler',
            runtime: lambda.Runtime.NODEJS_12_X,
            environment: {
                'UploadBucket': bucket.bucketName,
            },
            timeout: cdk.Duration.seconds(60),
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
        const uploadurl = node_apigateway.root.addResource('upload-url')
        uploadurl.addMethod('GET', uploadIntegration);

        // 建立一個lambda, 這邊範例用nodejs來寫upload
        const ecPayFunction = new lambda.Function(this, 'ecpay-function', {
            code: lambda.Code.fromAsset('resources/ecpay-function'),
            handler: 'app.handler',
            runtime: lambda.Runtime.NODEJS_12_X,
            environment: {
                'UploadBucket': '123',
            },
            timeout: cdk.Duration.seconds(60),
            memorySize: 128,
        });

        // apigateway 給予 lambda
        const ecPayIntegration = new apigateway.LambdaIntegration(ecPayFunction, {});
        const ecpay = node_apigateway.root.addResource('ecpay')
        ecpay.addMethod('GET', ecPayIntegration);

        new cdk.CfnOutput(this, 's3-uploader-url', {value: node_apigateway.url!});
    }
}
