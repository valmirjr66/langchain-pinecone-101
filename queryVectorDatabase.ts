import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";
import queryPineconeAndGPT from "./queryPineconeAndGPT.js";

dotenv.config();

const PROMPT = "Who joined the first meeting with comp.coop?";
const INDEX_NAME = `teste-index`;

const client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

(async () => {
  await queryPineconeAndGPT(client, INDEX_NAME, PROMPT);
})();
