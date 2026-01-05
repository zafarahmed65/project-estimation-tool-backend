// lambda.js - AWS Lambda handler wrapper
import serverless from "serverless-http";
import app from "./index.js";

// Wrap Express app with serverless-http
export const handler = serverless(app, {
  binary: ["image/*", "application/pdf", "application/octet-stream"],
});
