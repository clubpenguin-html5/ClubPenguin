import { App } from "@clubpenguin/app/app";
import { PaperItemConfig } from "@clubpenguin/app/config";
import { AvatarData } from "@clubpenguin/net/types/avatar";
import { Player } from "@clubpenguin/world/engine/player/avatar";
import { Engine } from "@clubpenguin/world/engine/engine";
import World from "@clubpenguin/world/World";
import Phaser from "phaser";
import { getLogger } from "@clubpenguin/lib/log";
import { ItemType } from "./itemType";
import { ActionFrame, ANIMATION_META } from "@clubpenguin/net/types/action";

let logger = getLogger('CP.world.engine.clothing');

export type ClothingSprite = Phaser.GameObjects.Sprite & { config: PaperItemConfig, animations: { [frame: number]: Phaser.Animations.Animation } };

export class ClothingManager {
    public engine: Engine;

    constructor(engine: Engine) {
        this.engine = engine;

        this.engine.on('player:add', (player: Player) => {
            if (player.attachClothing) this.addClothingSprites(player, player.userData.avatar);
        });
        this.engine.on('player:update', (player: Player) => {
            if (player.attachClothing) this.addClothingSprites(player, player.userData.avatar);
            this.engine.cleaner.collect();
        });
        this.engine.on('player:remove', (player: Player) => {
            for (let [_, clothing] of player.clothes) {
                this.engine.cleaner.deallocateResource('multiatlas', this.getSpriteKey(clothing.config.paper_item_id), player.userData.id);
            }
            this.engine.cleaner.collect();
        });
    }

    get world(): World {
        return this.engine.world;
    }

    get app(): App {
        return this.engine.app;
    }

    async addClothingSprites(player: Player, avatar: AvatarData): Promise<ClothingSprite[]> {
        let promise = Promise.all([
            this.addClothingSprite(player, ItemType.HEAD, avatar.head, false),
            this.addClothingSprite(player, ItemType.FACE, avatar.face, false),
            this.addClothingSprite(player, ItemType.NECK, avatar.neck, false),
            this.addClothingSprite(player, ItemType.BODY, avatar.body, false),
            this.addClothingSprite(player, ItemType.HAND, avatar.hand, false),
            this.addClothingSprite(player, ItemType.FEET, avatar.feet, false)
        ]);

        this.world.load.start();
        let sprites = await promise;

        this.engine.emit('clothing:ready', player);

        return sprites;
    }

    getSpriteKey(id: number): string {
        return `clothing-sprites-${id}`;
    }

    getSpriteAnimationKey(assetKey: string, action: number): string {
        return `${assetKey}_${action}animation`;
    }

    async loadClothingSprite(config: PaperItemConfig, startLoading: boolean, playerId?: number): Promise<void> {
        let id = config.paper_item_id;

        let key = this.getSpriteKey(id);

        logger.info('Loading sprite', key);

        await new Promise<void>((resolve, reject) => {
            if (this.world.textures.exists(key)) return resolve();

            this.world.load.multiatlas({
                key,
                atlasURL: `assets/clothing/sprites/${id}.json`,
                path: `assets/clothing/sprites`
            });

            let completeCallback = (key_: string, type_: string) => {
                if (key_ == key && type_ == 'multiatlas') {
                    this.world.load.off('filecomplete', completeCallback);
                    this.world.load.off('loaderror', errorCallback);

                    this.engine.cleaner.allocateResource(type_, key_, playerId);
                    resolve();
                }
            }
            this.world.load.on('filecomplete', completeCallback);

            let errorCallback = (file: Phaser.Loader.File) => {
                if (file.key == key && file.type == 'json') {
                    this.world.load.off('filecomplete', completeCallback);
                    this.world.load.off('loaderror', errorCallback);

                    reject(new Error(`Sprite ${id} failed to load!`));
                }
            }
            this.world.load.on('loaderror', errorCallback);
        });

    }

    async addClothingSprite(player: Player, type: ItemType, id: number, startLoading = true): Promise<ClothingSprite> {
        if (!id) {
            let clothing = player.clothes.get(type);
            if (clothing) {
                let key = this.getSpriteKey(clothing.config.paper_item_id);

                this.engine.cleaner.deallocateResource('multiatlas', key, player.userData.id);
                clothing.destroy();
                player.clothes.delete(type);
            }
            return;
        }

        let config = this.app.gameConfig.paper_items[id];
        logger.info('Adding sprite', config);

        let key = this.getSpriteKey(id);

        for (let [slot, clothing] of player.clothes) {
            if (clothing.config.paper_item_id == id) return;

            let key = this.getSpriteKey(clothing.config.paper_item_id);

            if (slot == config.type) {
                this.engine.cleaner.deallocateResource('multiatlas', key, player.userData.id);
                clothing.destroy();
                player.clothes.delete(slot);
                break;
            }
        }

        try {
            await this.loadClothingSprite(config, startLoading, player.userData.id);
        } catch (e) {
            logger.warn(`Error loading sprite ${id} ignoring...`);
            return;
        }

        logger.info('Attaching sprite', config);
        let sprite = this.attachClothingSprite(player, config);
        player.clothes.set(config.type, sprite);

        this.engine.emit('clothing:add', player, sprite);

        return sprite;
    }

    getClothingDepth(config: PaperItemConfig): number {
        switch (config.type) {
            case ItemType.HEAD:
                return 260;
            case ItemType.FACE:
                return 250;
            case ItemType.HAND:
                return 240;
            case ItemType.NECK:
                return 230;
            case ItemType.BODY:
                return 220;
            case ItemType.FEET:
                return 210;
            case ItemType.BOOK:
                return 270;
        }
    }

    attachClothingSprite(player: Player, config: PaperItemConfig): ClothingSprite {
        let spriteKey = this.getSpriteKey(config.paper_item_id);

        if (!this.world.textures.exists(spriteKey)) {
            logger.warn('Could not attach clothing (file missing)', player, config);
            return;
        }

        let sprite = this.world.add.sprite(0, 0, spriteKey, `${config.paper_item_id}/0`) as ClothingSprite;
        sprite.depth = this.getClothingDepth(config);
        sprite.config = config;
        sprite.animations = this.createClothingAnimations(player, spriteKey);

        player.add(sprite);
        player.sort('depth');

        return sprite;
    }

    createClothingAnimations(player: Player, spriteKey: string): { [actionFrame: number]: Phaser.Animations.Animation } {
        let animations: { [actionFrame: number]: Phaser.Animations.Animation } = {};

        const frameKeys = Object.keys(this.world.textures.get(spriteKey).frames);
        const sortedFrameKeys = frameKeys.filter(frameKey => frameKey !== "__BASE");

        sortedFrameKeys.sort((a, b) => {
            const frameA = this.parseFrame(a);
            const frameB = this.parseFrame(b);

            return frameA.actionFrame === frameB.actionFrame
                ? frameA.subframe - frameB.subframe
                : frameA.actionFrame - frameB.actionFrame;
        });

        let animationFrames: { [actionFrame: number]: { frames: Phaser.Types.Animations.AnimationFrame[], itemId: number } } = {  };

        for (const frameKey of sortedFrameKeys) {
            const {itemId, actionFrame, subframe} = this.parseFrame(frameKey);
            const isNested = subframe !== 0;

            if (!(actionFrame in animationFrames)) {
                animationFrames[actionFrame] = {
                    frames: [],
                    itemId: itemId
                };
            }

            if (!isNested) {
                this.addFrame(animationFrames[actionFrame].frames, spriteKey, `${itemId}/${actionFrame}`);

                animationFrames[actionFrame].itemId = itemId;

                continue;
            }

            this.addFrame(animationFrames[actionFrame].frames, spriteKey, `${itemId}/${actionFrame};${subframe}`);
        }

        for (const actionFrameId in animationFrames) {
            const animationKey = this.getSpriteAnimationKey(spriteKey, parseInt(actionFrameId));

            if (this.world.anims.exists(animationKey)) {
                animations[actionFrameId] = this.world.anims.get(animationKey);
                continue;
            }

            this.engine.cleaner.allocateResource('animation', animationKey, player.userData.id);

            if (parseInt(actionFrameId) === ActionFrame.WAVE) {
                const extraWaveFrames = {
                    start: 5,
                    end: 12,
                    spriteKey,
                    itemId: animationFrames[actionFrameId].itemId,
                    action: ActionFrame.WAVE
                }

                this.addFrames(animationFrames[actionFrameId].frames, extraWaveFrames, 2);
                this.addFrames(animationFrames[actionFrameId].frames, { ...extraWaveFrames, start: 1, end: 1 });
            }

            const animation = this.world.anims.create({
                key: animationKey,
                frames: animationFrames[actionFrameId].frames,
                frameRate: 24,
                skipMissedFrames: true,
                repeat: ANIMATION_META[actionFrameId]?.repeat ? -1 : 0
            });

            if (!animation) {
                logger.warn(`Animation ${animationKey} failed to be created. Skipping.`);
                continue;
            };

            animations[actionFrameId] = animation;
        }

        return animations;
    }

    parseFrame(frameKey: string): { itemId: number, actionFrame: number, subframe: number } {
        const [itemId, tmp] = frameKey.split('/');
        const [actionFrame, subframe = 0] = tmp.split(';').map(Number);

        return { itemId: parseInt(itemId), actionFrame, subframe };
    }

    private addFrames(
        frames: Phaser.Types.Animations.AnimationFrame[],
        config: { start: number, end: number, spriteKey: string, itemId: number, action: ActionFrame },
        repeat = 1
    ) {
        const { start, end, spriteKey, itemId, action } = config;

        for (let r = 0; r < repeat; r++)
            for (let j = start; j <= end; j++)
                this.addFrame(frames, spriteKey, `${itemId}/${action};${j}`);
    }

    private addFrame(arr: Phaser.Types.Animations.AnimationFrame[], key: string, frame: string) {
        return arr.push({
            key,
            frame,
            duration: 0
        });
    }

}
