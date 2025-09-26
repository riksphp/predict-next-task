export interface ToolExecutionContext {
  userId: string;
  sessionId: string;
}

export interface Tool<TArgs = unknown, TResult = unknown> {
  name: string;
  description?: string;
  execute(args: TArgs, ctx: ToolExecutionContext): Promise<TResult>;
}

export class ToolRegistry {
  private tools: Map<string, Tool<any, any>> = new Map();

  register(tool: Tool<any, any>): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): Tool<any, any> | undefined {
    return this.tools.get(name);
  }

  list(): string[] {
    return Array.from(this.tools.keys());
  }
}
