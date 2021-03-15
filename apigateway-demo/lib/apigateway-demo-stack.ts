import * as cdk from '@aws-cdk/core';
import * as apigatewayv2 from '@aws-cdk/aws-apigatewayv2';
import {HttpProxyIntegration, LambdaProxyIntegration} from '@aws-cdk/aws-apigatewayv2-integrations';
import * as lambda from '@aws-cdk/aws-lambda';
import * as acm from '@aws-cdk/aws-certificatemanager';

export class ApigatewayDemoStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // 建立lambda
        const booksDefaultFn = new lambda.Function(this, 'booksDefaultFn', {
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
        const booksDefaultIntegration = new LambdaProxyIntegration({
            handler: booksDefaultFn,
        });

        // 選本來的cert
        // const domainName = 'indochat-osp.com';
        // const cert = new acm.Certificate(this, "Certificate", {
        //     domainName: domainName,
        //     validation: acm.CertificateValidation.fromDns(),
        // });
        // new cdk.CfnOutput(this, "ACM-ARN", {
        //     value: cert.certificateArn,
        // });
        //
        // const dn = new apigatewayv2.DomainName(this, 'DN', {
        //     domainName,
        //     certificate: acm.Certificate.fromCertificateArn(this, 'cert', cert.certificateArn),
        // });
        const httpApi = new apigatewayv2.HttpApi(this, 'HttpApi', {
            // defaultDomainMapping: {
            //     domainName: dn,
            //     mappingKey: 'book'
            // },
            // defaultIntegration: new HttpProxyIntegration({
            //     url:`http://${domainName}`,
            // }),
        });

        httpApi.addRoutes({
            path: '/book/{book-id}',
            methods: [apigatewayv2.HttpMethod.GET],
            integration: booksDefaultIntegration,
        });

        // httpApi.addStage('Beta', {
        //     stageName: 'beta',
        //     autoDeploy: true,
        // })

        new cdk.CfnOutput(this, 'ApiURL', {
            value: httpApi.apiEndpoint
        })

        // new cdk.CfnOutput(this, 'ApiDNURL', {
        //     value: `https://${dn.name}/book/123`
        // })
    }
}
