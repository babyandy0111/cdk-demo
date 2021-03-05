#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {EksFargateDemoStack} from '../lib/eks_fargate_demo-stack';

const app = new cdk.App();
new EksFargateDemoStack(app, 'EksFargateDemoStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION
    }
});
