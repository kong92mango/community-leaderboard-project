import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Community } from "../interfaces";

const CommunityRankingList = () => {
    const { data: leaderboards, isLoading: leaderboardLoading } = useQuery({
        queryKey: ['leaderboards'],
        queryFn: () => axios.get('http://localhost:8080/community/top').then(res => res.data)
    });

    if (leaderboardLoading) return 'Leaderboard Loading...';

return (
    <div>
        {leaderboards.map((community: Community) => <div>{community.name}, {community.totalExperiencePoints}, {community.totalUsers}</div>)}
    </div>
);
}

export default CommunityRankingList;