import React from "react";
import RouteButton from "../misc/RouteButton";

export default function NotFound() {
  return (
    <div className="hero-content w-full text-center m-auto flex-col h-screen">
      <div className="flex-row m-auto">
        <h1 className="text-5xl font-bold">404</h1>
        <RouteButton to="/">← Back home</RouteButton>
      </div>
    </div>
  );
}
