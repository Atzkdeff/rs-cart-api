import { APIGatewayEvent, Context } from "aws-lambda";
import * as serverless from 'serverless-http';

import { bootstrap } from "../rs-cart-api/dist/main.js";

let cachedServer: serverless.Handler;

export async function bootstrapServerlessApp(  event: APIGatewayEvent, context: Context,) {
  try {
    console.log('start bootstrapping');

    if (!cachedServer) {
      cachedServer = await  bootstrap();
    }

    console.log(`App is prepared`);
    return await cachedServer(event, context);
  } catch (error) {
    console.log(
      'app bootstrap failed',
      error,
      (error as { message?: string })?.message,
    );

    return {
      statusCode: 400,
      body: JSON.stringify({
        errorMessage: 'app bootstrap failed',
      }),
    };
  }
}
