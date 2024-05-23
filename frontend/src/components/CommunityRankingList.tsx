import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Community } from "../interfaces";
import LeaderboardEntry from './LeaderboardEntry';
import { BROADCAST_INTERVAL, API_BASE_URL, LEADERBOARD_MAX_RESULTS } from '../../../shared/constants';
import './CommunityRankingList.css';

const CommunityRankingList = () => {
  const { data: leaderboards, isLoading: leaderboardLoading, refetch } = useQuery({
    queryKey: ['leaderboards'],
    queryFn: () => axios.get(`${API_BASE_URL}/community/top`).then(res => res.data)
  });

  const socketAddress = API_BASE_URL.split('//')[1];

  useEffect(() => {
    const socket = new WebSocket(`ws://${socketAddress}`);

    socket.onopen = () => {
      console.log('WebSocket connection opened');
    };

    socket.onmessage = (event) => {
      console.log('WebSocket message received:', event.data); // console log when community DB changes 
      refetch();
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      socket.close();
    };
  }, [refetch]);

  if (leaderboardLoading) return <div className="leaderboard-loading">Leaderboard Loading...</div>;

  return (
    <div className="community-ranking-list">
      <h2>Leaderboard is automatically updated every {BROADCAST_INTERVAL} seconds.</h2>
      <h2>Only the top {LEADERBOARD_MAX_RESULTS} communities are displayed.</h2>
      <div className="leaderboard-entries">
        {leaderboards.slice(0, LEADERBOARD_MAX_RESULTS).map((community: Community, index: number) => (
          <LeaderboardEntry
            key={index}
            logoUrl={community.logo || ''}
            name={community.name}
            rank={index + 1}
            exp={community.totalExperiencePoints || 0}
            userCount={community.totalUsers || 0}
          />
        ))}
      </div>
    </div>
  );
}

export default CommunityRankingList;
