import Axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { API_URL } from '../../util/api';
import InputText from '../forms/InputText';

export default function Dashboard() {
    const navigate = useNavigate();
    const [username] = useState('');
    const [gameCode, setGameCode] = useState('');

    const handleLogout = () => {
        Axios.post(`${API_URL}/api/logout`, {
        }).then(_ => {
            alert("Successfully logged out!");
            navigate('/');
        }).catch(err => {
            console.error(err);
            alert("Logout failed: " + err.response.data.message);
        });
    };

    const handleJoin = () => {
        //TO-DO check if lobby exists?
        navigate(`/lobby/${gameCode}`,{state:{gameCode:gameCode}});
    };

    const handleMake = () => {
        //TO-DO get random lobby code and actually set the websocket up
        navigate(`/lobby/${gameCode}`,{state:{gameCode:gameCode}});
    };

    return (
        <div className="hero-content w-full text-center m-auto flex-col gap-0 h-screen">
            <h1 className="text-5xl font-bold flex-row mb-12">Escavalon</h1>
            <h2 className="text-3xl font-bold">Welcome, {username || 'User'}!</h2>
            <div className="justify-center">
                <InputText 
                    name="Game Code"
                    placeholder="Game Code"
                    label=''
                    onChange={(event) => setGameCode(event.target.value)}
                />
            </div>

            <span className="btn mt-4 w-auto h-auto p-0 deco deco-accent">
                <button
                    onClick={handleJoin}
                    className="btn-deco text-lg serif font-semibold text-accent bg-paper-darker p-2">
                        Join A Lobby
                </button>
            </span>

            <hr className="flex mt-4 border-t-2 bg-paper-darker w-2/20 mx-auto" />

            <span className="btn mt-4 w-auto h-auto p-0 deco deco-accent">
                <button
                    onClick={handleMake}
                    className="btn-deco text-lg serif font-semibold text-accent bg-paper-darker p-2">
                        Make A Game
                </button>
            </span>
            
            <div className="absolute top-4 right-4 p-2">
                <span className="btn mt-4 w-auto h-auto p-0 deco deco-accent">
                    <button
                        onClick={handleLogout}
                        className="btn-deco text-lg serif font-semibold text-accent bg-paper-darker p-2">
                            Logout
                    </button>
                </span>
            </div>
        </div>
    );
}