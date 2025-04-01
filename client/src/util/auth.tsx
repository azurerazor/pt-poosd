import React, { useState, useEffect } from "react";
import { API_URL } from "./api";
import { Navigate } from "react-router";
import Loading from "../components/pages/Loading";


import { createContext, useContext } from 'react';

type UserContextType = {
  username: string;
};

export const UserContext = createContext<UserContextType>({ username: '' });

export const useUser = () => useContext(UserContext);


function ProtectedRoute({ element }: { element: React.ReactElement }): React.ReactElement {
    const [isLoading, setIsLoading] = useState(true);
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${API_URL}/api/get_user`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });

                if (res.status !== 200) {
                    throw new Error(res.statusText);
                }

                const data = await res.json();
                setUsername(data.username);
            } catch (err) {
                console.log('Auth error:', err);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchData();
    }, []);

    if(isLoading) {
        return <Loading />;
    }

    if(!username) {
        return <Navigate to="/login" />
    }

    return (
        <UserContext.Provider value={{ username }}>
            {element}
        </UserContext.Provider>
    );

    //shit shiiiiiit sheeeet
}

export default ProtectedRoute;
