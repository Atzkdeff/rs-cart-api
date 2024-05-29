import * as cdk from 'aws-cdk-lib';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNode from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from 'constructs'
import * as path from 'path';

export class ServerlessStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const serverlessBootstrap = new lambdaNode.NodejsFunction(this, "serverlessBootstrap", {
      bundling: {
        minify: true, // Applies minification during the build
        sourceMap: true, // Includes source maps
        target: 'es2020', // Target specific version of ECMAScript
        // define: { 'process.env.KEY': JSON.stringify('VALUE') }, // Replace variables in code
        externalModules: [
          "class-transformer",
          "@nestjs/websockets/socket-module",
          "@nestjs/microservices",
          "class-validator",
          // "@nestjs/microservices/microservices-module",
          // "cache-manager",
        ],
      },

      handler: "bootstrapServerlessApp",
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      entry: lambda.Code.fromAsset(path.join(__dirname, "bootstrap-serverless-app.ts")).path,
      // depsLockFilePath: path.join(
      //   __dirname,
      //   "..",
      //   "package-lock.json"
      // ),
    });


    // API Gateway to route HTTP requests to the Lambda function
    const apiForNestJs = new apigateway.LambdaRestApi(this, "NestJsEndpoint", {
      handler: serverlessBootstrap,
    });
  }
}
