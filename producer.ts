import Kinesis, { PutRecordsInput, PutRecordsRequestEntry } from "aws-sdk/clients/kinesis";
import { v4 as uuidv4 } from "uuid";

export class KinesisClient { 
  private readonly maxMessagesInSingeData: number = 10;
  private readonly chunksSize: number = 500;
 
  public async putRecords(myMsg: myObj[]): Promise<void> {
    const stringifiedArray = myMsg.map(item => JSON.stringify(item));
    const groupedMessages: PutRecordsRequestEntry[] = this.chunk(stringifiedArray, this.maxMessagesInSingeData)
      .map((groupArray) => groupArray.join("#"))
      .map((blobData) => {
        return {
          Data: blobData,
          PartitionKey: uuidv4()
      }});
    const messagesChunks = this.chunk(groupedMessages, this.chunksSize);

    await Promise.all(messagesChunks.map(async (messageChunk) => {
      const records: PutRecordsInput = {
        Records: messageChunk,
        StreamName: this.kinesisStreamName
      };
      await this.kinesis.putRecords(records).promise();
    }));
  }

  private chunk<T>(array: T[], size: number): T[][] {
     const chunked_arr: T[][] = [];
     let index = 0;
     while (index < array.length) {
         chunked_arr.push(array.slice(index, size + index));
         index += size;
     }
     return chunked_arr;
  }
}