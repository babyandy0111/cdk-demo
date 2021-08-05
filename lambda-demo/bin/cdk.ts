#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { CdkStack } from '../lib/cdk-stack';
import {EcsFargateDemoStack} from "../../ecs-fargate-demo/lib/ecs-fargate-demo-stack";

const app = new cdk.App();
new CdkStack(app, 'CdkStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION
    }
});
