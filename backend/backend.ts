// backend/ApiClient.ts
// Klient REST API (browser) dla endpointów z Postmana.
// Każda metoda odpowiada jednemu endpointowi. Output: Promise<any>.

export class ApiError extends Error {
  public status: number;
  public body: any;
  constructor(status: number, body: any) {
    super(`API Error ${status}: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
    this.status = status;
    this.body = body;
  }
}

/* ----------------------
   Typy wejściowe (eksportowane)
   ---------------------- */

export interface RegisterPayload {
  email: string;
  password: string;
  provider?: string; // np. 'local'
  nickname?: string; // optional (postman wyliczał)
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AddDocumentPayload {
  category: string;
  files: File[]; // browser File
}

export interface DeleteDocumentParams {
  mimetype?: string;
  filename?: string;
}

export interface ChatPromptPayload {
  prompt: string;
  categories?: string[];
  chatId?: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface ChatRenamePayload {
  chatId: string;
  newName: string;
}

export interface GetChatByIdParams {
  chatId: string;
}

export interface DeleteChatByIdParams {
  chatId: string;
}

/* ----------------------
   Api client
   ---------------------- */

export default class ApiClient {
  private baseUrl: string = `http://localhost:3000/api`;
  private token: string | null = null;
  private tokenStorageKey = 'backend_client_token';

  constructor(token?: string) {
    if (token) {
      this.token = token;
    }
    const cookieToken = this.getTokenFromCookie();
    if (cookieToken) {
      this.token = cookieToken;
    }
  }

  setTokenCookie(token: string) {
    if (typeof document !== 'undefined') {
      document.cookie = `backend_token=${encodeURIComponent(token)}; path=/; SameSite=Strict`;
    }
  }

  getTokenFromCookie(): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/(?:^|; )backend_token=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  clearTokenFromCookie() {
    if (typeof document !== 'undefined') {
      document.cookie = 'backend_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    }
  }

  /* ----------------------
     Token helpers
     ---------------------- */
  setToken(token: string, persist = true) {
    this.token = token;
    this.setTokenCookie(token);
    if (persist && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(this.tokenStorageKey, token);
      } catch (e) { /* ignore */ }
    }
  }


  clearToken() {
    this.token = null;
    // Usuwanie tokena z localStorage
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(this.tokenStorageKey);
      } catch (e) { /* ignore */ }
    }
    // Usuwanie tokena z ciasteczka
    if (typeof document !== 'undefined') {
      document.cookie = 'backend_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    }
  }
  getToken(): string | null {
    if (typeof window === 'undefined') {
      return this.token ?? this.getTokenFromCookie() ?? null;
    }
    return this.token ?? this.getTokenFromCookie() ?? window.localStorage.getItem(this.tokenStorageKey) ?? null;
  }

  // POST /api/auth/register
  async register(payload: RegisterPayload): Promise<any> {
    // Postman pre-request computed nickname from email; replicate if missing
    const body = { provider: 'local', ...payload };
    if (!body.nickname && payload.email) {
      body.nickname = payload.email.split('@')[0];
    }

    const res = await this.request('POST', `${this.baseUrl}/auth/register`, { body, skipAuth: true });
    // Postman test saved token => if response includes token, store it automatically
    if (res?.token) {
      this.setToken(res.token);
      this.setTokenCookie(res.token);
    }
    return res;
  }

  // POST /api/auth/login
  async login(payload: LoginPayload): Promise<any> {
    const res = await this.request('POST', `${this.baseUrl}/auth/login`, { body: payload, skipAuth: true });
    if (res?.token) {
      this.setToken(res.token);
      this.setTokenCookie(res.token);
    }
    return res;
  }

  async logout(): Promise<void> {
    this.clearToken();
    this.clearTokenFromCookie();
  }

  // POST /api/documents (form-data with files)
  async addDocument(payload: AddDocumentPayload): Promise<any> {
    const fd = new FormData();
    fd.append('category', payload.category);
    // append multiple files under 'file' key (Postman uses repeated 'file' entries)
    for (const f of payload.files) {
      fd.append('file', f, f.name);
    }
    return this.request('POST', `${this.baseUrl}/documents`, { body: fd });
  }

  // DELETE /api/documents?mimetype=...&filename=...
  async deleteDocument(params: DeleteDocumentParams): Promise<any> {
    return this.request('DELETE', `${this.baseUrl}/documents`, { query: params });
  }

  // GET /api/documents/findAll
  async findAllDocuments(): Promise<any> {
    return this.request('GET', `${this.baseUrl}/documents/findAll`);
  }

  // POST /api/chat/prompt
  async chatPrompt(payload: ChatPromptPayload): Promise<any> {
    return this.request('POST', `${this.baseUrl}/chat/prompt`, { body: payload });
  }

  // POST /api/user/passwordChange
  async changeUserPassword(payload: ChangePasswordPayload): Promise<any> {
    return this.request('POST', `${this.baseUrl}/user/passwordChange`, { body: payload });
  }

  // DELETE /api/user/
  async deleteUser(): Promise<any> {
    return this.request('DELETE', `${this.baseUrl}/user/`);
  }

  // GET /api/user/me
  async getUserMe(): Promise<any> {
    return this.request('GET', `${this.baseUrl}/user/me`);
  }

  // PATCH /api/chat/rename
  async chatRename(payload: ChatRenamePayload): Promise<any> {
    return this.request('PATCH', `${this.baseUrl}/chat/rename`, { body: payload });
  }

  // GET /api/chat?chatId=...
  async getChatById(params: GetChatByIdParams): Promise<any> {
    return this.request('GET', `${this.baseUrl}/chat`, { query: params });
  }

  // GET /api/chat/findAll
  async findAllChats(): Promise<any> {
    return this.request('GET', `${this.baseUrl}/chat/findAll`);
  }

  // DELETE /api/chat/?chatId=...
  async deleteChatById(params: DeleteChatByIdParams): Promise<any> {
    return this.request('DELETE', `${this.baseUrl}/chat/`, { query: params });
  }

  private async request(
    method: string,
    path: string,
    options?: {
      query?: Record<string, any>;
      body?: any; // either object (json) or FormData
      headers?: Record<string, string>;
      skipAuth?: boolean;
    }
  ): Promise<any> {
    // build url + query
    const url = new URL(path, this.baseUrl.startsWith('http') ? this.baseUrl : (typeof window !== 'undefined' ? window.location.origin + this.baseUrl : this.baseUrl));
    if (options?.query) {
      Object.entries(options.query).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.append(k, String(v));
      });
    }

    const headers: Record<string, string> = options?.headers ? { ...options.headers } : {};
    let body: BodyInit | undefined;

    if (options?.body instanceof FormData) {
      body = options.body;
      // don't set content-type; browser will set multipart boundary
    } else if (options?.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(options.body);
    }

    if (!options?.skipAuth && this.getToken()) {
      headers['Authorization'] = `Bearer ${this.getToken()}`;
    }

    const res = await fetch(url.toString(), {
      method,
      headers,
      body,
      // credentials intentionally not included - keep it stateless; if you need cookies, adapt here
    });

    const text = await res.text();
    let data: any = text;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      // keep raw text if not json
      data = text;
    }

    if (!res.ok) {
      throw new ApiError(res.status, data);
    }
    return data;
  }
}
