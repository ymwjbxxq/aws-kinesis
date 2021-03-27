# KINESIS #

"[Amazon Kinesis Data Streams](https://aws.amazon.com/kinesis/data-streams/) is a massively scalable and durable real-time data streaming service). KDS can continuously capture gigabytes of data per second from hundreds of thousands of sources such as website clickstreams, database event streams, financial transactions, social media feeds, IT logs, and location-tracking events. The data collected is available in milliseconds to enable real-time analytics use cases such as real-time dashboards, real-time anomaly detection, dynamic pricing, and more."

### Cost ###

* Amazon Kinesis Data Streams uses simple pay as you go pricing.
* PUT Payload Unit (25KB)
* https://aws.amazon.com/kinesis/data-streams/pricing/

You are charged per 25kb payload unit, so you should merge messages if you have records that are smaller in size

### KPL or API ###

[Kinesis Producer Library (KPL)](https://docs.aws.amazon.com/streams/latest/dev/kinesis-record-deaggregation.html) provides a layer of abstraction for ingesting data, has some build-in functionalities.
AWS SDK is the low-level service integration

I prefer to use the AWS SDK inside Lambda function and avoid wrapper etc., but it is just a preference.

### PutRecords ###

Writes multiple data records into a Kinesis data stream in a single call. More info [here](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Kinesis.html#putRecords-property)

* Each PutRecords request can support up to 500 records
* Each record in the request can be as large as 1 MiB
* Up to a limit of 5 MB for the entire request, including partition key

### Producer ###

The idea behind the Producer is to merge multiple messages and save some money at scale when the amount of records is massive.

* Get an array of messages that you want to send
* Convert them in strings because the Data parameter accepts Buffer|Uint8Array|Blob|string. Note that the kinesis library will convert them in base64.
* Group messages in the first batch (in the example is 10 but can be less or more). You need to consider the PutRecords quota and the size of the payload that you want to send, and the processing time in the Consumer
* Group messages again considering the PutRecord 500 records limit.

For example:

You have 30k messages:

* Without merging messages, you need to call kinesis.putRecords 60 times (30000/500).
* Merging messages, 10 as the code example we have now 3000 unique messages and the call to kinesis.putRecords is reduced to 6  (3000/500)

Put this at a massive scale, and you will see the savings in cost.

### Consumer ###

The idea behind the Consumer is very simple

* Get the Kinesis batch
* Convert each record from base64 to ut8
* Split the message, in this case, was a merge of 10
* Process them in parallel
