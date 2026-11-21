/** Stable UI-facing contract; the mock adapter preserves existing Q&A answers. */
export type KarenChatResponse = { reply: string; session_id?: string; message_id?: string; suggestions?: string[] };
export async function sendKarenMessage(
  message: string,
  mockReply: (message: string) => string
): Promise<KarenChatResponse> {
  // Later: replace this implementation with fetch('/api/v1/chat/messages', ...).
  // Do not change the component or its message rendering when connecting FastAPI.
  return { reply: mockReply(message) };
}
