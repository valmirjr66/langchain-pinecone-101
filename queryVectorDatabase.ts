import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";
import queryPineconeAndGPT from "./queryPineconeAndGPT.js";
import readline from 'readline-sync';

dotenv.config();
const INDEX_NAME = `teste-index`;
const client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

const question = readline.question("What would you like to ask?\n");

(async () => await queryPineconeAndGPT(client, INDEX_NAME, question))();