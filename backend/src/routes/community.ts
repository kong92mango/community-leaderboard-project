import express from 'express';
import { CommunityModel } from '../models/Community';
import { UserModel } from '../models/User';

const communityRouter = express.Router();

/**
 * @route GET /community/top
 * @returns {Array} - Array of Community objects
 */
communityRouter.get('/top', async (_, res) => {
//order of routes matter, do not change
  try {
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

    res.send(communities);
  } catch (error: any) {
	console.error('Error during aggregation:', error.message, error.stack);
    res.status(500).send({ message: 'Unexpected error retrieving leaderboard' });
  }
});

/**
 * @route GET /community/:id
 * @param {string} id - Community ID
 * @returns {Community} - Community object
 */
communityRouter.get('/:id', async (req, res) => {
  try {
    const community = await CommunityModel.findById(req.params.id).lean();
    if (!community) {
      return res.status(404).send({ message: 'Community not found' });
    }
    res.send(community);
  } catch (error) {
    res.status(500).send({ message: 'Unexpected error retrieving community' });
  }
});

/**
 * @route GET /community
 * @returns {Array} - Array of Community objects
 */
communityRouter.get('/', async (_, res) => {
  try {
    const communities = await CommunityModel.find({}).lean();
    res.send(communities);
  } catch (error) {
    res.status(500).send({ message: 'Unexpected error retrieving communities' });
  }
});

export {
  communityRouter
};
