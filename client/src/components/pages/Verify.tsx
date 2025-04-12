import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import RouteButton from "../misc/RouteButton";
import Loading from "./Loading";
import { API_URL } from '../../util/api';

export default function Verify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/verify/:token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token }),
          credentials: 'include'
        });

        if (res.status !== 200) throw new Error(res.statusText);
        await res.json();
        setVerified(true);
      } catch (err) {
        console.error('Auth error:', err);
        setVerified(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (verified === false) {
      navigate('/login');
    }
  }, [verified, navigate]);

  if (isLoading) return <Loading />;

  return (
    <div className="hero-content w-full text-center m-auto flex-col gap-0 h-screen">
      <h1 className="text-5xl font-bold flex-row mb-12">Email Verified</h1>
      <RouteButton to='/login'>
        Back to Login
      </RouteButton>
    </div>
  );
}
