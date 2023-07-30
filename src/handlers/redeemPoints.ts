import { GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { dbClient } from "../config";
import { BaseParams, Book, User } from "../types";

const USERS_TABLE_NAME = process.env.USERS_TABLE_NAME;

type Params = {
  book: Book;
  total: {
    total: number;
  };
} & BaseParams;

const deductUserPoints = async (userId: string) => {
  const command = new UpdateItemCommand({
    TableName: USERS_TABLE_NAME,
    Key: marshall({
      id: userId,
    }),
    UpdateExpression: "SET points = :zero",
    ExpressionAttributeValues: marshall({
      ":zero": 0,
    }),
  });

  await dbClient.send(command);
};

export const redeemPoints = async ({ userId, total }: Params) => {
  let orderAmount = total.total;
  try {
    const command = new GetItemCommand({
      TableName: USERS_TABLE_NAME,
      Key: marshall({
        id: userId,
      }),
    });

    const result = await dbClient.send(command);
    const user = unmarshall(result.Item) as User;

    const points = user.points;
    if (orderAmount > points) {
      await deductUserPoints(userId);
      orderAmount = orderAmount - points;
      return { total: orderAmount, points };
    } else {
      throw new Error("Order total is less than redeem points");
    }
  } catch (err) {
    throw new Error(err);
  }
};
