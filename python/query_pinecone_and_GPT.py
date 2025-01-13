from langchain_community.embeddings import OpenAIEmbeddings
import openai
from pinecone.grpc import PineconeGRPC as Pinecone


async def query_pinecone_and_gpt(client: Pinecone, index_name: str, prompt: str):
    print("Querying Pinecone vector store...")

    index = client.Index(index_name)
    query_embedding = await OpenAIEmbeddings().embed_query(prompt)

    query_response = await index.query(
        {
            "topK": 10,
            "vector": query_embedding,
            "includeMetadata": True,
            "includeValues": True,
        }
    )

    print(f"Found {len(query_response['matches'])} matches...")

    if query_response["matches"]:
        concatenated_page_content = " ".join(
            match["metadata"]["pageContent"] for match in query_response["matches"]
        )

        openai.api_key = "your_openai_api_key"

        augmented_prompt = (
            f"Using the following information, answer the prompt at end: {concatenated_page_content}"
            f"\n========================\n"
            f"{prompt}"
        )

        completion = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant created to answer questions based on RAG retrieval.",
                },
                {"role": "user", "content": augmented_prompt},
            ],
        )

        print(f"\nAnswer: {completion.choices[0].message['content']}")
    else:
        print("No matches.")
