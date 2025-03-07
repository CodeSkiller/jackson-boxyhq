// This is an in-memory implementation to be used with testing and prototyping only

import { DatabaseDriver, DatabaseOption, Index, Encrypted } from '../typings';
import * as dbutils from './utils';

class Mem implements DatabaseDriver {
  private options: DatabaseOption;
  private store: any;
  private indexes: any;
  private cleanup: any;
  private ttlStore: any;
  private ttlCleanup: any;
  private timerId: any;

  constructor(options: DatabaseOption) {
    this.options = options;
  }

  async init(): Promise<Mem> {
    this.store = {}; // map of key, value
    this.indexes = {}; // map of key, Set
    this.cleanup = {}; // map of indexes for cleanup when store key is deleted
    this.ttlStore = {}; // map of key to ttl

    if (this.options.ttl) {
      this.ttlCleanup = async () => {
        const now = Date.now();
        for (const k in this.ttlStore) {
          if (this.ttlStore[k].expiresAt < now) {
            await this.delete(this.ttlStore[k].namespace, this.ttlStore[k].key);
          }
        }

        if (this.options.ttl) {
          this.timerId = setTimeout(this.ttlCleanup, this.options.ttl * 1000);
        }
      };

      this.timerId = setTimeout(this.ttlCleanup, this.options.ttl * 1000);
    }

    return this;
  }

  async get(namespace: string, key: string): Promise<any> {
    const res = this.store[dbutils.key(namespace, key)];
    if (res) {
      return res;
    }

    return null;
  }

  async getAll(namespace: string, pageOffset: number, pageLimit: number): Promise<unknown[]> {
    const offsetAndLimitValueCheck = !dbutils.isNumeric(pageOffset) && !dbutils.isNumeric(pageLimit);
    const returnValue: string[] = [];
    const skip = Number(offsetAndLimitValueCheck ? 0 : pageOffset);

    let take = Number(offsetAndLimitValueCheck ? this.options.pageLimit : pageLimit);
    let count = 0;

    take += skip;

    if (namespace) {
      const index = dbutils.keyFromParts(dbutils.createdAtPrefix, namespace);

      if (this.indexes[index] === undefined) {
        return [];
      }

      const val: string[] = Array.from(this.indexes[index]);
      const iterator: IterableIterator<string> = val.reverse().values();

      for (const value of iterator) {
        if (count >= take) {
          break;
        }

        if (count >= skip) {
          returnValue.push(this.store[dbutils.keyFromParts(namespace, value)]);
        }

        count++;
      }
    }

    return returnValue || [];
  }

  async getByIndex(namespace: string, idx: Index): Promise<any> {
    const dbKeys = await this.indexes[dbutils.keyForIndex(namespace, idx)];

    const ret: string[] = [];
    for (const dbKey of dbKeys || []) {
      ret.push(await this.get(namespace, dbKey));
    }

    return ret;
  }

  async put(namespace: string, key: string, val: Encrypted, ttl = 0, ...indexes: any[]): Promise<any> {
    const k = dbutils.key(namespace, key);

    this.store[k] = val;

    if (ttl) {
      this.ttlStore[k] = {
        namespace,
        key,
        expiresAt: Date.now() + ttl * 1000,
      };
    }
    // no ttl support for secondary indexes
    for (const idx of indexes || []) {
      const idxKey = dbutils.keyForIndex(namespace, idx);
      let set = this.indexes[idxKey];
      if (!set) {
        set = new Set();
        this.indexes[idxKey] = set;
      }

      set.add(key);
      const cleanupKey = dbutils.keyFromParts(dbutils.indexPrefix, k);
      let cleanup = this.cleanup[cleanupKey];
      if (!cleanup) {
        cleanup = new Set();
        this.cleanup[cleanupKey] = cleanup;
      }

      cleanup.add(idxKey);
    }
    let createdAtSet = this.indexes[dbutils.keyFromParts(dbutils.createdAtPrefix, namespace)];
    if (!createdAtSet) {
      createdAtSet = new Set();
      this.indexes[dbutils.keyFromParts(dbutils.createdAtPrefix, namespace)] = createdAtSet;
      this.store['createdAt'] = new Date().toISOString();
      createdAtSet.add(key);
    } else {
      if (!this.indexes[dbutils.keyFromParts(dbutils.createdAtPrefix, namespace)].has(key)) {
        createdAtSet.add(key);
        this.store['createdAt'] = new Date().toISOString();
      }
    }

    let modifiedAtSet = this.indexes[dbutils.keyFromParts(dbutils.modifiedAtPrefix, namespace)];
    if (!modifiedAtSet) {
      modifiedAtSet = new Set();
      this.indexes[dbutils.keyFromParts(dbutils.modifiedAtPrefix, namespace)] = modifiedAtSet;
    }
    modifiedAtSet.add(key);
    this.store['modifiedAt'] = new Date().toISOString();
  }

  async delete(namespace: string, key: string): Promise<any> {
    const k = dbutils.key(namespace, key);

    delete this.store[k];

    const idxKey = dbutils.keyFromParts(dbutils.indexPrefix, k);
    // delete secondary indexes and then the mapping of the seconary indexes
    const dbKeys = this.cleanup[idxKey];

    for (const dbKey of dbKeys || []) {
      this.indexes[dbKey] && this.indexes[dbKey].delete(key);
    }
    this.indexes[dbutils.keyFromParts(dbutils.createdAtPrefix, namespace)].delete(key);
    this.indexes[dbutils.keyFromParts(dbutils.modifiedAtPrefix, namespace)].delete(key);
    delete this.cleanup[idxKey];
    delete this.ttlStore[k];
  }
}

export default {
  new: async (options: DatabaseOption) => {
    return await new Mem(options).init();
  },
};
