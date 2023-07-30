import { BaseParams, Book } from "../types";

type Params = {
  book: Book;
} & BaseParams;

export const calculateTotal = ({ book, quantity }: Params) => {
  const total = book.price * quantity;
  return { total };
};
