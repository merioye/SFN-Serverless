import { SQSEvent } from "aws-lambda";
import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import {
  SFNClient,
  SendTaskSuccessCommand,
  SendTaskFailureCommand,
} from "@aws-sdk/client-sfn";
import { dbClient } from "../config";

const sfnClient = new SFNClient({ region: "us-east-1" });

const BOOKS_TABLE_NAME = process.env.BOOKS_TABLE_NAME;

const updateBookQuantity = async (bookId: string, orderQuantity: number) => {
  const command = new UpdateItemCommand({
    TableName: BOOKS_TABLE_NAME,
    Key: marshall({
      id: bookId,
    }),
    UpdateExpression: "SET quantity = quantity - :orderQuantity",
    ExpressionAttributeValues: marshall({
      ":orderQuantity": orderQuantity,
    }),
  });

  await dbClient.send(command);
};

// It will prepare/create/finalize the order before the order is dispatched
// for delivery and notify the Step Function State Task whether the order
// creation/preparation is successfull or failed
export const sqsWorker = async (event: SQSEvent) => {
  let body: any;
  try {
    const record = event.Records[0];
    body = JSON.parse(record.body);
    /** Find a courier and attach courier information to order */
    const courier = "<email-id>";

    // Update book quantity
    await updateBookQuantity(body.Input.bookId, body.Input.quantity);

    // Attach courier information to the order
    const command = new SendTaskSuccessCommand({
      output: JSON.stringify({ courier }),
      taskToken: body.Token,
    });
    await sfnClient.send(command);
  } catch (err) {
    console.log("===== You got an Error =====");
    console.log(err);
    const command = new SendTaskFailureCommand({
      error: "NoCourierAvailable",
      cause: "No couriers are available",
      taskToken: body.Token,
    });
    await sfnClient.send(command);
  }
};
