import { tool, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod';
import { getDocumentById } from '@/lib/db/queries';
import { documentHandlersByArtifactKind } from '@/lib/artifacts/server';
import type { ChatMessage } from '@/lib/types';

interface UpdateDocumentProps {
  dataStream: UIMessageStreamWriter<ChatMessage>;
}

export const updateDocument = ({ dataStream }: UpdateDocumentProps) =>
  tool({
    description: 'Update a document with the given description.',
    inputSchema: z.object({
      id: z.string().describe('The ID of the document to update'),
      description: z.string().describe('The description of changes that need to be made'),
    }),
    execute: async ({ id, description }) => {
      const document = await getDocumentById({ id });
      if (!document) {
        return { error: 'Document not found' };
      }
      dataStream.write({ type: 'data-clear', data: null, transient: true });
      const documentHandler = documentHandlersByArtifactKind.find((h) => h.kind === document.kind);
      if (!documentHandler) {
        throw new Error(`No document handler found for kind: ${document.kind}`);
      }
      const allowedKinds = ['code', 'text', 'image', 'sheet'] as const;
      type AllowedKind = typeof allowedKinds[number];
      const safeKind = allowedKinds.includes(document.kind as AllowedKind)
        ? (document.kind as AllowedKind)
        : undefined;
      await documentHandler.onUpdateDocument({
        document: { ...document, kind: safeKind },
        description,
        dataStream,
      });
      dataStream.write({ type: 'data-finish', data: null, transient: true });
      return {
        id,
        title: document.title,
        kind: safeKind,
        content: 'The document has been updated successfully.',
      };
    },
  });
