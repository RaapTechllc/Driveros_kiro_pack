export type {
  ChatMessage,
  ChatSession,
  PageContext,
  PageId,
  CompanyMemory,
  MemoryEvent,
  TimelineEntry,
  ChatRequest,
  ChatStreamChunk,
} from './types'

export {
  createEmptyMemory,
  loadMemory,
  saveMemory,
  loadChatHistory,
  saveChatHistory,
  processMemoryEvent,
  addCoachNote,
  bootstrapMemoryFromStorage,
} from './memory'

export {
  buildSystemPrompt,
  getProactiveNudge,
} from './prompts'
