import { api } from "../lib";
import type { AuthCreateRequest, AuthRequest, AuthResponse } from "../models";

export default class AuthService {
  public async signin(data: AuthRequest): Promise<AuthResponse> {
    const { data: authentication } = await api.post<AuthResponse>(
      "auth/signin",
      data
    );
    return authentication;
  }

  public async signup(data: AuthCreateRequest): Promise<AuthResponse> {
    const { data: authentication } = await api.post<AuthResponse>(
      "auth/signup",
      data
    );
    return authentication;
  }
}
