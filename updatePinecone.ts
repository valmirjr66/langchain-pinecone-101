import { Pinecone, PineconeRecord, RecordMetadata } from "@pinecone-database/pinecone";
import { DirectoryLoader } from "langchain/document_loaders";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export default async (
  client: Pinecone,
  indexName: string,
) => {
  console.log("Retrieving Pinecone index...");

  const index = client.Index(indexName);

  console.log(`Pinecone index retrieved`);

  const loader = new DirectoryLoader("./documents", {
    ".txt": (path) => new TextLoader(path),
    ".pdf": (path) => new PDFLoader(path),
  });

  const docs = await loader.load();

  for (const doc of docs) {
    console.log(`Processing document: ${doc.metadata.source}...`);

    const txtPath = doc.metadata.source;
    const text = doc.pageContent;

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 100,
    });

    console.log("Splitting text into chunks...");

    const chunks = await textSplitter.createDocuments([text]);

    console.log(`Text split into ${chunks.length} chunks`);

    console.log(`Embedding ${chunks.length} text chunks...`);

    const embeddingsArrays = await new OpenAIEmbeddings()
      .embedDocuments(
        chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " "))
      );

    console.log("Finished embedding documents");

    console.log(`Creating ${chunks.length} vectors array with id, values and metadata...`);

    const batchSize = 100;

    let batch: PineconeRecord<RecordMetadata>[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const vector = {
        id: `${txtPath}_${i}`,
        values: embeddingsArrays[i],
        metadata: {
          ...chunk.metadata,
          loc: JSON.stringify(chunk.metadata.loc),
          pageContent: chunk.pageContent,
          txtPath: txtPath,
        },
      };

      batch.push(vector);

      if (batch.length === batchSize || i === chunks.length - 1) {
        await index.upsert(batch);
        batch = [];
      }
    }

    console.log(`Pinecone index updated with ${chunks.length} vectors`);
  }
};
