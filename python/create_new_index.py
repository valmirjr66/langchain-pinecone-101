import asyncio
from pinecone import Pinecone


async def create_new_index(client: Pinecone, index_name: str):
    indexes = client.list_indexes()

    for index in indexes:
        print(f'"{index.name}" will be deleted.')
        client.delete_index(index.name)

    print(f'Creating "{index_name}"...')

    client.create_index(
        name=index_name,
        dimension=1536,
        metric="cosine",
        spec={"serverless": {"cloud": "aws", "region": "us-east-1"}},
    )

    await asyncio.sleep(10)
