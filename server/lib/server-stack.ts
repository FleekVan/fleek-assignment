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
    const lambdaSecurityGroup = new ec2.SecurityGroup(
      this,
      "LambdaSecurityGroup",
      { vpc },
    );
    const dbSecurityGroup = new ec2.SecurityGroup(this, "DbSecurityGroup", {
      vpc,
    });
    dbSecurityGroup.addIngressRule(
      lambdaSecurityGroup,
      ec2.Port.tcp(3306),
      "allow lambda to connect to db",
    );
    // In a real setup, this would not exist
    // It's public here for easy skeema database migrations. Otherwise we need to run the migrations from an ec2 instance in the private subnet.
    dbSecurityGroup.addIngressRule(
      ec2.Peer.ipv4("0.0.0.0/0"),
      ec2.Port.tcp(3306),
      "allow everyone to connect to the db",
    );

    const db = new rds.DatabaseInstance(this, "database", {
      // networking
      vpc,
      vpcSubnets: vpc.selectSubnets({
        // In a real setup, this will be ec2.SubnetType.PRIVATE_WITH_EGRESS.
        // It's public here for easy skeema database migrations. Otherwise we need to run the migrations from an ec2 instance in the private subnet.
        subnetType: ec2.SubnetType.PUBLIC,
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
      // In a real setup, this would be false.
      // It's public here for easy skeema database migrations. Otherwise we need to run the migrations from an ec2 instance in the private subnet.
      publiclyAccessible: true,
    });

    const dbProxy = new rds.DatabaseProxy(this, "Proxy", {
      proxyTarget: rds.ProxyTarget.fromInstance(db),
      secrets: [db.secret!],
      securityGroups: [dbSecurityGroup],
      vpc,
      requireTLS: false,
      vpcSubnets: vpc.selectSubnets({
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      }),
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
        AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE: "1", // sdk v3 sucks
        DB_SECRET_ARN: db.secret!.secretFullArn!,
        DB_HOST: dbProxy.endpoint,
      },
    });

    db.secret!.grantRead(handler);

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
