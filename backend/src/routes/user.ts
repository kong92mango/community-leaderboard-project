import express from "express";
import { UserModel } from "../models/User";
import { CommunityModel } from "../models/Community";

const userRouter = express.Router();

/**
 * @route GET /user/:id
 * @param {string} id - User ID
 * @returns {User} - User object with experiencePoints field
 */
userRouter.get("/:id", async (req, res) => {
	const user = await UserModel.findById(req.params.id).select('+experiencePoints');
	if (!user) {
		return res.status(404).send({ message: "User not found" });
	}
	res.send(user);
});

/**
 * @route GET /user
 * @returns {Array} - Array of User objects
 * @note Adds the virtual field of totalExperience to the user.
 * @hint You might want to use a similar aggregate in your leaderboard code.
 */
userRouter.get("/", async (_, res) => {
	const users = await UserModel.aggregate([
		{
			$unwind: "$experiencePoints"
		},
		{
			$group: {
				_id: "$_id",
				email: { $first: "$email" },
				profilePicture: { $first: "$profilePicture" },
				totalExperience: { $sum: "$experiencePoints.points" }
			}
		}
	]);
	res.send(users);
});

/**
 * @route POST /user/:userId/join/:communityId
 * @param {string} userId - User ID
 * @param {string} communityId - Community ID
 * @description Joins a community
 */
userRouter.post("/:userId/join/:communityId", async (req, res) => {
	const { userId, communityId } = req.params;

	try {
	  const user = await UserModel.findById(userId);
	  if (!user) {
		return res.status(404).json({ message: 'User not found' });
	  }
  
	  if (user.community) {
		const currentCommunity = await CommunityModel.findById(user.community);
		if (communityId === currentCommunity?.id){
			return res.status(200).json({ message: `User is already in this community.` });
		}
		if (currentCommunity) {
			return res.status(400).json({ message: `User is already a member of another community (${currentCommunity.name}), please leave first.` });
		}
		// If user has a community attached but it can't be found, we pretend the user does not have an old community and 
		// continue allow user to join new community
	  }
  
	  const community = await CommunityModel.findById(communityId);
	  if (!community) {
		return res.status(404).json({ message: 'Community not found' });
	  }
  
	  user.community = community._id;
	  await user.save();
  
	  return res.status(200).json({ message: 'User has successfully joined the community' });
	} catch (error) {
	  return res.status(500).json({ message: 'Unexpected error while joining community' });
	}
  });

/**
 * @route DELETE /user/:userId/leave/:communityId
 * @param {string} userId - User ID
 * @param {string} communityId - Community ID
 * @description leaves a community
 */
userRouter.delete("/:userId/leave/:communityId", async (req, res) => {
	const { userId, communityId } = req.params;

	try {
		const user = await UserModel.findById(userId);
		if (!user) {
		  return res.status(404).json({ message: 'User not found' });
		}
	
		if (!user.community) {
		  return res.status(400).json({ message: 'User is not a member of any community yet' });
		}

		if (user.community.toString() !== communityId) {
		  return res.status(400).json({ message: 'User is not a member of this community' });
		}
	
		const currentCommunity = await CommunityModel.findById(user.community);
		const currentCommunityName = currentCommunity?.name ?? '';
		user.community = null;
		await user.save();
		const successMessage = currentCommunityName ? `User has successfully left the community of ${currentCommunity?.name}` : `User has successfully left this community`
		return res.status(200).json({ message: successMessage });

	  } catch (error) {
		return res.status(500).json({ message: 'Unexpected error while leaving community' });
	}
});

export {
    userRouter
}
