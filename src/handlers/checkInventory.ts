import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { dbClient } from "../config";
import { Book, BaseParams } from "../types";

const BOOKS_TABLE_NAME = process.env.BOOKS_TABLE_NAME;
enum Errors {
  BOOK_OUT_OF_STOCK = "BookOutOfStock",
  BOOK_NOT_FOUND = "BookNotFound",
}

export const checkInventory = async ({ bookId, quantity }: BaseParams) => {
  try {
    const command = new QueryCommand({
      TableName: BOOKS_TABLE_NAME,
      KeyConditionExpression: "id = :bookId",
      ExpressionAttributeValues: marshall({
        ":bookId": bookId,
      }),
    });

    const result = await dbClient.send(command);
    const book = unmarshall(result.Items[0]) as Book;

    // checking stock availability
    if (book.quantity - quantity > 0) {
      return book;
    } else {
      const bookOutOfStockError = new Error("The book is out of stock");
      bookOutOfStockError.name = Errors.BOOK_OUT_OF_STOCK;
      throw bookOutOfStockError;
    }
  } catch (err) {
    if (err.name === Errors.BOOK_OUT_OF_STOCK) {
      throw err;
    } else {
      const bookNotFoundError = new Error(err);
      bookNotFoundError.name = Errors.BOOK_NOT_FOUND;
      throw bookNotFoundError;
    }
  }
};
