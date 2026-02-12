import { Router } from 'express';
import { messageController, authenticate } from '../../container';
import { validate, validateQuery } from '../../middleware/validate';
import {
  createConversationSchema,
  sendMessageSchema,
  listConversationsQuerySchema,
  getMessagesQuerySchema,
} from './message.validation';

const router = Router();

// ==========================================
// Conversation Routes
// ==========================================

// GET /api/conversations - List user's conversations
router.get(
  '/conversations',
  authenticate,
  validateQuery(listConversationsQuerySchema),
  messageController.listConversations.bind(messageController)
);

// POST /api/conversations - Create or get conversation for a booking
router.post(
  '/conversations',
  authenticate,
  validate(createConversationSchema),
  messageController.createConversation.bind(messageController)
);

// GET /api/conversations/:id - Get conversation details with messages
router.get(
  '/conversations/:id',
  authenticate,
  messageController.getConversation.bind(messageController)
);

// GET /api/conversations/:id/messages - Get messages with pagination
router.get(
  '/conversations/:id/messages',
  authenticate,
  validateQuery(getMessagesQuerySchema),
  messageController.getMessages.bind(messageController)
);

// POST /api/conversations/:id/read - Mark all messages as read
router.post(
  '/conversations/:id/read',
  authenticate,
  messageController.markConversationRead.bind(messageController)
);

// ==========================================
// Message Routes
// ==========================================

// POST /api/messages - Send a message
router.post(
  '/messages',
  authenticate,
  validate(sendMessageSchema),
  messageController.sendMessage.bind(messageController)
);

// POST /api/messages/:id/read - Mark single message as read
router.post(
  '/messages/:id/read',
  authenticate,
  messageController.markMessageRead.bind(messageController)
);

export default router;
