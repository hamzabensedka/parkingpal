import { Request, Response, NextFunction } from 'express';
import { IUserBlockRepository } from '../interfaces/IUserBlockRepository';

/**
 * Middleware factory that creates a block enforcement middleware.
 * Prevents blocked users from interacting with each other.
 *
 * The target user ID can be extracted from:
 * - req.body (for POST/PUT requests)
 * - req.params (for route parameters)
 * - Custom extractor function
 *
 * @param userBlockRepository - Repository to check block relationships
 * @param options - Configuration options for extracting target user ID
 */
export function createBlockEnforcementMiddleware(
  userBlockRepository: IUserBlockRepository,
  options: {
    /** Field name in req.body to extract target user ID */
    bodyField?: string;
    /** Field name in req.params to extract target user ID */
    paramField?: string;
    /** Custom function to extract target user ID from request */
    extractor?: (req: Request) => string | undefined;
  } = {}
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = req.user?.id;

      // Skip if no authenticated user
      if (!currentUserId) {
        next();
        return;
      }

      // Extract target user ID from request
      let targetUserId: string | undefined;

      if (options.extractor) {
        targetUserId = options.extractor(req);
      } else if (options.bodyField && req.body) {
        targetUserId = req.body[options.bodyField];
      } else if (options.paramField && req.params) {
        targetUserId = req.params[options.paramField];
      }

      // Skip if no target user ID
      if (!targetUserId) {
        next();
        return;
      }

      // Skip if user is interacting with themselves
      if (currentUserId === targetUserId) {
        next();
        return;
      }

      // Check for bidirectional block relationship
      const isBlocked = await userBlockRepository.hasBlockRelationship(
        currentUserId,
        targetUserId
      );

      if (isBlocked) {
        res.status(403).json({
          success: false,
          error: 'Cannot interact with this user',
        });
        return;
      }

      next();
    } catch (error) {
      // Don't block on errors - let the request proceed and fail naturally
      console.error('Block enforcement middleware error:', error);
      next();
    }
  };
}

/**
 * Pre-configured middleware instances for common use cases
 */
export function createBlockEnforcementMiddlewareSet(userBlockRepository: IUserBlockRepository) {
  return {
    /**
     * For message sending - checks receiverId in body
     * Used with POST /api/messages
     */
    forMessageSending: createBlockEnforcementMiddleware(userBlockRepository, {
      extractor: (req) => {
        // For messaging, we need to get the receiver from the conversation
        // This is handled at the service level since we need to query the conversation
        return undefined;
      },
    }),

    /**
     * For direct user interactions - checks userId in body
     */
    forUserIdInBody: createBlockEnforcementMiddleware(userBlockRepository, {
      bodyField: 'userId',
    }),

    /**
     * For route params - checks userId in params
     */
    forUserIdInParams: createBlockEnforcementMiddleware(userBlockRepository, {
      paramField: 'userId',
    }),

    /**
     * For booking-related checks - checks hostId or renterId
     */
    forBookingParticipant: createBlockEnforcementMiddleware(userBlockRepository, {
      extractor: (req) => req.body?.hostId || req.body?.renterId,
    }),
  };
}
