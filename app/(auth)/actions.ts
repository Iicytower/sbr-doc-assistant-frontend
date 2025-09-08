
// Uses real backend for register/login, mocks for everything else.
import ApiClient, { RegisterPayload, LoginPayload } from '../../backend/backend';
const api = new ApiClient();

export interface LoginActionState {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data" | "user_exists";
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    if (!email || !password) return { status: 'invalid_data' };
    await api.login({ email, password } as LoginPayload);
    return { status: 'success' };
  } catch (e: any) {
    if (e?.body?.error === 'user_exists') return { status: 'user_exists' };
    if (e?.body?.error === 'invalid_data') return { status: 'invalid_data' };
    return { status: 'failed' };
  }
};

export interface RegisterActionState {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "user_exists"
    | "invalid_data";
}

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    if (!email || !password) return { status: 'invalid_data' };
    await api.register({ email, password } as RegisterPayload);
    return { status: 'success' };
  } catch (e: any) {
    if (e?.body?.error === 'user_exists') return { status: 'user_exists' };
    if (e?.body?.error === 'invalid_data') return { status: 'invalid_data' };
    return { status: 'failed' };
  }
};
