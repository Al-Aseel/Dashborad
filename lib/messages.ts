import { api } from "./api";

export type MessageStatus = "new" | "read" | "replied" | "archived";

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  message: string;
  subject: string;
  contactInfo?: string;
  isSeen: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface MessagesResponse {
  status: string;
  data: {
    messages: ContactMessage[];
    total: number;
    page: string;
    limit: string;
    totalPages: number;
  };
  message: string;
}

export interface MessageResponse {
  status: string;
  data: {
    message: ContactMessage;
  };
  message: string;
}

// Get all messages
export async function getAllMessages(params?: {
  page?: number;
  limit?: number;
  isSeen?: boolean;
  q?: string;
}): Promise<MessagesResponse> {
  try {
    const response = await api.get("/message", {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        isSeen: params?.isSeen,
        q: params?.q,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
}

// Get specific message by ID
export async function getMessageById(id: string): Promise<MessageResponse> {
  try {
    const response = await api.get(`/message/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching message ${id}:`, error);
    throw error;
  }
}

// Delete a message
export async function deleteMessage(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete(`/message/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting message ${id}:`, error);
    throw error;
  }
}

// Update message status (mark as read, archive, etc.)
export async function updateMessageStatus(
  id: string,
  status: MessageStatus,
  reply?: string
): Promise<MessageResponse> {
  try {
    const response = await api.get(`/message/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error updating message ${id}:`, error);
    throw error;
  }
}

// Mark message as read
export async function markMessageAsRead(id: string): Promise<MessageResponse> {
  return updateMessageStatus(id, "read");
}

// Archive message
export async function archiveMessage(id: string): Promise<MessageResponse> {
  return updateMessageStatus(id, "archived");
}

// Reply to message
export async function replyToMessage(
  id: string,
  reply: string
): Promise<MessageResponse> {
  return updateMessageStatus(id, "replied", reply);
}
