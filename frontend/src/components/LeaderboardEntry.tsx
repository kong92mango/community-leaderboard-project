import React from 'react';

interface LeaderboardEntryProps {
  logoUrl: string;
  name: string;
  rank: number;
  exp: number;
  userCount: number;
}

const LeaderboardEntry: React.FC<LeaderboardEntryProps> = ({ logoUrl, name, rank, exp, userCount }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px', borderRadius: '5px', display: 'flex', alignItems: 'center' }}>
      <img src={logoUrl} alt={`${name} logo`} style={{ width: '50px', height: '50px', marginRight: '10px' }} />
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
