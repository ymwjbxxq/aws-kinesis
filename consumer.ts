import { KinesisStreamEvent, KinesisStreamHandler, KinesisStreamRecord, KinesisStreamRecordPayload } from "aws-lambda";

export const startExecution: KinesisStreamHandler = async (event: KinesisStreamEvent): Promise<void> => {
  await Promise.all(event.Records.map(async (record: KinesisStreamRecord) => {
    const payload: KinesisStreamRecordPayload = record.kinesis;
    const decodedBase64 = Buffer.from(payload.data, "base64").toString("utf8");
    const myMessages: myObj[] = decodedBase64.split("#").map(requestString => JSON.parse(requestString));

    await Promise.all(myMessages.map(async message => { 
      await doSomething(message);
    }));
  }));
};