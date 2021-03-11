#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ApigatewayDemoStack } from '../lib/apigateway-demo-stack';

const app = new cdk.App();
new ApigatewayDemoStack(app, 'ApigatewayDemoStack');
