import { InterAgentMessage, AgentType } from './types';

type Subscriber = (message: InterAgentMessage) => void;

export class AgentMessageBus {
  private subscribers: Map<AgentType | 'BROADCAST', Set<Subscriber>> = new Map();

  subscribe(target: AgentType | 'BROADCAST', handler: Subscriber): () => void {
    const set = this.subscribers.get(target) ?? new Set<Subscriber>();
    set.add(handler);
    this.subscribers.set(target, set);
    return () => {
      set.delete(handler);
    };
  }

  async broadcast(message: InterAgentMessage): Promise<void> {
    const targets: (AgentType | 'BROADCAST')[] = ['BROADCAST', message.to];
    for (const target of targets) {
      const set = this.subscribers.get(target);
      if (!set) continue;
      for (const handler of set) handler(message);
    }
  }
}
