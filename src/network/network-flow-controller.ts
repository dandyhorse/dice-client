export interface DisconnectableNetwork {
  disconnect(): void;
}

export class StaleNetworkFlowError extends Error {
  constructor() {
    super('stale network flow');
  }
}

export class NetworkFlowController<T extends DisconnectableNetwork> {
  private generation = 0;
  private readonly owned = new Set<T>();
  private readonly onDisconnect?: (network: T) => void;
  private readonly onInvalidate?: () => void;

  constructor(onDisconnect?: (network: T) => void, onInvalidate?: () => void) {
    this.onDisconnect = onDisconnect;
    this.onInvalidate = onInvalidate;
  }

  begin(): number {
    return this.invalidate();
  }

  track(generation: number, network: T): void {
    if (!this.isCurrent(generation)) {
      this.disconnect(network);
      throw new StaleNetworkFlowError();
    }
    this.owned.add(network);
  }

  assert(generation: number, network: T): void {
    if (this.isCurrent(generation) && this.owned.has(network)) return;
    this.owned.delete(network);
    this.disconnect(network);
    throw new StaleNetworkFlowError();
  }

  preserve(generation: number, network: T): void {
    this.assert(generation, network);
    this.invalidate(network);
  }

  release(network: T): void {
    this.owned.delete(network);
  }

  owns(network: T): boolean {
    return this.owned.has(network);
  }

  isCurrent(generation: number): boolean {
    return generation === this.generation;
  }

  invalidate(preserve?: T): number {
    this.generation += 1;
    for (const network of this.owned) {
      if (network !== preserve) this.disconnect(network);
    }
    this.owned.clear();
    this.onInvalidate?.();
    return this.generation;
  }

  private disconnect(network: T): void {
    network.disconnect();
    this.onDisconnect?.(network);
  }
}
