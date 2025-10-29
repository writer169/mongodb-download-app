import { MongoClient } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  }

  const { collection, database } = req.query;

  if (!collection || !database) {
    return res.status(400).json({ 
      error: 'Missing required parameters: collection and database' 
    });
  }

  let client: MongoClient | null = null;

  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI not configured');
    }

    client = new MongoClient(mongoUri);
    await client.connect();

    const db = client.db(database as string);
    const coll = db.collection(collection as string);

    const documents = await coll.find({}).toArray();

    return res.status(200).json({
      collection: collection,
      database: database,
      count: documents.length,
      data: documents,
      exportedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error downloading collection:', error);
    return res.status(500).json({ 
      error: 'Failed to download collection',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
}