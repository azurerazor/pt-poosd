import {
  USERNAME_HINT,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
} from "@common/util/validation.js";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { API_URL } from "../../util/api";
import FormCard from "../forms/FormCard";
import InputPassword from "../forms/InputPassword";
import InputTextRegex from "../forms/InputTextRegex";
import Submit from "../forms/Submit";
import Link from "../misc/RouteLink";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loginErr, setLoginErr] = useState("");

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            throw new Error(errorData.message || "Login failed");
          });
        }
        return response.json();
      })
      .then(() => {
        // alert("Successfully logged in!");
        navigate("/dashboard");
      })
      .catch((err) => {
        console.error(err);
        // alert("Login failed: " + err.message);
        setLoginErr("Login failed: " + err.message);
      });

    event.preventDefault();
  }

  return (
    <div className="hero-content w-full text-center m-auto flex-col h-screen">
      <h1 className="text-5xl font-bold flex-row mb-8">Escavalon</h1>
      <FormCard>
        <form onSubmit={handleLogin}>
          <h2 className="text-3xl font-bold">Log in</h2>
          <p className="text-base-content mb-4">
            Don&apos;t have an account? <Link to="/signup">Sign up here</Link>
          </p>
          <InputTextRegex
            name="username"
            label="Username"
            pattern={USERNAME_PATTERN}
            minLength={USERNAME_MIN_LENGTH}
            maxLength={USERNAME_MAX_LENGTH}
            validatorHint={USERNAME_HINT}
            placeholder="Enter username"
            onChange={(event) => setUsername(event.target.value)}
          />
          <InputPassword
            name="password"
            label="Password"
            placeholder="Enter password"
            onChange={(event) => setPassword(event.target.value)}
          />
          <Submit value="Log in" />
        </form>
        <h4 className="text-bold text-red-600">{loginErr}</h4>
      </FormCard>
    </div>
  );
}
