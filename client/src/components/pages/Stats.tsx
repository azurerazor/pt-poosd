import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { API_URL } from '../../util/api';
import { useUser } from '../../util/auth';
import StatsCard from '../ui/StatsCard';
import { all_roles } from '../../../../common/game/roles';

interface StatsData {
  gamesPlayed: number;
  gamesWon: number;
  gamesPlayedAs: Record<string, number>;
  gamesWonAs: Record<string, number>;
  gamesPlayedAsGood: number;
  gamesWonAsGood: number;
  gamesPlayedAsEvil: number;
  gamesWonAsEvil: number;
}

export default function Stats() {
  const navigate = useNavigate();
  const { username } = useUser();
  const [stats, setStats] = useState<StatsData | null>(null);

  const handleLogout = () => {
    fetch(`${API_URL}/api/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    }).then(_ => {
      alert("Successfully logged out!");
      navigate('/');
    }).catch(err => {
      console.error(err);
      alert("Logout failed: " + err.message);
    });
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/stats/user`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (!res.ok) throw new Error(res.statusText);

        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        console.error(err);
        alert("Stats fetch failed: " + (err.message || "Unknown error"));
      }
    };

    fetchStats();
  }, []);

  if (!stats) {
    return <div className="flex justify-center items-center h-screen">Loading stats...</div>;
  }

  return (
    <div className="min-h-screen bg-base-100 py-10 px-4">
      <h1 className="text-4xl font-bold text-center mb-8">Stats for {username}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Overall Stats */}
        <StatsCard played={stats.gamesPlayed} won={stats.gamesWon} />
        <StatsCard played={stats.gamesPlayedAsGood} won={stats.gamesWonAsGood} role="Good" />
        <StatsCard played={stats.gamesPlayedAsEvil} won={stats.gamesWonAsEvil} role="Evil" />

        {/* Per-role Stats */}
        {all_roles.map(role => {
          const name = role.name;
          const played = stats.gamesPlayedAs[name] || 0;
          const won = stats.gamesWonAs[name] || 0;
          
          return (
            <StatsCard key={name} played={played} won={won} role={name} />
          );
        })}
      </div>
    </div>
  );
}
