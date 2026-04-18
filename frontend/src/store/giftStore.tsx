import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  type ReactNode,
} from "react";
import { checkFollowUp, findGifts } from "../api/client";
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
  gender: string;
  additional_context: string;
  followup_questions: string[];
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
  gender: "not specified",
  additional_context: "",
  followup_questions: [],
  profile: null,
  results: [],
  total_candidates: 0,
  error: null,
};

type Action =
  | { type: "SET_FORM"; description: string; budget_min: number; budget_max: number; occasion: string; gender: string }
  | { type: "SET_FOLLOWUP"; questions: string[] }
  | { type: "SET_ADDITIONAL_CONTEXT"; context: string }
  | { type: "SET_PARSING" }
  | { type: "SET_SEARCHING" }
  | { type: "SET_RANKING" }
  | { type: "SET_RESULTS"; payload: FindGiftsResponse }
  | { type: "SET_ERROR"; error: string }
  | { type: "REFINE"; budget_min?: number; budget_max?: number; additional_context?: string }
  | { type: "RESET" };

function reducer(state: GiftState, action: Action): GiftState {
  switch (action.type) {
    case "SET_FORM":
      return { ...state, description: action.description, budget_min: action.budget_min, budget_max: action.budget_max, occasion: action.occasion, gender: action.gender };
    case "SET_FOLLOWUP":
      return { ...state, phase: "followup", followup_questions: action.questions };
    case "SET_ADDITIONAL_CONTEXT":
      return { ...state, additional_context: action.context };
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
    case "REFINE":
      return {
        ...state,
        budget_min: action.budget_min ?? state.budget_min,
        budget_max: action.budget_max ?? state.budget_max,
        additional_context: action.additional_context ?? state.additional_context,
      };
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
    async (description: string, budget_min: number, budget_max: number, occasion: string, gender: string) => {
      dispatch({ type: "SET_FORM", description, budget_min, budget_max, occasion, gender });

      try {
        const followup = await checkFollowUp({ description, budget_min, budget_max, occasion, gender });

        if (followup.needs_followup && followup.questions.length > 0) {
          dispatch({ type: "SET_FOLLOWUP", questions: followup.questions });
          return;
        }

        await runSearch(dispatch, description, budget_min, budget_max, occasion, gender, "");
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

export function useContinueAfterFollowup() {
  const dispatch = useGiftDispatch();
  const state = useGiftState();

  return useCallback(
    async (additionalContext: string) => {
      dispatch({ type: "SET_ADDITIONAL_CONTEXT", context: additionalContext });
      try {
        await runSearch(
          dispatch,
          state.description,
          state.budget_min,
          state.budget_max,
          state.occasion,
          state.gender,
          additionalContext
        );
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          error: err instanceof Error ? err.message : "Something went wrong.",
        });
      }
    },
    [dispatch, state.description, state.budget_min, state.budget_max, state.occasion]
  );
}

export function useRefineSearch() {
  const dispatch = useGiftDispatch();
  const state = useGiftState();

  return useCallback(
    async (budget_min: number, budget_max: number, extraDetails: string) => {
      const newContext = [state.additional_context, extraDetails].filter(Boolean).join(". ");
      dispatch({ type: "REFINE", budget_min, budget_max, additional_context: newContext });

      try {
        await runSearch(dispatch, state.description, budget_min, budget_max, state.occasion, state.gender, newContext);
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          error: err instanceof Error ? err.message : "Something went wrong.",
        });
      }
    },
    [dispatch, state.description, state.occasion, state.additional_context]
  );
}

async function runSearch(
  dispatch: React.Dispatch<Action>,
  description: string,
  budget_min: number,
  budget_max: number,
  occasion: string,
  gender: string,
  additional_context: string
) {
  dispatch({ type: "SET_PARSING" });
  await new Promise((r) => setTimeout(r, 800));
  dispatch({ type: "SET_SEARCHING" });
  await new Promise((r) => setTimeout(r, 1200));
  dispatch({ type: "SET_RANKING" });

  const response = await findGifts({
    description,
    budget_min,
    budget_max,
    occasion,
    additional_context,
    gender,
  });
  dispatch({ type: "SET_RESULTS", payload: response });
}
