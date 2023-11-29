export async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
export function split(arr, n) {
  const res = [];
  while (arr.length) {
    res.push(arr.splice(0, n));
  }
  return res;
}
export const delayMS = (t = 200) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(t);
    }, t);
  });
};
export function throttledPromises<T>(
  asyncFunction: (item: T) => Promise<any>,
  items: T[] = [],
  batchSize = 1,
  delay = 0,
) {
  return new Promise(async (resolve, reject) => {
    const output = [];
    const batches = split(items, batchSize);
    await asyncForEach(batches, async (batch) => {
      const promises = batch.map(asyncFunction).map((p) => p.catch(reject));
      const results = await Promise.all(promises);
      output.push(...results);
      await delayMS(delay);
    });
    resolve(output);
  });
}
