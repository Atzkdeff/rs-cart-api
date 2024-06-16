require('source-map-support').install();

import { NestFactory } from '@nestjs/core';

import helmet from 'helmet';
import * as serverless from 'serverless-http';

import { AppModule } from './app.module';

const port = process.env.PORT || 4000;

export async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
      origin: (req, callback) => callback(null, true),
    });
    app.use(helmet());

    // await app.listen(port);

    //serverless
    await app.init();
    const expressApp = await app.getHttpAdapter().getInstance();

    return serverless.default(expressApp, { provider: 'aws' });
}

bootstrap().then(() => {
  console.log('App is running on %s port', port);
});
