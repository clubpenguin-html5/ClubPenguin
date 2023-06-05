/* START OF COMPILED CODE */

import Phaser from "phaser";
import TextBox from "../../lib/ui/TextBox";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class ErrorBubble extends Phaser.GameObjects.Container {

    constructor(scene: Phaser.Scene, x?: number, y?: number) {
        super(scene, x ?? 0, y ?? 0);

        // graphic
        const graphic = scene.add.image(0, 0, "create", "create-module/errorBubble");
        graphic.setOrigin(0.5, 0.17801047);
        this.add(graphic);

        // textBox
        const textBox = new TextBox(scene, -270.3375, 0, "BurbankSmallBold");
        textBox.setOrigin(0, 0);
        textBox.tintTopLeft = 6710886;
        textBox.tintTopRight = 6710886;
        textBox.tintBottomLeft = 6710886;
        textBox.tintBottomRight = 6710886;
        textBox.text = "Example error";
        textBox.fontSize = -18;
        this.add(textBox);

        // textBox (prefab fields)
        textBox.boxWidth = 540.7875;
        textBox.boxHeight = 92.025;
        textBox.horizontalAlign = 1;
        textBox.verticalAlign = 1;

        /* START-USER-CTR-CODE */
        // Write your code here.
        /* END-USER-CTR-CODE */
    }

    /* START-USER-CODE */

    // Write your code here.

    /* END-USER-CODE */
}

/* END OF COMPILED CODE */
