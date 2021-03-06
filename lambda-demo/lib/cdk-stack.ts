import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam';

export class CdkStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // creatre golang api for lambda
        const testFunction = new lambda.Function(this, id, {
            code: lambda.Code.fromAsset('resources/golang-test', {
                bundling: {
                    image: lambda.Runtime.GO_1_X.bundlingDockerImage,
                    user: "root",
                    environment: {
                        'IMENV': 'TEST',
                    },
                    command: [
                        'bash', '-c', ['make lambda-build',].join(' && ')
                    ]
                },
            }),
            environment: {
                'TESTENV': 'test',
            },
            timeout: cdk.Duration.seconds(5),
            memorySize: 128,
            handler: 'main',
            runtime: lambda.Runtime.GO_1_X,
        });

        const golang_apigateway = new apigateway.RestApi(this, 'GoApi', {
            defaultCorsPreflightOptions: {
                allowMethods: ['OPTIONS', 'GET'],
                allowHeaders: ['Content-Type'],
                allowOrigins: ['*'],
            },
        });

        // apigateway 給予 lambda
        const golangIntegration = new apigateway.LambdaIntegration(testFunction, {});
        golang_apigateway.root.addMethod('GET', golangIntegration);

        // Output
        new cdk.CfnOutput(this, 'golang-lambda-url', {value: golang_apigateway.url!});

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
        const uploadFunction = new lambda.Function(this, 'UploaderFunction', {
            code: lambda.Code.fromAsset('resources/s3-uploader-function'),
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
        node_apigateway.root.addMethod('GET', uploadIntegration);

        new cdk.CfnOutput(this, 'node-lambda-url', {value: node_apigateway.url!});
    }
}
