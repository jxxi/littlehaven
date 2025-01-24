import type { NextApiRequest, NextApiResponse } from 'next';

import {
  createCircle,
  deleteCircle,
  getCircle,
  getCirclesByUserId,
  getPublicCircles,
  updateCircle,
} from '@/utils/circle/operations';

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'POST': {
      // Create a new circle
      const circle = req.body;
      try {
        const newCircle = await createCircle(circle);
        res.status(201).json(newCircle);
      } catch (error) {
        res.status(500).json({
          message:
            error instanceof Error ? error.message : 'Failed to create circle',
        });
      }
      break;
    }

    case 'PUT': {
      // Update an existing circle
      const { circleId, updates } = req.body;
      try {
        const updatedCircle = await updateCircle(circleId, updates);
        res.status(200).json(updatedCircle);
      } catch (error) {
        res.status(500).json({
          message:
            error instanceof Error ? error.message : 'Failed to update circle',
        });
      }
      break;
    }

    case 'DELETE': {
      // Delete a circle
      const { circleId } = req.body;
      try {
        const deletedCircle = await deleteCircle(circleId);
        res.status(200).json(deletedCircle);
      } catch (error) {
        res.status(500).json({
          message:
            error instanceof Error ? error.message : 'Failed to delete circle',
        });
      }
      break;
    }

    case 'GET': {
      // Handle different GET requests
      const { circleId, userId, isPublic } = req.query;

      if (circleId) {
        // Get a specific circle
        try {
          const circle = await getCircle(circleId as string);
          res.status(200).json(circle);
        } catch (error) {
          res.status(500).json({
            message:
              error instanceof Error ? error.message : 'Failed to fetch circle',
          });
        }
      } else if (userId) {
        // Get circles by user ID
        try {
          const circles = await getCirclesByUserId(userId as string);
          res.status(200).json(circles);
        } catch (error) {
          res.status(500).json({
            message:
              error instanceof Error
                ? error.message
                : 'Failed to fetch circles for user',
          });
        }
      } else if (isPublic) {
        // Get public circles
        try {
          const publicCircles = await getPublicCircles();
          res.status(200).json(publicCircles);
        } catch (error) {
          res.status(500).json({
            message:
              error instanceof Error
                ? error.message
                : 'Failed to fetch public circles',
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
