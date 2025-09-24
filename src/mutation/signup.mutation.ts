import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { AuthCreateRequest, AuthResponse } from "../models";
import { Service } from "../services";

async function mutator(data: AuthCreateRequest): Promise<AuthResponse> {
  return Service.auth.signup(data);
}

interface Props {
  onSuccess: (data: AuthResponse) => void;
  onError: (error: Error | AxiosError) => void;
}

export function useSignupMutation({
  onSuccess,
  onError,
}: Props): UseMutationResult<
  AuthResponse,
  Error | AxiosError,
  AuthCreateRequest
> {
  return useMutation({
    mutationFn: (data: AuthCreateRequest) => mutator(data),
    onSuccess,
    onError,
  });
}
