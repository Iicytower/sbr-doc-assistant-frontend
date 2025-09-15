import { NextResponse, type NextRequest } from 'next/server';
// Middleware nie jest już potrzebny po usunięciu autoryzacji. Eksportujemy pustą funkcję.
export function middleware() {
  return NextResponse.next();
}
