import type { NextApiRequest, NextApiResponse } from 'next';

import {
  createCircleMember,
  deleteCircleMember,
  getAllMembersForCircle,
  getMemberByCircleIdAndUserId,
  updateCircleMember,
} from '@/utils/circle/member/operations';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { method } = req;

  switch (method) {
    case 'POST':
      try {
        const { circleId, userId, bio, nickname } = req.body;
        const newMemberRole = await createCircleMember({
          circleId,
          userId,
          nickname,
          bio,
        });
        res.status(201).json(newMemberRole);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
      break;

    case 'PUT':
      try {
        const { circleId, userId, updates } = req.body;
        const updatedMemberRole = await updateCircleMember(
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
      try {
        const { circleId, userId } = req.body;
        const deletedMemberRole = await deleteCircleMember(circleId, userId);
        res.status(200).json(deletedMemberRole);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
      break;

    case 'GET':
      try {
        const { circleId, userId } = req.body;
        let roles;

        if (circleId && userId) {
          roles = await getMemberByCircleIdAndUserId(circleId, userId);
        } else {
          roles = await getAllMembersForCircle(circleId);
        }

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
