import { Tool } from './types';

export interface ExpSumArgs {
  values: number[];
}

export const expSumTool: Tool<ExpSumArgs, number> = {
  name: 'math.expSum',
  async execute(args: ExpSumArgs): Promise<number> {
    return args.values.reduce((acc, v) => acc + Math.exp(v), 0);
  },
};
