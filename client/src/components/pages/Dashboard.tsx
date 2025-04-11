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
        fetch(`${API_URL}/api/logout`,{
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
            alert("Logout failed: " + err.response.data.message);
        });        
    };

    const handleJoin = () => {
        //TO-DO check if lobby exists?
        navigate(`/lobby/${gameCode}`);
    };

    const handleMake = () => {
        //TO-DO get random lobby code and make new Lobby and actually set the websocket up
        navigate(`/lobby/${gameCode}`);
    };

    return (
        <div className="hero-content w-full text-center m-auto flex-col gap-0 h-screen">
            <h1 className="text-5xl font-bold flex-row mb-12">Escavalon</h1>
            <h2 className="text-3xl font-bold">Welcome, {username}!</h2>
            <div className="justify-center">
                <InputText 
                    name="Game Code"
                    placeholder="Game Code"
                    label=''
                    onChange={(event) => setGameCode(event.target.value)}
                />
            </div>


            <FunctionButton
                label="Join A Lobby"
                onClick={handleJoin}
            />
            
            <hr className="flex mt-4 border-t-2 bg-paper-darker w-2/20 mx-auto" />

            <FunctionButton
                label="Make A Lobby"
                onClick={handleMake}
            />
            
            <div className="absolute top-4 right-4 p-2">
                <FunctionButton
                    label="Logout"
                    onClick={handleLogout}
                />
            </div>
        </div>
    );
}
