import "devtools-detect";
import Phaser from "phaser";

if ('Phaser' in global) delete global['Phaser'];
Phaser.Plugins.PluginCache.register('Loader', LoaderPlugin, 'load');

import { App } from "@clubpenguin/app/app";
import Bootstrap from "@clubpenguin/boot/Bootstrap";
import Startscreen from "@clubpenguin/start/Startscreen";
import Create from "@clubpenguin/create/Create";
import Login from "@clubpenguin/login/Login";
import Redemption from "@clubpenguin/redemption/Redemption";
import Load from "@clubpenguin/load/Load";
import ErrorArea from "@clubpenguin/app/ErrorArea";
import Notifications from "@clubpenguin/world/notifications/Notifications";
import InternalErrorArea from "@clubpenguin/app/InternalErrorArea";
import Logo from "@clubpenguin/logo/Logo";
import World from "@clubpenguin/world/World";
import Interface from "@clubpenguin/world/interface/Interface";
import { Debug } from "@clubpenguin/debug";
import { LoaderPlugin } from "@clubpenguin/app/loader";
import { ColorLevelFormatter, getLogger, LogLevel } from "@clubpenguin/lib/log";

let logger = getLogger('CP');
logger.level = __webpack_options__.LOG_LEVEL ?? LogLevel.WARN;
let colorFormat = {
    [LogLevel.TRACE]: 'color:#FFFFFF;background-color:#616161',
    [LogLevel.DEBUG]: 'color:#00021C;background-color:#1C608A',
    [LogLevel.INFO]: 'color:#FFFFFF;background-color:#22A4F3',
    [LogLevel.WARN]: 'color:#000000;background-color:#FFBC3A',
    [LogLevel.ERROR]: 'color:#FFFFFF;background-color:#DB2C2C'
};
logger.formatter = new ColorLevelFormatter('%c{level}%c %c[%c{now}%c] [%c{name}%c] %c{msg}', ['', '', 'color:#616161', 'color:#0052AF', 'color:#616161', 'color:#22A4F3', 'color:#616161', ''], colorFormat);

let app: App;

interface RunParams {
    parentId: string,
    elementId: string,
    elementClassName: string,
    language: string,
    apiPath: string,
    mediaPath: string,
    crossOrigin: string,
    cacheVersion: string,
    contentVersion: string,
    minigameVersion: string,
    environmentType: string
}

declare global {
    /* ========== WEBPACK VARIABLES ========== */
    const __webpack_options__: {
        EXPOSE_DEBUG: boolean,
        RECAPTCHA_SITE_KEY: string,
        LOG_LEVEL: number
    };
    const __webpack_public_path__: string;

    /* ========== PLAY PAGE ========== */
    interface Window {
        jsAPI: {
            showNav(): void;
            hideNav(): void;
            showRules(): void;
        };
        handleGameError: (options?: { handled: boolean }) => void;
    }
}

function onAppCrash(): void {
    if (window.handleGameError) window.handleGameError({ handled: false });
    stop(true);
}

export function isBrowserCompatible(): boolean {
    return (
        typeof fetch == 'function' &&
        typeof crypto == 'object' &&
        typeof crypto.subtle == 'object' &&
        typeof WebSocket == 'function'
    );
}

export function run(params: RunParams): void {
    stop();

    logger.info('Starting app');
    app = new App({
        parent: params.parentId,
        fullscreenTarget: params.parentId,
        autoFocus: true,
        title: 'Club Penguin',
        banner: false,
        backgroundColor: 0xffffff,
        transparent: false,
        scene: [
            Bootstrap,
            Create,
            Login,
            Redemption,
            Startscreen,
            World,
            Interface,
            Load,
            Logo,
            Notifications,
            ErrorArea,
            InternalErrorArea
        ],
        width: 1710,
        height: 1080,
        type: Phaser.WEBGL,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        fps: {
            target: 24,
            limit: 24
        },
        dom: {
            createContainer: true
        },
        input: {
            mouse: {
                target: params.parentId
            },
            touch: {
                target: params.parentId
            }
        },
        physics: {
            default: 'matter',
            matter: {
                gravity: {
                    x: 0,
                    y: 0
                },
                enableSleeping: true,
                debug: params.environmentType == 'dev'
            }
        },
        loader: {
            baseURL: params.mediaPath,
            maxParallelDownloads: 10,
            crossOrigin: params.crossOrigin
        },
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: true,
        callbacks: {
            postBoot: (app: App) => {
                if (params.elementId) app.canvas.id = params.elementId;
                if (params.elementClassName) app.canvas.className = params.elementClassName;

                app.friends.init(params.mediaPath, app.airtower.createAvatarUrlCallback());
            }
        }
    }, {
        language: params.language,
        apiPath: params.apiPath,
        cacheVersion: params.cacheVersion,
        contentVersion: params.contentVersion,
        minigameVersion: params.minigameVersion,
        environmentType: params.environmentType
    });
    app.onCrash = onAppCrash;

    LoaderPlugin.cacheVersion = params.cacheVersion;
}

export function isRunning(): boolean {
    return app !== undefined;
}

export function sizeChange(repositionFriends = false): void {
    if (!isRunning()) return;

    logger.info('Repositioning app');

    if (app.scale.getParentBounds()) app.scale.refresh();
    if (repositionFriends) app.friends.reposition();
}

export function handleLogOff(redirectUrl: string): void {
    stop(true);

    if (redirectUrl) window.location.href = redirectUrl;
}

export let handleWindowUnload = handleLogOff;

export let handleBack = handleLogOff;

export function handleNameResubmit(): void {

}

export function handleShowPreactivation(): void {

}

export function friendsEventHandler(event: string, params: any[]): void {
    if (!isRunning()) return;

    app.friends.friendsEventHandler(event, params);
}

export function sendBuddyRequest(swid: string): void {
    if (!isRunning()) return;

    app.friends.sendBuddyRequest(swid);
}

export function sendAcceptBuddyRequest(swid: string): void {
    if (!isRunning()) return;

    app.friends.sendAcceptBuddyRequest(swid);
}

export function sendRejectBuddyRequest(swid: string): void {
    if (!isRunning()) return;

    app.friends.sendRejectBuddyRequest(swid);
}

export function sendToggleBestFriend(swid: string): void {
    if (!isRunning()) return;

    app.friends.sendToggleBestFriend(swid);
}

export function sendToggleBestCharacter(id: string): void {
    if (!isRunning()) return;

    app.friends.sendToggleBestCharacter(id);
}

export function stop(terminate = false): void {
    if (isRunning()) {
        logger.info('Stopping app');
        //app.airtower.close();
        app.destroy(false, terminate);
    }
}

logger.info('Club Penguin ready');

export let debug: Debug;

if (__webpack_options__.EXPOSE_DEBUG) debug = new Debug(() => app);
