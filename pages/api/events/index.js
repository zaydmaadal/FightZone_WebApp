import { connectToDatabase } from '../../../src/lib/mongodb';

export default async function handler(req, res) {
  const { method } = req;
  const { db } = await connectToDatabase();

  switch (method) {
    case 'GET':
      try {
        // Haal alle events op uit de database
        const events = await db.collection('events').find({}).toArray();
        return res.status(200).json(events);
      } catch (error) {
        console.error('Error fetching events:', error);
        return res.status(500).json({ error: 'Error fetching events' });
      }
    case 'POST':
      try {
        const { title, description, start, end, location, type } = req.body;
        if (!title || !description || !start || !end || !location || !type) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        const newEvent = {
          title,
          description,
          start: new Date(start),
          end: new Date(end),
          location,
          type,
          createdAt: new Date()
        };
        const result = await db.collection('events').insertOne(newEvent);
        return res.status(201).json({
          _id: result.insertedId,
          ...newEvent
        });
      } catch (error) {
        console.error('Error creating event:', error);
        return res.status(500).json({ error: 'Error creating event' });
      }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
} 