"use client"

import { useState, useCallback } from "react"

export function useArrayManager<T>(initialValue: T[] = []) {
  const [items, setItems] = useState<T[]>(initialValue)

  const addItem = useCallback((item: T) => {
    setItems((prev) => [...prev, item])
  }, [])

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updateItem = useCallback((index: number, newItem: T) => {
    setItems((prev) => prev.map((item, i) => (i === index ? newItem : item)))
  }, [])

  const clearItems = useCallback(() => {
    setItems([])
  }, [])

  return {
    items,
    setItems,
    addItem,
    removeItem,
    updateItem,
    clearItems,
  }
}
