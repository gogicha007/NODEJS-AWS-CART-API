#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
import { CartServiceCdkStack } from '../lib/cart-service-cdk-stack';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = new cdk.App();
new CartServiceCdkStack(app, 'CartServiceCdkStack', {
  env: { account: '149614785775', region: 'eu-north-1' }
});
