import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import {
  CallToolResult,
  ServerNotification,
  ServerRequest,
} from "@modelcontextprotocol/sdk/types.js";
import axios, { AxiosInstance } from "axios";

const FORTY_TWO_TOKEN = process.env.FORTY_TWO_TOKEN;
const FORTY_TWO_URL = process.env.FORTY_TWO_URL;

if (!FORTY_TWO_TOKEN) {
  throw new Error(
    "FORTY_TWO_TOKEN must be set in environment variables.",
  );
}

export type ToolConfig = {
  title: string;
  description: string;
  inputSchema: any;
  outputSchema?: any;
};

export type ToolHandler = (
  args: any,
  extra: RequestHandlerExtra<ServerRequest, ServerNotification>,
) => CallToolResult | Promise<CallToolResult>;

export type Tool = {
  config: ToolConfig;
  handler: ToolHandler;
};

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: FORTY_TWO_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${FORTY_TWO_TOKEN}`;