import { UserBlock } from '@prisma/client';

export interface IUserBlockRepository {
  /**
   * Create a new block relationship
   */
  create(blockerId: string, blockedId: string): Promise<UserBlock>;

  /**
   * Remove a block relationship
   */
  delete(blockerId: string, blockedId: string): Promise<void>;

  /**
   * Check if user A has blocked user B
   */
  isBlocked(blockerId: string, blockedId: string): Promise<boolean>;

  /**
   * Check if there's any block relationship between two users (bidirectional)
   */
  hasBlockRelationship(userId1: string, userId2: string): Promise<boolean>;

  /**
   * Get all users blocked by a user
   */
  findBlockedByUser(blockerId: string, limit?: number, offset?: number): Promise<{
    blocks: UserBlock[];
    total: number;
  }>;

  /**
   * Get all users who have blocked a user
   */
  findBlockersOfUser(blockedId: string): Promise<UserBlock[]>;
}
