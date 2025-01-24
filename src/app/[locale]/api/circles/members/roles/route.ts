import type { NextApiRequest, NextApiResponse } from 'next';

import {
  createMemberRole,
  deleteMemberRole,
  getRolesForUserInCircle,
  updateMemberRole,
} from '@/utils/circle/member/operations'; // Adjust the import based on your project structure

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { method } = req;

  switch (method) {
    case 'POST':
      // Create a new member role
      try {
        const { circleId, userId, roleId } = req.body;
        const newMemberRole = await createMemberRole(circleId, userId, roleId);
        res.status(201).json(newMemberRole);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
      break;

    case 'PUT':
      // Update an existing member role
      try {
        const { circleId, userId, updates } = req.body;
        const updatedMemberRole = await updateMemberRole(
          circleId,
          userId,
          updates,
        );
        res.status(200).json(updatedMemberRole);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
      break;

    case 'DELETE':
      // Delete a member role
      try {
        const { circleId, userId } = req.body;
        const deletedMemberRole = await deleteMemberRole(circleId, userId);
        res.status(200).json(deletedMemberRole);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
      break;

    case 'GET':
      // Get roles for a user in a circle
      try {
        const { circleId, userId } = req.body;
        const roles = await getRolesForUserInCircle(circleId, userId);
        res.status(200).json(roles);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['POST', 'PUT', 'DELETE', 'GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
