import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';

import helmet from 'helmet';

import { AppModule } from './app.module';
import { Callback, Context, Handler } from 'aws-lambda';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import serverlessExpress from '@codegenie/serverless-express';

let server: Handler;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();

  return serverlessExpress({
    app: expressApp,
  });
}

export const handler: Handler = async (
  event: APIGatewayProxyEventV2,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
