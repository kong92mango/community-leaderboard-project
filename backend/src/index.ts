import express, { Express } from "express";
import { apiRouter } from "./routes";
import { mongoose } from '@typegoose/typegoose';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { CommunityModel } from "./models/Community";
import { UserModel } from "./models/User";
import { BROADCAST_INTERVAL, API_BASE_URL, DEFAULT_SOCKET_PORT } from '../../shared/constants';


const app: Express = express();
const port = API_BASE_URL.split(':')[2] || DEFAULT_SOCKET_PORT;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB. Check the README on how to run the database.', error);
  });

app.use("/", apiRouter);

const server = app.listen(port, () => {
  console.log(`Server is running at ${API_BASE_URL}`);
});

// Set up WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: any) => {
  console.log('Client connected');
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Function to broadcast updates to all connected clients
const broadcastUpdate = async () => {
  const communities = await CommunityModel.aggregate([
    {
      $lookup: {
        from: UserModel.collection.name,
        localField: '_id',
        foreignField: 'community',
        as: 'members'
      }
    },
    {
      $addFields: {
        totalUsers: { $size: '$members' },
        totalExperiencePoints: {
          $sum: {
            $map: {
              input: '$members',
              as: 'member',
              in: { $sum: '$$member.experiencePoints.points' }
            }
          }
        }
      }
    },
    {
      $sort: {
        totalExperiencePoints: -1
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        logo: 1,
        totalUsers: 1,
        totalExperiencePoints: 1
      }
    }
  ]);

  wss.clients.forEach((client: any) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(communities));
    }
  });
};

setInterval(broadcastUpdate, BROADCAST_INTERVAL * 1000);

