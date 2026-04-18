import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  type ReactNode,
} from "react";
import { findGifts } from "../api/client";
import type {
  AppPhase,
  FindGiftsResponse,
  GiftResult,
  RecipientProfile,
} from "../types";

interface GiftState {
  phase: AppPhase;
  description: string;
  budget_min: number;
  budget_max: number;
  occasion: string;
  profile: RecipientProfile | null;
  results: GiftResult[];
  total_candidates: number;
  error: string | null;
}

const initialState: GiftState = {
  phase: "idle",
  description: "",
  budget_min: 25,
  budget_max: 100,
  occasion: "birthday",
  profile: null,
  results: [],
  total_candidates: 0,
  error: null,
};

type Action =
  | { type: "SET_FORM"; description: string; budget_min: number; budget_max: number; occasion: string }
  | { type: "SET_PARSING" }
  | { type: "SET_SEARCHING" }
  | { type: "SET_RANKING" }
  | { type: "SET_RESULTS"; payload: FindGiftsResponse }
  | { type: "SET_ERROR"; error: string }
  | { type: "RESET" };

function reducer(state: GiftState, action: Action): GiftState {
  switch (action.type) {
    case "SET_FORM":
      return { ...state, description: action.description, budget_min: action.budget_min, budget_max: action.budget_max, occasion: action.occasion };
    case "SET_PARSING":
      return { ...state, phase: "parsing", error: null };
    case "SET_SEARCHING":
      return { ...state, phase: "searching" };
    case "SET_RANKING":
      return { ...state, phase: "ranking" };
    case "SET_RESULTS":
      return {
        ...state,
        phase: "done",
        profile: action.payload.profile,
        results: action.payload.results,
        total_candidates: action.payload.total_candidates,
      };
    case "SET_ERROR":
      return { ...state, phase: "error", error: action.error };
    case "RESET":
      return { ...initialState };
    default:
      return state;
  }
}

const StateCtx = createContext<GiftState>(initialState);
const DispatchCtx = createContext<React.Dispatch<Action>>(() => {});

export function GiftProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export const useGiftState = () => useContext(StateCtx);
export const useGiftDispatch = () => useContext(DispatchCtx);

export function useSubmitSearch() {
  const dispatch = useGiftDispatch();

  return useCallback(
    async (description: string, budget_min: number, budget_max: number, occasion: string) => {
      dispatch({ type: "SET_FORM", description, budget_min, budget_max, occasion });
      dispatch({ type: "SET_PARSING" });

      try {
        await new Promise((r) => setTimeout(r, 900));
        dispatch({ type: "SET_SEARCHING" });

        await new Promise((r) => setTimeout(r, 1400));
        dispatch({ type: "SET_RANKING" });

        const response = await findGifts({ description, budget_min, budget_max, occasion });
        dispatch({ type: "SET_RESULTS", payload: response });
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          error: err instanceof Error ? err.message : "Something went wrong.",
        });
      }
    },
    [dispatch]
  );
}
