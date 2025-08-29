"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

export type MessageStatus = "new" | "read" | "replied" | "archived"

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  body: string
  status: MessageStatus
  reply?: string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = "aseel_messages_store"

function loadFromStorage(): ContactMessage[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ContactMessage[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveToStorage(messages: ContactMessage[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  } catch {
    // ignore
  }
}

export function useMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>(loadFromStorage)

  useEffect(() => {
    saveToStorage(messages)
  }, [messages])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const next = JSON.parse(e.newValue) as ContactMessage[]
          setMessages(next)
        } catch {
          // noop
        }
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const addMessage = useCallback((input: Omit<ContactMessage, "id" | "status" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString()
    const newMsg: ContactMessage = {
      id: `${Date.now()}`,
      name: input.name,
      email: input.email,
      phone: input.phone,
      subject: input.subject,
      body: input.body,
      status: "new",
      reply: input.reply,
      createdAt: now,
      updatedAt: now,
    }
    setMessages((prev) => [newMsg, ...prev])
    return newMsg
  }, [])

  const updateMessage = useCallback((id: string, patch: Partial<ContactMessage>) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch, updatedAt: new Date().toISOString() } : m)),
    )
  }, [])

  const deleteMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const markRead = useCallback((id: string, read: boolean) => {
    updateMessage(id, { status: read ? "read" : "new" })
  }, [updateMessage])

  const archive = useCallback((id: string, archived: boolean) => {
    updateMessage(id, { status: archived ? "archived" : "read" })
  }, [updateMessage])

  const reply = useCallback((id: string, replyText: string) => {
    updateMessage(id, { reply: replyText, status: "replied" })
  }, [updateMessage])

  const counts = useMemo(() => {
    return {
      total: messages.length,
      new: messages.filter((m) => m.status === "new").length,
      read: messages.filter((m) => m.status === "read").length,
      replied: messages.filter((m) => m.status === "replied").length,
      archived: messages.filter((m) => m.status === "archived").length,
    }
  }, [messages])

  return { messages, addMessage, updateMessage, deleteMessage, markRead, archive, reply, counts }
}


