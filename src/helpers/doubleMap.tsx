/*
* Represents a Map but requiring two keys
*/

export class DoubleMap<K, L, V> implements Iterable<[K, L, V]> {
  private outer = new Map<K, Map<L, V>>();

  get(k: K, l: L): V | undefined {
    return this.outer.get(k)?.get(l);
  }

  set(k: K, l: L, v: V): this {
    let inner = this.outer.get(k);
    if (!inner) {
      inner = new Map<L, V>();
      this.outer.set(k, inner);
    }
    inner.set(l, v);
    return this;
  }

  has(k: K, l: L): boolean {
    return this.outer.get(k)?.has(l) ?? false;
  }

  delete(k: K, l: L): boolean {
    const inner = this.outer.get(k);
    if (!inner) return false;
    const deleted = inner.delete(l);
    if (inner.size === 0) this.outer.delete(k); // clean up empty inner maps
    return deleted;
  }

  getInner(k: K): ReadonlyMap<L, V> | undefined {
    return this.outer.get(k);
  }

  clear(): void {
    this.outer.clear();
  }

  get size(): number {
    let n = 0;
    for (const inner of this.outer.values()) n += inner.size;
    return n;
  }

  *[Symbol.iterator](): IterableIterator<[K, L, V]> {
    for (const [k, inner] of this.outer) {
      for (const [l, v] of inner) {
        yield [k, l, v];
      }
    }
  }

  entries(): IterableIterator<[K, L, V]> {
    return this[Symbol.iterator]();
  }

  *keys(): IterableIterator<[K, L]> {
    for (const [k, l] of this) yield [k, l];
  }

  *values(): IterableIterator<V> {
    for (const [, , v] of this) yield v;
  }

  forEach(cb: (v: V, k: K, l: L, map: this) => void): void {
    for (const [k, l, v] of this) cb(v, k, l, this);
  }
}