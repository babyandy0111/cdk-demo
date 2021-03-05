#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { EcsFargateDemoStack } from '../lib/ecs-fargate-demo-stack';

const app = new cdk.App();
new EcsFargateDemoStack(app, 'EcsFargateDemoStack');
