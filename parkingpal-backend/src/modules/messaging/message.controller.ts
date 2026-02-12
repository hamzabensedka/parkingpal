import { Request, Response, NextFunction } from 'express';
import { MessageService } from './message.service';
import {
  toConversationSummaryDTO,
  toConversationDTO,
  toMessageDTO,
} from './message.mappers';
import {
  CreateConversationInput,
  SendMessageInput,
  ListConversationsQueryInput,
  GetMessagesQueryInput,
} from './message.validation';
import {
  ConversationSummaryDTO,
  ConversationDTO,
  MessageDTO,
} from '@parkingpal/shared-types';

export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  /**
   * GET /api/conversations
   * List all conversations for the authenticated user
   */
  async listConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const query = req.query as unknown as ListConversationsQueryInput;

      const { conversations, total, unreadCounts } = await this.messageService.getConversations(
        userId,
        query.limit ?? 20,
        query.offset ?? 0
      );

      const conversationDTOs: ConversationSummaryDTO[] = conversations.map(conv =>
        toConversationSummaryDTO(conv, unreadCounts.get(conv.id) ?? 0)
      );

      res.json({
        success: true,
        data: {
          conversations: conversationDTOs,
          total,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/conversations/:id
   * Get a conversation by ID with messages
   */
  async getConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const { conversation, unreadCount } = await this.messageService.getConversation(id, userId);
      const conversationDTO: ConversationDTO = toConversationDTO(conversation, unreadCount);

      res.json({
        success: true,
        data: {
          conversation: conversationDTO,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/conversations
   * Create or get a conversation for a booking
   */
  async createConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { bookingId } = req.body as CreateConversationInput;

      const { conversation, unreadCount, created } =
        await this.messageService.getOrCreateConversation(bookingId, userId);

      const conversationDTO: ConversationDTO = toConversationDTO(conversation, unreadCount);

      res.status(created ? 201 : 200).json({
        success: true,
        data: {
          conversation: conversationDTO,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/conversations/:id/messages
   * Get messages for a conversation with pagination
   */
  async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const query = req.query as unknown as GetMessagesQueryInput;

      const messages = await this.messageService.getMessages(
        id,
        userId,
        query.limit ?? 50,
        query.offset ?? 0
      );

      // Messages are returned in DESC order (newest first), reverse for chronological
      const messageDTOs: MessageDTO[] = messages.map(toMessageDTO).reverse();

      res.json({
        success: true,
        data: {
          messages: messageDTOs,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/messages
   * Send a message in a conversation
   */
  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { conversationId, text } = req.body as SendMessageInput;

      const message = await this.messageService.sendMessage(conversationId, userId, text);
      const messageDTO: MessageDTO = toMessageDTO(message);

      res.status(201).json({
        success: true,
        data: {
          message: messageDTO,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/conversations/:id/read
   * Mark all messages in a conversation as read
   */
  async markConversationRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      await this.messageService.markConversationAsRead(id, userId);

      res.json({
        success: true,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/messages/:id/read
   * Mark a single message as read
   */
  async markMessageRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      await this.messageService.markMessageAsRead(id, userId);

      res.json({
        success: true,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}
