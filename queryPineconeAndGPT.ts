import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import OpenAI from "openai";

export default async (
  client: Pinecone,
  indexName: string,
  prompt: string
) => {
  console.log("Querying Pinecone vector store...");

  const index = client.Index(indexName);
  const queryEmbedding = await new OpenAIEmbeddings().embedQuery(prompt);

  let queryResponse = await index.query({
    topK: 10,
    vector: queryEmbedding,
    includeMetadata: true,
    includeValues: true,
  });

  console.log(`Found ${queryResponse.matches.length} matches...`);

  if (queryResponse.matches.length) {
    const concatenatedPageContent = queryResponse.matches
      .map((match) => match.metadata.pageContent)
      .join(" ");

    const openaiClient = new OpenAI();

    const augmentedPrompt =
      `Using the following information, answer the prompt at end: ${concatenatedPageContent}

    ========================

    ${prompt}`;

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant created to answer question based on RAG retrieval."
        },
        {
          role: "user",
          content: augmentedPrompt
        },
      ],
    });

    console.log(`\nAnswer: ${completion.choices[0].message.content}`);
  } else {
    console.log("No matches.");
  }
};
