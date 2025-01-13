import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";
import { v4 as uuidv4 } from 'uuid';
import createNewIndex from "./createNewIndex.js";
import queryPineconeAndGPT from "./queryPineconeAndGPT.js";
import updatePinecone from "./updatePinecone.js";

dotenv.config();

const PROMPT = "How to name raw footage files?";
const INDEX_NAME = `teste-${uuidv4()}`;

const client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

(async () => {
  await createNewIndex(client, INDEX_NAME);

  await updatePinecone(client, INDEX_NAME);

  await queryPineconeAndGPT(client, INDEX_NAME, PROMPT);
})();
