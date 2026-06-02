#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { CartServiceCdkStack } from '../lib/cart-service-cdk-stack';

const app = new cdk.App();
new CartServiceCdkStack(app, 'CartServiceCdkStack', {
  env: { account: '149614785775', region: 'eu-north-1' }
});
