export type CircleMember = {
  circleId: string;
  userId: string;
  nickname: string;
  bio?: string;
  isDeafened?: boolean;
  isMuted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
