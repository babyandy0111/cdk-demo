#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { CdkStack } from '../lib/cdk-stack';
import {goLambda} from "../lib/go-lambda";
import {nodeLambda} from "../lib/node-lambda";

const app = new cdk.App();
new CdkStack(app, 'CdkStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION
    }
});

new goLambda(app, 'GolangLambdaStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION
    }
});

new nodeLambda(app, 'NodeLambdaStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION
    }
});
