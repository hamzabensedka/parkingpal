import { Router, Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { cacheMiddleware } from '../../middleware/cacheMiddleware';
import { legalCache } from '../../utils/cache';

const router = Router();

const LEGAL_DIR = path.join(__dirname, '..', '..', '..', 'legal');

/**
 * GET /api/legal/cgu
 * Returns the Terms of Service (CGU) in markdown format
 * Cached for 30 days
 */
router.get('/cgu', cacheMiddleware(legalCache, 'legal:cgu'), async (req: Request, res: Response) => {
  try {
    const content = await fs.readFile(path.join(LEGAL_DIR, 'cgu.md'), 'utf-8');
    res.type('text/markdown').send(content);
  } catch {
    res.status(404).json({ success: false, error: 'Document not found' });
  }
});

/**
 * GET /api/legal/privacy-policy
 * Returns the Privacy Policy in markdown format
 * Cached for 30 days
 */
router.get('/privacy-policy', cacheMiddleware(legalCache, 'legal:privacy'), async (req: Request, res: Response) => {
  try {
    const content = await fs.readFile(path.join(LEGAL_DIR, 'privacy-policy.md'), 'utf-8');
    res.type('text/markdown').send(content);
  } catch {
    res.status(404).json({ success: false, error: 'Document not found' });
  }
});

/**
 * GET /api/legal/mentions-legales
 * Returns the Legal Mentions in markdown format
 * Cached for 30 days
 */
router.get('/mentions-legales', cacheMiddleware(legalCache, 'legal:mentions'), async (req: Request, res: Response) => {
  try {
    const content = await fs.readFile(path.join(LEGAL_DIR, 'mentions-legales.md'), 'utf-8');
    res.type('text/markdown').send(content);
  } catch {
    res.status(404).json({ success: false, error: 'Document not found' });
  }
});

/**
 * GET /api/legal
 * Returns links to all legal documents
 * Cached for 30 days
 */
router.get('/', cacheMiddleware(legalCache, 'legal:index'), (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      documents: [
        { name: 'Conditions Générales d\'Utilisation', path: '/api/legal/cgu' },
        { name: 'Politique de Confidentialité', path: '/api/legal/privacy-policy' },
        { name: 'Mentions Légales', path: '/api/legal/mentions-legales' },
      ],
    },
  });
});

export default router;
