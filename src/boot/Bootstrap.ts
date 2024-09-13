/* START OF COMPILED CODE */

import Phaser from "phaser";
import InputBlocker from "../lib/ui/components/InputBlocker";
import TextBox from "../lib/ui/TextBox";
import ButtonComponent from "../lib/ui/components/ButtonComponent";
/* START-USER-IMPORTS */
import TabId from "is-tab-duplicated";

import { App } from "@clubpenguin/app/app";
import ErrorArea from "@clubpenguin/app/ErrorArea";
import InternalErrorArea from "@clubpenguin/app/InternalErrorArea";
import { Language } from "@clubpenguin/app/locale";
import Load from "@clubpenguin/load/Load";
import { LoaderTask } from "@clubpenguin/load/tasks";
/* END-USER-IMPORTS */

export default class Bootstrap extends Phaser.Scene {

    constructor() {
        super("Bootstrap");

        /* START-USER-CTR-CODE */

        window.addEventListener('devtoolschange', event => {
            if (event.detail.isOpen) console.log(
                this.getDevtoolsWarnMessage(),
                'font-weight: bold; color: red; font-size: 350%; background: navy;',
                'color: red; font-size: 250%; background: navy;',
                'color: lime; font-size: 200%; background: teal;',
                'color: white; font-size: 150%; background: olive;'
            );
        });

        /* END-USER-CTR-CODE */
    }

    preload(): void {

        this.load.pack("bootstrap-pack", "assets/boot/bootstrap-pack.json");
    }

    editorCreate(): void {

        // club_penguin
        const club_penguin = this.add.image(0, 0, "club_penguin");
        club_penguin.setOrigin(0, 0);

        // cover
        const cover = this.add.rectangle(0, 0, 1710, 1080);
        cover.setOrigin(0, 0);
        cover.visible = false;
        cover.isFilled = true;
        cover.fillColor = 0;
        cover.fillAlpha = 0.4;

        // embeddedErrorDialog
        const embeddedErrorDialog = this.add.container(0, 0);
        embeddedErrorDialog.visible = false;

        // dialogBody
        const dialogBody = this.add.nineslice(0, 0, "boot", "boot/dialog", 796.5, 495, 47, 47, 47, 47);
        dialogBody.setOrigin(0, 0);
        embeddedErrorDialog.add(dialogBody);

        // dialogMessage
        const dialogMessage = new TextBox(this, 34.537498474121094, 29.924999237060547, "BurbankSmallMedium");
        dialogMessage.tintFill = true;
        dialogMessage.tintTopLeft = 0;
        dialogMessage.tintTopRight = 0;
        dialogMessage.tintBottomLeft = 0;
        dialogMessage.tintBottomRight = 0;
        dialogMessage.text = "Load Error\nSorry, there's been an error loading\nClub Penguin. Please try logging in\nlater. If the problem continues please\ncontact support@clubpenguin.com";
        dialogMessage.fontSize = -40.5;
        dialogMessage.align = 1;
        embeddedErrorDialog.add(dialogMessage);

        // dialogCode
        const dialogCode = new TextBox(this, 38.25, 427.5, "BurbankSmallMedium");
        dialogCode.tintFill = true;
        dialogCode.tintTopLeft = 9976322;
        dialogCode.tintTopRight = 9976322;
        dialogCode.tintBottomLeft = 9976322;
        dialogCode.tintBottomRight = 9976322;
        dialogCode.text = "c0";
        dialogCode.fontSize = -24.75;
        dialogCode.align = 2;
        embeddedErrorDialog.add(dialogCode);

        // dialogButton
        const dialogButton = this.add.image(219.60000610351562, 301.1625061035156, "boot", "boot/button");
        dialogButton.setOrigin(0, 0);
        embeddedErrorDialog.add(dialogButton);

        // dialogButtonLabel
        const dialogButtonLabel = new TextBox(this, 230.1750030517578, 321.63751220703125, "BurbankSmallMedium");
        dialogButtonLabel.tintFill = true;
        dialogButtonLabel.tintTopLeft = 16777215;
        dialogButtonLabel.tintTopRight = 16777215;
        dialogButtonLabel.tintBottomLeft = 16777215;
        dialogButtonLabel.tintBottomRight = 16777215;
        dialogButtonLabel.text = "OK";
        dialogButtonLabel.fontSize = -42.75;
        dialogButtonLabel.align = 1;
        embeddedErrorDialog.add(dialogButtonLabel);

        // cover (components)
        new InputBlocker(cover);

        // dialogMessage (prefab fields)
        dialogMessage.boxWidth = 722.475;
        dialogMessage.boxHeight = 257.9625;
        dialogMessage.horizontalAlign = 1;
        dialogMessage.verticalAlign = 1;

        // dialogCode (prefab fields)
        dialogCode.boxWidth = 729;
        dialogCode.boxHeight = 38.7;
        dialogCode.horizontalAlign = 2;
        dialogCode.verticalAlign = 1;

        // dialogButton (components)
        const dialogButtonButtonComponent = new ButtonComponent(dialogButton);
        dialogButtonButtonComponent.upTexture = {"key":"boot","frame":"boot/button"};
        dialogButtonButtonComponent.overTexture = {"key":"boot","frame":"boot/buttonHover"};
        dialogButtonButtonComponent.downTexture = {"key":"boot","frame":"boot/buttonDown"};
        dialogButtonButtonComponent.handCursor = true;
        dialogButtonButtonComponent.pixelPerfect = true;

        // dialogButtonLabel (prefab fields)
        dialogButtonLabel.boxWidth = 337.8375;
        dialogButtonLabel.boxHeight = 70.2;
        dialogButtonLabel.horizontalAlign = 1;
        dialogButtonLabel.verticalAlign = 1;

        this.cover = cover;
        this.dialogBody = dialogBody;
        this.dialogMessage = dialogMessage;
        this.dialogCode = dialogCode;
        this.dialogButton = dialogButton;
        this.dialogButtonLabel = dialogButtonLabel;
        this.embeddedErrorDialog = embeddedErrorDialog;

        this.events.emit("scene-awake");
    }

    public cover!: Phaser.GameObjects.Rectangle;
    public dialogBody!: Phaser.GameObjects.NineSlice;
    public dialogMessage!: TextBox;
    public dialogCode!: TextBox;
    public dialogButton!: Phaser.GameObjects.Image;
    public dialogButtonLabel!: TextBox;
    public embeddedErrorDialog!: Phaser.GameObjects.Container;

    /* START-USER-CODE */

    declare game: App;

    create(): void {
        if (!this.cache.json.exists('bootstrap-pack')) {
            if (window.handleGameError) window.handleGameError({ handled: false });
            throw new Error('Bootstrap could not initiate Club Penguin');
        }

        this.scene.run('InternalErrorArea');

        this.editorCreate();

        this.loadClubPenguin();
    }

    async loadClubPenguin(): Promise<void> {
        await new Promise<void>(resolve => this.scene.run('Load', {
            onready: () => resolve()
        }));

        let load = this.scene.get('Load') as Load;
        load.show();

        try {
            await this.game.locale.load();
            await this.game.gameConfig.load(this.game.locale.abbreviation.toString());
        } catch (e) {
            this.showLoadError();
            throw e;
        }

        load.track(new LoaderTask(this.load)).important = true;

        this.load.pack("app-pack", "assets/app/app-pack.json");
        this.load.pack("font-library", "assets/lib/fonts/font-library.json");
        this.scene.run('Logo', {
            oninit: (scene: Phaser.Scene) => load.track(new LoaderTask(scene.load))
        });
        this.load.start();

        await load.waitAllTasksComplete();

        let error = await new Promise<ErrorArea>(resolve => this.scene.run('ErrorArea', {
            onready: (scene: ErrorArea) => resolve(scene)
        }));

        if (this.load.totalFailed > 0) return this.showLoadError();

        TabId.initInstance();
        if (TabId.isTabDuplicated() && this.game.environmentType == 'prod') {
            error.showError(error.WINDOW_SMALL, this.game.locale.localize('shell.MULTI_CONNECTIONS', 'error_lang'), this.game.locale.localize('Okay'), () => {
                window.location.reload();
                return false;
            }, error.makeCode('c', error.MULTI_CONNECTIONS));

            throw new Error('Multiple connections detected!');
        }

        let path = 'start'; // TODO: get path

        if (path === 'login') {
            this.scene.start('Login');
        } else if (path === 'create') {
            this.scene.start('Create');
        } else if (path === 'redeem') {
            this.scene.start('Redemption');
        } else {
            this.scene.start('Startscreen');
        }
    }

    showLoadError(): void {
        let errorMessage: string;
        let buttonText: string;

        switch (this.game.locale.language) {
            case Language.PT:
                errorMessage = "Erro\nHouve um erro ao carregar o Club Penguin. Tente novamente mais tarde. Se o problema continuar, contate support.pt@clubpenguin.com ";
                buttonText = "OK";
                break;
            case Language.FR:
                errorMessage = "Erreur de chargement\nUne erreur s'est produite. Essaie de te connecter plus tard. Si le problème persiste, contacte support.fr@clubpenguin.com";
                buttonText = "OK";
                break;
            case Language.ES:
                errorMessage = "Error al cargar la página\nVuelve a intentarlo más tarde. Si el problema continúa, comunícate con support.es@clubpenguin.com ";
                buttonText = "OK";
                break;
            case Language.DE:
                errorMessage = "Ladefehler\nFehler beim Laden. Bitte versuche dich später erneut anzumelden. Bei Problemen kontaktiere bitte support.de@clubpenguin.com ";
                buttonText = "O.K.";
                break;
            case Language.RU:
                errorMessage = "Ошибка загрузки\nИзвини, в процессе загрузки «Клуба пингвинов» произошла ошибка. Попробуй зайти в игру позднее. Если эта проблема не исчезнет, то рекомендуем обратиться в Службу поддержки по адресу: support@clubpenguin.ru";
                buttonText = "OK";
                break;
            default:
                errorMessage = "Load Error\nSorry, there's been an error loading Club Penguin. Please try logging in later. If the problem continues please contact support@clubpenguin.com";
                buttonText = "OK";
        };

        let interr = this.scene.get('InternalErrorArea') as InternalErrorArea;
        interr.showErrorDialog(errorMessage, buttonText, () => window.location.reload(), '10010');
    }

    getDevtoolsWarnMessage(): string {
        switch (this.game?.locale.language) {
            case Language.PT:
                return (
                    '%cESPERE!\n%cSua conta pode estar em perigo.\n\n' +
                    '%cQualquer criminoso pode induzi-lo a inserir códigos aqui que podem dar acesso à sua conta ou causar sua suspensão.\n\n' +
                    '%cSe você sabe o que está fazendo, considere se juntar à nossa equipe :)'
                );
            case Language.FR:
                return (
                    '%cATTENDEZ!\n%cVotre compte peut être en danger.\n\n' +
                    '%cTout criminel pourrait vous inciter à saisir ici des codes qui pourraient lui donner accès à votre compte ou entraîner votre suspension.\n\n' +
                    '%cSi vous savez ce que vous faites, envisagez de rejoindre notre équipe :)'
                );
            case Language.ES:
                return (
                    '%c¡ESPERA!\n%cTu cuenta puede correr peligro.\n\n' +
                    '%cCualquier malhechor podría engañarte al introducir códigos aquí que les puede dar acceso a tu cuenta, o causarle una suspención.\n\n' +
                    '%cSi sabes lo que estás haciendo, considera unirte a nuestro equipo :)'
                );
            case Language.DE:
                return (
                    '%cWARTEN!\n%cIhr Konto könnte in Gefahr sein.\n\n' +
                    '%cKriminelle könnten Sie dazu verleiten, hier Code einzuführen, der ihnen Zugriff auf Ihr Konto verschafft oder Sie sperrt.\n\n' +
                    '%cWenn Sie wissen, was Sie tun, denken Sie darüber nach, unserem Team beizutreten :)'
                );
            case Language.RU:
                return (
                    '%cЖДАТЬ!\n%cВаш аккаунт может быть в опасности.\n\n' +
                    '%cЗлоумышленники могут обманом заставить вас ввести здесь код, который может дать им доступ к вашей учетной записи или заблокировать вас.\n\n' +
                    '%cЕсли вы знаете, что делаете, рассмотрите возможность присоединиться к нашей команде :)'
                );
            default:
                return (
                    '%cWAIT!\n%cYour account might be in danger.\n\n' +
                    '%cBad actors might trick you into introducing code here that could give them access to your account or get you banned.\n\n' +
                    '%cIf you know what you\'re doing, consider joining our team :)'
                );
        }
    }

    /* END-USER-CODE */
}

/* END OF COMPILED CODE */
