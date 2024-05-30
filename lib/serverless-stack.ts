import * as cdk from 'aws-cdk-lib';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNode from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs'
import * as path from 'path';

export class ServerlessStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'MyVPC', {
      maxAzs: 3, // Default is all AZs in the region
    });

    const lambdaServerlessSecurityGroup = new ec2.SecurityGroup(
      this,
      "Serverless Security Group",
      {
        vpc,
      }
    );

    const rdsSecurityGroup = new ec2.SecurityGroup(
      this,
      "RDS Security group",
      {
        vpc,
      }
    );

    rdsSecurityGroup.addIngressRule(
      lambdaServerlessSecurityGroup,
      ec2.Port.tcp(5432),
      "allow db connections from the serverless app"
    );

    const database = new rds.DatabaseInstance(this, 'NestJS RDS db', {
      databaseName: process.env.MAIN_DB_NAME,
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16_2,
      }),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      allocatedStorage: 20,
      vpc,
      securityGroups: [rdsSecurityGroup]
    });

    const serverlessBootstrap = new lambdaNode.NodejsFunction(this, "serverlessBootstrap", {
      bundling: {
        minify: true, // Applies minification during the build
        sourceMap: true, // Includes source maps
        target: 'es2020', // Target specific version of ECMAScript
        externalModules: [
          "class-transformer",
          "@nestjs/websockets/socket-module",
          "@nestjs/microservices",
          "class-validator",
          // "@nestjs/microservices/microservices-module",
          // "cache-manager",
        ],
      },
      environment: {
        HOST: database.dbInstanceEndpointAddress,
        DATABASE: process.env.MAIN_DB_NAME ?? "",
        USER: "",
        DBPORT: database.dbInstanceEndpointPort,
        PASSWORD: ""/*rdsCredentials.password?.unsafeUnwrap() as string*/,
      },
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: lambda.Code.fromAsset(path.join(__dirname, "bootstrap-serverless-app.ts")).path,
      handler: "bootstrapServerlessApp",
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      vpc,
      securityGroups: [lambdaServerlessSecurityGroup]
      // depsLockFilePath: path.join(
      //   __dirname,
      //   "..",
      //   "package-lock.json"
      // ),
    });


    const apiForNestJs = new apigateway.LambdaRestApi(this, "NestJsEndpoint", {
      handler: serverlessBootstrap,
    });
  }
}
