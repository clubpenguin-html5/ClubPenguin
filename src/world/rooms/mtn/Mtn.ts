
// You can write more code here

/* START OF COMPILED CODE */

import Phaser from "phaser";
import DepthEnabled from "../../../lib/ui/components/DepthEnabled";
import ButtonComponent from "../../../lib/ui/components/ButtonComponent";
import FirstLane from "./prefabs/FirstLane";
import SecondLane from "./prefabs/SecondLane";
import ThirdLane from "./prefabs/ThirdLane";
import FourthLane from "./prefabs/FourthLane";
import RoomTrigger from "../../../lib/ui/components/RoomTrigger";
/* START-USER-IMPORTS */
import { App } from "../../../app/app";
import { Engine,  Room } from "../../engine/engine";
import Interface from "../../interface/Interface";
import World from "@clubpenguin/world/World";
/* END-USER-IMPORTS */

export default class Mtn extends Phaser.Scene implements Room {

    constructor() {
        super("Mtn");

        /* START-USER-CTR-CODE */
        // Write your code here.
        /* END-USER-CTR-CODE */
    }

    preload(): void {

        this.load.pack("mtn-pack", "assets/world/rooms/mtn/mtn-pack.json");
    }

    editorCreate(): void {

        // mtn_sky
        const mtn_sky = this.add.image(-133.3125, -24.75, "mtn", "mtn/sky");
        mtn_sky.setOrigin(0, 0);

        // mtn_bg
        const mtn_bg = this.add.image(-32.0625, 165.375, "mtn", "mtn/bg");
        mtn_bg.setOrigin(0, 0);

        // mtn_foreground
        const mtn_foreground = this.add.image(92.25, 841.1625, "mtn", "mtn/foreground");
        mtn_foreground.setOrigin(0, 0);

        // mtn_cables
        const mtn_cables = this.add.image(1063.2375, 99.7875, "mtn", "mtn/cables");
        mtn_cables.setOrigin(0, 0);

        // cablecar
        const cablecar = this.add.sprite(744.075, 16.9875, "mtn", "mtn/cablecar0001");
        cablecar.setOrigin(0, 0);

        // mtn_mountain
        const mtn_mountain = this.add.image(-126, 67.95, "mtn", "mtn/base");
        mtn_mountain.setOrigin(0, 0);

        // mtn_cable1
        const mtn_cable1 = this.add.image(871.875, 26.2125, "mtn", "mtn/cable1");
        mtn_cable1.setOrigin(0, 0);

        // mtn_cable2
        const mtn_cable2 = this.add.image(1014.8625, 29.7, "mtn", "mtn/cable2");
        mtn_cable2.setOrigin(0, 0);

        // mtn_snow
        const mtn_snow = this.add.image(862.875, 230.85, "mtn", "mtn/snow");
        mtn_snow.setOrigin(0, 0);

        // mtn_front
        const mtn_front = this.add.image(335.8125, 12.9375, "mtn", "mtn/front");
        mtn_front.setOrigin(0, 0);

        // mtn_shopback
        const mtn_shopback = this.add.image(1117.35, 243.5625, "mtn", "mtn/shopback");
        mtn_shopback.setOrigin(0, 0);

        // mtn_store
        const mtn_store = this.add.image(1172.8125, 364.275, "mtn", "mtn/store");
        mtn_store.setOrigin(0.317165, 0.890653);

        // mtn_secondlane
        const mtn_secondlane = this.add.image(546.075, 679.5, "mtn", "mtn/secondlane");
        mtn_secondlane.setOrigin(0.5892079207920792, 0.7910752688172042);

        // mtn_thirdlane
        const mtn_thirdlane = this.add.image(1127.5875, 758.7, "mtn", "mtn/thirdlane");
        mtn_thirdlane.setOrigin(0.4061052631578947, 0.8309090909090909);

        // mtn_fourthlane
        const mtn_fourthlane = this.add.image(1346.4, 649.125, "mtn", "mtn/fourthlane");
        mtn_fourthlane.setOrigin(0.34204918032786885, 0.8220879120879121);

        // cat
        const cat = this.add.sprite(548.075, 203.7375, "mtn", "mtn/cat0001");

        // cat_btn
        const cat_btn = this.add.image(545.625, 201.9375, "mtn", "mtn/cat_btn");
        cat_btn.alpha = 0.01;
        cat_btn.alphaTopLeft = 0.01;
        cat_btn.alphaTopRight = 0.01;
        cat_btn.alphaBottomLeft = 0.01;
        cat_btn.alphaBottomRight = 0.01;

        // catalogue
        const catalogue = this.add.image(1617.6375, 1005.525, "mtn", "mtn/catalogue0001");

        // catalogue_btn
        const catalogue_btn = this.add.image(1617.6375, 1005.525, "mtn", "mtn/catalogue0004");
        catalogue_btn.alpha = 0.01;
        catalogue_btn.alphaTopLeft = 0.01;
        catalogue_btn.alphaTopRight = 0.01;
        catalogue_btn.alphaBottomLeft = 0.01;
        catalogue_btn.alphaBottomRight = 0.01;

        // firstLane
        const firstLane = new FirstLane(this, 229.05, 538.875);
        this.add.existing(firstLane);

        // secondLane
        const secondLane = new SecondLane(this, 714.0375, 685.2375);
        this.add.existing(secondLane);

        // thirdLane
        const thirdLane = new ThirdLane(this, 1051.3125, 706.3875);
        this.add.existing(thirdLane);

        // fourthLane
        const fourthLane = new FourthLane(this, 1283.4, 656.8875);
        this.add.existing(fourthLane);

        // block
        const block = this.add.image(0, 0, "mtn", "mtn/block");
        block.setOrigin(0, 0);
        block.visible = false;

        // mtn_village_mc
        const mtn_village_mc = this.add.image(1020.2625, 299.025, "mtn", "mtn/village_mc");
        mtn_village_mc.visible = false;

        // mtn_plaza_mc
        const mtn_plaza_mc = this.add.image(1401.075, 567.3375, "mtn", "mtn/plaza_mc");
        mtn_plaza_mc.visible = false;

        // shop_btn
        const shop_btn = this.add.image(1178.8875, 337.3875, "mtn", "mtn/shop_btn0004");
        shop_btn.alpha = 0.01;
        shop_btn.alphaTopLeft = 0.01;
        shop_btn.alphaTopRight = 0.01;
        shop_btn.alphaBottomLeft = 0.01;
        shop_btn.alphaBottomRight = 0.01;

        // exit_btn
        const exit_btn = this.add.image(1415.1375, 575.8875, "mtn", "mtn/exit_btn0004");
        exit_btn.alpha = 0.01;
        exit_btn.alphaTopLeft = 0.01;
        exit_btn.alphaTopRight = 0.01;
        exit_btn.alphaBottomLeft = 0.01;
        exit_btn.alphaBottomRight = 0.01;

        // lists
        const triggers = [mtn_village_mc, mtn_plaza_mc];

        // mtn_foreground (components)
        const mtn_foregroundDepthEnabled = new DepthEnabled(mtn_foreground);
        mtn_foregroundDepthEnabled.automaticSort = false;
        mtn_foregroundDepthEnabled.depth = 1080;

        // mtn_mountain (components)
        const mtn_mountainDepthEnabled = new DepthEnabled(mtn_mountain);
        mtn_mountainDepthEnabled.automaticSort = false;
        mtn_mountainDepthEnabled.depth = 1;

        // mtn_cable1 (components)
        const mtn_cable1DepthEnabled = new DepthEnabled(mtn_cable1);
        mtn_cable1DepthEnabled.automaticSort = false;
        mtn_cable1DepthEnabled.depth = 1;

        // mtn_cable2 (components)
        const mtn_cable2DepthEnabled = new DepthEnabled(mtn_cable2);
        mtn_cable2DepthEnabled.automaticSort = false;
        mtn_cable2DepthEnabled.depth = 1;

        // mtn_snow (components)
        const mtn_snowDepthEnabled = new DepthEnabled(mtn_snow);
        mtn_snowDepthEnabled.automaticSort = false;
        mtn_snowDepthEnabled.depth = 3;

        // mtn_front (components)
        const mtn_frontDepthEnabled = new DepthEnabled(mtn_front);
        mtn_frontDepthEnabled.automaticSort = false;
        mtn_frontDepthEnabled.depth = 3;

        // mtn_shopback (components)
        const mtn_shopbackDepthEnabled = new DepthEnabled(mtn_shopback);
        mtn_shopbackDepthEnabled.automaticSort = false;
        mtn_shopbackDepthEnabled.depth = 5;

        // mtn_store (components)
        new DepthEnabled(mtn_store);

        // mtn_secondlane (components)
        new DepthEnabled(mtn_secondlane);

        // mtn_thirdlane (components)
        new DepthEnabled(mtn_thirdlane);

        // mtn_fourthlane (components)
        new DepthEnabled(mtn_fourthlane);

        // cat (components)
        new DepthEnabled(cat);

        // cat_btn (components)
        const cat_btnButtonComponent = new ButtonComponent(cat_btn);
        cat_btnButtonComponent.handCursor = true;
        cat_btnButtonComponent.pixelPerfect = true;

        // catalogue (components)
        const catalogueDepthEnabled = new DepthEnabled(catalogue);
        catalogueDepthEnabled.automaticSort = false;
        catalogueDepthEnabled.depth = 1080;

        // catalogue_btn (components)
        const catalogue_btnButtonComponent = new ButtonComponent(catalogue_btn);
        catalogue_btnButtonComponent.handCursor = true;
        catalogue_btnButtonComponent.pixelPerfect = true;

        // firstLane (components)
        new DepthEnabled(firstLane);

        // secondLane (components)
        new DepthEnabled(secondLane);

        // thirdLane (components)
        new DepthEnabled(thirdLane);

        // fourthLane (components)
        new DepthEnabled(fourthLane);

        // mtn_village_mc (components)
        const mtn_village_mcRoomTrigger = new RoomTrigger(mtn_village_mc);
        mtn_village_mcRoomTrigger.destination = "200";
        mtn_village_mcRoomTrigger.playerX = 501.75;
        mtn_village_mcRoomTrigger.playerY = 657;

        // mtn_plaza_mc (components)
        const mtn_plaza_mcRoomTrigger = new RoomTrigger(mtn_plaza_mc);
        mtn_plaza_mcRoomTrigger.destination = "200";
        mtn_plaza_mcRoomTrigger.playerX = 501.75;
        mtn_plaza_mcRoomTrigger.playerY = 657;

        // shop_btn (components)
        const shop_btnButtonComponent = new ButtonComponent(shop_btn);
        shop_btnButtonComponent.pixelPerfect = true;

        // exit_btn (components)
        const exit_btnButtonComponent = new ButtonComponent(exit_btn);
        exit_btnButtonComponent.pixelPerfect = true;

        this.cablecar = cablecar;
        this.cat = cat;
        this.cat_btn = cat_btn;
        this.catalogue = catalogue;
        this.catalogue_btn = catalogue_btn;
        this.firstLane = firstLane;
        this.block = block;
        this.shop_btn = shop_btn;
        this.exit_btn = exit_btn;
        this.triggers = triggers;

        this.events.emit("scene-awake");
    }

    public cablecar!: Phaser.GameObjects.Sprite;
    public cat!: Phaser.GameObjects.Sprite;
    public cat_btn!: Phaser.GameObjects.Image;
    public catalogue!: Phaser.GameObjects.Image;
    public catalogue_btn!: Phaser.GameObjects.Image;
    public firstLane!: FirstLane;
    public block!: Phaser.GameObjects.Image;
    public shop_btn!: Phaser.GameObjects.Image;
    public exit_btn!: Phaser.GameObjects.Image;
    public triggers!: Phaser.GameObjects.Image[];

    /* START-USER-CODE */

    declare game: App;

    init(data: any): void {
        this.scene.moveBelow('Interface');

        if (data.oninit) data.oninit(this);
    }

    get world(): World {
        return (this.scene.get('World') as World);
    }

    get engine(): Engine {
        return this.world.engine;
    }

    get interface(): Interface {
        return (this.scene.get('Interface') as Interface);
    }

    create(data: any) {

        this.editorCreate();

        this.cablecar.on('animationupdate', this.updateCableDepth, this);
        this.cablecar.play('mtn-cablecar-animation');

        this.cat_btn.on('over', () => this.cat.play('mtn-cat-animation'));
        this.cat_btn.on('out', () => {
            this.cat.stop();
            this.cat.setFrame('mtn/cat0001');
        });

        this.exit_btn.on('release', () => this.world.move(1417.5, 569.25));
        this.shop_btn.on('release', () => this.world.move(1174.5, 344.25));

        this.catalogue_btn.on('over', () => this.catalogue.setFrame('mtn/catalogue0002'));
        this.catalogue_btn.on('out', () => this.catalogue.setFrame('mtn/catalogue0001'));
        if (data.onready) data.onready(this);
    }

    updateCableDepth(_animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame): void {
        if (frame.index >= 110 && frame.index <= 144) this.cablecar.depth = 2; // BACK
        else if (frame.index >= 78 && frame.index <= 109) this.cablecar.depth = 4; // FRONT
        else this.cablecar.depth = 0; // pulley
    }

    unload(engine: Engine): void {
        engine.app.unloadAssetPack('mtn-pack');
    }

    /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
