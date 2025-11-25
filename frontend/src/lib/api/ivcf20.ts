import type { Elder, IvcfResult } from "../types";
import { api } from "./api";

export async function createIVCF20(elder: Partial<Elder>, result: IvcfResult) {
  try {
    const response = api.post("/ivcf20", {
     // id: elder.familyId,
      elderId: elder.id,
      answers: JSON.stringify(result.answers),
      result: result.category,
      score: result.score,
    });

    return response;
  } catch (error) {
    console.error("Error creating IVCF20 result:", error);
    throw error;
  }
}


export async function getIVCF20ByElderId(elder: Partial<Elder>) {
  try {
    const response = await api.get(`/ivcf20/${elder.id}`);
    return response;
  } catch (error) {
    console.error("Error fetching IVCF20 result:", error);
    throw error;
  }
}
