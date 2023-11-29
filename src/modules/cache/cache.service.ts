import {
  IDynamicObject,
  IStringDynamicObject,
} from '@common/auth/types/DynamicObject.types';
import { sha256HashString } from '@common/utils/hash';
import { _1_MINUTE } from '@common/utils/time';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class NestCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  sortObjectIntoKey(object: IStringDynamicObject) {
    const sortedKeys = Object.keys(object).sort();
    const hashedKeyObject = sortedKeys.reduce((acc, key) => {
      acc += key + ':' + object[key] + '_';
      return acc;
    }, '');

    return sha256HashString(hashedKeyObject);
  }

  sortDynamicObjectIntoKey(object: IDynamicObject) {
    const sortedKeys = Object.keys(object).sort();
    const hashedKeyObject = sortedKeys.reduce((acc, key) => {
      acc += key + ':' + object[key] + '_';
      return acc;
    }, '');

    return sha256HashString(hashedKeyObject);
  }

  async get(key: IStringDynamicObject) {
    const hashedKey = this.sortObjectIntoKey(key);
    return await this.cacheManager.get(hashedKey);
  }

  async set(key: IStringDynamicObject, value: any, ttl?: number) {
    const hashedKey = this.sortObjectIntoKey(key);
    return await this.cacheManager.set(hashedKey, value, ttl);
  }

  async del(key: IStringDynamicObject) {
    const hashedKey = this.sortObjectIntoKey(key);
    return await this.cacheManager.del(hashedKey);
  }

  async reset() {
    return await this.cacheManager.reset();
  }

  async cachedValueOrFetch<T>(
    key: IStringDynamicObject,
    fetchFunction: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cachedValue = await this.get(key);
    if (cachedValue) {
      return cachedValue as T;
    }

    const fetchedValue = await fetchFunction();
    await this.set(key, fetchedValue, ttl);
    return fetchedValue;
  }

  async secureIdempotence(key: IStringDynamicObject, expireAt = 5 * _1_MINUTE) {
    const cachedValue = await this.get(key);
    if (cachedValue) {
      return false;
    }

    await this.set(key, true, expireAt);
    return true;
  }
}
