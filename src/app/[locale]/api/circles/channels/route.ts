import type { NextApiRequest, NextApiResponse } from 'next';

import {
  createChannel,
  deleteChannel,
  getAllChannelsForCircle,
  getChannelById,
  updateChannel,
} from '@/utils/channel/operations';

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'POST': {
      // Create a new circle
      const { circleId, name, description, type } = req.body;
      try {
        const newChannel = await createChannel(
          circleId,
          name,
          description,
          type,
        );
        res.status(201).json(newChannel);
      } catch (error) {
        res.status(500).json({
          message:
            error instanceof Error ? error.message : 'Failed to create channel',
        });
      }
      break;
    }

    case 'PUT': {
      // Update an existing circle
      const { channelId, updates } = req.body;
      try {
        const updatedChannel = await updateChannel(channelId, updates);
        res.status(200).json(updatedChannel);
      } catch (error) {
        res.status(500).json({
          message:
            error instanceof Error ? error.message : 'Failed to update channel',
        });
      }
      break;
    }

    case 'DELETE': {
      // Delete a circle
      const { channelId } = req.body;
      try {
        const deletedChannel = await deleteChannel(channelId);
        res.status(200).json(deletedChannel);
      } catch (error) {
        res.status(500).json({
          message:
            error instanceof Error ? error.message : 'Failed to delete channel',
        });
      }
      break;
    }

    case 'GET': {
      // Handle different GET requests
      const { channelId, circleId } = req.query;

      if (channelId) {
        // Get a specific channel
        try {
          const channel = await getChannelById(channelId as string);
          res.status(200).json(channel);
        } catch (error) {
          res.status(500).json({
            message:
              error instanceof Error
                ? error.message
                : 'Failed to fetch channel',
          });
        }
      } else if (circleId) {
        // Get channels by circle id
        try {
          const channels = await getAllChannelsForCircle(circleId as string);
          res.status(200).json(channels);
        } catch (error) {
          res.status(500).json({
            message:
              error instanceof Error
                ? error.message
                : 'Failed to fetch channels for circle',
          });
        }
      } else {
        res.status(400).json({ message: 'Invalid query parameters' });
      }
      break;
    }

    default:
      res.setHeader('Allow', ['POST', 'PUT', 'DELETE', 'GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
