export interface SharedContextSnapshot {
  userId: string;
  sessionId: string;
  data: Record<string, unknown>;
  updatedAtMs: number;
}

export class SharedContextStore {
  private store: Map<string, SharedContextSnapshot> = new Map();

  private key(userId: string, sessionId: string): string {
    return `${userId}:${sessionId}`;
  }

  get(userId: string, sessionId: string): SharedContextSnapshot | undefined {
    return this.store.get(this.key(userId, sessionId));
  }

  upsert(userId: string, sessionId: string, data: Record<string, unknown>): SharedContextSnapshot {
    const key = this.key(userId, sessionId);
    const existing = this.store.get(key);
    const merged = {
      userId,
      sessionId,
      data: { ...(existing?.data ?? {}), ...data },
      updatedAtMs: Date.now(),
    } satisfies SharedContextSnapshot;
    this.store.set(key, merged);
    return merged;
  }
}
