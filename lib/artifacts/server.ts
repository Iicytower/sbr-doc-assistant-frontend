
import { codeDocumentHandler } from '@/artifacts/code/server';
import { sheetDocumentHandler } from '@/artifacts/sheet/server';
import { textDocumentHandler } from '@/artifacts/text/server';
import type { ArtifactKind } from '@/components/artifact';
import type { UIMessageStreamWriter } from 'ai';
import type { ChatMessage } from '../types';

export interface SaveDocumentProps {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}

export interface CreateDocumentCallbackProps {
  id: string;
  title: string;
  dataStream: UIMessageStreamWriter<ChatMessage>;
}

export interface UpdateDocumentCallbackProps {
  document: {
    id: string;
    title: string;
    content?: string;
    kind?: ArtifactKind;
    userId?: string;
    // Add more fields if needed by usage
  };
  description: string;
  dataStream: UIMessageStreamWriter<ChatMessage>;
}

export interface DocumentHandler<T = ArtifactKind> {
  kind: T;
  onCreateDocument: (args: CreateDocumentCallbackProps) => Promise<void>;
  onUpdateDocument: (args: UpdateDocumentCallbackProps) => Promise<void>;
}

export function createDocumentHandler<T extends ArtifactKind>(config: {
  kind: T;
  onCreateDocument: (params: CreateDocumentCallbackProps) => Promise<string>;
  onUpdateDocument: (params: UpdateDocumentCallbackProps) => Promise<string>;
}): DocumentHandler<T> {
  return {
    kind: config.kind,
    onCreateDocument: async (args: CreateDocumentCallbackProps) => {
      await config.onCreateDocument({
        id: args.id,
        title: args.title,
        dataStream: args.dataStream,
      });
      return;
    },
    onUpdateDocument: async (args: UpdateDocumentCallbackProps) => {
      await config.onUpdateDocument({
        document: args.document,
        description: args.description,
        dataStream: args.dataStream,
      });
      return;
    },
  };
}

// Use this array to define the document handlers for each artifact kind.
export const documentHandlersByArtifactKind: Array<DocumentHandler> = [
  textDocumentHandler,
  codeDocumentHandler,
  sheetDocumentHandler,
];

export const artifactKinds = ['text', 'code', 'sheet'] as const;
