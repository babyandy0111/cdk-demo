#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {EcsFargateDemoStack} from '../lib/ecs-fargate-demo-stack';

const app = new cdk.App();
new EcsFargateDemoStack(app, 'EcsFargateDemoStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION
    }
});
