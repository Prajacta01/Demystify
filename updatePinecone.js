// source: HashDefine on youtube https://www.youtube.com/watch?v=LtF3mCn0GUs

import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export const updatePinecone = async (client, indexName, text) => {
  const index = client.Index(indexName);
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
  });
  const chunks = await textSplitter.createDocuments([text]);

  const embeddingsArrays = await new OpenAIEmbeddings().embedDocuments(
    chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " "))
  );
  console.log("Finished embedding documents");
  const batchSize = 100;
  let batch = [];
  for (let idx = 0; idx < chunks.length; idx++) {
    const chunk = chunks[idx];
    const vector = {
      id: `${txtPath}_${idx}`,
      values: embeddingsArrays[idx],
      metadata: {
        ...chunk.metadata,
        loc: JSON.stringify(chunk.metadata.loc),
        pageContent: chunk.pageContent,
        txtPath: txtPath,
      },
    };
    batch.push(vector);
    
    if (batch.length === batchSize || idx === chunks.length - 1) {
      await index.upsert({
        upsertRequest: {
          vectors: batch,
        },
      });
      batch = [];
    }
  }
};