import Phaser from "phaser";

import { App } from "@clubpenguin/app/app";
import PressureTrigger from "@clubpenguin/lib/ui/components/PressureTrigger";
import RoomTrigger from "@clubpenguin/lib/ui/components/RoomTrigger";
import Trigger from "@clubpenguin/lib/ui/components/Trigger";
import { LoaderTask } from "@clubpenguin/load/tasks";
import { AnyUserData } from "@clubpenguin/net/types/user";
import { Avatar, AvatarCls, Player } from "@clubpenguin/world/engine/player/avatar";
import { Engine, Room } from "@clubpenguin/world/engine/engine";
import World from "@clubpenguin/world/World";
import { Actions } from "./actions";
import { ClothingSprite } from "../clothing/clothingManager";

export class PlayerManager {
    public DEFAULT_AVATAR = 'penguin';

    public engine: Engine;

    constructor(engine: Engine) {
        this.engine = engine;

        this.avatars = {};
        this.players = {};

        this.engine.on('clothing:ready', (player: Player) => player.actions.reset());
        this.engine.on('clothing:add', (player: Player, sprite: ClothingSprite) => player.actions.reset());
        this.engine.on('room:unload', () => {
            this.players = {};
        });
    }

    get world(): World {
        return this.engine.world;
    }

    get app(): App {
        return this.engine.app;
    }

    public avatars: { [key: string]: AvatarCls };
    public players: { [id: number]: Player };

    get player(): Player {
        return this.players[this.world.myUser.id];
    }

    async loadAvatar(key: string): Promise<AvatarCls> {
        if (key in this.avatars) return this.avatars[key];

        let module = await import(/* webpackInclude: /\.ts$/ */`@clubpenguin/world/avatar/${key}`);
        let avatar: AvatarCls = module.default;

        let load = this.engine.loadScreen;

        let task = load.track(new LoaderTask('Avatar loader', this.world.load));
        module.load(this.world);

        this.world.load.start();
        await task.wait();

        this.avatars[key] = avatar;
        return avatar;
    }

    generateSpriteAnimations(assetKey: string, frameKey: string, prefix: string, index: number, fromFrame: number, toFrame?: number, loop = true): Phaser.Animations.Animation {
        let key = this.getSpriteAnimationKey(assetKey, prefix, index);
        if (this.world.anims.exists(key)) return this.world.anims.get(key);

        let frames: Phaser.Types.Animations.AnimationFrame[] = [];
        if (toFrame != undefined) {
            for (let i = fromFrame; i <= toFrame; i++) {
                frames.push({
                    key: assetKey,
                    frame: `${frameKey}/${prefix}${index}_${String(i).padStart(4, '0')}`,
                    duration: 0
                });
            }
        } else {
            frames = [{
                key: assetKey,
                frame: `${frameKey}/${prefix}${index}`,
                duration: 0
            }];
        }

        let animation = this.world.anims.create({
            key,
            frames,
            frameRate: 24,
            skipMissedFrames: true,
            repeat: frames.length > 1 && loop ? -1 : 0
        });

        if (animation == false) this.world.anims.get(key);
        else return animation;
    }

    getSpriteAnimationKey(assetKey: string, prefix: string, index: number): string {
        return `${assetKey}${prefix}_${index}animation`;
    }

    avatarToPlayer(avatar: Avatar, data: AnyUserData): Player {
        let player = avatar as Player;

        player.userData = data;
        player.clothes = new Map();
        player.actions = new Actions(player);

        return player;
    }

    async createPlayer(data: AnyUserData, x?: number, y?: number): Promise<Player> {
        if (!this.engine.currentRoom) throw new Error('Players cannot exist without a room');

        let avatarKey = data.avatar.transformation ?? this.DEFAULT_AVATAR;

        let avatarCls = await this.loadAvatar(avatarKey);
        let avatar = new avatarCls(this.engine.currentRoom, x, y);

        let player = this.avatarToPlayer(avatar, data);
        return player;
    }

    setupPlayer(player: Player, data: AnyUserData): void {
        player.createAnimations(this.engine);
        player.actions.reset();

        player.hitbox.on('release', () => this.world.isMyPlayer(data) ? this.world.interface.openMyNamecard() : this.world.interface.openNamecard(data));
        this.world.interface.attachPlayerOverlay(player);

        this._updatePlayer(player, data);
    }

    _updatePlayer(player: Player, data: AnyUserData): void {
        let tintFill = this.app.gameConfig.player_colors[String(data.avatar.color)];
        player.body_art.setTintFill(Number(tintFill));

        if (this.world.isMyPlayer(data)) {
            player.ring.visible = true;
            player.ring.strokeColor = 0x3399FF;
        } else if (this.world.isFriend(data)) {
            player.ring.visible = true;
            player.ring.strokeColor = 0x009900;
        } else player.ring.visible = false;

        player.overlay.nickname.text = data.nickname;
        player.overlay.balloon.x = player.speechBubbleOffset.x;
        player.overlay.balloon.y = player.speechBubbleOffset.y;
    }

    addPlayer(player: Player): Avatar {
        if (player.userData.id in this.players) return;

        this.setupPlayer(player, player.userData);
        player.depth = player.y + 1;
        this.engine.currentRoom.add.existing(player);

        this.players[player.userData.id] = player;
        this.testTriggers(player, true, undefined, undefined, true);

        this.engine.emit('player:add', player);
        return player;
    }

    updatePlayer(player: Player, data: AnyUserData): void {
        this._updatePlayer(player, data);
        player.userData = data;
        this.engine.emit('player:update', player);
    }

    removePlayer(player: Player): void {
        this.testTriggers(player, true, NaN, NaN);

        this.world.interface.removePlayerOverlay(player);
        this.engine.emit('player:remove', player);

        player.destroy();
        delete this.players[player.userData.id];

    }

    testTriggers(player: Player, finishedMoving: boolean, x?: number, y?: number, prohibitJoinRoom = false): void {
        x = x ?? player.x;
        y = y ?? player.y;

        let scene = player.scene as Room;
        let triggers = 'triggers' in scene ? scene.triggers : [];

        for (let trigger of triggers) {
            let genericTrigger = Trigger.getComponent(trigger);
            if (genericTrigger && finishedMoving && !prohibitJoinRoom && genericTrigger.test(x, y)) genericTrigger.execute(this.engine, player);

            let roomTrigger = RoomTrigger.getComponent(trigger);
            if (roomTrigger && finishedMoving && !prohibitJoinRoom && roomTrigger.test(x, y)) roomTrigger.execute(this.engine, player);

            let pressureTrigger = PressureTrigger.getComponent(trigger);
            if (pressureTrigger) {
                let test = pressureTrigger.test(x, y);
                let state = Boolean(test);
                if (state != pressureTrigger.active) {
                    if (state && !finishedMoving) continue;
                    pressureTrigger.active = state;
                    pressureTrigger.execute(this.engine, player);
                }
            }
        }
    }

    findPlayerPath(player: Player, x: number, y: number): Phaser.Math.Vector2 {
        let origin = new Phaser.Math.Vector2(player.x, player.y);
        let target = new Phaser.Math.Vector2(x, y);

        let block = 'block' in player.scene ? player.scene.block as Phaser.GameObjects.Image : undefined;
        if (block == undefined) return target;

        let distance = Math.round(Phaser.Math.Distance.BetweenPoints(origin, target));
        let stepX = (target.x - origin.x) / distance;
        let stepY = (target.y - origin.y) / distance;

        let point = new Phaser.Math.Vector2(0, 0);
        let matrix = new Phaser.GameObjects.Components.TransformMatrix();
        let parentMatrix = new Phaser.GameObjects.Components.TransformMatrix();

        let hitTest = player.scene.input.makePixelPerfect();
        while (distance > 0) {
            if (block.parentContainer) {
                block.parentContainer.getWorldTransformMatrix(matrix, parentMatrix);
                matrix.applyInverse(origin.x, origin.y, point);
            } else {
                Phaser.Math.TransformXY(origin.x, origin.y, block.x, block.y, block.rotation, block.scaleX, block.scaleY, point);
            }

            let testX = point.x + block.displayOriginX;
            let testY = point.y + block.displayOriginY;
            if (hitTest({}, testX + stepX, testY + stepY, block)) {
                break;
            }

            origin.x += stepX;
            origin.y += stepY;

            distance--;
        }

        return origin;
    }

    enablePlayerPhysics(): void {
        this.player.scene.matter.add.gameObject(this.player, {
            shape: {
                type: 'circle',
                radius: 25
            },
            isStatic: false
        });
    }

}
