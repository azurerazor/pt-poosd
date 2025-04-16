import { useState } from 'react';
import { useNavigate } from 'react-router';
import { API_URL } from '../../util/api';
import InputText from '../forms/InputText';
import FunctionButton from '../misc/FunctionButton';
import { useUser } from '../../util/auth';

export default function Dashboard() {
  const navigate = useNavigate();
  const [gameCode, setGameCode] = useState('');
  const { username } = useUser();

  const handleLogout = () => {
    fetch(`${API_URL}/api/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
      .then(() => {
        alert("Successfully logged out!");
        navigate('/');
      })
      .catch(err => {
        console.error(err);
        alert("Logout failed: " + err.response.data.message);
      });        
  };

  const handleJoin = () => {
    navigate(`/game?id=${gameCode}`);
  };

  const handleMake = async () => {
    try {
      const res = await fetch(`${API_URL}/api/game/create`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (res.status !== 201) {
        throw new Error(res.statusText);
      }

      const data = await res.json();
      setGameCode(data.code);
      navigate(`/game?id=${data.code}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="hero-content w-full text-center m-auto flex-col gap-0">
      <img src="../../../images/logo.png" className="justify-center" />
      <h2 className="text-3xl font-bold">Welcome, {username}!</h2>

      <div className="flex flex-col w-md mt-12">
        <div className="flex items-center gap-4 justify-center mb-6">
          <InputText
            name="Game Code"
            placeholder="Enter game code"
            label=""
            onChange={(event) => setGameCode(event.target.value)}
            className="h-12 w-64chrome mt-4"
          />

          <FunctionButton
            label="Join A Lobby"
            onClick={handleJoin}
          />
        </div>

        <div className="divider">or</div>

        <div className="flex justify-center">
          <FunctionButton
            label="Make A Lobby"
            onClick={handleMake}
          />
        </div>
      </div>

      <div className="absolute top-4 right-4 p-2 flex gap-2">
        <FunctionButton label="Stats" onClick={() => navigate('/stats')} />
        <FunctionButton label="Logout" onClick={handleLogout} />
      </div>
    </div>
  );
}
