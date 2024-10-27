import { ActionData } from "./action";
import { MessageData } from "./message";
import { PlayerData } from "./player";
import { AnyUserData } from "./user";
import { Waddle } from "./waddle";

export type Payloads = {
    'room:join': {
        room_id: number,
        players: PlayerData[],
        waddles: Waddle[]
    },
    'waddle:join': {
        player: number,
        waddle_id: number
    },
    'waddle:leave': {
        player: number,
        waddle_id: number
    },
    'game:start': {
        game_id: string
    },
    'game:over': {
        coins: number
    },
    'message:create': MessageData,
    'player:add': PlayerData,
    'player:update': PlayerData,
    'player:action': ActionData,
    'player:remove': PlayerData,
    'user:update': AnyUserData
};

export type Payload<P extends any, O extends keyof P, D extends P[O]> = {
    op: O,
    d: D
};

export type ClientPayloads = {
    'room:join': {
        room_id: number,
        x: number,
        y: number
    },
    'waddle:join': {
        waddle_id: number
    },
    'waddle:leave': {
        waddle_id: number
    },
    'game:start': {
        game_id: string
    },
    'game:over': {
        score: number
    },
    'room:spawn': {},
    'player:action': ActionData,
};

export type ClientPayload<P extends any, O extends keyof P, D extends P[O]> = {
    op: O,
    d: D
};

