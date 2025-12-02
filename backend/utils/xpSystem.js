export const calculateXP = (participationType) => {
  const xpMap = {
    participant: 10,
    winner_first: 50,
    winner_second: 30,
    winner_third: 20,
  };

  return xpMap[participationType] || 10;
};

export const awardXPToUsers = async (participants, xpPoints) => {
  try {
    const { default: User } = await import('../models/User.js');
    
    for (const participantId of participants) {
      const user = await User.findById(participantId);
      if (user && user.role === 'STUDENT') {
        user.awardXP(xpPoints);
        await user.save();
      }
    }
  } catch (error) {
    console.error('Error awarding XP:', error);
    throw error;
  }
};

export const getLeaderboard = async (limit = 10) => {
  try {
    const { default: User } = await import('../models/User.js');
    
    const topUsers = await User.find({ role: 'STUDENT' })
      .sort({ xp: -1 })
      .limit(limit)
      .select('name email xp badges');

    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      ...user.toObject(),
    }));

    return leaderboard;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
};

export const getUserRank = async (userId) => {
  try {
    const { default: User } = await import('../models/User.js');
    
    const user = await User.findById(userId);
    if (!user || user.role !== 'STUDENT') {
      return null;
    }

    const higherRanked = await User.countDocuments({
      role: 'STUDENT',
      xp: { $gt: user.xp },
    });

    return higherRanked + 1;
  } catch (error) {
    console.error('Error getting user rank:', error);
    throw error;
  }
};
