import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { BaseParams, Book } from "../types";
import { dbClient } from "../config";

const USERS_TABLE_NAME = process.env.USERS_TABLE_NAME;

type Params = {
  book: Book;
  total: {
    total: number;
    points: number;
  };
  refundStatus?: string;
  quantityRestoreStatus?: string;
  courierError?: string;
  billingStatus?: string;
} & BaseParams;

export const restoreRedeemPoints = async ({ userId, total }: Params) => {
  try {
    if (total.points) {
      const command = new UpdateItemCommand({
        TableName: USERS_TABLE_NAME,
        Key: marshall({
          id: userId,
        }),
        UpdateExpression: "SET points = :points",
        ExpressionAttributeValues: marshall({
          ":points": total.points,
        }),
      });

      await dbClient.send(command);
    }
  } catch (err) {
    throw new Error(err);
  }
};
