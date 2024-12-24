export const createPineconeIndex = async (
  client,
  indexName,
  vectorDimension
) => {
  const { indexes } = await client.listIndexes();

  for (const index of indexes) {
    console.log(`"${index.name}" will be deleted.`);
    await client.deleteIndex(index.name);
  }

  console.log(`Creating "${indexName}"...`);

  const createClient = await client.createIndex({
    name: indexName,
    dimension: vectorDimension,
    metric: "cosine",
    spec: {
      serverless: {
        cloud: 'aws', region: 'us-east-1'
      }
    }
  });

  console.log(`Created with client:`, createClient);

  await new Promise((resolve) => setTimeout(resolve, 10000));
};
