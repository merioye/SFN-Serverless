import { BaseParams, Book } from "../types";

type Params = {
  book: Book;
  total: {
    total: number;
    points: number;
  };
} & BaseParams;

export const billCustomer = (params: Params) => {
  // bill the customer e.g using stripe token from the params

  return "Successfully billed the customer";
};
