import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { TypeScriptCode } from "@mrgrain/cdk-esbuild";

export class ServerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new lambda.Function(this, "graphql-api", {
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
      environment: {
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      },
    });
  }
}
