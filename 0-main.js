import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { v4 as uuidv4 } from 'uuid';
import { createPineconeIndex } from "./1-createPineconeIndex.js";
import { updatePinecone } from "./2-updatePinecone.js";
import { queryPineconeVectorStoreAndQueryLLM } from "./3-queryPineconeAndQueryGPT.js";

dotenv.config();

const loader = new DirectoryLoader("./documents", {
  ".txt": (path) => new TextLoader(path),
  ".pdf": (path) => new PDFLoader(path),
});
const docs = await loader.load();
const question = "Who is mr Gatsby?";
const indexName = `teste-${uuidv4()}`;
const vectorDimension = 1536;

const client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

(async () => {
  await createPineconeIndex(client, indexName, vectorDimension);

  await updatePinecone(client, indexName, docs);

  await queryPineconeVectorStoreAndQueryLLM(client, indexName, question);
})();
