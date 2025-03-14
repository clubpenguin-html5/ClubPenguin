import { ActionData } from "./action";
import { MessageData } from "./message";
import { PlayerData } from "./player";

export type Payloads = {
    'room:join': {
        room_id: number,
        players: PlayerData[]
    },
    'message:create': MessageData,
    'player:add': PlayerData,
    'player:update': PlayerData,
    'player:action': ActionData,
    'player:remove': PlayerData
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
    'room:spawn': {},
    'player:action': ActionData,
};

export type ClientPayload<P extends any, O extends keyof P, D extends P[O]> = {
    op: O,
    d: D
};

