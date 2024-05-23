import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Community } from "../interfaces";
import LeaderboardEntry from './LeaderboardEntry';
import { BROADCAST_INTERVAL, API_BASE_URL } from '../../../shared/constants';

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

  if (leaderboardLoading) return 'Leaderboard Loading...';

  return (
    <div>
      <div>Leaderboard is automatically updated every {BROADCAST_INTERVAL} seconds.</div>
      {leaderboards.map((community: Community, index: number) => (
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
  );
}

export default CommunityRankingList;
