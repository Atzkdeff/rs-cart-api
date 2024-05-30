// import { Sequelize } from 'sequelize';

require('source-map-support').install();

import { NestFactory } from '@nestjs/core';

import helmet from 'helmet';
import * as serverless from 'serverless-http';

import { AppModule } from './app.module';

const port = process.env.PORT || 4000;

let cachedServer: serverless.Handler;

export async function bootstrap() {

  // const sequelize = new Sequelize(
  //   process.env.DATABASE || '',
  //   process.env.USER || '',
  //   process.env.PASSWORD || '',
  //   {
  //     dialect: 'postgres',
  //     host: process.env.HOST,
  //     port: Number(process.env.DBPORT),
  //     ssl: true,
  //     dialectOptions: {
  //     ssl: { require: true },
  //   },
  //   },
  // );
  // await sequelize
  //   .authenticate()
  //   .then(() => {
  //     console.log('DB Connection has been established successfully.');
  //   })
  //   .catch(e => {
  //     console.error('Unable to connect to the database:', e);
  //   });

  if (!cachedServer) {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
      origin: (req, callback) => callback(null, true),
    });
    app.use(helmet());

    // await app.listen(port);

    //serverless
    await app.init();
    const expressApp = await app.getHttpAdapter().getInstance();

    cachedServer = serverless.default(expressApp, { provider: 'aws' });
  }

  return cachedServer
}

bootstrap().then(() => {
  console.log('App is running on %s port', port);
});
