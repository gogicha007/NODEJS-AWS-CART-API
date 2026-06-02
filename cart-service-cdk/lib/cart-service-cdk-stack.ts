import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as path from 'node:path'

export class CartServiceCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cartService = new NodejsFunction(this, "CartServiceLambda", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, '../../src/main.ts'),
      timeout: cdk.Duration.seconds(30)
    })

    const fnUrl = cartService.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,

      cors: {
        allowedOrigins: ['https://d2htpstdr8w7tm.cloudfront.net'],
        allowedMethods: [
          lambda.HttpMethod.GET,
          lambda.HttpMethod.POST,
          lambda.HttpMethod.PUT,
          lambda.HttpMethod.DELETE,
          lambda.HttpMethod.OPTIONS,
        ],
        allowedHeaders: ['Content-Type', "Authorization"],
        maxAge: cdk.Duration.minutes(10)

      }
    })

    new cdk.CfnOutput(this, 'CardServiceFunctionUrl', {
      value: fnUrl.url,
      description: 'The direct HTTPS endpoint for the Cart Service Lambda'
    })
  }
}
