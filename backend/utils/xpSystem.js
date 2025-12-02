/**
 * Calculate XP to award based on event participation
 * @param {String} participationType - Type of participation: 'participant', 'winner_first', 'winner_second', 'winner_third'
 * @returns {Number} - XP points to award
 */
export const calculateXP = (participationType) => {
  const xpMap = {
    participant: 10,      // Base XP for participating
    winner_first: 50,     // First prize winner
    winner_second: 30,    // Second prize winner
    winner_third: 20,     // Third prize winner
  };

  return xpMap[participationType] || 10;
};

/**
 * Award XP to users based on event participation
 * @param {Array} participants - Array of user IDs or user objects
 * @param {Number} xpPoints - XP points to award
 */
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

/**
 * Get leaderboard data
 * @param {Number} limit - Number of top users to retrieve
 * @returns {Array} - Array of top users with rank
 */
export const getLeaderboard = async (limit = 10) => {
  try {
    const { default: User } = await import('../models/User.js');
    
    const topUsers = await User.find({ role: 'STUDENT' })
      .sort({ xp: -1 })
      .limit(limit)
      .select('name email xp badges');

    // Add rank to each user
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

/**
 * Get user's rank in the leaderboard
 * @param {String} userId - User ID
 * @returns {Number} - User's rank
 */
export const getUserRank = async (userId) => {
  try {
    const { default: User } = await import('../models/User.js');
    
    const user = await User.findById(userId);
    if (!user || user.role !== 'STUDENT') {
      return null;
    }

    // Count users with higher XP
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
