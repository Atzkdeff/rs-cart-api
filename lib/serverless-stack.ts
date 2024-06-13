import * as cdk from 'aws-cdk-lib';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNode from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from 'constructs'
import * as path from 'path';

export class ServerlessStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dbCredentialsSecret = new secretsmanager.Secret(this, 'RDSCreds', {
      secretName: id + "-rds-credentials",
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: process.env.RDS_DB_USER_NAME || ""
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password'
      }
    });
    const rdsCredentials = rds.Credentials.fromSecret(dbCredentialsSecret);

    const vpc = new ec2.Vpc(this, 'MyVPC', {
      maxAzs: 3, // Default is all AZs in the region
      natGateways: 0,
      subnetConfiguration: [
        // {
        //   name: "Isolated",
        //   subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        // },
        // {
        //   name: "Private",
        //   subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        // },
        {
          cidrMask: 24,
          name: "Public",
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
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
      ec2.Port.tcp(+(process.env.RDS_DEFAULT_PORT ?? 5432)),
      "allow db connections from the serverless app"
    );

    const database = new rds.DatabaseInstance(this, 'NestJS RDS db', {
      databaseName: process.env.RDS_DB_NAME,
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16_2,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      allocatedStorage: 20,
      multiAz: false,
      allowMajorVersionUpgrade: false,
      autoMinorVersionUpgrade: true,
      backupRetention: cdk.Duration.days(7),
      deleteAutomatedBackups: true,
      credentials: rdsCredentials,
      vpc,
      vpcSubnets: {
        // subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        subnetType: ec2.SubnetType.PUBLIC,
      },
      // securityGroups: [rdsSecurityGroup],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deletionProtection: false
    });

    const serverlessBootstrap = new lambdaNode.NodejsFunction(this, "serverlessBootstrap", {
      bundling: {
        minify: true, // Applies minification during the build
        sourceMap: true, // Includes source maps
        target: 'es2020', // Target specific version of ECMAScript
        nodeModules: ["pg", "pg-hstore"],
        externalModules: [
          "class-transformer",
          "@nestjs/websockets/socket-module",
          "@nestjs/microservices",
          "class-validator",
          // "@nestjs/microservices/microservices-module",
          // "cache-manager",
          // 'aws-sdk', '@nestjs/microservices', 'class-transformer', '@nestjs/websockets/socket-module', 'cache-manager', 'class-validator'
        ],
      },
      environment: {
        DATABASE_HOST: database.dbInstanceEndpointAddress,
        RDS_DB_NAME: process.env.RDS_DB_NAME ?? "",
        RDS_DB_USER_NAME: process.env.RDS_DB_USER_NAME ?? "",
        RDS_DEFAULT_PORT: database.dbInstanceEndpointPort,
        DATABASE_PASSWORD: rdsCredentials.password?.unsafeUnwrap() as string
      },
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: lambda.Code.fromAsset(path.join(__dirname, "bootstrap-serverless-app.ts")).path,
      handler: "bootstrapServerlessApp",
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      // timeout: cdk.Duration.seconds(30),
      vpc,
      allowPublicSubnet: true, // Confirm that lambda is in VPC
      // securityGroups: [lambdaServerlessSecurityGroup],
      securityGroups: [database.connections.securityGroups[0]],
      depsLockFilePath: path.join(
        __dirname,
        "..",
        "package-lock.json"
      ),
    });


    database.connections.allowDefaultPortFrom(serverlessBootstrap);
    dbCredentialsSecret.grantRead(serverlessBootstrap);
    database.grantConnect(serverlessBootstrap, process.env.RDS_DB_USER_NAME);

    const apiForNestJs = new apigateway.LambdaRestApi(this, "NestJsEndpoint", {
      handler: serverlessBootstrap,
    });
  }
}
