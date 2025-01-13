import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";
import createNewIndex from "./createNewIndex.js";
import updatePinecone from "./updatePinecone.js";

dotenv.config();

const INDEX_NAME = `teste-index`;

const client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

(async () => {
  await createNewIndex(client, INDEX_NAME);

  await updatePinecone(client, INDEX_NAME);
})();
