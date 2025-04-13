import { USERNAME_HINT, USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH, USERNAME_PATTERN } from '@common/util/validation.js';
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
        event.preventDefault();

        fetch(`${API_URL}/api/register`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, username, password }),
            credentials: 'include'
        }).then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.message || 'Signup failed');
                });
            }
            return response.json();
        })
        .then(_ => {
            alert("Signup successful!");
            navigate('/login');
        })
        .catch(err => {
            console.error(err);
            alert("Signup failed: " + err.message);
        });
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
                        pattern={USERNAME_PATTERN}
                        minLength={USERNAME_MIN_LENGTH}
                        maxLength={USERNAME_MAX_LENGTH}
                        validatorHint={USERNAME_HINT}
                        placeholder="Enter username"

                        onChange={(event) => setUsername(event.target.value)}
                    />
                    <InputEmail
                        name='email'
                        label="Email"
                        placeholder="Enter email"

                        onChange={(event) => setEmail(event.target.value)}
                    />
                    <InputPassword
                        name='password'
                        label="Password"
                        placeholder="Enter password"

                        onChange={(event) => setPassword(event.target.value)}
                    />
                    <Submit value="Sign up" />
                </form>
            </FormCard>
        </div>

    );
}
