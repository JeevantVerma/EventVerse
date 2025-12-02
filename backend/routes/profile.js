import express from 'express';
import User from '../models/User.js';
import Event from '../models/Event.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { getLeaderboard, getUserRank } from '../utils/xpSystem.js';

const router = express.Router();

/**
 * @route   GET /api/profile
 * @desc    Get detailed profile for logged-in user
 * @access  Private
 */
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    
    let additionalData = {};

    // For students, include participation history and rank
    if (user.role === 'STUDENT') {
      const registeredEvents = await Event.find({
        registeredParticipants: user._id,
      }).select('title startDateTime endDateTime status category');

      const rank = await getUserRank(user._id);

      additionalData = {
        registeredEvents,
        rank,
        totalEvents: registeredEvents.length,
      };
    }

    // For society admins, include their events
    if (user.role === 'SOCIETY_ADMIN') {
      const societyEvents = await Event.find({ createdBy: user._id })
        .select('title status startDateTime category')
        .sort({ createdAt: -1 });

      additionalData = {
        societyEvents,
        totalEvents: societyEvents.length,
      };
    }

    res.json({
      success: true,
      user,
      ...additionalData,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile.',
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/', authenticate, async (req, res) => {
  try {
    const { name, favoriteCategories } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    
    // Only students can update favorite categories
    if (favoriteCategories && user.role === 'STUDENT') {
      user.favoriteCategories = favoriteCategories;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile.',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/leaderboard
 * @desc    Get global leaderboard of top XP students
 * @access  Public
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await getLeaderboard(limit);

    res.json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard.',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/stats/overview
 * @desc    Get overview statistics (SUPER_ADMIN only)
 * @access  Private (SUPER_ADMIN)
 */
router.get('/stats/overview', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const pendingApprovals = await Event.countDocuments({ status: 'PENDING_APPROVAL' });
    const approvedEvents = await Event.countDocuments({ status: 'APPROVED' });
    const completedEvents = await Event.countDocuments({ status: 'COMPLETED' });
    
    const totalStudents = await User.countDocuments({ role: 'STUDENT' });
    const totalSocieties = await User.countDocuments({ role: 'SOCIETY_ADMIN' });

    // Events by category
    const eventsByCategory = await Event.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Events by society
    const eventsBySociety = await Event.aggregate([
      { $group: { _id: '$societyName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Upcoming events
    const upcomingEvents = await Event.find({
      status: 'APPROVED',
      startDateTime: { $gte: new Date() },
    }).sort({ startDateTime: 1 }).limit(5);

    res.json({
      success: true,
      stats: {
        totalEvents,
        pendingApprovals,
        approvedEvents,
        completedEvents,
        totalStudents,
        totalSocieties,
        eventsByCategory,
        eventsBySociety,
        upcomingEvents,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics.',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/highlights
 * @desc    Get personalized event highlights for students
 * @access  Private (STUDENT)
 */
router.get('/highlights', authenticate, authorize('STUDENT'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Get user's registered events
    const registeredEvents = await Event.find({
      registeredParticipants: user._id,
      startDateTime: { $gte: new Date() },
    }).select('startDateTime endDateTime');

    // Build query for recommended events
    const query = {
      status: 'APPROVED',
      startDateTime: { $gte: new Date() },
      registeredParticipants: { $ne: user._id }, // Not already registered
    };

    // Filter by favorite categories if set
    if (user.favoriteCategories && user.favoriteCategories.length > 0) {
      query.category = { $in: user.favoriteCategories };
    }

    let recommendedEvents = await Event.find(query)
      .sort({ startDateTime: 1 })
      .limit(10);

    // Filter out events that clash with registered events
    recommendedEvents = recommendedEvents.filter(event => {
      return !registeredEvents.some(registered => 
        (event.startDateTime >= registered.startDateTime && event.startDateTime < registered.endDateTime) ||
        (event.endDateTime > registered.startDateTime && event.endDateTime <= registered.endDateTime) ||
        (event.startDateTime <= registered.startDateTime && event.endDateTime >= registered.endDateTime)
      );
    });

    res.json({
      success: true,
      highlights: recommendedEvents,
    });
  } catch (error) {
    console.error('Get highlights error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching highlights.',
      error: error.message,
    });
  }
});

export default router;
