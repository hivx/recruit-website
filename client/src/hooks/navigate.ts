// src/hooks/navigate.ts
import { useNavigate } from "react-router-dom";

export function useAppNavigate() {
  return useNavigate() as (path: string) => void;
}
