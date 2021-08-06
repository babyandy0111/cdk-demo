import * as cdk from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import * as route53 from '@aws-cdk/aws-route53'
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as route53Targets from '@aws-cdk/aws-route53-targets'

export class goLambda extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        // creatre golang api for lambda
        const testFunction = new lambda.Function(this, id, {
            code: lambda.Code.fromAsset('resources/test-function', {
                bundling: {
                    image: lambda.Runtime.GO_1_X.bundlingImage,
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

        const rootDomain = 'indochat-osp.com';

        const zone = route53.HostedZone.fromLookup(this, "MyCoolHostedZone", {
            domainName: rootDomain,
        });

        const cert = new acm.Certificate(this, "MySecureWildcardCert", {
            domainName: `*.${rootDomain}`,
            validation: acm.CertificateValidation.fromDns(zone),
        });

        const golang_apigateway = new apigateway.RestApi(this, 'GoApi', {
            domainName: {
                domainName: `api-test.${rootDomain}`,
                certificate: acm.Certificate.fromCertificateArn(this, "my-cert", cert.certificateArn),
                endpointType: apigateway.EndpointType.REGIONAL,
            },
            defaultCorsPreflightOptions: {
                allowMethods: ['OPTIONS', 'GET'],
                allowHeaders: ['Content-Type'],
                allowOrigins: ['*'],
            },
        });

        // apigateway 給予 lambda
        const golangIntegration = new apigateway.LambdaIntegration(testFunction, {});
        golang_apigateway.root.addMethod('GET', golangIntegration);

        const books = golang_apigateway.root.addResource('books');
        books.addMethod('POST', golangIntegration);

        // Output
        new cdk.CfnOutput(this, 'test-url', {value: golang_apigateway.url!});

        new route53.ARecord(this, "apiDNS", {
            zone: zone,
            recordName: "api-test",
            target: route53.RecordTarget.fromAlias(
                new route53Targets.ApiGateway(golang_apigateway)
            ),
        });
    }
}
