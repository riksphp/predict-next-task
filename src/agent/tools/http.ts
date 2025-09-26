import { Tool, ToolExecutionContext } from './types';

export interface HttpGetArgs {
  url: string;
  headers?: Record<string, string>;
}

export interface HttpPostArgs {
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
}

export const httpGetTool: Tool<HttpGetArgs, unknown> = {
  name: 'http.get',
  async execute(args: HttpGetArgs, _ctx: ToolExecutionContext): Promise<unknown> {
    const res = await fetch(args.url, {
      method: 'GET',
      headers: args.headers,
    });
    const contentType = res.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) return res.json();
    return res.text();
  },
};

export const httpPostTool: Tool<HttpPostArgs, unknown> = {
  name: 'http.post',
  async execute(args: HttpPostArgs, _ctx: ToolExecutionContext): Promise<unknown> {
    const res = await fetch(args.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(args.headers ?? {}) },
      body: args.body ? JSON.stringify(args.body) : undefined,
    });
    const contentType = res.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) return res.json();
    return res.text();
  },
};
