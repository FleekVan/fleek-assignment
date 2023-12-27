import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as apigwv2_integration from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import { Construct } from "constructs";
import { TypeScriptCode } from "@mrgrain/cdk-esbuild";

export class ServerStack extends cdk.Stack {
  private databaseName: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.databaseName = "fleekdb";

    const vpc = new ec2.Vpc(this, "vpc", {
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "privatelambda",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 24,
          name: "public",
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });
    const dbSecurityGroup = new ec2.SecurityGroup(this, "DbSecurityGroup", {
      vpc,
    });

    const lambdaSecurityGroup = new ec2.SecurityGroup(
      this,
      "LambdaSecurityGroup",
      {
        vpc,
      },
    );

    const db = new rds.DatabaseInstance(this, "database", {
      // networking
      vpc,
      vpcSubnets: vpc.selectSubnets({
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      }),
      securityGroups: [dbSecurityGroup],

      // configure for free-tier MySQL
      engine: rds.DatabaseInstanceEngine.MYSQL,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE3,
        ec2.InstanceSize.MICRO,
      ),
      maxAllocatedStorage: 200,

      // credentials

      databaseName: this.databaseName,
      credentials: rds.Credentials.fromGeneratedSecret("admin"),
    });

    const handler = new lambda.Function(this, "handler-graphql", {
      vpc,
      vpcSubnets: vpc.selectSubnets({
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      }),
      securityGroups: [lambdaSecurityGroup],
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: new TypeScriptCode("src/lambda.ts", {
        buildOptions: {
          platform: "node",
          target: "node20",
          format: "cjs",
          outfile: "index.cjs",
        },
      }),
      timeout: cdk.Duration.seconds(30),
      memorySize: 1024, // lambda performs better with more memory
      environment: {
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1", // optimization
        DB_ENDPOINT_ADDRESS: db.dbInstanceEndpointAddress,
        DB_NAME: this.databaseName,
        DB_PORT: db.dbInstanceEndpointPort,
        DB_SECRET_ARN: db.secret?.secretFullArn || "",
      },
    });

    const api = new apigwv2.HttpApi(this, "http-api-gateway", {
      corsPreflight: {
        allowHeaders: ["Authorization"],
        allowMethods: [
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.HEAD,
          apigwv2.CorsHttpMethod.OPTIONS,
          apigwv2.CorsHttpMethod.POST,
        ],
        allowOrigins: ["*"],
        maxAge: cdk.Duration.days(10),
      },
    });

    api.addRoutes({
      path: "/graphql",
      methods: [apigwv2.HttpMethod.ANY],
      integration: new apigwv2_integration.HttpLambdaIntegration(
        "graphql-endpoint",
        handler,
      ),
    });

    new cdk.CfnOutput(this, "api-url", {
      value: api.apiEndpoint + "/graphql",
    });
  }
}
