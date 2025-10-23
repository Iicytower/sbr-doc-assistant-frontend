// Minimal mock for Suggestion type used in the app
export interface Suggestion {
  id: string;
  documentId: string;
  originalText: string;
  suggestedText: string;
  description: string;
  isResolved: boolean;
  userId: string;
  createdAt: Date;
  documentCreatedAt: Date;
}
