import * as PIXI from "pixi.js";

import { PipeObstacle } from "./pipes-obstacle";
import { ObstaclesView } from "./obstacles-view";
import { GameSettings } from "../game-settings";
import { Ground } from "../ground/ground";
import { World } from "../world";

export class ObstaclesController extends PIXI.utils.EventEmitter {
    public static readonly PIPE_PASSED = "pipePassed"; // move to notification class

    private readonly PIPES_COUNT: number = 3;

    private _view: ObstaclesView;
    private _gameSettings: GameSettings = GameSettings.getInstance();

    private _nextPipeObstacleIndex: number;
    private _moveObstaclesTicker: PIXI.Ticker;

    constructor(view: ObstaclesView) {
        super();

        this._view = view;
        this._view.on(ObstaclesView.PIPE_PASSED, this.onPipePassed, this);

        this._nextPipeObstacleIndex = 0;

        this._moveObstaclesTicker = new PIXI.Ticker();
        this._moveObstaclesTicker.add(() => this.moveObstacles());

        this.addObstacles();
    }

    get NextPipeObstacle(): PipeObstacle {
        return this._view.pipeObstacles[this._nextPipeObstacleIndex];
    }

    public startMoving(): void {
        this._moveObstaclesTicker.start();
    }

    public stopMoving(): void {
        this._moveObstaclesTicker.stop();
    }

    public resetObstacles(): void {
        this.resetPipesPosition();
    }

    //TODO
    // add move behavior
    private moveObstacles() {
        this.movePipes();
        this.moveGround();
    }

    private movePipes(): void {
        this._view.movePipes();
    }

    private moveGround(): void {
        this._view.moveGround(-this._gameSettings.groundMoveSpeed);
    }

    private onPipePassed(): any {
        this._nextPipeObstacleIndex =
            this._nextPipeObstacleIndex < this.PIPES_COUNT - 1 ? this._nextPipeObstacleIndex + 1 : 0;
        this._view.nextPipeObstacleIndex = this._nextPipeObstacleIndex;

        this.emit(ObstaclesController.PIPE_PASSED);
    }

    private addObstacles(): void {
        this.addPipeObstacles();
        this.addGroundObstacle();
    }

    // TODO
    // move ground as parallax background in the root view
    private addGroundObstacle() {
        const ground = (World.getInstance().ground = new Ground());
        ground.y = this._gameSettings.gameHeight - ground.height;

        World.addObjectToWorld(ground);

        this._view.groundObstacle = ground;
    }

    private addPipeObstacles() {
        this._view.pipeObstacles = [];

        for (let i = 0; i < this.PIPES_COUNT; i++) {
            const pipeObstacle: PipeObstacle = new PipeObstacle();
            pipeObstacle.x =
                this._gameSettings.gameWidth + pipeObstacle.width * i + i * this._gameSettings.obstaclesDistance;
            World.addObjectToWorld(pipeObstacle.upperPipe); // add them below ground
            World.addObjectToWorld(pipeObstacle.bottomPipe); // add them below ground
            this._view.pipeObstacles.push(pipeObstacle);
        }
    }

    private resetPipesPosition(): void {
        // TODO:
        // nextPipeObsticle show be only in the controller or model
        // remove it from the view

        this._nextPipeObstacleIndex = 0;
        this._view.nextPipeObstacleIndex = 0;

        this._view.resetPipesPosition();
    }
}
