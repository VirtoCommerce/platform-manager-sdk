const resultsMap = new WeakMap();

export default function once(
  func: (...args: unknown[]) => void
): (...args: unknown[]) => unknown {
  return function (...args: unknown[]): unknown {
    if (!resultsMap.has(func)) {
      const result = func.apply(this, args);
      resultsMap.set(func, result);
    }
    return resultsMap.get(func);
  };
}
