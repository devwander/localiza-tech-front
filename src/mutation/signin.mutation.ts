import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { AuthRequest, AuthResponse } from "../models";
import { Service } from "../services";

async function mutator(data: AuthRequest): Promise<AuthResponse> {
  return Service.auth.signin(data);
}

interface Props {
  onSuccess: (data: AuthResponse) => void;
  onError: (error: Error | AxiosError) => void;
}

export function useSigninMutation({
  onSuccess,
  onError,
}: Props): UseMutationResult<AuthResponse, Error | AxiosError, AuthRequest> {
  return useMutation({
    mutationFn: (data: AuthRequest) => mutator(data),
    onSuccess,
    onError,
  });
}
