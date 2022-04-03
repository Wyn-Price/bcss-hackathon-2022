import { useCallback } from 'react';
import { useState, useEffect } from 'react';
export default class ListenableObject<T> {
  private _value: T

  listeners = new Set<(newValue: T, oldValue: T) => void>()

  constructor(defaultValue: T) {
    this._value = defaultValue
  }

  get value() {
    return this._value
  }

  set value(val: T) {
    const old = this._value
    this._value = val
    Array.from(this.listeners).forEach(lis => lis(val, old))
  }
}

export const useListenableObject = <T>(obj: ListenableObject<T>) => {
  const [state, setState] = useState(obj.value)
  useEffect(() => {
    const listener = (val: T) => {
      setState(val)
    }
    obj.listeners.add(listener)
    return () => {
      obj.listeners.delete(listener)
    }
  }, [obj])
  return [
    state,
    useCallback((o: T) => {
      obj.value = o
    }, [obj])
  ] as const
}