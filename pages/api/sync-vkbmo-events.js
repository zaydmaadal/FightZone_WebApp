import { connectToDatabase } from '../../src/lib/mongodb';
import fetch from 'node-fetch';

const DATA_API_URL = 'https://inffuse.eventscalendar.co/js/v0.1/calendar/data?inffuse-platform=weebly&inffuse-user=134849841&inffuse-site=270538925224280173&inffuse-project=9ec8a24a-f8de-4208-a693-04800cd55286';

function combineDateTime(dateStr, hour, minutes) {
  if (!dateStr) return null;
  const pad = n => n.toString().padStart(2, '0');
  // Europe/Brussels is meestal +02:00 in mei (zomertijd)
  return `${dateStr}T${pad(hour || 0)}:${pad(minutes || 0)}:00+02:00`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const response = await fetch(DATA_API_URL, { method: 'POST' });
    const data = await response.json();

    const events = (data?.project?.data?.events || []).map(event => {
      const allDay = !!event.allday;
      let start, end;
      if (allDay) {
        start = event.startDate;
        end = event.endDate;
      } else {
        start = combineDateTime(event.startDate, event.startHour, event.startMinutes);
        end = combineDateTime(event.endDate, event.endHour, event.endMinutes);
      }
      return {
        title: event.title,
        start,
        end,
        allDay,
        location: event.location,
        description: event.description,
        createdAt: new Date()
      };
    });

    const { db } = await connectToDatabase();
    let added = 0;
    for (const event of events) {
      const exists = await db.collection('events').findOne({
        title: event.title,
        start: event.start,
        allDay: event.allDay
      });
      if (!exists) {
        await db.collection('events').insertOne(event);
        added++;
      }
    }
    res.status(200).json({ message: `Sync complete. ${added} nieuwe events toegevoegd.`, events });
  } catch (error) {
    console.error('Error syncing VKBMO events:', error);
    res.status(500).json({ error: 'Error syncing VKBMO events', details: error.message });
  }
}

// TIP voor de frontend:
// Toon bij event.allDay === true GEEN tijd, of zet 'Hele dag' bij het event in de agenda. 