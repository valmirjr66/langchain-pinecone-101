from langchain_community.document_loaders import DirectoryLoader
from langchain_community.document_loaders import DirectoryLoader
from langchain_community.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from pinecone.grpc import PineconeGRPC as Pinecone
from langchain_community.document_loaders import PyPDFLoader


async def update_pinecone(client: Pinecone, index_name: str):
    print("Retrieving Pinecone index...")

    index = client.Index(index_name)

    print("Pinecone index retrieved")

    loader = DirectoryLoader("./documents", glob="**/*.pdf", loader_cls=PyPDFLoader)

    docs = loader.load()

    for doc in docs:
        print(f"Processing document: {doc.metadata['source']}...")

        txt_path = doc.metadata["source"]
        text = doc.page_content

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100,
        )

        print("Splitting text into chunks...")

        chunks = await text_splitter.create_documents([text])

        print(f"Text split into {len(chunks)} chunks")

        print(f"Embedding {len(chunks)} text chunks...")

        embeddings_arrays = await OpenAIEmbeddings().embed_documents(
            [chunk.page_content.replace("\n", " ") for chunk in chunks]
        )

        print("Finished embedding documents")

        print(f"Creating {len(chunks)} vectors array with id, values and metadata...")

        batch_size = 100
        batch = []

        for i, chunk in enumerate(chunks):
            vector = PineconeRecord(
                id=f"{txt_path}_{i}",
                values=embeddings_arrays[i],
                metadata={
                    **chunk.metadata,
                    "loc": str(chunk.metadata["loc"]),
                    "page_content": chunk.page_content,
                    "txt_path": txt_path,
                },
            )

            batch.append(vector)

            if len(batch) == batch_size or i == len(chunks) - 1:
                await index.upsert(batch)
                batch = []

        print(f"Pinecone index updated with {len(chunks)} vectors")
