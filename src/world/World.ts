
// You can write more code here

let SPAWN_ROOMS = [
    '100', // town
    '200', // village
    '230', // mtn
    '300', // plaza
    '400', // beach
    '800', // dock
    '801', // forts
    '802', // rink
    //'805', // berg
    '807', // shack
    '809', // forest
    '810', // cove

];

/* START OF COMPILED CODE */

import Phaser from "phaser";
/* START-USER-IMPORTS */
import type Load from "../load/Load";
import { LoaderTask } from "../load/tasks";
import type Interface from "./interface/Interface";
import type { BasePenguinData, MyPenguinData, PenguinData } from '../net/types/penguin/penguin';
import type Engine from "./engine/Engine";
import type { App } from "../app/app";
import { RelationshipType } from "../net/types/penguin/relationship";
/* END-USER-IMPORTS */

export default class World extends Phaser.Scene {

    constructor() {
        super("World");

        /* START-USER-CTR-CODE */
        // Write your code here.
        /* END-USER-CTR-CODE */
    }

    postload(): void {

        this.load.pack("world-pack", "assets/app/world-pack.json");
    }

    editorCreate(): void {

        this.events.emit("scene-awake");
    }

    /* START-USER-CODE */

    declare public game: App;

    get engine(): Engine {
        return (this.scene.get('Engine') as Engine);
    }

    get interface(): Interface {
        return (this.scene.get('Interface') as Interface);
    }

    public worldId: number;
    public myPenguinData: MyPenguinData;

    init(): void {
        let load = this.scene.get('Load') as Load;
        if (!load.isShowing) load.show({ logo: true });
    }

    create(data: { id: number, name: string }): void {
        this.worldId = data.id;

        this.editorCreate();

        this.startWorld();
    }

    async startWorld(): Promise<void> {
        let load = this.scene.get('Load') as Load;
        load.track(new LoaderTask(this.load));

        let myUser = await this.game.airtower.getMyUser()
        this.myPenguinData = myUser.data;

        this.postload();
        // TODO: load world here
        this.load.start();

        await load.waitAllTasksComplete();

        await new Promise<void>(resolve => this.scene.run('Interface', {
            oninit: (scene: Interface) => load.track(new LoaderTask(scene.load)),
            onready: () => resolve()
        }));

        await load.waitAllTasksComplete();

        let engine = await new Promise<Engine>(resolve => this.scene.run('Engine', {
            onready: (scene: Engine) => resolve(scene)
        }));

        let myFriends = await this.game.airtower.getMyFriends();
        let friends = myFriends.data.filter(penguin => penguin.mascotId == undefined);
        let characters = myFriends.data.filter(penguin => penguin.mascotId != undefined).map(penguin => penguin.id);

        this.game.friends.connect(friends, characters, true, true, true);

        let roomConfig = this.game.gameConfig.rooms[this.getRandomItem(SPAWN_ROOMS)];
        console.log('Mocking room join on room', roomConfig);
        await engine.joinRoom(roomConfig);
    }

    public standardPenguinTimeOffset = 0;

    getStandardPenguinTime(): Date {
        let now = new Date();
        now.setTime(now.getTime() + this.standardPenguinTimeOffset * 60000);
        return now;
    }

    getRandomItem<T>(array: T[]): T {
        let idx = Math.floor(Math.random() * array.length);
        return array[idx];
    }

    isPlayer(data: BasePenguinData): data is MyPenguinData {
        return data.id == this.myPenguinData.id;
    }

    isPlayerModerator(): boolean {
        return this.myPenguinData.moderator;
    }

    isMascot(data: BasePenguinData): boolean {
        return data.mascotId != undefined;
    }

    isMember(data: BasePenguinData): boolean {
        return data?.member != undefined;
    }

    isPending(data: PenguinData): boolean {
        return data.relationship?.type == RelationshipType.PENDING;
    }

    isFriend(data: PenguinData): boolean {
        return [RelationshipType.FRIEND, RelationshipType.BEST_FRIEND].includes(data.relationship?.type);
    }

    isBestFriend(data: PenguinData): boolean {
        return data.relationship?.type == RelationshipType.BEST_FRIEND;
    }

    isIgnored(data: PenguinData): boolean {
        return data.relationship?.type == RelationshipType.IGNORED;
    }

    openNamecardById(id: string): void {
        // TODO: fetch penguin data
        this.interface.openNamecard({
            id: id,
            username: 'P' + id,
            nickname: 'P' + id,
            avatar: {
                color: 2,
                head: 0,
                face: 0,
                neck: 0,
                body: 0,
                hand: 0,
                feet: 0,
                photo: 0,
                flag: 0
            },
            relationship: {
                type: RelationshipType.FRIEND,
                since: ''
            },
            publicStampbook: false
        });
    }

    /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
