import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { BaseParams, Book } from "../types";
import { dbClient } from "../config";

const BOOKS_TABLE_NAME = process.env.BOOKS_TABLE_NAME;

type Params = {
  book: Book;
  total: {
    total: number;
    points: number;
  };
  refundStatus?: string;
  courierError?: string;
  billingStatus?: string;
} & BaseParams;

export const restoreQuantity = async ({ bookId, quantity }: Params) => {
  const command = new UpdateItemCommand({
    TableName: BOOKS_TABLE_NAME,
    Key: marshall({
      id: bookId,
    }),
    UpdateExpression: "SET quantity = quantity + :orderQuantity",
    ExpressionAttributeValues: marshall({
      ":orderQuantity": quantity,
    }),
  });

  await dbClient.send(command);
  return "Quantity Restored";
};
