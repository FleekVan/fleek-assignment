import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ServerStack } from "../lib/server-stack";

const app = new cdk.App();
new ServerStack(app, "production", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
