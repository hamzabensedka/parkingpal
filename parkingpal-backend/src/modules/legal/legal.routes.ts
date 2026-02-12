import { Router, Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';

const router = Router();

const LEGAL_DIR = path.join(__dirname, '..', '..', '..', 'legal');

/**
 * GET /api/legal/cgu
 * Returns the Terms of Service (CGU) in markdown format
 */
router.get('/cgu', async (req: Request, res: Response) => {
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
 */
router.get('/privacy-policy', async (req: Request, res: Response) => {
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
 */
router.get('/mentions-legales', async (req: Request, res: Response) => {
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
 */
router.get('/', (req: Request, res: Response) => {
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
