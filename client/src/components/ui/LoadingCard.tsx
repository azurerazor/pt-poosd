import { Player } from "../../../../common/game/player";
import { Roles, getRoles } from "../../../../common/game/roles";
import FunctionButton from "../misc/FunctionButton";
import { useState } from 'react';
import AssassinationPlayerSelect from "./AssassinationPlayerSelect";

interface Props {
    message: string
}

const LoadingCard: React.FC<Props> = ({ message }) => {
    return (
        <div className="card bg-base-100 shadow-sm">
        <div className="card-body w-full">
            <h1 className="text-5xl font-bold flex-row">{message}</h1>
        </div>
        </div>
    );
};

export default LoadingCard;

