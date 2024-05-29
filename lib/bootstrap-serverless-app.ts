import { APIGatewayEvent, Context } from "aws-lambda";

import { bootstrap } from "../rs-cart-api/dist/main.js";

export async function bootstrapServerlessApp(  event: APIGatewayEvent, context: Context,) {
  try {
    console.log('start bootstrapping');
    const serverlessHandler = await bootstrap();
    console.log(`App is prepared`);
    const result = await serverlessHandler(event, context);

    return result;
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
