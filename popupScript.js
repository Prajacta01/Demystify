
import { PineconeClient } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";
import { updatePinecone } from "./updatePinecone.js";
import { queryPineconeVectorStoreAndQueryLLM } from "./querying.js";
import * as fs from "fs";

dotenv.config()
const text = fs.readFileSync("article.txt", "utf8");

const indexName = "demystify"
const vectorDimension = 1536
const question = 'Breaches of secuurity and privacy by an application can be concerning. Possible threats to life and property can be concerning among other things. Is there anything to worry about in the terms and conditions? '

const client = new PineconeClient();
await client.init({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENVIRONMENT
});

const summarize = async () => {
  // In this example, we use a `MapReduceDocumentsChain` specifically prompted to summarize a set of documents.
  const model = new OpenAI({ temperature: 0 });
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  const docs = await textSplitter.createDocuments([text]);

  // This convenience function creates a document chain prompted to summarize a set of documents.
  const chain = loadSummarizationChain(model, { type: "map_reduce" });
  const res = await chain.call({
    input_documents: docs,
  });
  console.log({ res })
  return res
}

const createPineconeIndex = async (client, indexName, vectorDimension) => {
  // check existing indexes
  const existingIndexes = await client.listIndexes()
  if (!existingIndexes.includes(indexName)) {
    const createClient = await client.createIndex({
      createRequest: {
        name: indexName,
        dimension: vectorDimension,
        metric: "cosine",
      },
    })
    // we have to wait for a minute
    await new Promise((resolve) => setTimeout(resolve, 60000))
  } else {
    console.log(indexName, 'exists')
  }
}

(async () => {
//   await createPineconeIndex(client, indexName, vectorDimension);
  await updatePinecone(client, indexName, vectorDimension);
  const response = await queryPineconeVectorStoreAndQueryLLM(client, indexName, question)
  alert(response)
})

let scrapePage = document.getElementById('scrapePage')

// receive content from content script
chrome.runtime.onMessage.addListener(async(request, sender, sendresponse) => {
  let content = request.content
  
  // alert(content)
})

scrapePage.addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({active: true, currentWindow:true});

  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    func: scrapePageContents,
  })
})

function scrapePageContents() {
  let content = document.body.innerText
  chrome.runtime.sendMessage({content})
}
