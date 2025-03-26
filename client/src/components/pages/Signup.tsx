import Axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { API_URL } from '../../util/api';
import FormCard from '../forms/FormCard';
import InputEmail from '../forms/InputEmail';
import InputPassword from '../forms/InputPassword';
import InputTextRegex from '../forms/InputTextRegex';
import Submit from '../forms/Submit';
import Link from '../misc/RouteLink';

export default function Signup() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    function handleSignup(event: React.FormEvent<HTMLFormElement>) {
        Axios.post(`${API_URL}/api/register`, {
            email,
            username,
            password
        }).then(_ => {
            alert("Signup successful!");
            navigate('/login');
        }).catch(err => {
            console.error(err);
            alert("Signup failed: " + err.response.data.message);
        });
        event.preventDefault();
    }

    return (
        <div className="hero-content w-full text-center m-auto flex-col h-screen">
            <h1 className="text-5xl font-bold flex-row mb-8">Escavalon</h1>
            <FormCard>
                <form onSubmit={handleSignup}>
                    <h2 className="text-3xl font-bold">Sign up</h2>
                    <p className="text-base-content mb-4">
                        Already have an account? <Link to='/login'>Log in here</Link>
                    </p>
                    <InputTextRegex
                        name='username'
                        label='Username'
                        minLength={3}
                        maxLength={16}
                        pattern="[A-Za-z0-9]+(?:[\-_]*[A-Za-z0-9]+)*[A-Za-z0-9]+"
                        validatorHint="3-16 letters, numbers, underscores or hyphens"
                        placeholder="super-cool-username"

                        onChange={(event) => setUsername(event.target.value)}
                    />
                    <InputEmail
                        name='email'
                        label="Email"
                        placeholder="you@gmail.com"

                        onChange={(event) => setEmail(event.target.value)}
                    />
                    <InputPassword
                        name='password'
                        label="Password"
                        placeholder="password1234"

                        onChange={(event) => setPassword(event.target.value)}
                    />
                    <Submit value="Sign up" />
                </form>
            </FormCard>
        </div>

    );
}
