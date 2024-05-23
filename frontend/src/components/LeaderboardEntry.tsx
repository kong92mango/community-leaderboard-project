import React from 'react';
import './LeaderboardEntry.css';

interface LeaderboardEntryProps {
  logoUrl: string;
  name: string;
  rank: number;
  exp: number;
  userCount: number;
}

const LeaderboardEntry: React.FC<LeaderboardEntryProps> = ({ logoUrl, name, rank, exp, userCount }) => {

  const topRankStyling = (rank: number): string => {
    if (rank === 1) return 'gold-rank';
    if (rank === 2) return 'silver-rank';
    if (rank === 3) return 'bronze-rank';
    return '';
  }

  return (
    <div className={`leaderboard-entry ${topRankStyling(rank)}`}>
      <img src={logoUrl} alt={`${name} logo`} />
      <div>
        <h2>{name}</h2>
        <p>Rank: {rank}</p>
        <p>Total Experience Points: {exp}</p>
        <p>Total Users: {userCount}</p>
      </div>
    </div>
  );
}

export default LeaderboardEntry;
