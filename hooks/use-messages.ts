"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAllMessages,
  getMessageById,
  deleteMessage as deleteMessageAPI,
  markMessageAsRead,
  archiveMessage as archiveMessageAPI,
  replyToMessage,
  ContactMessage,
  MessageStatus,
} from "@/lib/messages";

export function useMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState<{ isSeen: string; q: string }>({
    isSeen: "all",
    q: "",
  });

  // Load messages from API on component mount
  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      isSeen?: string;
      q?: string;
    }) => {
      try {
        setLoading(true);
        setError(null);
        const effectiveIsSeen = params?.isSeen ?? filters.isSeen;
        const effectiveQ = params?.q ?? filters.q;
        const response = await getAllMessages({
          page: params?.page || pagination.page,
          limit: params?.limit || pagination.limit,
          isSeen:
            effectiveIsSeen === "all" ? undefined : effectiveIsSeen === "true",
          q: effectiveQ,
        });
        setMessages(response.data.messages || []);
        setPagination({
          page: parseInt(response.data.page),
          limit: parseInt(response.data.limit),
          total: response.data.total,
          totalPages: response.data.totalPages,
        });
        if (params && (params.isSeen !== undefined || params.q !== undefined)) {
          setFilters((prev) => ({
            isSeen: params.isSeen ?? prev.isSeen,
            q: params.q ?? prev.q,
          }));
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
        setError("فشل في تحميل الرسائل");
        setMessages([]);
      } finally {
        setLoading(false);
      }
    },
    [filters.isSeen, filters.q] // Only include filter dependencies that are stable
  );

  const addMessage = useCallback(
    (
      input: Omit<
        ContactMessage,
        "_id" | "isSeen" | "createdAt" | "updatedAt" | "__v"
      >
    ) => {
      // This function is kept for backward compatibility but should be handled by the contact form
      const now = new Date().toISOString();
      const newMsg: ContactMessage = {
        _id: `${Date.now()}`,
        name: input.name,
        email: input.email,
        message: input.message,
        subject: input.subject,
        isSeen: false,
        createdAt: now,
        updatedAt: now,
        __v: 0,
      };
      setMessages((prev) => [newMsg, ...prev]);
      return newMsg;
    },
    []
  );

  const updateMessage = useCallback(
    (id: string, patch: Partial<ContactMessage>) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === id
            ? { ...m, ...patch, updatedAt: new Date().toISOString() }
            : m
        )
      );
    },
    []
  );

  const deleteMessage = useCallback(async (id: string) => {
    try {
      setError(null);
      await deleteMessageAPI(id);
      // تحديث فوري للجدول
      setMessages((prev) => prev.filter((m) => m._id !== id));
      // تحديث الـ pagination
      setPagination((prev) => ({
        ...prev,
        total: prev.total - 1,
        totalPages: Math.ceil((prev.total - 1) / prev.limit),
      }));
    } catch (err) {
      console.error("Failed to delete message:", err);
      setError("فشل في حذف الرسالة");
    }
  }, []);

  const markRead = useCallback(
    async (id: string, read: boolean) => {
      try {
        setError(null);
        if (read) {
          await markMessageAsRead(id);
          updateMessage(id, { isSeen: true });
        } else {
          updateMessage(id, { isSeen: false });
        }
      } catch (err) {
        console.error("Failed to mark message as read:", err);
        setError("فشل في تحديث حالة الرسالة");
      }
    },
    [updateMessage]
  );

  const archive = useCallback(
    async (id: string, archived: boolean) => {
      try {
        setError(null);
        if (archived) {
          await archiveMessageAPI(id);
          updateMessage(id, { isSeen: true });
        } else {
          updateMessage(id, { isSeen: false });
        }
      } catch (err) {
        console.error("Failed to archive message:", err);
        setError("فشل في أرشفة الرسالة");
      }
    },
    [updateMessage]
  );

  const reply = useCallback(
    async (id: string, replyText: string) => {
      try {
        setError(null);
        await replyToMessage(id, replyText);
        updateMessage(id, { isSeen: true });
      } catch (err) {
        console.error("Failed to reply to message:", err);
        setError("فشل في إرسال الرد");
      }
    },
    [updateMessage]
  );

  const counts = useMemo(() => {
    return {
      total: pagination.total,
      new: messages.filter((m) => !m.isSeen).length,
      read: messages.filter((m) => m.isSeen).length,
    };
  }, [messages, pagination.total]);

  const goToPage = useCallback(
    (page: number) => {
      setPagination((prev) => ({ ...prev, page }));
      loadMessages({ page, isSeen: filters.isSeen, q: filters.q });
    },
    [loadMessages, filters.isSeen, filters.q]
  );

  const changePageSize = useCallback(
    (limit: number) => {
      setPagination((prev) => ({ ...prev, limit, page: 1 }));
      loadMessages({
        page: 1,
        limit,
        isSeen: filters.isSeen,
        q: filters.q,
      });
    },
    [loadMessages, filters.isSeen, filters.q]
  );

  const searchMessages = useCallback(
    (q: string, isSeen?: string) => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      loadMessages({ page: 1, q, isSeen });
    },
    [loadMessages]
  );

  return {
    messages,
    loading,
    error,
    pagination,
    addMessage,
    updateMessage,
    deleteMessage,
    markRead,
    archive,
    reply,
    counts,
    loadMessages,
    goToPage,
    changePageSize,
    searchMessages,
    clearError: () => setError(null),
  };
}
