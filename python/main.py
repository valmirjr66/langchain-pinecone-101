from dotenv import load_dotenv
from create_new_index import create_new_index
from query_pinecone_and_GPT import query_pinecone_and_gpt
from update_pinecone import update_pinecone
import os
import uuid
import asyncio
from pinecone.grpc import PineconeGRPC as Pinecone

load_dotenv()

PROMPT = "How to name raw footage files?"
INDEX_NAME = f"teste-{uuid.uuid4()}"

client = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

print(client)


async def main():
    await create_new_index(client, INDEX_NAME)
    await update_pinecone(client, INDEX_NAME)
    await query_pinecone_and_gpt(client, INDEX_NAME, PROMPT)


asyncio.run(main())
