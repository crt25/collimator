export class TupleMap<Key, Value> {
  private readonly _map = new Map<string, Value>();

  private getKey(key: Key): string {
    return `${this.keyToString(key)}`;
  }

  constructor(
    /**
     * Maps the key to a string. No two different keys are allowed to map to the same string.
     */
    private readonly keyToString: (key: Key) => string,
  ) {}

  /**
   * @returns boolean indicating whether an element with the specified key exists or not.
   */
  public has(key: Key): boolean {
    const stringKey = this.getKey(key);

    return this._map.has(stringKey);
  }

  /**
   * Adds a new element with a specified key and value to the Map.
   * If an element with the same key already exists, the element will be updated.
   */
  public set(key: Key, value: Value): void {
    const stringKey = this.getKey(key);

    this._map.set(stringKey, value);
  }

  /**
   * Returns a specified element from the Map object.
   * If the value that is associated to the provided key is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the Map.
   * @returns Returns the element associated with the specified key. If no element is associated with the specified key, undefined is returned.
   */
  public get(key: Key): Value | undefined {
    const stringKey = this.getKey(key);

    return this._map.get(stringKey);
  }

  /**
   * @returns true if an element in the Map existed and has been removed, or false if the element does not exist.
   */
  public delete(key: Key): boolean {
    const stringKey = this.getKey(key);

    return this._map.delete(stringKey);
  }

  /**
   * Returns an iterable of values in the map.
   */
  public values(): MapIterator<Value> {
    return this._map.values();
  }
}
