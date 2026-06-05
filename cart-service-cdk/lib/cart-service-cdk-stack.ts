import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'node:path';
import * as ec2 from 'aws-cdk-lib/aws-ec2'

export class CartServiceCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, 'ExistingVpc', {
      vpcId: 'vpc-093efa4901ab18078'
    })

    const cartServiceLambdaSecurityGroup = new ec2.SecurityGroup(this, 'CartServiceLambdaSecurityGroup',
      {
        vpc: vpc,
        description: 'Security group for Cart Service Lambda',
        allowAllOutbound: false,
      }
    )

    cartServiceLambdaSecurityGroup.addEgressRule(
      ec2.Peer.securityGroupId('sg-01b44ca4caa60a100'),
      ec2.Port.tcp(5432),
      'Allow access to PostgreSQL RDS'
    )

    cartServiceLambdaSecurityGroup.addEgressRule(
      ec2.Peer.ipv4(vpc.vpcCidrBlock),
      ec2.Port.tcp(443),
      'Allow access to VPC endpoints'
    )

    const cartService = new NodejsFunction(this, 'CartServiceLambda', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: 'handler',
      entry: path.join(__dirname, '../../src/main.ts'),
      vpc: vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED
      },
      securityGroups: [cartServiceLambdaSecurityGroup],
      environment: {
        RDS_PG_HOST: process.env.RDS_PG_HOST ?? '',
        RDS_PG_PORT: process.env.RDS_PG_PORT ?? '5432',
        RDS_PG_USERNAME: process.env.RDS_PG_USERNAME ?? 'postgres',
        RDS_PG_PASSWORD: process.env.RDS_PG_PASSWORD ?? '',
        RDS_PG_DATABASE: process.env.RDS_PG_DATABASE ?? 'postgres',
        TYPEORM_SYNCHRONIZE: process.env.TYPEORM_SYNCHRONIZE ?? 'false',
      },
      projectRoot: path.join(__dirname, '../../'),
      timeout: cdk.Duration.seconds(30),

      bundling: {
        externalModules: [
          '@nestjs/websockets/socket-module',
          '@nestjs/microservices/microservices-module',
          '@nestjs/microservices',
          'class-validator',
          'class-transformer',
        ],
      },
    });

    const rdsSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      'RdsSecurityGroup',
      'sg-01b44ca4caa60a100'
    )

    rdsSecurityGroup.addIngressRule(
      ec2.Peer.securityGroupId(cartServiceLambdaSecurityGroup.securityGroupId),
      ec2.Port.tcp(5432),
      'Allow Lambda to connect to PostgreSQL'
    )

    const fnUrl = cartService.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,

      cors: {
        allowedOrigins: ['https://d2htpstdr8w7tm.cloudfront.net'],
        allowedMethods: [lambda.HttpMethod.ALL],
        allowedHeaders: ['Content-Type', 'Authorization'],
        maxAge: cdk.Duration.minutes(10),
      },
    });

    new cdk.CfnOutput(this, 'CardServiceFunctionUrl', {
      value: fnUrl.url,
      description: 'The direct HTTPS endpoint for the Cart Service Lambda',
    });
  }
}
