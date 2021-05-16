(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnemyStates = void 0;
const StateMachineAI_1 = require("./../Wolfie2D/AI/StateMachineAI");
const AABB_1 = require("./../Wolfie2D/DataTypes/Shapes/AABB");
const Vec2_1 = require("./../Wolfie2D/DataTypes/Vec2");
const Attack_1 = require("./BatStates/Attack");
const Idle_1 = require("./BatStates/Idle");
const game_enums_1 = require("./../GameSystems/game_enums");
const Damaged_1 = require("./BatStates/Damaged");
const GameEventType_1 = require("../Wolfie2D/Events/GameEventType");
class BatAI extends StateMachineAI_1.default {
    constructor() {
        super(...arguments);
        /** The default movement speed of this AI */
        this.speed = 15;
        // State machine defers updates and event handling to its children
        // Check super classes for details
    }
    // update(deltaT: number): void {
    //     console.log("BAT HERE");
    // }
    initializeAI(owner, options) {
        this.owner = owner;
        this.addState(EnemyStates.DEFAULT, new Idle_1.default(this, owner));
        this.addState(EnemyStates.ATTACKING, new Attack_1.default(this, owner));
        this.addState(EnemyStates.DAMAGED, new Damaged_1.default(this, owner));
        this.health = options.health;
        this.player = options.player;
        // Initialize to the default state
        this.initialize(EnemyStates.DEFAULT);
    }
    activate(options) {
    }
    damage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.owner.setAIActive(false, {});
            this.owner.isCollidable = false;
            if (!this.owner.animation.isPlaying("DYING")) {
                this.owner.removePhysics();
                this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "bat_death", loop: false, holdReference: false });
                this.owner.animation.play("DYING", false, game_enums_1.Game_Events.ENEMY_DIED);
            }
        }
        else {
            this.changeState(EnemyStates.DAMAGED);
        }
    }
    getPlayerPosition() {
        let pos = this.player.position;
        // Get the new player location
        let start = this.owner.position.clone();
        let delta = pos.clone().sub(start);
        // Iterate through the tilemap region until we find a collision
        let minX = Math.min(start.x, pos.x);
        let maxX = Math.max(start.x, pos.x);
        let minY = Math.min(start.y, pos.y);
        let maxY = Math.max(start.y, pos.y);
        // Get the wall tilemap
        let walls = this.owner.getScene().getLayer("Wall").getItems()[0];
        let minIndex = walls.getColRowAt(new Vec2_1.default(minX, minY));
        let maxIndex = walls.getColRowAt(new Vec2_1.default(maxX, maxY));
        let tileSize = walls.getTileSize();
        for (let col = minIndex.x; col <= maxIndex.x; col++) {
            for (let row = minIndex.y; row <= maxIndex.y; row++) {
                let tile_val = walls.getTileAtRowCol(new Vec2_1.default(col, row));
                if (tile_val === 18 || tile_val === 19 || tile_val === 44 || tile_val === 45) {
                    // Get the position of this tile
                    let tilePos = new Vec2_1.default(col * tileSize.x + tileSize.x / 2, row * tileSize.y + tileSize.y / 2);
                    // Create a collider for this tile
                    let collider = new AABB_1.default(tilePos, tileSize.scaled(1 / 2));
                    let hit = collider.intersectSegment(start, delta, Vec2_1.default.ZERO);
                    if (hit !== null && start.distanceSqTo(hit.pos) < start.distanceSqTo(pos)) {
                        // We hit a wall, we can't see the player
                        return null;
                    }
                }
            }
        }
        return pos;
    }
}
exports.default = BatAI;
var EnemyStates;
(function (EnemyStates) {
    EnemyStates["DEFAULT"] = "default";
    EnemyStates["ATTACKING"] = "attacking";
    EnemyStates["DAMAGED"] = "damaged";
    EnemyStates["PREVIOUS"] = "previous";
})(EnemyStates = exports.EnemyStates || (exports.EnemyStates = {}));
},{"../Wolfie2D/Events/GameEventType":117,"./../GameSystems/game_enums":80,"./../Wolfie2D/AI/StateMachineAI":92,"./../Wolfie2D/DataTypes/Shapes/AABB":104,"./../Wolfie2D/DataTypes/Vec2":111,"./BatStates/Attack":2,"./BatStates/Damaged":3,"./BatStates/Idle":5}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("./../../Wolfie2D/DataTypes/Vec2");
const Timer_1 = require("./../../Wolfie2D/Timing/Timer");
const BatAI_1 = require("../BatAI");
const EnemyState_1 = require("./EnemyState");
class Attack extends EnemyState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
        // Regularly update the player location
        this.exitTimer = new Timer_1.default(1000);
        this.resetTimer = new Timer_1.default(2000);
    }
    onEnter(options) {
        this.resetTimer.start();
        this.owner.animation.play("ATTACK", true);
        this.lastPlayerPos = new Vec2_1.default(this.parent.getPlayerPosition().x, this.parent.getPlayerPosition().y);
    }
    handleInput(event) { }
    update(deltaT) {
        if (this.parent.getPlayerPosition() !== null) {
            // Player is visible, restart the exitTimer
            this.exitTimer.start();
            if (!this.doneMoving) {
                this.owner.invertX = this.owner._velocity.x < 0;
                if (this.resetTimer.isStopped()) {
                    this.finished(BatAI_1.EnemyStates.DEFAULT);
                }
                if (this.owner.position.distanceTo(this.lastPlayerPos) < 5) {
                    this.doneMoving = true;
                }
                this.owner.move(this.owner.position.dirTo(this.lastPlayerPos).scale(3));
            }
            else {
                this.resetTimer.start();
                this.doneMoving = false;
                this.lastPlayerPos = new Vec2_1.default(this.parent.getPlayerPosition().x, this.parent.getPlayerPosition().y);
            }
        }
        if (this.exitTimer.isStopped()) {
            // We haven't seen the player in a while, go check out where we last saw them, if possible
            this.finished(BatAI_1.EnemyStates.DEFAULT);
        }
    }
    onExit() {
        return {};
    }
}
exports.default = Attack;
},{"../BatAI":1,"./../../Wolfie2D/DataTypes/Vec2":111,"./../../Wolfie2D/Timing/Timer":182,"./EnemyState":4}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EnemyState_1 = require("./EnemyState");
const BatAI_1 = require("../BatAI");
const GameEventType_1 = require("../../Wolfie2D/Events/GameEventType");
class Damaged extends EnemyState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "bat_damage", loop: false, holdReference: false });
        this.owner.animation.play("DAMAGE", false);
        this.lastPlayerPos = this.parent.getPlayerPosition();
    }
    handleInput(event) { }
    update(deltaT) {
        if (this.lastPlayerPos !== null) {
            this.owner.move(this.owner.position.dirTo(this.lastPlayerPos).scale(-2));
        }
        if (!this.owner.animation.isPlaying("DAMAGE")) {
            this.finished(BatAI_1.EnemyStates.DEFAULT);
        }
    }
    onExit() {
        this.owner.animation.stop();
        return {};
    }
}
exports.default = Damaged;
},{"../../Wolfie2D/Events/GameEventType":117,"../BatAI":1,"./EnemyState":4}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const State_1 = require("./../../Wolfie2D/DataTypes/State/State");
class EnemyState extends State_1.default {
    constructor(parent, owner) {
        super(parent);
        this.owner = owner;
    }
}
exports.default = EnemyState;
},{"./../../Wolfie2D/DataTypes/State/State":108}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BatAI_1 = require("../BatAI");
const EnemyState_1 = require("./EnemyState");
class Idle extends EnemyState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.owner.animation.play("IDLE", true);
    }
    handleInput(event) {
    }
    update(deltaT) {
        if (this.parent.getPlayerPosition() !== null && this.owner.position.distanceTo(this.parent.getPlayerPosition()) < 200) {
            this.finished(BatAI_1.EnemyStates.ATTACKING);
        }
    }
    onExit() {
        this.owner.animation.stop();
        return {};
    }
}
exports.default = Idle;
},{"../BatAI":1,"./EnemyState":4}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnemyStates = void 0;
const StateMachineAI_1 = require("../Wolfie2D/AI/StateMachineAI");
const AABB_1 = require("../Wolfie2D/DataTypes/Shapes/AABB");
const Vec2_1 = require("../Wolfie2D/DataTypes/Vec2");
const Attack_1 = require("./CoinEnemyStates/Attack");
class Coin_EnemyAI extends StateMachineAI_1.default {
    constructor() {
        super(...arguments);
        /** The default movement speed of this AI */
        this.speed = 20;
        // State machine defers updates and event handling to its children
        // Check super classes for details
    }
    initializeAI(owner, options) {
        this.owner = owner;
        this.addState(EnemyStates.DEFAULT, new Attack_1.default(this, owner));
        this.start_velocity = new Vec2_1.default(options.velocityX, options.velocityY);
        this.player = options.player;
        // Initialize to the default state
        this.initialize(EnemyStates.DEFAULT);
    }
    activate(options) {
    }
    damage(damage) {
    }
    getPlayerPosition() {
        let pos = this.player.position;
        // Get the new player location
        let start = this.owner.position.clone();
        let delta = pos.clone().sub(start);
        // Iterate through the tilemap region until we find a collision
        let minX = Math.min(start.x, pos.x);
        let maxX = Math.max(start.x, pos.x);
        let minY = Math.min(start.y, pos.y);
        let maxY = Math.max(start.y, pos.y);
        // Get the wall tilemap
        let walls = this.owner.getScene().getLayer("Wall").getItems()[0];
        let minIndex = walls.getColRowAt(new Vec2_1.default(minX, minY));
        let maxIndex = walls.getColRowAt(new Vec2_1.default(maxX, maxY));
        let tileSize = walls.getTileSize();
        for (let col = minIndex.x; col <= maxIndex.x; col++) {
            for (let row = minIndex.y; row <= maxIndex.y; row++) {
                let tile_val = walls.getTileAtRowCol(new Vec2_1.default(col, row));
                if (tile_val === 18 || tile_val === 19 || tile_val === 44 || tile_val === 45) {
                    // Get the position of this tile
                    let tilePos = new Vec2_1.default(col * tileSize.x + tileSize.x / 2, row * tileSize.y + tileSize.y / 2);
                    // Create a collider for this tile
                    let collider = new AABB_1.default(tilePos, tileSize.scaled(1 / 2));
                    let hit = collider.intersectSegment(start, delta, Vec2_1.default.ZERO);
                    if (hit !== null && start.distanceSqTo(hit.pos) < start.distanceSqTo(pos)) {
                        // We hit a wall, we can't see the player
                        return null;
                    }
                }
            }
        }
        return pos;
    }
}
exports.default = Coin_EnemyAI;
var EnemyStates;
(function (EnemyStates) {
    EnemyStates["DEFAULT"] = "default";
    EnemyStates["ATTACKING"] = "attacking";
    EnemyStates["PREVIOUS"] = "previous";
})(EnemyStates = exports.EnemyStates || (exports.EnemyStates = {}));
},{"../Wolfie2D/AI/StateMachineAI":92,"../Wolfie2D/DataTypes/Shapes/AABB":104,"../Wolfie2D/DataTypes/Vec2":111,"./CoinEnemyStates/Attack":7}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Timer_1 = require("../../Wolfie2D/Timing/Timer");
const EnemyState_1 = require("./EnemyState");
class Attack extends EnemyState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
        // Regularly update the player location
        this.deleteTimer = new Timer_1.default(15000);
    }
    onEnter(options) {
        this.deleteTimer.start();
    }
    handleInput(event) { }
    update(deltaT) {
        if (Math.abs(this.parent.start_velocity.x) > 0) {
            this.parent.start_velocity.x -= this.parent.start_velocity.normalized().scale(this.parent.speed * deltaT).x / 15;
        }
        if (Math.abs(this.parent.start_velocity.y) > 0) {
            this.parent.start_velocity.y -= this.parent.start_velocity.normalized().scale(this.parent.speed * deltaT).y / 15;
        }
        if (this.parent.start_velocity.mag() < .05 && this.deleteTimer.isStopped()) {
            this.owner.destroy();
        }
        this.owner.move(this.parent.start_velocity);
    }
    onExit() {
        return {};
    }
}
exports.default = Attack;
},{"../../Wolfie2D/Timing/Timer":182,"./EnemyState":8}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const State_1 = require("../../Wolfie2D/DataTypes/State/State");
class EnemyState extends State_1.default {
    constructor(parent, owner) {
        super(parent);
        this.owner = owner;
    }
}
exports.default = EnemyState;
},{"../../Wolfie2D/DataTypes/State/State":108}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BossStates = void 0;
const StateMachineAI_1 = require("./../Wolfie2D/AI/StateMachineAI");
const AABB_1 = require("./../Wolfie2D/DataTypes/Shapes/AABB");
const Vec2_1 = require("./../Wolfie2D/DataTypes/Vec2");
const Dying_1 = require("./EnvyStates/Dying");
const Idle_1 = require("./EnvyStates/Idle");
const Attack_1 = require("./EnvyStates/Attack");
const Damage_1 = require("./EnvyStates/Damage");
const Walk_1 = require("./EnvyStates/Walk");
const Charge_1 = require("./EnvyStates/Charge");
const game_enums_1 = require("../GameSystems/game_enums");
class EnvyAI extends StateMachineAI_1.default {
    constructor() {
        super(...arguments);
        /** The default movement speed of this AI */
        this.speed = 20;
        // State machine defers updates and event handling to its children
        // Check super classes for details
    }
    initializeAI(owner, options) {
        this.owner = owner;
        this.addState(BossStates.DEFAULT, new Idle_1.default(this, owner));
        this.addState(BossStates.WALKING, new Walk_1.default(this, owner));
        this.addState(BossStates.CHARGING, new Charge_1.default(this, owner));
        this.addState(BossStates.DYING, new Dying_1.default(this, owner));
        this.addState(BossStates.DAMAGED, new Damage_1.default(this, owner));
        this.addState(BossStates.ATTACKING, new Attack_1.default(this, owner));
        this.health = options.health;
        this.player = options.player;
        this.punch = options.punch;
        this.punch_direction = Vec2_1.default.ZERO;
        // Initialize to the default state
        this.initialize(BossStates.DEFAULT);
    }
    handleEvent(event) {
        if (event.type === game_enums_1.Game_Events.ENVY_PUNCH) {
            this.punch.use(this.owner, "enemies", this.owner.position.dirTo(this.player.position));
        }
    }
    activate(options) {
    }
    damage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.owner.setAIActive(false, {});
            this.owner.isCollidable = false;
            if (this.currentState !== this.stateMap.get(BossStates.DYING)) {
                this.changeState(BossStates.DYING);
            }
        }
        else {
            this.changeState(BossStates.DAMAGED);
        }
    }
    getPlayerPosition() {
        let pos = this.player.position;
        // Get the new player location
        let start = this.owner.position.clone();
        let delta = pos.clone().sub(start);
        // Iterate through the tilemap region until we find a collision
        let minX = Math.min(start.x, pos.x);
        let maxX = Math.max(start.x, pos.x);
        let minY = Math.min(start.y, pos.y);
        let maxY = Math.max(start.y, pos.y);
        // Get the wall tilemap
        let walls = this.owner.getScene().getLayer("Wall").getItems()[0];
        let minIndex = walls.getColRowAt(new Vec2_1.default(minX, minY));
        let maxIndex = walls.getColRowAt(new Vec2_1.default(maxX, maxY));
        let tileSize = walls.getTileSize();
        for (let col = minIndex.x; col <= maxIndex.x; col++) {
            for (let row = minIndex.y; row <= maxIndex.y; row++) {
                let tile_val = walls.getTileAtRowCol(new Vec2_1.default(col, row));
                if (tile_val === 18 || tile_val === 19 || tile_val === 44 || tile_val === 45) {
                    // Get the position of this tile
                    let tilePos = new Vec2_1.default(col * tileSize.x + tileSize.x / 2, row * tileSize.y + tileSize.y / 2);
                    // Create a collider for this tile
                    let collider = new AABB_1.default(tilePos, tileSize.scaled(1 / 2));
                    let hit = collider.intersectSegment(start, delta, Vec2_1.default.ZERO);
                    if (hit !== null && start.distanceSqTo(hit.pos) < start.distanceSqTo(pos)) {
                        // We hit a wall, we can't see the player
                        return null;
                    }
                }
            }
        }
        return pos;
    }
}
exports.default = EnvyAI;
var BossStates;
(function (BossStates) {
    BossStates["DEFAULT"] = "default";
    BossStates["DAMAGED"] = "damaged";
    BossStates["PREVIOUS"] = "previous";
    BossStates["DYING"] = "dying";
    BossStates["ATTACKING"] = "attacking";
    BossStates["WALKING"] = "WALKING";
    BossStates["CHARGING"] = "CHARGING";
})(BossStates = exports.BossStates || (exports.BossStates = {}));
},{"../GameSystems/game_enums":80,"./../Wolfie2D/AI/StateMachineAI":92,"./../Wolfie2D/DataTypes/Shapes/AABB":104,"./../Wolfie2D/DataTypes/Vec2":111,"./EnvyStates/Attack":10,"./EnvyStates/Charge":12,"./EnvyStates/Damage":13,"./EnvyStates/Dying":14,"./EnvyStates/Idle":15,"./EnvyStates/Walk":16}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const EnvyAI_1 = require("../EnvyAI");
const GameEventType_1 = require("../../Wolfie2D/Events/GameEventType");
class Attack extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "envy_attack", loop: false, holdReference: false });
        this.owner.animation.play("PUNCH", false);
    }
    handleInput(event) { }
    update(deltaT) {
        if (!this.owner.animation.isPlaying("PUNCH")) {
            this.finished(EnvyAI_1.BossStates.WALKING);
        }
    }
    onExit() {
        return {};
    }
}
exports.default = Attack;
},{"../../Wolfie2D/Events/GameEventType":117,"../EnvyAI":9,"./BossState":11}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const State_1 = require("./../../Wolfie2D/DataTypes/State/State");
class BossState extends State_1.default {
    constructor(parent, owner) {
        super(parent);
        this.owner = owner;
    }
}
exports.default = BossState;
},{"./../../Wolfie2D/DataTypes/State/State":108}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const EnvyAI_1 = require("../EnvyAI");
const game_enums_1 = require("../../GameSystems/game_enums");
const GameEventType_1 = require("../../Wolfie2D/Events/GameEventType");
class Charge extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "envy_charge", loop: false, holdReference: false });
        this.owner.animation.play("CHARGE", false, game_enums_1.Game_Events.ENVY_PUNCH);
        // update rotation for attacking
        this.parent.punch_direction = this.owner.position.dirTo(this.parent.player.position);
    }
    handleInput(event) { }
    update(deltaT) {
        if (!this.owner.animation.isPlaying("CHARGE")) {
            this.finished(EnvyAI_1.BossStates.ATTACKING);
        }
    }
    onExit() {
        this.owner.animation.stop();
        return {};
    }
}
exports.default = Charge;
},{"../../GameSystems/game_enums":80,"../../Wolfie2D/Events/GameEventType":117,"../EnvyAI":9,"./BossState":11}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const EnvyAI_1 = require("../EnvyAI");
const GameEventType_1 = require("../../Wolfie2D/Events/GameEventType");
class Damage extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "envy_damage", loop: false, holdReference: false });
        this.owner.animation.play("DAMAGE", false);
    }
    handleInput(event) { }
    update(deltaT) {
        if (!this.owner.animation.isPlaying("DAMAGE")) {
            this.finished(EnvyAI_1.BossStates.DEFAULT);
        }
    }
    onExit() {
        this.owner.animation.stop();
        return { "timer": 25 };
    }
}
exports.default = Damage;
},{"../../Wolfie2D/Events/GameEventType":117,"../EnvyAI":9,"./BossState":11}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const game_enums_1 = require("../../GameSystems/game_enums");
const GameEventType_1 = require("../../Wolfie2D/Events/GameEventType");
class Damage extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "envy_death", loop: false, holdReference: false });
        this.owner.animation.play("DYING", false, game_enums_1.Game_Events.BOSS_DIED);
        // Reset the return object
        this.retObj = {};
    }
    handleInput(event) { }
    update(deltaT) {
    }
    onExit() {
        this.owner.animation.stop();
        return this.retObj;
    }
}
exports.default = Damage;
},{"../../GameSystems/game_enums":80,"../../Wolfie2D/Events/GameEventType":117,"./BossState":11}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const EnvyAI_1 = require("../EnvyAI");
const Timer_1 = require("../../Wolfie2D/Timing/Timer");
class Idle extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
        this.attack_timer = new Timer_1.default(950);
    }
    onEnter(options) {
        this.owner.animation.play("IDLE", true);
        this.attack_timer.pause();
    }
    handleInput(event) {
    }
    update(deltaT) {
        if (this.parent.getPlayerPosition() !== null && this.owner.position.distanceTo(this.parent.getPlayerPosition()) < 200) {
            this.finished(EnvyAI_1.BossStates.WALKING);
        }
    }
    onExit() {
        this.owner.animation.stop();
        return this.retObj;
    }
}
exports.default = Idle;
},{"../../Wolfie2D/Timing/Timer":182,"../EnvyAI":9,"./BossState":11}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("./../../Wolfie2D/DataTypes/Vec2");
const BossState_1 = require("./BossState");
const EnvyAI_1 = require("../EnvyAI");
class Walk extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.owner.animation.play("WALK", true);
    }
    handleInput(event) { }
    update(deltaT) {
        if (this.parent.getPlayerPosition() !== null && this.owner.position.distanceTo(this.parent.getPlayerPosition()) < 64) {
            this.finished(EnvyAI_1.BossStates.CHARGING);
        }
        if (this.parent.getPlayerPosition() !== null) {
            this.lastPlayerPos = new Vec2_1.default(this.parent.getPlayerPosition().x, this.parent.getPlayerPosition().y);
            // Player is visible, restart the exitTimer
            this.owner.move(this.owner.position.dirTo(this.lastPlayerPos).scale(4));
            if (this.owner._velocity.x < 0) {
                this.owner.invertX = true;
            }
            else {
                this.owner.invertX = false;
            }
        }
    }
    onExit() {
        return {};
    }
}
exports.default = Walk;
},{"../EnvyAI":9,"./../../Wolfie2D/DataTypes/Vec2":111,"./BossState":11}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BossStates = void 0;
const StateMachineAI_1 = require("./../Wolfie2D/AI/StateMachineAI");
const AABB_1 = require("./../Wolfie2D/DataTypes/Shapes/AABB");
const Vec2_1 = require("./../Wolfie2D/DataTypes/Vec2");
const Attack_1 = require("./GluttonyStates/Attack");
const Idle_1 = require("./GluttonyStates/Idle");
const Dying_1 = require("./GluttonyStates/Dying");
const Damage_1 = require("./GluttonyStates/Damage");
const game_enums_1 = require("../GameSystems/game_enums");
const GameEventType_1 = require("../Wolfie2D/Events/GameEventType");
class GluttonyAI extends StateMachineAI_1.default {
    constructor() {
        super(...arguments);
        /** The default movement speed of this AI */
        this.speed = 20;
        // State machine defers updates and event handling to its children
        // Check super classes for details
    }
    initializeAI(owner, options) {
        this.owner = owner;
        this.slam = options.slam;
        this.addState(BossStates.DEFAULT, new Idle_1.default(this, owner));
        this.addState(BossStates.ATTACKING, new Attack_1.default(this, owner));
        this.addState(BossStates.DAMAGE, new Damage_1.default(this, owner));
        this.addState(BossStates.DYING, new Dying_1.default(this, owner));
        this.health = options.health;
        this.player = options.player;
        // Initialize to the default state
        this.initialize(BossStates.DEFAULT);
        this.getPlayerPosition();
    }
    activate(options) {
    }
    damage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.owner.setAIActive(false, {});
            this.owner.isCollidable = false;
            if (this.currentState !== this.stateMap.get(BossStates.DYING)) {
                this.changeState(BossStates.DYING);
            }
            // this.owner.animation.play("DYING");
            // this.owner.visible = false;
        }
        else {
            this.changeState(BossStates.DAMAGE);
        }
    }
    handleEvent(event) {
        if (event.type === game_enums_1.Game_Events.GLUT_ATTACK) {
            this.slam.use(this.owner, "enemies", Vec2_1.default.ZERO);
            this.changeState(BossStates.DEFAULT);
        }
        else if (event.type === "GluttonyDeath") {
            this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "gluttony_death", loop: false, holdReference: false });
        }
    }
    getPlayerPosition() {
        let pos = this.player.position;
        // Get the new player location
        let start = this.owner.position.clone();
        let delta = pos.clone().sub(start);
        // Iterate through the tilemap region until we find a collision
        let minX = Math.min(start.x, pos.x);
        let maxX = Math.max(start.x, pos.x);
        let minY = Math.min(start.y, pos.y);
        let maxY = Math.max(start.y, pos.y);
        // Get the wall tilemap
        let walls = this.owner.getScene().getLayer("Wall").getItems()[0];
        let minIndex = walls.getColRowAt(new Vec2_1.default(minX, minY));
        let maxIndex = walls.getColRowAt(new Vec2_1.default(maxX, maxY));
        let tileSize = walls.getTileSize();
        for (let col = minIndex.x; col <= maxIndex.x; col++) {
            for (let row = minIndex.y; row <= maxIndex.y; row++) {
                if (walls.isTileCollidable(col, row)) {
                    // Get the position of this tile
                    let tilePos = new Vec2_1.default(col * tileSize.x + tileSize.x / 2, row * tileSize.y + tileSize.y / 2);
                    // Create a collider for this tile
                    let collider = new AABB_1.default(tilePos, tileSize.scaled(1 / 2));
                    let hit = collider.intersectSegment(start, delta, Vec2_1.default.ZERO);
                    if (hit !== null && start.distanceSqTo(hit.pos) < start.distanceSqTo(pos)) {
                        // We hit a wall, we can't see the player
                        return null;
                    }
                }
            }
        }
        return pos;
    }
}
exports.default = GluttonyAI;
var BossStates;
(function (BossStates) {
    BossStates["DEFAULT"] = "default";
    BossStates["DAMAGE"] = "damage";
    BossStates["ATTACKING"] = "attacking";
    BossStates["PREVIOUS"] = "previous";
    BossStates["DYING"] = "dying";
})(BossStates = exports.BossStates || (exports.BossStates = {}));
},{"../GameSystems/game_enums":80,"../Wolfie2D/Events/GameEventType":117,"./../Wolfie2D/AI/StateMachineAI":92,"./../Wolfie2D/DataTypes/Shapes/AABB":104,"./../Wolfie2D/DataTypes/Vec2":111,"./GluttonyStates/Attack":18,"./GluttonyStates/Damage":20,"./GluttonyStates/Dying":21,"./GluttonyStates/Idle":22}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const game_enums_1 = require("../../GameSystems/game_enums");
const GameEventType_1 = require("../../Wolfie2D/Events/GameEventType");
class Attack extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "gluttony_attack", loop: false, holdReference: false });
        this.owner.animation.play("ATTACK", false, game_enums_1.Game_Events.GLUT_ATTACK);
    }
    handleInput(event) { }
    update(deltaT) {
    }
    onExit() {
        return {};
    }
}
exports.default = Attack;
},{"../../GameSystems/game_enums":80,"../../Wolfie2D/Events/GameEventType":117,"./BossState":19}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const State_1 = require("./../../Wolfie2D/DataTypes/State/State");
class BossState extends State_1.default {
    constructor(parent, owner) {
        super(parent);
        this.owner = owner;
    }
}
exports.default = BossState;
},{"./../../Wolfie2D/DataTypes/State/State":108}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const GluttonyAI_1 = require("../GluttonyAI");
const GameEventType_1 = require("../../Wolfie2D/Events/GameEventType");
class Damage extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "gluttony_damage", loop: false, holdReference: false });
        this.owner.animation.play("DAMAGE", false);
    }
    handleInput(event) { }
    update(deltaT) {
        if (!this.owner.animation.isPlaying("DAMAGE")) {
            this.finished(GluttonyAI_1.BossStates.DEFAULT);
        }
    }
    onExit() {
        this.owner.animation.stop();
        return { "timer": 25 };
    }
}
exports.default = Damage;
},{"../../Wolfie2D/Events/GameEventType":117,"../GluttonyAI":17,"./BossState":19}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameEvent_1 = require("./../../Wolfie2D/Events/GameEvent");
const BossState_1 = require("./BossState");
const game_enums_1 = require("../../GameSystems/game_enums");
class Damage extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.parent.handleEvent(new GameEvent_1.default("GluttonyDeath", {}));
        this.owner.animation.play("DYING", false, game_enums_1.Game_Events.BOSS_DIED);
        // Reset the return object
        this.retObj = {};
    }
    handleInput(event) { }
    update(deltaT) {
    }
    onExit() {
        this.owner.animation.stop();
        return this.retObj;
    }
}
exports.default = Damage;
},{"../../GameSystems/game_enums":80,"./../../Wolfie2D/Events/GameEvent":116,"./BossState":19}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const GluttonyAI_1 = require("../GluttonyAI");
const Timer_1 = require("../../Wolfie2D/Timing/Timer");
class Idle extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
        this.attack_timer = new Timer_1.default(950);
    }
    onEnter(options) {
        this.owner.animation.play("IDLE", true);
        if (options.timer) {
            this.attack_timer = new Timer_1.default(options.timer);
            this.attack_timer.start();
        }
        else {
            this.attack_timer = new Timer_1.default(1000);
            this.attack_timer.pause();
        }
    }
    handleInput(event) {
    }
    update(deltaT) {
        if (this.parent.getPlayerPosition() !== null && this.attack_timer.isPaused() && this.parent.getPlayerPosition().distanceTo(this.owner.position) < 300) {
            this.attack_timer.start();
        }
        if (this.attack_timer.isStopped()) {
            this.finished(GluttonyAI_1.BossStates.ATTACKING);
        }
    }
    onExit() {
        this.owner.animation.stop();
        return this.retObj;
    }
}
exports.default = Idle;
},{"../../Wolfie2D/Timing/Timer":182,"../GluttonyAI":17,"./BossState":19}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BossStates = void 0;
const StateMachineAI_1 = require("./../Wolfie2D/AI/StateMachineAI");
const AABB_1 = require("./../Wolfie2D/DataTypes/Shapes/AABB");
const Vec2_1 = require("./../Wolfie2D/DataTypes/Vec2");
const Attack_1 = require("./GreedStates/Attack");
const Idle_1 = require("./GreedStates/Idle");
const Dying_1 = require("./GreedStates/Dying");
const Damage_1 = require("./GreedStates/Damage");
const game_enums_1 = require("../GameSystems/game_enums");
class GreedAI extends StateMachineAI_1.default {
    constructor() {
        super(...arguments);
        /** The default movement speed of this AI */
        this.speed = 0;
        // State machine defers updates and event handling to its children
        // Check super classes for details
    }
    initializeAI(owner, options) {
        this.owner = owner;
        this.addState(BossStates.DEFAULT, new Idle_1.default(this, owner));
        this.addState(BossStates.ATTACKING, new Attack_1.default(this, owner));
        this.addState(BossStates.DAMAGE, new Damage_1.default(this, owner));
        this.addState(BossStates.DYING, new Dying_1.default(this, owner));
        this.health = options.health;
        this.player = options.player;
        // Initialize to the default state
        this.initialize(BossStates.DEFAULT);
        this.getPlayerPosition();
    }
    activate(options) {
    }
    damage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.owner.setAIActive(false, {});
            this.owner.isCollidable = false;
            if (this.currentState !== this.stateMap.get(BossStates.DYING)) {
                this.changeState(BossStates.DYING);
            }
        }
        else {
            this.changeState(BossStates.DAMAGE);
        }
    }
    handleEvent(event) {
        if (event.type === game_enums_1.Game_Events.GREED_ATTACK) {
            this.changeState(BossStates.DEFAULT);
        }
    }
    getPlayerPosition() {
        let pos = this.player.position;
        // Get the new player location
        let start = this.owner.position.clone();
        let delta = pos.clone().sub(start);
        // Iterate through the tilemap region until we find a collision
        let minX = Math.min(start.x, pos.x);
        let maxX = Math.max(start.x, pos.x);
        let minY = Math.min(start.y, pos.y);
        let maxY = Math.max(start.y, pos.y);
        // Get the wall tilemap
        let walls = this.owner.getScene().getLayer("Wall").getItems()[0];
        let minIndex = walls.getColRowAt(new Vec2_1.default(minX, minY));
        let maxIndex = walls.getColRowAt(new Vec2_1.default(maxX, maxY));
        let tileSize = walls.getTileSize();
        for (let col = minIndex.x; col <= maxIndex.x; col++) {
            for (let row = minIndex.y; row <= maxIndex.y; row++) {
                if (walls.isTileCollidable(col, row)) {
                    // Get the position of this tile
                    let tilePos = new Vec2_1.default(col * tileSize.x + tileSize.x / 2, row * tileSize.y + tileSize.y / 2);
                    // Create a collider for this tile
                    let collider = new AABB_1.default(tilePos, tileSize.scaled(1 / 2));
                    let hit = collider.intersectSegment(start, delta, Vec2_1.default.ZERO);
                    if (hit !== null && start.distanceSqTo(hit.pos) < start.distanceSqTo(pos)) {
                        // We hit a wall, we can't see the player
                        return null;
                    }
                }
            }
        }
        return pos;
    }
}
exports.default = GreedAI;
var BossStates;
(function (BossStates) {
    BossStates["DEFAULT"] = "default";
    BossStates["DAMAGE"] = "damage";
    BossStates["ATTACKING"] = "attacking";
    BossStates["PREVIOUS"] = "previous";
    BossStates["DYING"] = "dying";
})(BossStates = exports.BossStates || (exports.BossStates = {}));
},{"../GameSystems/game_enums":80,"./../Wolfie2D/AI/StateMachineAI":92,"./../Wolfie2D/DataTypes/Shapes/AABB":104,"./../Wolfie2D/DataTypes/Vec2":111,"./GreedStates/Attack":24,"./GreedStates/Damage":26,"./GreedStates/Dying":27,"./GreedStates/Idle":28}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const game_enums_1 = require("../../GameSystems/game_enums");
const GameEventType_1 = require("../../Wolfie2D/Events/GameEventType");
class Attack extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "greed_attack", loop: false, holdReference: false });
        this.owner.animation.play("ATTACK", false, game_enums_1.Game_Events.GREED_ATTACK);
    }
    handleInput(event) { }
    update(deltaT) {
    }
    onExit() {
        return {};
    }
}
exports.default = Attack;
},{"../../GameSystems/game_enums":80,"../../Wolfie2D/Events/GameEventType":117,"./BossState":25}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const State_1 = require("./../../Wolfie2D/DataTypes/State/State");
class BossState extends State_1.default {
    constructor(parent, owner) {
        super(parent);
        this.owner = owner;
    }
}
exports.default = BossState;
},{"./../../Wolfie2D/DataTypes/State/State":108}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const GreedAI_1 = require("../GreedAI");
const GameEventType_1 = require("../../Wolfie2D/Events/GameEventType");
class Damage extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "greed_damage", loop: false, holdReference: false });
        this.owner.animation.play("DAMAGE", false);
    }
    handleInput(event) { }
    update(deltaT) {
        if (!this.owner.animation.isPlaying("DAMAGE")) {
            this.finished(GreedAI_1.BossStates.DEFAULT);
        }
    }
    onExit() {
        this.owner.animation.stop();
        return { "timer": 25 };
    }
}
exports.default = Damage;
},{"../../Wolfie2D/Events/GameEventType":117,"../GreedAI":23,"./BossState":25}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const game_enums_1 = require("../../GameSystems/game_enums");
const GameEventType_1 = require("../../Wolfie2D/Events/GameEventType");
class Damage extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "greed_death", loop: false, holdReference: false });
        this.owner.animation.play("DYING", false, game_enums_1.Game_Events.BOSS_DIED);
    }
    handleInput(event) { }
    update(deltaT) {
    }
    onExit() {
        this.owner.animation.stop();
        return {};
    }
}
exports.default = Damage;
},{"../../GameSystems/game_enums":80,"../../Wolfie2D/Events/GameEventType":117,"./BossState":25}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const GreedAI_1 = require("../GreedAI");
const Timer_1 = require("../../Wolfie2D/Timing/Timer");
class Idle extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
        this.attack_timer = new Timer_1.default(950);
    }
    onEnter(options) {
        this.owner.animation.play("IDLE", true);
        if (options.timer) {
            this.attack_timer = new Timer_1.default(options.timer);
            this.attack_timer.start();
        }
        else {
            this.attack_timer = new Timer_1.default(1000);
            this.attack_timer.pause();
        }
    }
    handleInput(event) {
    }
    update(deltaT) {
        if (this.parent.getPlayerPosition() !== null && this.attack_timer.isPaused() && this.parent.getPlayerPosition().distanceTo(this.owner.position) < 300) {
            this.attack_timer.start();
        }
        if (this.attack_timer.isStopped()) {
            this.finished(GreedAI_1.BossStates.ATTACKING);
        }
    }
    onExit() {
        this.owner.animation.stop();
        return this.retObj;
    }
}
exports.default = Idle;
},{"../../Wolfie2D/Timing/Timer":182,"../GreedAI":23,"./BossState":25}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnemyStates = void 0;
const StateMachineAI_1 = require("./../Wolfie2D/AI/StateMachineAI");
const AABB_1 = require("./../Wolfie2D/DataTypes/Shapes/AABB");
const Vec2_1 = require("./../Wolfie2D/DataTypes/Vec2");
const game_enums_1 = require("./../GameSystems/game_enums");
const Idle_1 = require("./HoundStates/Idle");
const TeleportStart_1 = require("./HoundStates/TeleportStart");
const TeleportEnd_1 = require("./HoundStates/TeleportEnd");
const Attack_1 = require("./HoundStates/Attack");
const Damage_1 = require("./HoundStates/Damage");
const Run_1 = require("./HoundStates/Run");
const GameEventType_1 = require("../Wolfie2D/Events/GameEventType");
class HoundAI extends StateMachineAI_1.default {
    constructor() {
        super(...arguments);
        /** The default movement speed of this AI */
        this.speed = 20;
        // State machine defers updates and event handling to its children
        // Check super classes for details
    }
    initializeAI(owner, options) {
        this.owner = owner;
        this.addState(EnemyStates.DEFAULT, new Idle_1.default(this, owner));
        this.addState(EnemyStates.TELEPORT_START, new TeleportStart_1.default(this, owner));
        this.addState(EnemyStates.TELEPORT_END, new TeleportEnd_1.default(this, owner));
        this.addState(EnemyStates.ATTACK, new Attack_1.default(this, owner));
        this.addState(EnemyStates.DAMAGE, new Damage_1.default(this, owner));
        this.addState(EnemyStates.RUN, new Run_1.default(this, owner));
        this.health = options.health;
        this.player = options.player;
        this.hitbox = options.hitbox;
        // Initialize to the default state
        this.initialize(EnemyStates.DEFAULT);
    }
    activate(options) {
    }
    damage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.owner.setAIActive(false, {});
            this.owner.isCollidable = false;
            if (!this.owner.animation.isPlaying("DYING")) {
                this.owner.removePhysics();
                this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "hound_death", loop: false, holdReference: false });
                this.owner.animation.play("DYING", false, game_enums_1.Game_Events.ENEMY_DIED);
            }
        }
        else {
            this.changeState(EnemyStates.DAMAGE);
        }
    }
    getPlayerPosition() {
        let pos = this.player.position;
        // Get the new player location
        let start = this.owner.position.clone();
        let delta = pos.clone().sub(start);
        // Iterate through the tilemap region until we find a collision
        let minX = Math.min(start.x, pos.x);
        let maxX = Math.max(start.x, pos.x);
        let minY = Math.min(start.y, pos.y);
        let maxY = Math.max(start.y, pos.y);
        // Get the wall tilemap
        let walls = this.owner.getScene().getLayer("Wall").getItems()[0];
        let minIndex = walls.getColRowAt(new Vec2_1.default(minX, minY));
        let maxIndex = walls.getColRowAt(new Vec2_1.default(maxX, maxY));
        let tileSize = walls.getTileSize();
        for (let col = minIndex.x; col <= maxIndex.x; col++) {
            for (let row = minIndex.y; row <= maxIndex.y; row++) {
                let tile_val = walls.getTileAtRowCol(new Vec2_1.default(col, row));
                if (tile_val === 18 || tile_val === 19 || tile_val === 44 || tile_val === 45) {
                    // Get the position of this tile
                    let tilePos = new Vec2_1.default(col * tileSize.x + tileSize.x / 2, row * tileSize.y + tileSize.y / 2);
                    // Create a collider for this tile
                    let collider = new AABB_1.default(tilePos, tileSize.scaled(1 / 2));
                    let hit = collider.intersectSegment(start, delta, Vec2_1.default.ZERO);
                    if (hit !== null && start.distanceSqTo(hit.pos) < start.distanceSqTo(pos)) {
                        // We hit a wall, we can't see the player
                        return null;
                    }
                }
            }
        }
        return pos;
    }
}
exports.default = HoundAI;
var EnemyStates;
(function (EnemyStates) {
    EnemyStates["DEFAULT"] = "default";
    EnemyStates["ATTACK"] = "attack";
    EnemyStates["DAMAGE"] = "damage";
    EnemyStates["TELEPORT_START"] = "teleportStart";
    EnemyStates["TELEPORT_END"] = "teleportEnd";
    EnemyStates["RUN"] = "run";
    EnemyStates["PREVIOUS"] = "previous";
})(EnemyStates = exports.EnemyStates || (exports.EnemyStates = {}));
},{"../Wolfie2D/Events/GameEventType":117,"./../GameSystems/game_enums":80,"./../Wolfie2D/AI/StateMachineAI":92,"./../Wolfie2D/DataTypes/Shapes/AABB":104,"./../Wolfie2D/DataTypes/Vec2":111,"./HoundStates/Attack":30,"./HoundStates/Damage":31,"./HoundStates/Idle":33,"./HoundStates/Run":34,"./HoundStates/TeleportEnd":35,"./HoundStates/TeleportStart":36}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("./../../Wolfie2D/DataTypes/Vec2");
const HoundAI_1 = require("../HoundAI");
const EnemyState_1 = require("./EnemyState");
class TeleportStart extends EnemyState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.owner.animation.play("ATTACK", true);
    }
    handleInput(event) { }
    update(deltaT) {
        // update last player position
        if (this.parent.getPlayerPosition() !== null && this.parent.getPlayerPosition() !== undefined) {
            this.lastPlayerPos = new Vec2_1.default(this.parent.getPlayerPosition().x, this.parent.getPlayerPosition().y);
        }
        else {
            this.finished(HoundAI_1.EnemyStates.DEFAULT);
        }
        // if can't see player go idle
        if (this.lastPlayerPos === null) {
            this.finished(HoundAI_1.EnemyStates.DEFAULT);
        }
        else if (this.owner.position.distanceTo(this.lastPlayerPos) > 32 * 8) {
            this.finished(HoundAI_1.EnemyStates.DEFAULT);
        }
        // flip if player on left of hound
        this.owner.invertX = this.lastPlayerPos.x < this.owner.position.x;
        // if player is too far, run/teleport
        if (this.owner.position.distanceTo(this.lastPlayerPos) > 32 * 6) {
            this.finished(HoundAI_1.EnemyStates.TELEPORT_START);
        }
        else if (this.owner.position.distanceTo(this.lastPlayerPos) > 32 * 1) {
            this.finished(HoundAI_1.EnemyStates.RUN);
        }
    }
    onExit() {
        return {};
    }
}
exports.default = TeleportStart;
},{"../HoundAI":29,"./../../Wolfie2D/DataTypes/Vec2":111,"./EnemyState":32}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HoundAI_1 = require("../HoundAI");
const EnemyState_1 = require("./EnemyState");
const GameEventType_1 = require("../../Wolfie2D/Events/GameEventType");
class Damage extends EnemyState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "hound_damage", loop: false, holdReference: false });
        this.owner.animation.play("DAMAGE", false);
        this.lastPlayerPos = this.parent.getPlayerPosition();
    }
    handleInput(event) {
    }
    update(deltaT) {
        if (this.lastPlayerPos !== null) {
            this.owner.move(this.owner.position.dirTo(this.lastPlayerPos).scale(-1));
        }
        if (!this.owner.animation.isPlaying("DAMAGE")) {
            let playerPos = this.parent.getPlayerPosition();
            if (playerPos !== null && this.owner.position.distanceTo(playerPos) <= 32 * 8) {
                if (this.owner.position.distanceTo(this.parent.getPlayerPosition()) > 32 * 6) {
                    this.finished(HoundAI_1.EnemyStates.TELEPORT_START);
                }
                else {
                    this.finished(HoundAI_1.EnemyStates.RUN);
                }
            }
            else {
                this.finished(HoundAI_1.EnemyStates.DEFAULT);
            }
        }
    }
    onExit() {
        this.owner.animation.stop();
        return {};
    }
}
exports.default = Damage;
},{"../../Wolfie2D/Events/GameEventType":117,"../HoundAI":29,"./EnemyState":32}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const State_1 = require("./../../Wolfie2D/DataTypes/State/State");
class EnemyState extends State_1.default {
    constructor(parent, owner) {
        super(parent);
        this.owner = owner;
    }
}
exports.default = EnemyState;
},{"./../../Wolfie2D/DataTypes/State/State":108}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HoundAI_1 = require("../HoundAI");
const EnemyState_1 = require("./EnemyState");
class Idle extends EnemyState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.owner.animation.play("IDLE", true);
    }
    handleInput(event) {
    }
    update(deltaT) {
        if (this.parent.getPlayerPosition() !== null && this.parent.getPlayerPosition() !== undefined && this.owner.position.distanceTo(this.parent.getPlayerPosition()) <= 32 * 8) {
            if (this.owner.position.distanceTo(this.parent.getPlayerPosition()) > 32 * 6) {
                this.finished(HoundAI_1.EnemyStates.TELEPORT_START);
            }
            else {
                this.finished(HoundAI_1.EnemyStates.RUN);
            }
        }
    }
    onExit() {
        this.owner.animation.stop();
        return {};
    }
}
exports.default = Idle;
},{"../HoundAI":29,"./EnemyState":32}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("./../../Wolfie2D/DataTypes/Vec2");
const HoundAI_1 = require("../HoundAI");
const EnemyState_1 = require("./EnemyState");
class TeleportStart extends EnemyState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.owner.animation.play("RUN", true);
    }
    handleInput(event) { }
    update(deltaT) {
        // update last player position
        if (this.parent.getPlayerPosition() !== null && this.parent.getPlayerPosition() !== undefined) {
            this.lastPlayerPos = new Vec2_1.default(this.parent.getPlayerPosition().x, this.parent.getPlayerPosition().y);
        }
        else {
            this.finished(HoundAI_1.EnemyStates.DEFAULT);
        }
        // if can't see player go idle
        if (this.lastPlayerPos === null) {
            this.finished(HoundAI_1.EnemyStates.DEFAULT);
        }
        else if (this.owner.position.distanceTo(this.lastPlayerPos) > 32 * 8) {
            this.finished(HoundAI_1.EnemyStates.DEFAULT);
        }
        // flip if player on left of hound
        this.owner.invertX = this.lastPlayerPos.x < this.owner.position.x;
        // if player is too far, run/teleport
        if (this.owner.position.distanceTo(this.lastPlayerPos) > 32 * 6) {
            this.finished(HoundAI_1.EnemyStates.TELEPORT_START);
        }
        else if (this.owner.position.distanceTo(this.lastPlayerPos) > 32 * .5) {
            this.owner.move(this.owner.position.dirTo(this.lastPlayerPos).scale(2));
        }
        else {
            this.finished(HoundAI_1.EnemyStates.ATTACK);
        }
    }
    onExit() {
        return {};
    }
}
exports.default = TeleportStart;
},{"../HoundAI":29,"./../../Wolfie2D/DataTypes/Vec2":111,"./EnemyState":32}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HoundAI_1 = require("../HoundAI");
const EnemyState_1 = require("./EnemyState");
const game_enums_1 = require("../../GameSystems/game_enums");
class TeleportEnd extends EnemyState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.owner.animation.play("EMERGE", false, game_enums_1.Game_Events.HELLHOUND_TP_START);
    }
    handleInput(event) { }
    update(deltaT) {
        if (!this.owner.animation.isPlaying("EMERGE")) {
            this.finished(HoundAI_1.EnemyStates.DEFAULT);
        }
    }
    onExit() {
        this.owner.removePhysics();
        this.owner.addPhysics(this.parent.hitbox);
        this.owner.setGroup("enemy");
        this.owner.setTrigger("player", game_enums_1.Game_Events.ENEMY_COLLISION, "hound hit player");
        return {};
    }
}
exports.default = TeleportEnd;
},{"../../GameSystems/game_enums":80,"../HoundAI":29,"./EnemyState":32}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("./../../Wolfie2D/DataTypes/Vec2");
const HoundAI_1 = require("../HoundAI");
const EnemyState_1 = require("./EnemyState");
const game_enums_1 = require("../../GameSystems/game_enums");
const AABB_1 = require("../../Wolfie2D/DataTypes/Shapes/AABB");
class TeleportStart extends EnemyState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.owner.animation.play("SINK", false, game_enums_1.Game_Events.HELLHOUND_TP_START);
        this.lastPlayerPos = this.parent.player.position;
    }
    handleInput(event) { }
    update(deltaT) {
        if (!this.owner.animation.isPlaying("SINK")) {
            this.finished(HoundAI_1.EnemyStates.TELEPORT_END);
        }
        if (this.parent.getPlayerPosition() === null) {
            this.finished(HoundAI_1.EnemyStates.DEFAULT);
        }
    }
    onExit() {
        this.owner.removePhysics();
        this.owner.addPhysics(new AABB_1.default(Vec2_1.default.ZERO, new Vec2_1.default(1, 1)), new Vec2_1.default(500, 500));
        this.owner.setGroup("wall");
        this.owner.position = new Vec2_1.default(this.lastPlayerPos.x, this.lastPlayerPos.y);
        return {};
    }
}
exports.default = TeleportStart;
},{"../../GameSystems/game_enums":80,"../../Wolfie2D/DataTypes/Shapes/AABB":104,"../HoundAI":29,"./../../Wolfie2D/DataTypes/Vec2":111,"./EnemyState":32}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BossStates = void 0;
const StateMachineAI_1 = require("./../Wolfie2D/AI/StateMachineAI");
const AABB_1 = require("./../Wolfie2D/DataTypes/Shapes/AABB");
const Vec2_1 = require("./../Wolfie2D/DataTypes/Vec2");
const Dying_1 = require("./LustStates/Dying");
const Idle_1 = require("./LustStates/Idle");
const Attack_1 = require("./LustStates/Attack");
const Damaged_1 = require("./LustStates/Damaged");
class LustAI extends StateMachineAI_1.default {
    constructor() {
        super(...arguments);
        /** The default movement speed of this AI */
        this.speed = 20;
        // State machine defers updates and event handling to its children
        // Check super classes for details
    }
    // update(deltaT: number): void {
    //     console.log("BAT HERE");
    // }
    initializeAI(owner, options) {
        this.owner = owner;
        this.addState(BossStates.DEFAULT, new Idle_1.default(this, owner));
        this.addState(BossStates.DYING, new Dying_1.default(this, owner));
        this.addState(BossStates.DAMAGED, new Damaged_1.default(this, owner));
        this.addState(BossStates.ATTACKING, new Attack_1.default(this, owner));
        this.health = options.health;
        this.player = options.player;
        // Initialize to the default state
        this.initialize(BossStates.DEFAULT);
    }
    activate(options) {
    }
    damage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.owner.setAIActive(false, {});
            this.owner.isCollidable = false;
            if (this.currentState !== this.stateMap.get(BossStates.DYING)) {
                this.changeState(BossStates.DYING);
            }
        }
        else {
            this.changeState(BossStates.DAMAGED);
        }
    }
    getPlayerPosition() {
        let pos = this.player.position;
        // Get the new player location
        let start = this.owner.position.clone();
        let delta = pos.clone().sub(start);
        // Iterate through the tilemap region until we find a collision
        let minX = Math.min(start.x, pos.x);
        let maxX = Math.max(start.x, pos.x);
        let minY = Math.min(start.y, pos.y);
        let maxY = Math.max(start.y, pos.y);
        // Get the wall tilemap
        let walls = this.owner.getScene().getLayer("Wall").getItems()[0];
        let minIndex = walls.getColRowAt(new Vec2_1.default(minX, minY));
        let maxIndex = walls.getColRowAt(new Vec2_1.default(maxX, maxY));
        let tileSize = walls.getTileSize();
        for (let col = minIndex.x; col <= maxIndex.x; col++) {
            for (let row = minIndex.y; row <= maxIndex.y; row++) {
                let tile_val = walls.getTileAtRowCol(new Vec2_1.default(col, row));
                if (tile_val === 18 || tile_val === 19 || tile_val === 44 || tile_val === 45) {
                    // Get the position of this tile
                    let tilePos = new Vec2_1.default(col * tileSize.x + tileSize.x / 2, row * tileSize.y + tileSize.y / 2);
                    // Create a collider for this tile
                    let collider = new AABB_1.default(tilePos, tileSize.scaled(1 / 2));
                    let hit = collider.intersectSegment(start, delta, Vec2_1.default.ZERO);
                    if (hit !== null && start.distanceSqTo(hit.pos) < start.distanceSqTo(pos)) {
                        // We hit a wall, we can't see the player
                        return null;
                    }
                }
            }
        }
        return pos;
    }
}
exports.default = LustAI;
var BossStates;
(function (BossStates) {
    BossStates["DEFAULT"] = "default";
    BossStates["DAMAGED"] = "damaged";
    BossStates["PREVIOUS"] = "previous";
    BossStates["DYING"] = "dying";
    BossStates["ATTACKING"] = "attacking";
})(BossStates = exports.BossStates || (exports.BossStates = {}));
},{"./../Wolfie2D/AI/StateMachineAI":92,"./../Wolfie2D/DataTypes/Shapes/AABB":104,"./../Wolfie2D/DataTypes/Vec2":111,"./LustStates/Attack":38,"./LustStates/Damaged":40,"./LustStates/Dying":41,"./LustStates/Idle":42}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("./../../Wolfie2D/DataTypes/Vec2");
const Timer_1 = require("./../../Wolfie2D/Timing/Timer");
const BossState_1 = require("./BossState");
const GameEventType_1 = require("../../Wolfie2D/Events/GameEventType");
class Attack extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
        this.soundTimer = new Timer_1.default(3000);
    }
    onEnter(options) {
        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "lust_move", loop: false, holdReference: false });
        this.soundTimer.start();
        this.lastPlayerPos = new Vec2_1.default(this.parent.getPlayerPosition().x, this.parent.getPlayerPosition().y);
    }
    handleInput(event) { }
    update(deltaT) {
        if (this.soundTimer.isStopped()) {
            this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "lust_move", loop: false, holdReference: false });
            this.soundTimer.start();
        }
        if (this.parent.getPlayerPosition() !== null) {
            this.lastPlayerPos = new Vec2_1.default(this.parent.getPlayerPosition().x, this.parent.getPlayerPosition().y);
            // Player is visible, restart the exitTimer
            this.owner.move(this.owner.position.dirTo(this.lastPlayerPos).scale(2));
            if (Math.abs(this.owner._velocity.x) > Math.abs(this.owner._velocity.y)) {
                this.owner.animation.playIfNotAlready("WALK_RL", true);
                if (this.owner._velocity.x < 0) {
                    this.owner.invertX = true;
                }
                else {
                    this.owner.invertX = false;
                }
            }
            else {
                if (this.owner._velocity.y > 0) {
                    this.owner.animation.playIfNotAlready("WALK_DOWN", true);
                }
                else {
                    this.owner.animation.playIfNotAlready("WALK_UP", true);
                }
            }
        }
    }
    onExit() {
        return {};
    }
}
exports.default = Attack;
},{"../../Wolfie2D/Events/GameEventType":117,"./../../Wolfie2D/DataTypes/Vec2":111,"./../../Wolfie2D/Timing/Timer":182,"./BossState":39}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const State_1 = require("./../../Wolfie2D/DataTypes/State/State");
class BossState extends State_1.default {
    constructor(parent, owner) {
        super(parent);
        this.owner = owner;
    }
}
exports.default = BossState;
},{"./../../Wolfie2D/DataTypes/State/State":108}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const LustAI_1 = require("../LustAI");
const GameEventType_1 = require("../../Wolfie2D/Events/GameEventType");
class Damaged extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "lust_damage", loop: false, holdReference: false });
        this.owner.animation.play("DAMAGE", false);
        // Reset the return object
        this.retObj = {};
    }
    handleInput(event) { }
    update(deltaT) {
        if (!this.owner.animation.isPlaying("DAMAGE")) {
            this.finished(LustAI_1.BossStates.DEFAULT);
        }
    }
    onExit() {
        this.owner.animation.stop();
        return this.retObj;
    }
}
exports.default = Damaged;
},{"../../Wolfie2D/Events/GameEventType":117,"../LustAI":37,"./BossState":39}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const GameEventType_1 = require("../../Wolfie2D/Events/GameEventType");
const game_enums_1 = require("../../GameSystems/game_enums");
class Damage extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "lust_death", loop: false, holdReference: false });
        this.owner.animation.play("DYING", false, game_enums_1.Game_Events.BOSS_DIED);
    }
    handleInput(event) { }
    update(deltaT) {
    }
    onExit() {
        this.owner.animation.stop();
        return {};
    }
}
exports.default = Damage;
},{"../../GameSystems/game_enums":80,"../../Wolfie2D/Events/GameEventType":117,"./BossState":39}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const LustAI_1 = require("../LustAI");
const Timer_1 = require("../../Wolfie2D/Timing/Timer");
class Idle extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
        this.attack_timer = new Timer_1.default(950);
    }
    onEnter(options) {
        this.owner.animation.play("IDLE", true);
        this.attack_timer.pause();
    }
    handleInput(event) {
    }
    update(deltaT) {
        if (this.parent.getPlayerPosition() !== null && this.owner.position.distanceTo(this.parent.getPlayerPosition()) < 200) {
            this.finished(LustAI_1.BossStates.ATTACKING);
        }
    }
    onExit() {
        this.owner.animation.stop();
        return this.retObj;
    }
}
exports.default = Idle;
},{"../../Wolfie2D/Timing/Timer":182,"../LustAI":37,"./BossState":39}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerStates = void 0;
const StateMachineAI_1 = require("../Wolfie2D/AI/StateMachineAI");
const Vec2_1 = require("../Wolfie2D/DataTypes/Vec2");
const Emitter_1 = require("../Wolfie2D/Events/Emitter");
const game_enums_1 = require("../GameSystems/game_enums");
const Idle_1 = require("./PlayerStates/Idle");
const Walk_1 = require("./PlayerStates/Walk");
const Attack_1 = require("./PlayerStates/Attack");
const Damage_1 = require("./PlayerStates/Damage");
const Dying_1 = require("./PlayerStates/Dying");
const Debug_1 = require("../Wolfie2D/Debug/Debug");
var PlayerStates;
(function (PlayerStates) {
    PlayerStates["IDLE"] = "idle";
    PlayerStates["WALK"] = "walk";
    PlayerStates["ATTACK"] = "attack";
    PlayerStates["DAMAGE"] = "damage";
    PlayerStates["DYING"] = "dying";
})(PlayerStates = exports.PlayerStates || (exports.PlayerStates = {}));
class PlayerController extends StateMachineAI_1.default {
    initializeAI(owner, options) {
        this.owner = owner;
        this.direction = Vec2_1.default.ZERO;
        this.curr_velocity = Vec2_1.default.ZERO; // for use with slippery movement
        this.attack_direction = Vec2_1.default.ZERO;
        this.speed = options.speed;
        this.emitter = new Emitter_1.default();
        this.health_sprites = options.health_sprites;
        this.health = options.health;
        this.coins = options.coins;
        this.slippery = options.slippery !== undefined ? options.slippery : false;
        this.fists = options.fists;
        this.invincible_cheat = false;
        this.invincible = false;
        this.player_damage = options.damage;
        this.invincible_cheat_label = options.invincible_cheat_label;
        // initialize states
        this.addState(PlayerStates.IDLE, new Idle_1.default(this, this.owner));
        this.addState(PlayerStates.WALK, new Walk_1.default(this, this.owner));
        this.addState(PlayerStates.DAMAGE, new Damage_1.default(this, this.owner));
        this.addState(PlayerStates.ATTACK, new Attack_1.default(this, this.owner));
        this.addState(PlayerStates.DYING, new Dying_1.default(this, this.owner));
        this.initialize(PlayerStates.IDLE);
    }
    changeState(stateName) {
        super.changeState(stateName);
    }
    activate(options) { }
    handleEvent(event) {
        if (event.type === game_enums_1.Game_Events.ENEMY_COLLISION) {
            // take 1 damage
            this.damage(1);
            this.invincible = true;
        }
        else if (event.type === game_enums_1.Game_Events.BOSS_COLLISION) {
            // take 1 damage
            this.damage(1);
            this.invincible = true;
        }
        else if (event.type === game_enums_1.Game_Events.IFRAMES_OVER) {
            this.invincible = false;
            this.changeState(PlayerStates.WALK);
        }
        else if (event.type === game_enums_1.Game_Events.ATTACK_OVER) {
            this.changeState(PlayerStates.WALK);
        }
        else if (event.type === game_enums_1.Game_Events.GET_COIN) {
            if (event.data.get("coin_hurt") === "true") {
                this.damage(1);
            }
            this.coins++;
        }
        else if (event.type === game_enums_1.Game_Events.BOUGHT_HEART) {
            this.health++;
            this.coins -= 5;
        }
        else if (event.type === game_enums_1.Game_Events.BOUGHT_DAMAGE) {
            this.player_damage++;
        }
    }
    update(deltaT) {
        Debug_1.default.log("Position:", Math.round(this.owner.position.x) + ", " + Math.round(this.owner.position.y));
        super.update(deltaT);
    }
    damage(damage) {
        if (!this.invincible && !this.invincible_cheat) {
            this.health -= damage;
            if (this.health <= 0) {
                if (this.currentState !== this.stateMap.get(PlayerStates.DYING)) {
                    this.health_sprites[this.health_sprites.length - 1].getLayer().removeNode(this.health_sprites[this.health_sprites.length - 1]);
                    this.health_sprites.splice(this.health_sprites.length - 1, 1);
                    this.changeState(PlayerStates.DYING);
                }
            }
            else {
                this.changeState(PlayerStates.DAMAGE);
                this.health_sprites[this.health_sprites.length - 1].getLayer().removeNode(this.health_sprites[this.health_sprites.length - 1]);
                this.health_sprites.splice(this.health_sprites.length - 1, 1);
                this.invincible = true;
            }
        }
    }
    destroy() {
        delete this.owner;
    }
}
exports.default = PlayerController;
},{"../GameSystems/game_enums":80,"../Wolfie2D/AI/StateMachineAI":92,"../Wolfie2D/DataTypes/Vec2":111,"../Wolfie2D/Debug/Debug":112,"../Wolfie2D/Events/Emitter":114,"./PlayerStates/Attack":44,"./PlayerStates/Damage":45,"./PlayerStates/Dying":46,"./PlayerStates/Idle":47,"./PlayerStates/Walk":49}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_enums_1 = require("../../GameSystems/game_enums");
const GameEventType_1 = require("../../Wolfie2D/Events/GameEventType");
const PlayerController_1 = require("../PlayerController");
const PlayerState_1 = require("./PlayerState");
class Attack extends PlayerState_1.default {
    onEnter(options) {
        // console.log("enter attack");
        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "zara_punch", loop: false, holdReference: false });
        this.owner.animation.play("ATTACK", false, game_enums_1.Game_Events.ATTACK_OVER);
    }
    handleInput(event) {
        if (event.type === game_enums_1.Game_Events.ATTACK_OVER) {
            this.finished(PlayerController_1.PlayerStates.WALK);
        }
    }
    update(deltaT) {
        if (!this.owner.frozen) {
            // normal movement should continue during attacking state
            let dir = this.getInputDirection();
            if (this.parent.slippery) {
                // slippery movement
                if (dir.x !== 0) {
                    this.parent.curr_velocity.x += dir.normalized().scale(this.parent.speed * deltaT).x / 20;
                }
                else {
                    this.parent.curr_velocity.x -= this.parent.curr_velocity.normalized().scale(this.parent.speed * deltaT).x / 40;
                }
                if (dir.y !== 0) {
                    this.parent.curr_velocity.y += dir.normalized().scale(this.parent.speed * deltaT).y / 20;
                }
                else {
                    this.parent.curr_velocity.y -= this.parent.curr_velocity.normalized().scale(this.parent.speed * deltaT).y / 40;
                }
                if (this.parent.curr_velocity.mag() > 3) {
                    this.parent.curr_velocity = this.parent.curr_velocity.normalized().scale(3);
                }
            }
            else {
                // normal movement
                this.parent.curr_velocity = dir.normalized().scale(this.parent.speed * deltaT);
            }
        }
        super.update(deltaT);
    }
    onExit() {
        // console.log("exit attack");
        this.owner.animation.stop();
        return {};
    }
}
exports.default = Attack;
},{"../../GameSystems/game_enums":80,"../../Wolfie2D/Events/GameEventType":117,"../PlayerController":43,"./PlayerState":48}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_enums_1 = require("../../GameSystems/game_enums");
const GameEventType_1 = require("../../Wolfie2D/Events/GameEventType");
const Input_1 = require("../../Wolfie2D/Input/Input");
const PlayerController_1 = require("../PlayerController");
const PlayerState_1 = require("./PlayerState");
class Damage extends PlayerState_1.default {
    onEnter(options) {
        // console.log("enter damage");
        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "zara_damage", loop: false, holdReference: false });
        this.owner.animation.play("DAMAGE", false, game_enums_1.Game_Events.IFRAMES_OVER);
    }
    handleInput(event) { }
    update(deltaT) {
        if (!this.owner.frozen) {
            // have player face mouse
            let mouse_position = Input_1.default.getGlobalMousePosition();
            if (mouse_position.x < this.owner.position.x) {
                this.owner.invertX = true;
            }
            else {
                this.owner.invertX = false;
            }
            // punch attack
            if (Input_1.default.isMouseJustPressed()) {
                let attack_success;
                if (this.parent.player_damage === 1) {
                    attack_success = this.parent.fists[0].use(this.owner, "player", this.parent.attack_direction);
                }
                else if (this.parent.player_damage === 2) {
                    attack_success = this.parent.fists[1].use(this.owner, "player", this.parent.attack_direction);
                }
                else {
                    attack_success = this.parent.fists[2].use(this.owner, "player", this.parent.attack_direction);
                }
                if (attack_success) {
                    this.finished(PlayerController_1.PlayerStates.ATTACK);
                }
            }
            // normal movement should continue during attacking state
            let dir = this.getInputDirection();
            if (this.parent.slippery) {
                // slippery movement
                if (dir.x !== 0) {
                    this.parent.curr_velocity.x += dir.normalized().scale(this.parent.speed * deltaT).x / 20;
                }
                else {
                    this.parent.curr_velocity.x -= this.parent.curr_velocity.normalized().scale(this.parent.speed * deltaT).x / 40;
                }
                if (dir.y !== 0) {
                    this.parent.curr_velocity.y += dir.normalized().scale(this.parent.speed * deltaT).y / 20;
                }
                else {
                    this.parent.curr_velocity.y -= this.parent.curr_velocity.normalized().scale(this.parent.speed * deltaT).y / 40;
                }
                if (this.parent.curr_velocity.mag() > 3) {
                    this.parent.curr_velocity = this.parent.curr_velocity.normalized().scale(3);
                }
            }
            else {
                // normal movement
                this.parent.curr_velocity = dir.normalized().scale(this.parent.speed * deltaT);
            }
        }
        super.update(deltaT);
    }
    onExit() {
        // console.log("exit damage");
        this.owner.animation.stop();
        return {};
    }
}
exports.default = Damage;
},{"../../GameSystems/game_enums":80,"../../Wolfie2D/Events/GameEventType":117,"../../Wolfie2D/Input/Input":119,"../PlayerController":43,"./PlayerState":48}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_enums_1 = require("../../GameSystems/game_enums");
const GameEventType_1 = require("../../Wolfie2D/Events/GameEventType");
const PlayerState_1 = require("./PlayerState");
class Dying extends PlayerState_1.default {
    onEnter(options) {
        // console.log("enter damage");
        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "zara_death", loop: false, holdReference: false });
        this.owner.animation.play("DYING", false, game_enums_1.Game_Events.GAME_OVER);
    }
    handleInput(event) { }
    update(deltaT) {
    }
    onExit() {
        // console.log("exit damage");
        this.owner.animation.stop();
        return {};
    }
}
exports.default = Dying;
},{"../../GameSystems/game_enums":80,"../../Wolfie2D/Events/GameEventType":117,"./PlayerState":48}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Input_1 = require("../../Wolfie2D/Input/Input");
const PlayerController_1 = require("../PlayerController");
const PlayerState_1 = require("./PlayerState");
const Vec2_1 = require("../../Wolfie2D/DataTypes/Vec2");
class Idle extends PlayerState_1.default {
    onEnter(options) {
        // console.log("enter idle");
        this.owner.animation.play("IDLE", true);
        // if not slippery velocity should be zero for this state
        if (!this.parent.slippery) {
            this.parent.curr_velocity = Vec2_1.default.ZERO;
        }
    }
    handleInput(event) { }
    update(deltaT) {
        if (!this.owner.frozen) {
            // have player face left or right
            let mouse_position = Input_1.default.getGlobalMousePosition();
            if (mouse_position.x < this.owner.position.x) {
                this.owner.invertX = true;
            }
            else {
                this.owner.invertX = false;
            }
            // punch attack
            if (Input_1.default.isMouseJustPressed()) {
                let attack_success;
                if (this.parent.player_damage === 1) {
                    attack_success = this.parent.fists[0].use(this.owner, "player", this.parent.attack_direction);
                }
                else if (this.parent.player_damage === 2) {
                    attack_success = this.parent.fists[1].use(this.owner, "player", this.parent.attack_direction);
                }
                else {
                    attack_success = this.parent.fists[2].use(this.owner, "player", this.parent.attack_direction);
                }
                if (attack_success) {
                    this.finished(PlayerController_1.PlayerStates.ATTACK);
                }
            }
            let dir = this.getInputDirection();
            if (!dir.isZero()) {
                this.finished(PlayerController_1.PlayerStates.WALK);
            }
            if (this.parent.slippery) {
                // slide a bit
                if (Math.abs(this.parent.curr_velocity.x) > 0) {
                    this.parent.curr_velocity.x -= this.parent.curr_velocity.normalized().scale(this.parent.speed * deltaT).x / 40;
                }
                if (Math.abs(this.parent.curr_velocity.y) > 0) {
                    this.parent.curr_velocity.y -= this.parent.curr_velocity.normalized().scale(this.parent.speed * deltaT).y / 40;
                }
                // make sure the player comes to a complete stop
                if (Math.abs(this.parent.curr_velocity.x) < .05) {
                    this.parent.curr_velocity.x = 0;
                }
                if (Math.abs(this.parent.curr_velocity.y) < .05) {
                    this.parent.curr_velocity.y = 0;
                }
            }
        }
        super.update(deltaT);
    }
    onExit() {
        // console.log("exit idle");
        this.owner.animation.stop();
        return {};
    }
}
exports.default = Idle;
},{"../../Wolfie2D/DataTypes/Vec2":111,"../../Wolfie2D/Input/Input":119,"../PlayerController":43,"./PlayerState":48}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const State_1 = require("../../Wolfie2D/DataTypes/State/State");
const Vec2_1 = require("../../Wolfie2D/DataTypes/Vec2");
const Input_1 = require("../../Wolfie2D/Input/Input");
const game_enums_1 = require("../../GameSystems/game_enums");
class PlayerState extends State_1.default {
    constructor(parent, owner) {
        super(parent);
        this.owner = owner;
    }
    getInputDirection() {
        let direction = Vec2_1.default.ZERO;
        direction.x = (Input_1.default.isPressed("left") ? -1 : 0) + (Input_1.default.isPressed("right") ? 1 : 0);
        direction.y = (Input_1.default.isPressed("up") ? -1 : 0) + (Input_1.default.isPressed("down") ? 1 : 0);
        return direction;
    }
    update(deltaT) {
        if (!this.owner.frozen) {
            // do movement
            this.owner.move(this.parent.curr_velocity);
        }
        // Get the unit vector in the attack direction
        this.parent.attack_direction = this.owner.position.dirTo(Input_1.default.getGlobalMousePosition());
        // update rotation for attacking
        this.owner.attack_direction = Vec2_1.default.UP.angleToCCW(this.parent.attack_direction);
        // invincible cheat for play testing ##CHEAT##
        if (Input_1.default.isJustPressed("invincible")) {
            this.parent.invincible_cheat = !this.parent.invincible_cheat;
            this.parent.invincible_cheat_label.visible = this.parent.invincible_cheat;
        }
        // pause functionality
        if (Input_1.default.isJustPressed("pause")) {
            if (this.owner.getScene().getLayer("Pause").isHidden()) {
                this.emitter.fireEvent(game_enums_1.Game_Events.ON_PAUSE);
            }
            else {
                this.emitter.fireEvent(game_enums_1.Game_Events.ON_UNPAUSE);
            }
        }
    }
}
exports.default = PlayerState;
},{"../../GameSystems/game_enums":80,"../../Wolfie2D/DataTypes/State/State":108,"../../Wolfie2D/DataTypes/Vec2":111,"../../Wolfie2D/Input/Input":119}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Input_1 = require("../../Wolfie2D/Input/Input");
const PlayerController_1 = require("../PlayerController");
const PlayerState_1 = require("./PlayerState");
class Walk extends PlayerState_1.default {
    onEnter(options) {
        // console.log("enter walk");
        this.owner.animation.play("WALK", true);
    }
    handleInput(event) { }
    update(deltaT) {
        if (!this.owner.frozen) {
            this.owner.moving = true;
            // have player face mouse
            let mouse_position = Input_1.default.getGlobalMousePosition();
            if (mouse_position.x < this.owner.position.x) {
                this.owner.invertX = true;
            }
            else {
                this.owner.invertX = false;
            }
            // punch attack
            if (Input_1.default.isMouseJustPressed()) {
                let attack_success;
                if (this.parent.player_damage === 1) {
                    attack_success = this.parent.fists[0].use(this.owner, "player", this.parent.attack_direction);
                }
                else if (this.parent.player_damage === 2) {
                    attack_success = this.parent.fists[1].use(this.owner, "player", this.parent.attack_direction);
                }
                else {
                    attack_success = this.parent.fists[2].use(this.owner, "player", this.parent.attack_direction);
                }
                if (attack_success) {
                    this.finished(PlayerController_1.PlayerStates.ATTACK);
                }
            }
            let dir = this.getInputDirection();
            if (dir.isZero()) {
                this.finished(PlayerController_1.PlayerStates.IDLE);
            }
            if (this.parent.slippery) {
                // slippery movement
                if (dir.x !== 0) {
                    this.parent.curr_velocity.x += dir.normalized().scale(this.parent.speed * deltaT).x / 20;
                }
                else {
                    this.parent.curr_velocity.x -= this.parent.curr_velocity.normalized().scale(this.parent.speed * deltaT).x / 40;
                }
                if (dir.y !== 0) {
                    this.parent.curr_velocity.y += dir.normalized().scale(this.parent.speed * deltaT).y / 20;
                }
                else {
                    this.parent.curr_velocity.y -= this.parent.curr_velocity.normalized().scale(this.parent.speed * deltaT).y / 40;
                }
                if (this.parent.curr_velocity.mag() > 3) {
                    this.parent.curr_velocity = this.parent.curr_velocity.normalized().scale(3);
                }
            }
            else {
                // normal movement
                this.parent.curr_velocity = dir.normalized().scale(this.parent.speed * deltaT);
            }
        }
        super.update(deltaT);
    }
    onExit() {
        this.owner.moving = false;
        // console.log("exit walk");
        this.owner.animation.stop();
        return {};
    }
}
exports.default = Walk;
},{"../../Wolfie2D/Input/Input":119,"../PlayerController":43,"./PlayerState":48}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BossStates = void 0;
const StateMachineAI_1 = require("./../Wolfie2D/AI/StateMachineAI");
const AABB_1 = require("./../Wolfie2D/DataTypes/Shapes/AABB");
const Vec2_1 = require("./../Wolfie2D/DataTypes/Vec2");
const Idle_1 = require("./SlothStates/Idle");
const Damage_1 = require("./SlothStates/Damage");
const Dying_1 = require("./SlothStates/Dying");
const Fall_1 = require("./SlothStates/Fall");
const MovingShadow_1 = require("./SlothStates/MovingShadow");
const TossUp_1 = require("./SlothStates/TossUp");
const Walk_1 = require("./SlothStates/Walk");
class SlothAI extends StateMachineAI_1.default {
    constructor() {
        super(...arguments);
        /** The default movement speed of this AI */
        this.speed = 20;
        // State machine defers updates and event handling to its children
        // Check super classes for details
    }
    initializeAI(owner, options) {
        this.owner = owner;
        this.addState(BossStates.DEFAULT, new Idle_1.default(this, owner));
        this.addState(BossStates.DAMAGE, new Damage_1.default(this, owner));
        this.addState(BossStates.DYING, new Dying_1.default(this, owner));
        this.addState(BossStates.FALL, new Fall_1.default(this, owner));
        this.addState(BossStates.MOVING_SHADOW, new MovingShadow_1.default(this, owner));
        this.addState(BossStates.TOSS_UP, new TossUp_1.default(this, owner));
        this.addState(BossStates.WALK, new Walk_1.default(this, owner));
        this.health = options.health;
        this.player = options.player;
        this.hitbox = new AABB_1.default(Vec2_1.default.ZERO, new Vec2_1.default(56, 50));
        // Initialize to the default state
        this.initialize(BossStates.DEFAULT);
    }
    activate(options) {
    }
    damage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.owner.setAIActive(false, {});
            this.owner.isCollidable = false;
            if (this.currentState !== this.stateMap.get(BossStates.DYING)) {
                this.changeState(BossStates.DYING);
            }
        }
        else {
            this.changeState(BossStates.DAMAGE);
        }
    }
    handleEvent(event) {
    }
    getPlayerPosition() {
        let pos = this.player.position;
        // Get the new player location
        let start = this.owner.position.clone();
        let delta = pos.clone().sub(start);
        // Iterate through the tilemap region until we find a collision
        let minX = Math.min(start.x, pos.x);
        let maxX = Math.max(start.x, pos.x);
        let minY = Math.min(start.y, pos.y);
        let maxY = Math.max(start.y, pos.y);
        // Get the wall tilemap
        let walls = this.owner.getScene().getLayer("Wall").getItems()[0];
        let minIndex = walls.getColRowAt(new Vec2_1.default(minX, minY));
        let maxIndex = walls.getColRowAt(new Vec2_1.default(maxX, maxY));
        let tileSize = walls.getTileSize();
        for (let col = minIndex.x; col <= maxIndex.x; col++) {
            for (let row = minIndex.y; row <= maxIndex.y; row++) {
                if (walls.isTileCollidable(col, row)) {
                    // Get the position of this tile
                    let tilePos = new Vec2_1.default(col * tileSize.x + tileSize.x / 2, row * tileSize.y + tileSize.y / 2);
                    // Create a collider for this tile
                    let collider = new AABB_1.default(tilePos, tileSize.scaled(1 / 2));
                    let hit = collider.intersectSegment(start, delta, Vec2_1.default.ZERO);
                    if (hit !== null && start.distanceSqTo(hit.pos) < start.distanceSqTo(pos)) {
                        // We hit a wall, we can't see the player
                        return null;
                    }
                }
            }
        }
        return pos;
    }
}
exports.default = SlothAI;
var BossStates;
(function (BossStates) {
    BossStates["DEFAULT"] = "default";
    BossStates["DAMAGE"] = "damage";
    BossStates["TOSS_UP"] = "toss_up";
    BossStates["MOVING_SHADOW"] = "moving_shadow";
    BossStates["FALL"] = "fall";
    BossStates["WALK"] = "walk";
    BossStates["DYING"] = "dying";
})(BossStates = exports.BossStates || (exports.BossStates = {}));
},{"./../Wolfie2D/AI/StateMachineAI":92,"./../Wolfie2D/DataTypes/Shapes/AABB":104,"./../Wolfie2D/DataTypes/Vec2":111,"./SlothStates/Damage":52,"./SlothStates/Dying":53,"./SlothStates/Fall":54,"./SlothStates/Idle":55,"./SlothStates/MovingShadow":56,"./SlothStates/TossUp":57,"./SlothStates/Walk":58}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const State_1 = require("./../../Wolfie2D/DataTypes/State/State");
class BossState extends State_1.default {
    constructor(parent, owner) {
        super(parent);
        this.owner = owner;
    }
}
exports.default = BossState;
},{"./../../Wolfie2D/DataTypes/State/State":108}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const SlothAI_1 = require("../SlothAI");
const GameEventType_1 = require("../../Wolfie2D/Events/GameEventType");
class Damage extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "sloth_damage", loop: false, holdReference: false });
        this.owner.animation.play("DAMAGE", false);
    }
    handleInput(event) {
    }
    update(deltaT) {
        if (!this.owner.animation.isPlaying("DAMAGE")) {
            this.finished(SlothAI_1.BossStates.TOSS_UP);
        }
    }
    onExit() {
        this.owner.animation.stop();
        return {};
    }
}
exports.default = Damage;
},{"../../Wolfie2D/Events/GameEventType":117,"../SlothAI":50,"./BossState":51}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const game_enums_1 = require("../../GameSystems/game_enums");
const GameEventType_1 = require("../../Wolfie2D/Events/GameEventType");
class Dying extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "sloth_death", loop: false, holdReference: false });
        this.owner.animation.play("DYING", false, game_enums_1.Game_Events.BOSS_DIED);
    }
    handleInput(event) {
    }
    update(deltaT) {
    }
    onExit() {
        this.owner.animation.stop();
        return {};
    }
}
exports.default = Dying;
},{"../../GameSystems/game_enums":80,"../../Wolfie2D/Events/GameEventType":117,"./BossState":51}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const SlothAI_1 = require("../SlothAI");
const game_enums_1 = require("../../GameSystems/game_enums");
const GameEventType_1 = require("../../Wolfie2D/Events/GameEventType");
class Fall extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "sloth_catch", loop: false, holdReference: false });
        this.owner.animation.play("CATCH", false);
    }
    handleInput(event) {
    }
    update(deltaT) {
        if (!this.owner.animation.isPlaying("CATCH")) {
            this.finished(SlothAI_1.BossStates.WALK);
        }
    }
    onExit() {
        this.owner.removePhysics();
        this.owner.addPhysics(this.parent.hitbox);
        this.owner.setGroup("enemy");
        this.owner.setTrigger("player", game_enums_1.Game_Events.BOSS_COLLISION, "boss hit player");
        this.owner.animation.stop();
        return {};
    }
}
exports.default = Fall;
},{"../../GameSystems/game_enums":80,"../../Wolfie2D/Events/GameEventType":117,"../SlothAI":50,"./BossState":51}],55:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const SlothAI_1 = require("../SlothAI");
class Idle extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.owner.animation.play("IDLE", true);
    }
    handleInput(event) {
    }
    update(deltaT) {
        let player_pos = this.parent.getPlayerPosition();
        if (player_pos !== null && player_pos.distanceTo(this.owner.position) < 250) {
            this.finished(SlothAI_1.BossStates.WALK);
        }
    }
    onExit() {
        this.owner.animation.stop();
        return {};
    }
}
exports.default = Idle;
},{"../SlothAI":50,"./BossState":51}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("./../../Wolfie2D/DataTypes/Vec2");
const BossState_1 = require("./BossState");
const SlothAI_1 = require("../SlothAI");
const AABB_1 = require("../../Wolfie2D/DataTypes/Shapes/AABB");
class MovingShadow extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.owner.removePhysics();
        this.owner.addPhysics(new AABB_1.default(Vec2_1.default.ZERO, new Vec2_1.default(1, 1)), new Vec2_1.default(500, 500));
        this.owner.setGroup("wall");
        this.owner.animation.play("SHADOW", true);
    }
    handleInput(event) {
    }
    update(deltaT) {
        let player_pos = this.parent.player.position;
        if (this.owner.position.distanceTo(player_pos) < 16) {
            this.finished(SlothAI_1.BossStates.FALL);
        }
        this.owner.move(this.owner.position.dirTo(player_pos).normalize().scale(6));
    }
    onExit() {
        this.owner.animation.stop();
        return {};
    }
}
exports.default = MovingShadow;
},{"../../Wolfie2D/DataTypes/Shapes/AABB":104,"../SlothAI":50,"./../../Wolfie2D/DataTypes/Vec2":111,"./BossState":51}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const SlothAI_1 = require("../SlothAI");
const GameEventType_1 = require("../../Wolfie2D/Events/GameEventType");
class TossUp extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "sloth_throw", loop: false, holdReference: false });
        this.owner.animation.play("THROW", false);
    }
    handleInput(event) {
    }
    update(deltaT) {
        if (!this.owner.animation.isPlaying("THROW")) {
            this.finished(SlothAI_1.BossStates.MOVING_SHADOW);
        }
    }
    onExit() {
        this.owner.animation.stop();
        return {};
    }
}
exports.default = TossUp;
},{"../../Wolfie2D/Events/GameEventType":117,"../SlothAI":50,"./BossState":51}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const SlothAI_1 = require("../SlothAI");
const Timer_1 = require("../../Wolfie2D/Timing/Timer");
class Walk extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.owner.animation.play("WALK", true);
        this.timer = new Timer_1.default(1500);
        this.timer.start();
    }
    handleInput(event) {
    }
    update(deltaT) {
        if (this.timer.isStopped()) {
            this.finished(SlothAI_1.BossStates.TOSS_UP);
        }
        this.owner.move(this.owner.position.dirTo(this.parent.player.position).normalize().scale(.5));
    }
    onExit() {
        this.owner.animation.stop();
        return {};
    }
}
exports.default = Walk;
},{"../../Wolfie2D/Timing/Timer":182,"../SlothAI":50,"./BossState":51}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BossStates = void 0;
const StateMachineAI_1 = require("./../Wolfie2D/AI/StateMachineAI");
const AABB_1 = require("./../Wolfie2D/DataTypes/Shapes/AABB");
const Vec2_1 = require("./../Wolfie2D/DataTypes/Vec2");
const game_enums_1 = require("../GameSystems/game_enums");
const AttackDown_1 = require("./WrathStates/AttackDown");
const AttackUp_1 = require("./WrathStates/AttackUp");
const ChargeDown_1 = require("./WrathStates/ChargeDown");
const ChargeUp_1 = require("./WrathStates/ChargeUp");
const Damage_1 = require("./WrathStates/Damage");
const Idle_1 = require("./WrathStates/Idle");
const RunDown_1 = require("./WrathStates/RunDown");
const RunUp_1 = require("./WrathStates/RunUp");
const Dying_1 = require("./WrathStates/Dying");
class WrathAI extends StateMachineAI_1.default {
    constructor() {
        super(...arguments);
        /** The default movement speed of this AI */
        this.speed = 20;
        // State machine defers updates and event handling to its children
        // Check super classes for details
    }
    initializeAI(owner, options) {
        this.owner = owner;
        this.slice = options.slice;
        this.addState(BossStates.DEFAULT, new Idle_1.default(this, owner));
        this.addState(BossStates.DAMAGE, new Damage_1.default(this, owner));
        this.addState(BossStates.ATTACK_DOWN, new AttackDown_1.default(this, owner));
        this.addState(BossStates.ATTACK_UP, new AttackUp_1.default(this, owner));
        this.addState(BossStates.CHARGE_DOWN, new ChargeDown_1.default(this, owner));
        this.addState(BossStates.CHARGE_UP, new ChargeUp_1.default(this, owner));
        this.addState(BossStates.RUN_DOWN, new RunDown_1.default(this, owner));
        this.addState(BossStates.RUN_UP, new RunUp_1.default(this, owner));
        this.addState(BossStates.DYING, new Dying_1.default(this, owner));
        this.health = options.health;
        this.player = options.player;
        // Initialize to the default state
        this.initialize(BossStates.DEFAULT);
    }
    activate(options) {
    }
    damage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.owner.setAIActive(false, {});
            this.owner.isCollidable = false;
            if (this.currentState !== this.stateMap.get(BossStates.DYING)) {
                this.changeState(BossStates.DYING);
            }
        }
        else {
            this.changeState(BossStates.DAMAGE);
        }
    }
    handleEvent(event) {
        if (event.type === game_enums_1.Game_Events.WRATH_ATTACK_UP) {
            this.slice.use(this.owner, "enemies", Vec2_1.default.ZERO);
            this.changeState(BossStates.ATTACK_UP);
        }
        else if (event.type === game_enums_1.Game_Events.WRATH_ATTACK_DOWN) {
            this.slice.use(this.owner, "enemies", Vec2_1.default.ZERO);
            this.changeState(BossStates.ATTACK_DOWN);
        }
    }
    getPlayerPosition() {
        let pos = this.player.position;
        // Get the new player location
        let start = this.owner.position.clone();
        let delta = pos.clone().sub(start);
        // Iterate through the tilemap region until we find a collision
        let minX = Math.min(start.x, pos.x);
        let maxX = Math.max(start.x, pos.x);
        let minY = Math.min(start.y, pos.y);
        let maxY = Math.max(start.y, pos.y);
        // Get the wall tilemap
        let walls = this.owner.getScene().getLayer("Wall").getItems()[0];
        let minIndex = walls.getColRowAt(new Vec2_1.default(minX, minY));
        let maxIndex = walls.getColRowAt(new Vec2_1.default(maxX, maxY));
        let tileSize = walls.getTileSize();
        for (let col = minIndex.x; col <= maxIndex.x; col++) {
            for (let row = minIndex.y; row <= maxIndex.y; row++) {
                if (walls.isTileCollidable(col, row)) {
                    // Get the position of this tile
                    let tilePos = new Vec2_1.default(col * tileSize.x + tileSize.x / 2, row * tileSize.y + tileSize.y / 2);
                    // Create a collider for this tile
                    let collider = new AABB_1.default(tilePos, tileSize.scaled(1 / 2));
                    let hit = collider.intersectSegment(start, delta, Vec2_1.default.ZERO);
                    if (hit !== null && start.distanceSqTo(hit.pos) < start.distanceSqTo(pos)) {
                        // We hit a wall, we can't see the player
                        return null;
                    }
                }
            }
        }
        return pos;
    }
}
exports.default = WrathAI;
var BossStates;
(function (BossStates) {
    BossStates["DEFAULT"] = "default";
    BossStates["DAMAGE"] = "damage";
    BossStates["ATTACK_UP"] = "attack_up";
    BossStates["ATTACK_DOWN"] = "attack_down";
    BossStates["CHARGE_UP"] = "charge_up";
    BossStates["CHARGE_DOWN"] = "charge_down";
    BossStates["RUN_UP"] = "run_up";
    BossStates["RUN_DOWN"] = "run_down";
    BossStates["DYING"] = "dying";
})(BossStates = exports.BossStates || (exports.BossStates = {}));
},{"../GameSystems/game_enums":80,"./../Wolfie2D/AI/StateMachineAI":92,"./../Wolfie2D/DataTypes/Shapes/AABB":104,"./../Wolfie2D/DataTypes/Vec2":111,"./WrathStates/AttackDown":60,"./WrathStates/AttackUp":61,"./WrathStates/ChargeDown":63,"./WrathStates/ChargeUp":64,"./WrathStates/Damage":65,"./WrathStates/Dying":66,"./WrathStates/Idle":67,"./WrathStates/RunDown":68,"./WrathStates/RunUp":69}],60:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const WrathAI_1 = require("../WrathAI");
const GameEventType_1 = require("../../Wolfie2D/Events/GameEventType");
class AttackDown extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "wrath_attack", loop: false, holdReference: false });
        this.owner.animation.play("SLASH_DOWN", false);
    }
    handleInput(event) { }
    update(deltaT) {
        if (!this.owner.animation.isPlaying("SLASH_DOWN")) {
            this.finished(WrathAI_1.BossStates.RUN_DOWN);
        }
    }
    onExit() {
        this.owner.animation.stop();
        return { previous: WrathAI_1.BossStates.RUN_DOWN };
    }
}
exports.default = AttackDown;
},{"../../Wolfie2D/Events/GameEventType":117,"../WrathAI":59,"./BossState":62}],61:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const WrathAI_1 = require("../WrathAI");
const GameEventType_1 = require("../../Wolfie2D/Events/GameEventType");
class AttackUp extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "wrath_attack", loop: false, holdReference: false });
        this.owner.animation.play("SLASH_UP", false);
    }
    handleInput(event) { }
    update(deltaT) {
        if (!this.owner.animation.isPlaying("SLASH_UP")) {
            this.finished(WrathAI_1.BossStates.RUN_UP);
        }
    }
    onExit() {
        this.owner.animation.stop();
        return { previous: WrathAI_1.BossStates.RUN_UP };
    }
}
exports.default = AttackUp;
},{"../../Wolfie2D/Events/GameEventType":117,"../WrathAI":59,"./BossState":62}],62:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const State_1 = require("./../../Wolfie2D/DataTypes/State/State");
class BossState extends State_1.default {
    constructor(parent, owner) {
        super(parent);
        this.owner = owner;
    }
}
exports.default = BossState;
},{"./../../Wolfie2D/DataTypes/State/State":108}],63:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const WrathAI_1 = require("../WrathAI");
const game_enums_1 = require("../../GameSystems/game_enums");
class ChargeDown extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.owner.animation.play("CHARGE_DOWN", false, game_enums_1.Game_Events.WRATH_ATTACK_DOWN);
    }
    handleInput(event) { }
    update(deltaT) {
        if (!this.owner.animation.isPlaying("CHARGE_DOWN")) {
            this.finished(WrathAI_1.BossStates.ATTACK_DOWN);
        }
    }
    onExit() {
        this.owner.animation.stop();
        return { previous: WrathAI_1.BossStates.CHARGE_DOWN };
    }
}
exports.default = ChargeDown;
},{"../../GameSystems/game_enums":80,"../WrathAI":59,"./BossState":62}],64:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const WrathAI_1 = require("../WrathAI");
const game_enums_1 = require("../../GameSystems/game_enums");
class ChargeUp extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.owner.animation.play("CHARGE_UP", false, game_enums_1.Game_Events.WRATH_ATTACK_UP);
    }
    handleInput(event) { }
    update(deltaT) {
        if (!this.owner.animation.isPlaying("CHARGE_UP")) {
            this.finished(WrathAI_1.BossStates.ATTACK_UP);
        }
    }
    onExit() {
        this.owner.animation.stop();
        return { previous: WrathAI_1.BossStates.CHARGE_UP };
    }
}
exports.default = ChargeUp;
},{"../../GameSystems/game_enums":80,"../WrathAI":59,"./BossState":62}],65:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const GameEventType_1 = require("../../Wolfie2D/Events/GameEventType");
class Damage extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "wrath_damage", loop: false, holdReference: false });
        this.owner.animation.play("DAMAGE", false);
        this.previous = options.previous;
    }
    handleInput(event) { }
    update(deltaT) {
        if (!this.owner.animation.isPlaying("DAMAGE")) {
            this.finished(this.previous);
        }
    }
    onExit() {
        this.owner.animation.stop();
        return {};
    }
}
exports.default = Damage;
},{"../../Wolfie2D/Events/GameEventType":117,"./BossState":62}],66:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const game_enums_1 = require("../../GameSystems/game_enums");
const GameEventType_1 = require("../../Wolfie2D/Events/GameEventType");
class Dying extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "wrath_death", loop: false, holdReference: false });
        this.owner.animation.play("DYING", false, game_enums_1.Game_Events.BOSS_DIED);
    }
    handleInput(event) {
    }
    update(deltaT) {
    }
    onExit() {
        this.owner.animation.stop();
        return {};
    }
}
exports.default = Dying;
},{"../../GameSystems/game_enums":80,"../../Wolfie2D/Events/GameEventType":117,"./BossState":62}],67:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BossState_1 = require("./BossState");
const WrathAI_1 = require("../WrathAI");
class Idle extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.owner.animation.play("IDLE", true);
    }
    handleInput(event) {
    }
    update(deltaT) {
        if (this.parent.getPlayerPosition() !== null) {
            if (this.owner.position.y < 168) {
                this.finished(WrathAI_1.BossStates.RUN_DOWN);
            }
            else {
                this.finished(WrathAI_1.BossStates.RUN_UP);
            }
        }
    }
    onExit() {
        this.owner.animation.stop();
        return { previous: WrathAI_1.BossStates.DEFAULT };
    }
}
exports.default = Idle;
},{"../WrathAI":59,"./BossState":62}],68:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("./../../Wolfie2D/DataTypes/Vec2");
const BossState_1 = require("./BossState");
const WrathAI_1 = require("../WrathAI");
class RunDown extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.owner.animation.play("WALK_DOWN", true);
        this.speed = new Vec2_1.default(0, 5);
    }
    handleInput(event) {
    }
    update(deltaT) {
        if (this.owner.position.y > 420) {
            this.finished(WrathAI_1.BossStates.CHARGE_UP);
        }
        this.owner.move(this.speed);
    }
    onExit() {
        this.owner.animation.stop();
        return { previous: WrathAI_1.BossStates.RUN_DOWN };
    }
}
exports.default = RunDown;
},{"../WrathAI":59,"./../../Wolfie2D/DataTypes/Vec2":111,"./BossState":62}],69:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("./../../Wolfie2D/DataTypes/Vec2");
const BossState_1 = require("./BossState");
const WrathAI_1 = require("../WrathAI");
class RunUp extends BossState_1.default {
    constructor(parent, owner) {
        super(parent, owner);
    }
    onEnter(options) {
        this.owner.animation.play("WALK_UP", true);
        this.speed = new Vec2_1.default(0, -5);
    }
    handleInput(event) {
    }
    update(deltaT) {
        if (this.owner.position.y < 168) {
            this.finished(WrathAI_1.BossStates.CHARGE_DOWN);
        }
        this.owner.move(this.speed);
    }
    onExit() {
        this.owner.animation.stop();
        return { previous: WrathAI_1.BossStates.RUN_UP };
    }
}
exports.default = RunUp;
},{"../WrathAI":59,"./../../Wolfie2D/DataTypes/Vec2":111,"./BossState":62}],70:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BattleManager {
    handleInteraction(attackerType, weapon) {
        if (attackerType === "player") {
            // Check for collisions with enemies
            for (let enemy of this.enemies) {
                if (weapon.hits(enemy.owner)) {
                    enemy.damage(weapon.type.damage);
                }
            }
        }
        else {
            // Check for collision with player
            if (weapon.hits(this.player.owner)) {
                this.player.damage(weapon.type.damage);
            }
        }
    }
    setPlayer(player) {
        this.player = player;
    }
    setEnemies(enemies) {
        this.enemies = enemies;
    }
}
exports.default = BattleManager;
},{}],71:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Item {
    constructor(sprite) {
        this.sprite = sprite;
    }
    moveSprite(position, layer) {
        // Change the layer if needed
        if (layer) {
            let currentLayer = this.sprite.getLayer();
            currentLayer.removeNode(this.sprite);
            let newLayer = this.sprite.getScene().getLayer(layer);
            newLayer.addNode(this.sprite);
            this.sprite.setLayer(newLayer);
        }
        // Move the sprite
        this.sprite.position.copy(position);
    }
}
exports.default = Item;
},{}],72:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Registry_1 = require("../../Wolfie2D/Registry/Registries/Registry");
const ResourceManager_1 = require("../../Wolfie2D/ResourceManager/ResourceManager");
const Punch_1 = require("../WeaponTypes/Punch");
const GluttonySlam_1 = require("../WeaponTypes/GluttonySlam");
const WrathSlice_1 = require("../WeaponTypes/WrathSlice");
const EnvyPunch_1 = require("../WeaponTypes/EnvyPunch");
class WeaponRegistry extends Registry_1.default {
    preload() {
        const rm = ResourceManager_1.default.getInstance();
        this.registerItem("fist1", Punch_1.default);
        this.registerItem("fist2", Punch_1.default);
        this.registerItem("fist3", Punch_1.default);
        this.registerItem("slam", GluttonySlam_1.default);
        this.registerItem("slice", WrathSlice_1.default);
        this.registerItem("fist4", EnvyPunch_1.default);
    }
    registerAndPreloadItem(key) { }
    registerItem(key, constr) {
        this.add(key, constr);
    }
}
exports.default = WeaponRegistry;
},{"../../Wolfie2D/Registry/Registries/Registry":149,"../../Wolfie2D/ResourceManager/ResourceManager":168,"../WeaponTypes/EnvyPunch":75,"../WeaponTypes/GluttonySlam":76,"../WeaponTypes/Punch":77,"../WeaponTypes/WrathSlice":79}],73:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Registry_1 = require("../../Wolfie2D/Registry/Registries/Registry");
class WeaponTypeRegistry extends Registry_1.default {
    preload() { }
    // We don't need this for this assignment
    registerAndPreloadItem(key) { }
    registerItem(key, type) {
        this.add(key, type);
    }
}
exports.default = WeaponTypeRegistry;
},{"../../Wolfie2D/Registry/Registries/Registry":149}],74:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Emitter_1 = require("../Wolfie2D/Events/Emitter");
const Timer_1 = require("../Wolfie2D/Timing/Timer");
const Item_1 = require("./Item");
class Weapon extends Item_1.default {
    constructor(sprite, type, battleManager) {
        super(sprite);
        // Set the weapon type
        this.type = type;
        // Keep a reference to the sprite of this weapon
        this.sprite = sprite;
        // Rely on the weapon type to create any necessary assets
        this.assets = this.type.createRequiredAssets(this.sprite.getScene());
        // Create an event emitter
        this.emitter = new Emitter_1.default();
        // Save a reference to the battler manager
        this.battleManager = battleManager;
        // Create the cooldown timer
        this.cooldownTimer = new Timer_1.default(type.cooldown);
    }
    // @override
    /**
     * Uses this weapon in the specified direction.
     * This only works if the cooldown timer has ended
     */
    use(user, userType, direction) {
        // If the cooldown timer is still running, we can't use the weapon
        if (!this.cooldownTimer.isStopped()) {
            return false;
        }
        // Do a type specific weapon animation
        this.type.doAnimation(user, direction, ...this.assets);
        // Apply damage
        this.battleManager.handleInteraction(userType, this);
        // Send out an event to alert enemies
        // this.emitter.fireEvent("PUNCH", {position: user.position.clone(), volume: this.type.use_volume});
        // Reset the cooldown timer
        this.cooldownTimer.start();
        return true;
    }
    /**
     * A check for whether or not this weapon hit a node
     */
    hits(node) {
        return this.type.hits(node, ...this.assets);
    }
}
exports.default = Weapon;
},{"../Wolfie2D/Events/Emitter":114,"../Wolfie2D/Timing/Timer":182,"./Item":71}],75:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("../../Wolfie2D/DataTypes/Vec2");
const WeaponType_1 = require("./WeaponType");
class EnvyPunch extends WeaponType_1.default {
    initialize(options) {
        this.damage = options.damage;
        this.cooldown = options.cooldown;
        this.display_name = options.displayName;
        this.sprite_key = options.spriteKey;
        this.use_volume = options.useVolume;
    }
    doAnimation(attacker, direction, punch_sprite) {
        // rotate this with the game node
        punch_sprite.rotation = Vec2_1.default.UP.angleToCCW(direction);
        punch_sprite.position = attacker.position.clone().add(direction.scaled(50));
        // play the punch animation but queue the normal animation
        punch_sprite.animation.play("PUNCH");
        punch_sprite.animation.queue("NORMAL", true);
    }
    createRequiredAssets(scene) {
        let punch = scene.add.animatedSprite(this.sprite_key, "above");
        punch.animation.play("NORMAL", true);
        return [punch];
    }
    hits(node, punch_sprite) {
        return punch_sprite.boundary.overlaps(node.collisionShape);
    }
}
exports.default = EnvyPunch;
},{"../../Wolfie2D/DataTypes/Vec2":111,"./WeaponType":78}],76:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WeaponType_1 = require("./WeaponType");
class GluttonySlam extends WeaponType_1.default {
    initialize(options) {
        this.damage = options.damage;
        this.cooldown = options.cooldown;
        this.display_name = options.displayName;
        this.sprite_key = options.spriteKey;
        this.use_volume = options.useVolume;
    }
    doAnimation(attacker, direction, slam_sprite) {
        // move the punch out from the player
        slam_sprite.position = attacker.position.clone();
        slam_sprite.rotation += Math.random() * 10 + 10;
        // play the slam animation but queue the normal animation
        slam_sprite.animation.play("SMASH");
        slam_sprite.animation.queue("NORMAL", true);
    }
    createRequiredAssets(scene) {
        let slam = scene.add.animatedSprite("slam", "below");
        slam.animation.play("NORMAL", true);
        return [slam];
    }
    hits(node, slam_sprite) {
        return slam_sprite.boundary.overlaps(node.collisionShape);
    }
}
exports.default = GluttonySlam;
},{"./WeaponType":78}],77:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("../../Wolfie2D/DataTypes/Vec2");
const WeaponType_1 = require("./WeaponType");
class Punch extends WeaponType_1.default {
    initialize(options) {
        this.damage = options.damage;
        this.cooldown = options.cooldown;
        this.display_name = options.displayName;
        this.sprite_key = options.spriteKey;
        this.use_volume = options.useVolume;
    }
    doAnimation(attacker, direction, punch_sprite) {
        // rotate this with the game node
        punch_sprite.rotation = attacker.attack_direction;
        if (attacker.moving && (Math.abs(attacker.attack_direction - Vec2_1.default.UP.angleToCCW(attacker._velocity)) < .3 || Math.abs(attacker.attack_direction - Vec2_1.default.UP.angleToCCW(attacker._velocity)) > 5.5)) {
            punch_sprite.position = attacker.position.clone().add(direction.scaled(80));
        }
        else {
            punch_sprite.position = attacker.position.clone().add(direction.scaled(50));
        }
        // move the punch out from the player
        // play the punch animation but queue the normal animation
        punch_sprite.animation.play("PUNCH");
        punch_sprite.animation.queue("NORMAL", true);
    }
    createRequiredAssets(scene) {
        let punch = scene.add.animatedSprite(this.sprite_key, "above");
        punch.animation.play("NORMAL", true);
        return [punch];
    }
    hits(node, punch_sprite) {
        return punch_sprite.boundary.overlaps(node.collisionShape);
    }
}
exports.default = Punch;
},{"../../Wolfie2D/DataTypes/Vec2":111,"./WeaponType":78}],78:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WeaponType {
}
exports.default = WeaponType;
},{}],79:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("../../Wolfie2D/DataTypes/Vec2");
const WeaponType_1 = require("./WeaponType");
class WrathSlice extends WeaponType_1.default {
    initialize(options) {
        this.damage = options.damage;
        this.cooldown = options.cooldown;
        this.display_name = options.displayName;
        this.sprite_key = options.spriteKey;
        this.use_volume = options.useVolume;
        this.flip = true;
    }
    doAnimation(attacker, direction, slice_sprite) {
        // rotate this with the game node
        slice_sprite.rotation = this.flip ? Math.PI : 0;
        slice_sprite.position = this.flip ? new Vec2_1.default(attacker.position.x, attacker.position.y + 32) : new Vec2_1.default(attacker.position.x, attacker.position.y);
        this.flip = !this.flip;
        // play the punch animation but queue the normal animation
        slice_sprite.animation.play("SLICE");
        slice_sprite.animation.queue("NORMAL", true);
    }
    createRequiredAssets(scene) {
        let slice = scene.add.animatedSprite(this.sprite_key, "below");
        slice.animation.play("NORMAL", true);
        return [slice];
    }
    hits(node, punch_sprite) {
        return punch_sprite.boundary.overlaps(node.collisionShape);
    }
}
exports.default = WrathSlice;
},{"../../Wolfie2D/DataTypes/Vec2":111,"./WeaponType":78}],80:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game_Events = void 0;
var Game_Events;
(function (Game_Events) {
    Game_Events["ENEMY_DIED"] = "EnemyDied";
    Game_Events["BOSS_DIED"] = "BossDied";
    Game_Events["ENEMY_COLLISION"] = "EnemyCollision";
    Game_Events["GAME_OVER"] = "GameOver";
    Game_Events["IFRAMES_OVER"] = "IframesOver";
    Game_Events["INTRO_END"] = "IntroEnd";
    Game_Events["BOSS_COLLISION"] = "BossCollision";
    Game_Events["ON_PAUSE"] = "OnPause";
    Game_Events["ON_UNPAUSE"] = "OnUnpause";
    Game_Events["GLUT_ATTACK"] = "GlutAttack";
    Game_Events["ATTACK_OVER"] = "AttackOver";
    Game_Events["BOUGHT_HEART"] = "BoughtHeart";
    Game_Events["BOUGHT_DAMAGE"] = "BoughtDamage";
    Game_Events["ENTERED_SHOP"] = "EnteredShop";
    Game_Events["EXITED_SHOP"] = "ExitedShop";
    Game_Events["GET_COIN"] = "GetCoin";
    Game_Events["ENTER_BOSS_FIGHT"] = "EnterBossFight";
    Game_Events["HELLHOUND_TP_START"] = "HellHoundTeleportStart";
    Game_Events["NEXT_LEVEL"] = "NextLevel";
    Game_Events["WRATH_ATTACK_UP"] = "WrathAttackUp";
    Game_Events["GREED_ATTACK"] = "GreedAttack";
    Game_Events["WRATH_ATTACK_DOWN"] = "WrathAttackDown";
    Game_Events["ENVY_PUNCH"] = "EnvyPunch";
    Game_Events["EXIT_TO_MAIN"] = "ExitToMain";
})(Game_Events = exports.Game_Events || (exports.Game_Events = {}));
},{}],81:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("../Wolfie2D/DataTypes/Vec2");
const Color_1 = require("../Wolfie2D/Utils/Color");
const GameLevel_1 = require("./GameLevel");
const GraphicTypes_1 = require("../Wolfie2D/Nodes/Graphics/GraphicTypes");
const UIElementTypes_1 = require("../Wolfie2D/Nodes/UIElements/UIElementTypes");
const Input_1 = require("../Wolfie2D/Input/Input");
const GameEventType_1 = require("../Wolfie2D/Events/GameEventType");
const LustLevel_1 = require("./LustLevel");
const GluttonyLevel_1 = require("./GluttonyLevel");
const GreedLevel_1 = require("./GreedLevel");
class EnvyLevel extends GameLevel_1.default {
    initScene(init) {
        super.initScene(init);
        // TODO
        this.level_music_key = "lust_music";
        this.level_music_path = "game_assets/sounds/music/lust.mp3";
        this.boss_audios = {
            envy_attack: "game_assets/sounds/envy_attack.mp3",
            envy_charge: "game_assets/sounds/envy_charge.mp3",
            envy_damage: "game_assets/sounds/envy_damage.mp3",
            envy_death: "game_assets/sounds/envy_death.mp3"
        };
        this.boss_sprite = {
            envy: "game_assets/spritesheets/envy.json"
        };
        this.boss_attack_image = {
            fist4: "game_assets/spritesheets/impact_green.png"
        };
        this.boss_attack_sprite = {
            fist4: "game_assets/spritesheets/impact_green.json"
        };
        this.enemy_data = {
            enemyData: "game_assets/data/envy_enemy.json"
        };
        this.level_tilemap = {
            envyLevel: "game_assets/tilemaps/envy_level.json"
        };
        this.next_level_constructor = GreedLevel_1.default;
        this.shop_pos = new Vec2_1.default(1679, 157);
        this.player_start_pos = new Vec2_1.default(430, 1779); //spawn pos
        // this.player_start_pos = new Vec2(1008, 1556); // // boss
        this.player_speed = 150;
        this.level_text_color = new Color_1.default(89, 147, 36);
        this.start_level_text = "Envy's Emerald Enclave";
        this.end_level_text = "Envy has been defeated!";
        this.boss_room_pos = new Vec2_1.default(979, 1168);
        this.boss_room_size = new Vec2_1.default(7 * 32, 3 * 32);
        this.upper_boss_door = [new Vec2_1.default(912, 1268), new Vec2_1.default(944, 1268), new Vec2_1.default(976, 1268), new Vec2_1.default(1008, 1268), new Vec2_1.default(1040, 1268)];
        this.lower_boss_door = [new Vec2_1.default(912, 1300), new Vec2_1.default(944, 1300), new Vec2_1.default(976, 1300), new Vec2_1.default(1008, 1300), new Vec2_1.default(1040, 1300)];
        this.lose_money = true;
    }
    startScene() {
        super.startScene();
        this.initializeLabels();
    }
    updateScene(deltaT) {
        let scene_options = {
            health: 5,
            coins: 0
        };
        let physics_options = {
            physics: {
                groupNames: ["wall", "player", "enemy", "coin"],
                collisions: [
                    [0, 1, 1, 1],
                    [1, 0, 0, 0],
                    [1, 0, 0, 0],
                    [1, 0, 0, 0]
                ]
            }
        };
        if (Input_1.default.isJustPressed("lust")) {
            this.emitter.fireEvent(GameEventType_1.GameEventType.STOP_SOUND, { key: this.level_music_key });
            this.sceneManager.changeToScene(LustLevel_1.default, scene_options, physics_options);
        }
        else if (Input_1.default.isJustPressed("gluttony")) {
            this.emitter.fireEvent(GameEventType_1.GameEventType.STOP_SOUND, { key: this.level_music_key });
            this.sceneManager.changeToScene(GluttonyLevel_1.default, scene_options, physics_options);
        }
        super.updateScene(deltaT);
    }
    initializeLabels() {
        this.tutorial_labels = new Array();
        this.tutorial_zones = new Array();
        let tutorial_zone_1 = this.add.graphic(GraphicTypes_1.GraphicType.RECT, "primary", { position: new Vec2_1.default(430, 1800), size: new Vec2_1.default(7 * 32, 5 * 32) });
        tutorial_zone_1.addPhysics(undefined, undefined, false, true);
        tutorial_zone_1.color = Color_1.default.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_1);
        let tutorial_label_1 = this.add.uiElement(UIElementTypes_1.UIElementType.LABEL, "primary", { position: new Vec2_1.default(430, 1734), text: "The demons grow envious of your gold. They will steal it on attack!" });
        tutorial_label_1.font = "HellText";
        tutorial_label_1.textColor = Color_1.default.BLACK;
        tutorial_label_1.fontSize = 30;
        tutorial_label_1.size.set(30, 14);
        tutorial_label_1.borderWidth = 2;
        tutorial_label_1.borderColor = Color_1.default.TRANSPARENT;
        tutorial_label_1.backgroundColor = Color_1.default.TRANSPARENT;
        tutorial_label_1.visible = false;
        this.tutorial_labels.push(tutorial_label_1);
    }
}
exports.default = EnvyLevel;
},{"../Wolfie2D/DataTypes/Vec2":111,"../Wolfie2D/Events/GameEventType":117,"../Wolfie2D/Input/Input":119,"../Wolfie2D/Nodes/Graphics/GraphicTypes":129,"../Wolfie2D/Nodes/UIElements/UIElementTypes":142,"../Wolfie2D/Utils/Color":184,"./GameLevel":82,"./GluttonyLevel":84,"./GreedLevel":85,"./LustLevel":86}],82:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("../Wolfie2D/DataTypes/Vec2");
const Scene_1 = require("../Wolfie2D/Scene/Scene");
const RegistryManager_1 = require("../Wolfie2D/Registry/RegistryManager");
const AABB_1 = require("../Wolfie2D/DataTypes/Shapes/AABB");
const UIElementTypes_1 = require("../Wolfie2D/Nodes/UIElements/UIElementTypes");
const Color_1 = require("../Wolfie2D/Utils/Color");
const PlayerController_1 = require("../AI/PlayerController");
const BatAI_1 = require("../AI/BatAI");
const Weapon_1 = require("../GameSystems/Weapon");
const BattleManager_1 = require("../GameSystems/BattleManager");
const GluttonyAI_1 = require("../AI/GluttonyAI");
const game_enums_1 = require("./../GameSystems/game_enums");
const GameEvent_1 = require("../Wolfie2D/Events/GameEvent");
const GameNode_1 = require("./../Wolfie2D/Nodes/GameNode");
const EaseFunctions_1 = require("./../Wolfie2D/Utils/EaseFunctions");
const GameOver_1 = require("./GameOver");
const GraphicTypes_1 = require("../Wolfie2D/Nodes/Graphics/GraphicTypes");
const Input_1 = require("../Wolfie2D/Input/Input");
const Debug_1 = require("../Wolfie2D/Debug/Debug");
const HoundAI_1 = require("../AI/HoundAI");
const LustAI_1 = require("../AI/LustAI");
const GameEventType_1 = require("../Wolfie2D/Events/GameEventType");
const MainMenu_1 = require("./MainMenu");
const WrathAI_1 = require("../AI/WrathAI");
const CoinEnemyAI_1 = require("../AI/CoinEnemyAI");
const GreedAI_1 = require("../AI/GreedAI");
const EnvyAI_1 = require("../AI/EnvyAI");
const SlothAI_1 = require("../AI/SlothAI");
class GameLevel extends Scene_1.default {
    constructor() {
        super(...arguments);
        this.MAX_COINS = 99; // max coins for the player to hold at once
    }
    // use initScene to differentiate between level select start and game continue?
    initScene(init) {
        this.player_health = init.health;
        this.player_coins = init.coins;
        this.coin_hurt = false;
        this.player_slippery = false;
        this.player_damage = init.damage;
        this.has_shop = true;
        this.greed_tiles = false;
        this.lose_money = false;
    }
    loadScene() {
        //Load Music
        this.load.audio(this.level_music_key, this.level_music_path);
        // load the player and enemy spritesheets
        this.load.spritesheet("player", "game_assets/spritesheets/zara.json");
        //Load Zaras Heart image and sounds
        this.load.image("heart", "game_assets/images/heart.png");
        this.load.image("static_coin", "game_assets/spritesheets/coin.png");
        this.load.audio("zara_punch", "game_assets/sounds/zara_punch.mp3");
        this.load.audio("zara_damage", "game_assets/sounds/zara_damage.mp3");
        this.load.audio("zara_death", "game_assets/sounds/zara_death.mp3");
        // TODO PROJECT - add enemy spritesheets
        // Load in the enemy info
        //Gluttony
        for (let key in this.boss_sprite) {
            this.load.spritesheet(key, this.boss_sprite[key]);
        }
        for (let key in this.boss_audios) {
            this.load.audio(key, this.boss_audios[key]);
        }
        //coin
        this.load.spritesheet("coin", "game_assets/spritesheets/coin.json");
        this.load.audio("coin_pickup", "game_assets/sounds/coin_pickup.mp3");
        // shop fist image
        this.load.image("shop_fist", "game_assets/images/fist.png");
        //Hound
        this.load.spritesheet("hellhound", "game_assets/spritesheets/hellhound.json");
        this.load.audio("hound_damage", "game_assets/sounds/hound_damage.mp3");
        this.load.audio("hound_death", "game_assets/sounds/hound_death.mp3");
        for (let key in this.enemy_data) {
            this.load.object(key, this.enemy_data[key]);
        }
        this.load.spritesheet("shopkeep", "game_assets/spritesheets/shopkeep.json");
        //boss door audio
        this.load.audio("boss_door_close", "game_assets/sounds/boss_door_close.mp3");
        //Load bat audio
        this.load.spritesheet("hellbat", "game_assets/spritesheets/hellbat.json");
        this.load.audio("bat_death", "game_assets/sounds/bat_death.mp3");
        this.load.audio("bat_damage", "game_assets/sounds/bat_damage.mp3");
        //load shop screen
        this.load.image("shop_ui", "game_assets/images/shop_ui.png");
        // load the tilemap
        // TODO PROJECT - switch with correct tilemap
        for (let key in this.level_tilemap) {
            this.load.tilemap(key, this.level_tilemap[key]);
        }
        // load weapon info
        this.load.object("weaponData", "game_assets/data/weapon_data.json");
        this.load.image("fistOne", "game_assets/spritesheets/impact.png");
        this.load.spritesheet("fistOne", "game_assets/spritesheets/impact.json");
        this.load.image("fistTwo", "game_assets/spritesheets/impact_purple.png");
        this.load.spritesheet("fistTwo", "game_assets/spritesheets/impact_purple.json");
        this.load.image("fistThree", "game_assets/spritesheets/impact_blue.png");
        this.load.spritesheet("fistThree", "game_assets/spritesheets/impact_blue.json");
        this.load.image("fistFour", "game_assets/spritesheets/impact_green.png");
        this.load.spritesheet("fistFour", "game_assets/spritesheets/impact_green.json");
        //Load pause screen
        this.load.image("pauseScreen", "game_assets/images/pause_background.png");
        for (let key in this.boss_attack_image) {
            this.load.image(key, this.boss_attack_image[key]);
        }
        for (let key in this.boss_attack_sprite) {
            this.load.spritesheet(key, this.boss_attack_sprite[key]);
        }
    }
    startScene() {
        // Add in the tilemap
        let tilemap_layers = this.add.tilemap(Object.keys(this.level_tilemap)[0]);
        // let tilemap_layers = this.add.tilemap("gluttonyLevel");
        // get the wall layer
        this.walls = tilemap_layers[1].getItems()[0];
        // set the viewport bounds to the tilemap
        let tilemap_size = this.walls.size;
        this.viewport.setBounds(0, 0, tilemap_size.x, tilemap_size.y);
        // add primary layer
        this.addLayer("primary", 10);
        this.addLayer("above", 11);
        this.addLayer("below", 9);
        //Add pause screen layer
        this.addUILayer("Pause").disable();
        let hb = this.add.sprite("pauseScreen", "Pause");
        hb.position.set(hb.size.x / 2, hb.size.y / 2);
        let exit_to_main = this.add.uiElement(UIElementTypes_1.UIElementType.BUTTON, "Pause", { position: new Vec2_1.default(660, 360), text: "Exit to Main Menu" });
        exit_to_main.font = "HellText";
        exit_to_main.textColor = Color_1.default.BLACK;
        exit_to_main.fontSize = 42;
        exit_to_main.size.set(350, 90);
        exit_to_main.borderWidth = 2;
        exit_to_main.borderColor = Color_1.default.TRANSPARENT;
        exit_to_main.backgroundColor = new Color_1.default(233, 229, 158, .2);
        exit_to_main.onClickEventId = game_enums_1.Game_Events.EXIT_TO_MAIN;
        // Add a layer for UI
        this.addUILayer("UI");
        this.addUI();
        this.battle_manager = new BattleManager_1.default;
        this.initializeWeapons();
        this.initializePlayer();
        //Add Shop layer and other shop initialization
        this.initializeShop(this.shop_pos);
        this.initializeEnemies();
        this.battle_manager.setPlayer(this.player._ai);
        this.battle_manager.setEnemies(this.enemies.map(enemy => enemy._ai));
        // setup viewport
        this.viewport.follow(this.player);
        this.viewport.setZoomLevel(2);
        //Into label
        this.player.freeze();
        this.disablePause = true;
        this.level_start_label.tweens.play("slideIn");
        this.initializeBossRoom();
        //receiver subscribe to events
        this.subscribeToEvents();
        //music
        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: this.level_music_key, loop: true, holdReference: true });
        this.prev_health = this.player_health;
    }
    updateScene(deltaT) {
        Debug_1.default.log(" " + this.player.position.x + this.player.position.y);
        this.player_health = this.health_sprites.length;
        if (this.prev_health > this.player_health) {
            if (this.lose_money && this.player_coins > 0) {
                this.player_coins -= 1;
                this.coin_count_label.text = ": " + this.player_coins;
            }
        }
        this.prev_health = this.player_health;
        for (let i = 0; i < this.tutorial_zones.length; i++) {
            if (this.player.boundary.overlaps(this.tutorial_zones[i].boundary)) {
                this.tutorial_labels[i].visible = true;
            }
            else {
                this.tutorial_labels[i].visible = false;
            }
        }
        if (this.has_shop && (!this.player.boundary.overlaps(this.shop_zone.boundary)) && this.in_shop_zone) {
            this.in_shop_zone = false;
            this.shop_prompt.visible = false;
        }
        if (!this.player.frozen && Input_1.default.isJustPressed("interact") && this.in_shop_zone) {
            this.disablePause = true;
            for (let enemy of this.enemies) {
                enemy.freeze();
            }
            this.player.freeze();
            this.getLayer("shop").enable();
        }
        else if (Input_1.default.isJustPressed("interact") && this.in_shop_zone && this.player.frozen) {
            this.getLayer("shop").disable();
            this.player.unfreeze();
            for (let enemy of this.enemies) {
                enemy.unfreeze();
            }
            this.disablePause = false;
        }
        if (Input_1.default.isJustPressed("coins")) {
            this.player_coins += 5;
            this.player_coins = Math.min(this.player_coins, this.MAX_COINS);
            this.coin_count_label.text = " :  " + this.player_coins;
            for (let i = 0; i < 5; i++) {
                this.player._ai.handleEvent(new GameEvent_1.default(game_enums_1.Game_Events.GET_COIN, {}));
            }
        }
        let physics_options = {
            physics: {
                groupNames: ["wall", "player", "enemy", "coin"],
                collisions: [
                    [0, 1, 1, 1],
                    [1, 0, 0, 0],
                    [1, 0, 0, 0],
                    [1, 0, 0, 0]
                ]
            }
        };
        while (this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();
            switch (event.type) {
                case game_enums_1.Game_Events.ENEMY_COLLISION:
                    {
                        let node = this.sceneGraph.getNode(event.data.get("node"));
                        let other = this.sceneGraph.getNode(event.data.get("other"));
                        let bat_pos = Vec2_1.default.ZERO;
                        if (node === this.player) {
                            // other is bat
                            bat_pos = other.position;
                        }
                        else {
                            // node is bat
                            bat_pos = node.position;
                        }
                        event.data.add("batPosition", bat_pos);
                        node._ai.handleEvent(event);
                        other._ai.handleEvent(event);
                    }
                    break;
                case game_enums_1.Game_Events.GLUT_ATTACK:
                    {
                        for (let i = 0; i < this.enemies.length; i++) {
                            if (this.enemies[i].imageId === "Gluttony") {
                                this.enemies[i]._ai.handleEvent(new GameEvent_1.default(game_enums_1.Game_Events.GLUT_ATTACK));
                                break;
                            }
                        }
                    }
                    break;
                case game_enums_1.Game_Events.BOSS_COLLISION:
                    {
                        let node = this.sceneGraph.getNode(event.data.get("node"));
                        let other = this.sceneGraph.getNode(event.data.get("other"));
                        let boss_pos = Vec2_1.default.ZERO;
                        if (node === this.player) {
                            // other is bat
                            boss_pos = other.position;
                        }
                        else {
                            // node is bat
                            boss_pos = node.position;
                        }
                        event.data.add("bossPosition", boss_pos);
                        node._ai.handleEvent(event);
                        other._ai.handleEvent(event);
                    }
                    break;
                case game_enums_1.Game_Events.ENEMY_DIED:
                    {
                        let node = this.sceneGraph.getNode(event.data.get("owner"));
                        let enemy_position = node.position;
                        for (let i = 0; i < this.enemies.length; i++) {
                            if (this.enemies[i].id === node.id) {
                                this.enemies.splice(i, 1);
                                break;
                            }
                        }
                        this.battle_manager.setEnemies(this.enemies.map(enemy => enemy._ai));
                        node.destroy();
                        // drop a coin
                        let coin = this.add.animatedSprite("coin", "primary");
                        coin.position.set(enemy_position.x, enemy_position.y);
                        coin.addPhysics(coin.boundary, Vec2_1.default.ZERO, false);
                        coin.animation.play("IDLE", true);
                        coin.setGroup("coin");
                        coin.setTrigger("player", game_enums_1.Game_Events.GET_COIN, "player pick up coin");
                    }
                    break;
                case game_enums_1.Game_Events.GET_COIN:
                    {
                        let node = this.sceneGraph.getNode(event.data.get("node"));
                        let other = this.sceneGraph.getNode(event.data.get("other"));
                        if (node === this.player) {
                            // node is player
                            other.destroy();
                        }
                        else {
                            // other is player
                            node.destroy();
                        }
                        this.player_coins++;
                        this.player_coins = Math.min(this.player_coins, this.MAX_COINS);
                        this.coin_count_label.text = " :  " + this.player_coins;
                        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "coin_pickup", loop: false, holdReference: false });
                        this.player._ai.handleEvent(new GameEvent_1.default(game_enums_1.Game_Events.GET_COIN, { coin_hurt: String(this.coin_hurt) }));
                    }
                    break;
                case game_enums_1.Game_Events.ENTER_BOSS_FIGHT:
                    {
                        this.boss_room.removePhysics();
                        let tilemap = this.getTilemap("Wall");
                        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "boss_door_close", loop: false, holdReference: false });
                        for (let v of this.upper_boss_door) {
                            let tile_coords = tilemap.getColRowAt(v);
                            // let tile_world_pos = tilemap.getTileWorldPosition(tile_coords.y * tilemap.getDimensions().x + tile_coords.x);
                            if (this.greed_tiles) {
                                tilemap.setTile(tile_coords.y * tilemap.getDimensions().x + tile_coords.x, 45);
                            }
                            else {
                                tilemap.setTile(tile_coords.y * tilemap.getDimensions().x + tile_coords.x, 19);
                            }
                        }
                        for (let v of this.lower_boss_door) {
                            let tile_coords = tilemap.getColRowAt(v);
                            // let tile_world_pos = tilemap.getTileWorldPosition(tile_coords.y * tilemap.getDimensions().x + tile_coords.x);
                            if (this.greed_tiles) {
                                tilemap.setTile(tile_coords.y * tilemap.getDimensions().x + tile_coords.x, 44);
                            }
                            else {
                                tilemap.setTile(tile_coords.y * tilemap.getDimensions().x + tile_coords.x, 18);
                            }
                        }
                    }
                    break;
                case game_enums_1.Game_Events.BOSS_DIED:
                    {
                        let node = this.sceneGraph.getNode(event.data.get("owner"));
                        let node2 = this.sceneGraph.getNode(event.data.get("owner"));
                        for (let i = 0; i < this.enemies.length; i++) {
                            if (this.enemies[i].id === node.id) {
                                this.enemies.splice(i, 1);
                                break;
                            }
                        }
                        for (let i = 0; i < this.enemies.length; i++) {
                            if (this.enemies[i].imageId === "Boss_hitbox") {
                                node2 = this.sceneGraph.getNode(this.enemies[i].id);
                                this.enemies.splice(i, 1);
                                break;
                            }
                        }
                        this.battle_manager.setEnemies(this.enemies.map(enemy => enemy._ai));
                        if (node2 != node) {
                            node2.destroy();
                        }
                        node.destroy();
                        this.level_end_label.tweens.play("slideIn");
                    }
                    break;
                case game_enums_1.Game_Events.NEXT_LEVEL:
                    {
                        this.emitter.fireEvent(GameEventType_1.GameEventType.STOP_SOUND, { key: this.level_music_key });
                        this.viewport.stopFollow();
                        this.viewport.setZoomLevel(1);
                        this.sceneManager.changeToScene(this.next_level_constructor, {
                            health: this.player_health,
                            coins: this.player_coins,
                            damage: this.player_damage
                        }, physics_options);
                    }
                    break;
                case game_enums_1.Game_Events.IFRAMES_OVER:
                    {
                        this.player._ai.handleEvent(new GameEvent_1.default(game_enums_1.Game_Events.IFRAMES_OVER, {}));
                    }
                    break;
                case game_enums_1.Game_Events.ATTACK_OVER:
                    {
                        this.player._ai.handleEvent(new GameEvent_1.default(game_enums_1.Game_Events.ATTACK_OVER, {}));
                        this.player._ai.handleEvent(new GameEvent_1.default(game_enums_1.Game_Events.IFRAMES_OVER, {}));
                    }
                    break;
                case game_enums_1.Game_Events.INTRO_END:
                    {
                        this.disablePause = false;
                        this.player.unfreeze();
                        this.level_start_label.visible = false;
                    }
                    break;
                case game_enums_1.Game_Events.ON_PAUSE:
                    {
                        if (!this.disablePause) {
                            for (let enemy of this.enemies) {
                                enemy.freeze();
                            }
                            this.player.freeze();
                            this.viewport.setZoomLevel(1);
                            this.getLayer("UI").disable();
                            this.getLayer("Pause").enable();
                        }
                    }
                    break;
                case game_enums_1.Game_Events.ON_UNPAUSE:
                    {
                        for (let enemy of this.enemies) {
                            enemy.unfreeze();
                        }
                        this.player.unfreeze();
                        this.viewport.setZoomLevel(2);
                        this.getLayer("UI").enable();
                        this.getLayer("Pause").disable();
                    }
                    break;
                case game_enums_1.Game_Events.GAME_OVER:
                    {
                        this.emitter.fireEvent(GameEventType_1.GameEventType.STOP_SOUND, { key: this.level_music_key });
                        this.viewport.stopFollow();
                        this.viewport.setZoomLevel(1);
                        this.sceneManager.changeToScene(GameOver_1.default, {});
                    }
                    break;
                case game_enums_1.Game_Events.EXIT_TO_MAIN:
                    {
                        this.emitter.fireEvent(GameEventType_1.GameEventType.STOP_SOUND, { key: this.level_music_key });
                        this.viewport.stopFollow();
                        this.viewport.setZoomLevel(1);
                        this.sceneManager.changeToScene(MainMenu_1.default, {});
                    }
                    break;
                case game_enums_1.Game_Events.ENTERED_SHOP:
                    {
                        if (this.player_health < 10) {
                            this.health_buy_contract.text = "5 Coins = ";
                        }
                        if (!this.in_shop_zone) {
                            this.in_shop_zone = true;
                            this.shop_prompt.visible = true;
                        }
                    }
                    break;
                case game_enums_1.Game_Events.BOUGHT_HEART:
                    {
                        if (this.player_coins >= 5 && this.player_health < 10) {
                            this.player_coins -= 5;
                            let spriteToAdd = this.add.sprite("heart", "UI");
                            let prev_sprite = this.health_sprites[this.health_sprites.length - 1];
                            spriteToAdd.position = new Vec2_1.default(prev_sprite.position.x + 25, prev_sprite.position.y);
                            this.health_sprites.push(spriteToAdd);
                            this.player_health += 1;
                            this.coin_count_label.text = ": " + this.player_coins;
                            if (this.player_health === 10) {
                                this.health_buy_contract.text = "Maxed";
                            }
                            this.player._ai.handleEvent(new GameEvent_1.default(game_enums_1.Game_Events.BOUGHT_HEART, {}));
                        }
                    }
                    break;
                case game_enums_1.Game_Events.GREED_ATTACK:
                    {
                        let positionX = this.player.position.x;
                        let positionY = this.player.position.y;
                        let greed_position = this.sceneGraph.getNode(event.data.get("owner")).position;
                        let coin1 = this.add.animatedSprite("coin", "above");
                        coin1.addPhysics(coin1.boundary, Vec2_1.default.ZERO, false);
                        coin1.position.set(greed_position.x, greed_position.y);
                        coin1.animation.play("IDLE", true);
                        coin1.setGroup("coin");
                        coin1.setTrigger("player", game_enums_1.Game_Events.GET_COIN, "player pick up coin");
                        let coin1_vel = greed_position.dirTo(new Vec2_1.default(positionX, positionY)).scale(3.5);
                        coin1.addAI(CoinEnemyAI_1.default, { player: this.player, velocityX: coin1_vel.x, velocityY: coin1_vel.y });
                        let coin2 = this.add.animatedSprite("coin", "above");
                        coin2.addPhysics(coin2.boundary, Vec2_1.default.ZERO, false);
                        coin2.position.set(greed_position.x, greed_position.y);
                        coin2.animation.play("IDLE", true);
                        coin2.setGroup("coin");
                        coin2.setTrigger("player", game_enums_1.Game_Events.GET_COIN, "player pick up coin");
                        let coin2_vel = greed_position.dirTo(new Vec2_1.default(positionX - 64, positionY)).scale(3);
                        coin2.addAI(CoinEnemyAI_1.default, { player: this.player, velocityX: coin2_vel.x, velocityY: coin2_vel.y });
                        let coin3 = this.add.animatedSprite("coin", "above");
                        coin3.addPhysics(coin3.boundary, Vec2_1.default.ZERO, false);
                        coin3.position.set(greed_position.x, greed_position.y);
                        coin3.animation.play("IDLE", true);
                        coin3.setGroup("coin");
                        coin3.setTrigger("player", game_enums_1.Game_Events.GET_COIN, "player pick up coin");
                        let coin3_vel = greed_position.dirTo(new Vec2_1.default(positionX + 64, positionY)).scale(3);
                        coin3.addAI(CoinEnemyAI_1.default, { player: this.player, velocityX: coin3_vel.x, velocityY: coin3_vel.y });
                        for (let i = 0; i < this.enemies.length; i++) {
                            if (this.enemies[i].imageId === "Greed") {
                                this.enemies[i]._ai.handleEvent(event);
                                break;
                            }
                        }
                    }
                    break;
                case game_enums_1.Game_Events.WRATH_ATTACK_DOWN:
                    {
                        for (let i = 0; i < this.enemies.length; i++) {
                            if (this.enemies[i].imageId === "Wrath") {
                                this.enemies[i]._ai.handleEvent(event);
                                break;
                            }
                        }
                    }
                    break;
                case game_enums_1.Game_Events.WRATH_ATTACK_UP:
                    {
                        for (let i = 0; i < this.enemies.length; i++) {
                            if (this.enemies[i].imageId === "Wrath") {
                                this.enemies[i]._ai.handleEvent(event);
                                break;
                            }
                        }
                    }
                    break;
                case game_enums_1.Game_Events.ENVY_PUNCH:
                    {
                        for (let i = 0; i < this.enemies.length; i++) {
                            if (this.enemies[i].imageId === "Envy") {
                                this.enemies[i]._ai.handleEvent(event);
                                break;
                            }
                        }
                    }
                    break;
                case game_enums_1.Game_Events.BOUGHT_DAMAGE:
                    {
                        if (this.player_coins >= 10 && this.player_damage < 3) {
                            this.player_coins -= 10;
                            this.player_damage++;
                            this.coin_count_label.text = ": " + this.player_coins;
                            this.player._ai.handleEvent(event);
                            if (this.player_damage === 3) {
                                this.damage_buy_contract.text = "Sold Out";
                            }
                        }
                    }
                    break;
            }
        }
    }
    initializePlayer() {
        // Create the player
        this.player = this.add.animatedSprite("player", "primary");
        this.player.position.set(this.player_start_pos.x, this.player_start_pos.y);
        // this.player.position.set(1018, 330);
        this.player.addPhysics(new AABB_1.default(new Vec2_1.default(0, 14), new Vec2_1.default(16, 15)), new Vec2_1.default(0, 15));
        let fist1 = this.createWeapon("punch1");
        let fist2 = this.createWeapon("punch2");
        let fist3 = this.createWeapon("punch3");
        let invincible_label = this.add.uiElement(UIElementTypes_1.UIElementType.LABEL, "UI", { position: new Vec2_1.default(585, 280), text: "INVINCIBLE" });
        invincible_label.textColor = Color_1.default.BLACK;
        invincible_label.font = "HellText";
        invincible_label.visible = false;
        this.player.addAI(PlayerController_1.default, {
            speed: this.player_speed,
            fists: [fist1, fist2, fist3],
            slippery: this.player_slippery,
            health: this.player_health,
            coins: this.player_coins,
            damage: this.player_damage,
            health_sprites: this.health_sprites,
            invincible_cheat_label: invincible_label
        });
        this.player.animation.play("IDLE", true);
        this.player.setGroup("player");
    }
    initializeEnemies() {
        // Get the enemy data
        // const enemyData = this.load.getObject("enemyData");
        const enemyData = this.load.getObject(Object.keys(this.enemy_data)[0]);
        // Create an enemies array
        this.enemies = new Array(enemyData.numEnemies);
        // Initialize the enemies
        for (let i = 0; i < enemyData.numEnemies; i++) {
            let data = enemyData.enemies[i];
            // Create an enemy
            this.enemies[i] = this.add.animatedSprite(data.enemy_type, "primary");
            this.enemies[i].position.set(data.position[0], data.position[1]);
            this.enemies[i].animation.play("IDLE");
            let enemyOptions = {
                health: data.health,
                player: this.player,
            };
            // Activate physics
            if (data.enemy_type === "hellbat") {
                this.enemies[i].addPhysics();
                this.enemies[i].addAI(BatAI_1.default, enemyOptions);
                // this.enemies[i].addPhysics(new AABB(Vec2.ZERO, new Vec2(9, 7)));
                this.enemies[i].setGroup("enemy");
                this.enemies[i].setTrigger("player", game_enums_1.Game_Events.ENEMY_COLLISION, "bat hit player");
            }
            else if (data.enemy_type === "hellhound") {
                let enemyOptions = {
                    health: data.health,
                    player: this.player,
                    hitbox: new AABB_1.default(new Vec2_1.default(0, 14), new Vec2_1.default(25, 20))
                };
                this.enemies[i].addAI(HoundAI_1.default, enemyOptions);
                this.enemies[i].addPhysics(enemyOptions.hitbox);
                this.enemies[i].setGroup("enemy");
                this.enemies[i].setTrigger("player", game_enums_1.Game_Events.ENEMY_COLLISION, "hound hit player");
            }
            else if (data.enemy_type === "gluttony") {
                let enemyOptions = {
                    health: data.health,
                    player: this.player,
                    slam: this.createWeapon("slam")
                };
                this.enemies[i].addAI(GluttonyAI_1.default, enemyOptions);
                this.enemies[i].addPhysics(new AABB_1.default(Vec2_1.default.ZERO, new Vec2_1.default(56, 56)));
                this.enemies[i].setGroup("enemy");
                this.enemies[i].setTrigger("player", game_enums_1.Game_Events.BOSS_COLLISION, "boss hit player");
            }
            else if (data.enemy_type === "lust") {
                let enemyOptions = {
                    health: data.health,
                    player: this.player
                };
                this.enemies[i].addAI(LustAI_1.default, enemyOptions);
                this.enemies[i].addPhysics(new AABB_1.default(Vec2_1.default.ZERO, new Vec2_1.default(56, 50)));
                this.enemies[i].setGroup("enemy");
                this.enemies[i].setTrigger("player", game_enums_1.Game_Events.BOSS_COLLISION, "boss hit player");
            }
            else if (data.enemy_type === "greed") {
                let enemyOptions = {
                    health: data.health,
                    player: this.player
                };
                this.enemies[i].addAI(GreedAI_1.default, enemyOptions);
                this.enemies[i].addPhysics(new AABB_1.default(Vec2_1.default.ZERO, new Vec2_1.default(56, 56)));
                this.enemies[i].setGroup("enemy");
                this.enemies[i].setTrigger("player", game_enums_1.Game_Events.BOSS_COLLISION, "boss hit player");
            }
            else if (data.enemy_type === "wrath") {
                let enemyOptions = {
                    health: data.health,
                    player: this.player,
                    slice: this.createWeapon("slice")
                };
                this.enemies[i].addAI(WrathAI_1.default, enemyOptions);
                this.enemies[i].addPhysics(new AABB_1.default(Vec2_1.default.ZERO, new Vec2_1.default(26, 44)), new Vec2_1.default(0, 20));
                this.enemies[i].setGroup("enemy");
                this.enemies[i].setTrigger("player", game_enums_1.Game_Events.BOSS_COLLISION, "boss hit player");
            }
            else if (data.enemy_type === "envy") {
                let enemyOptions = {
                    health: data.health,
                    player: this.player,
                    punch: this.createWeapon("punch4")
                };
                this.enemies[i].addAI(EnvyAI_1.default, enemyOptions);
                this.enemies[i].addPhysics(new AABB_1.default(new Vec2_1.default(0, 14), new Vec2_1.default(16, 18)), new Vec2_1.default(0, 11));
                this.enemies[i].setGroup("enemy");
                this.enemies[i].setTrigger("player", game_enums_1.Game_Events.BOSS_COLLISION, "boss hit player");
            }
            else if (data.enemy_type === "sloth") {
                let enemyOptions = {
                    health: data.health,
                    player: this.player,
                    hitbox: new AABB_1.default(Vec2_1.default.ZERO, new Vec2_1.default(56, 50))
                };
                this.enemies[i].addPhysics(enemyOptions.hitbox);
                this.enemies[i].addAI(SlothAI_1.default, enemyOptions);
                this.enemies[i].setGroup("enemy");
                this.enemies[i].setTrigger("player", game_enums_1.Game_Events.ENEMY_COLLISION, "bat hit player");
            }
            else {
                let enemyOptions = {
                    health: data.health,
                    player: this.player,
                    slam: this.createWeapon("slam")
                };
                this.enemies[i].addAI(GluttonyAI_1.default, enemyOptions);
                this.enemies[i].addPhysics(new AABB_1.default(Vec2_1.default.ZERO, new Vec2_1.default(50, 50)));
            }
        }
    }
    initializeShop(position) {
        if (this.has_shop) {
            //Place shop keeper
            let shop_keep = this.add.animatedSprite("shopkeep", "primary");
            shop_keep.animation.play("IDLE", true);
            shop_keep.position = position;
            shop_keep.addPhysics(new AABB_1.default(new Vec2_1.default(0, 14), new Vec2_1.default(48, 40)));
            this.shop_zone = this.add.graphic(GraphicTypes_1.GraphicType.RECT, "primary", { position: new Vec2_1.default(position.x, position.y + 24), size: new Vec2_1.default(192, 128) });
            this.shop_zone.addPhysics(undefined, undefined, false, true);
            this.shop_zone.setTrigger("player", game_enums_1.Game_Events.ENTERED_SHOP, game_enums_1.Game_Events.EXITED_SHOP);
            this.shop_zone.color = new Color_1.default(0, 0, 0, 0);
            //Add shop prompt to main layer
            this.shop_prompt = this.add.uiElement(UIElementTypes_1.UIElementType.LABEL, "primary", { position: new Vec2_1.default(position.x, position.y - 50), text: "Press 'E' to enter the shop" });
            this.shop_prompt.font = "HellText";
            this.shop_prompt.textColor = Color_1.default.BLACK;
            this.shop_prompt.fontSize = 20;
            this.shop_prompt.size.set(30, 14);
            this.shop_prompt.borderWidth = 2;
            this.shop_prompt.borderColor = Color_1.default.TRANSPARENT;
            this.shop_prompt.backgroundColor = Color_1.default.TRANSPARENT;
            this.shop_prompt.visible = false;
            this.addUILayer("shop");
            // add heart contract on the left
            let heart_contract = this.add.sprite("shop_ui", "shop");
            heart_contract.position.set(200, 180);
            if (this.player_health === 10) {
                this.health_buy_contract = this.add.uiElement(UIElementTypes_1.UIElementType.BUTTON, "shop", { position: new Vec2_1.default(200, 160), text: "Maxed" });
            }
            else {
                this.health_buy_contract = this.add.uiElement(UIElementTypes_1.UIElementType.BUTTON, "shop", { position: new Vec2_1.default(200, 160), text: "5 Coins = " });
            }
            this.health_buy_contract.font = "HellText";
            this.health_buy_contract.textColor = Color_1.default.BLACK;
            this.health_buy_contract.fontSize = 42;
            this.health_buy_contract.size.set(250, 90);
            this.health_buy_contract.scale.set(1 / 2, 1 / 2);
            this.health_buy_contract.borderWidth = 2;
            this.health_buy_contract.borderColor = Color_1.default.TRANSPARENT;
            this.health_buy_contract.backgroundColor = new Color_1.default(233, 229, 158, .2);
            this.health_buy_contract.onClickEventId = game_enums_1.Game_Events.BOUGHT_HEART;
            let contract_heart_image = this.add.sprite("heart", "shop");
            contract_heart_image.position.set(250, 160);
            // add damage contract on the right
            let damage_contract = this.add.sprite("shop_ui", "shop");
            damage_contract.position.set(440, 180);
            if (this.player_damage === 3) {
                this.damage_buy_contract = this.add.uiElement(UIElementTypes_1.UIElementType.BUTTON, "shop", { position: new Vec2_1.default(440, 160), text: "Sold Out" });
            }
            else {
                this.damage_buy_contract = this.add.uiElement(UIElementTypes_1.UIElementType.BUTTON, "shop", { position: new Vec2_1.default(440, 160), text: "10 Coins = " });
            }
            this.damage_buy_contract.font = "HellText";
            this.damage_buy_contract.textColor = Color_1.default.BLACK;
            this.damage_buy_contract.fontSize = 42;
            this.damage_buy_contract.size.set(265, 90);
            this.damage_buy_contract.padding = Vec2_1.default.ZERO;
            this.damage_buy_contract.borderWidth = 2;
            this.damage_buy_contract.borderColor = Color_1.default.TRANSPARENT;
            this.damage_buy_contract.scale.set(1 / 2, 1 / 2);
            this.damage_buy_contract.backgroundColor = new Color_1.default(233, 229, 158, .2);
            this.damage_buy_contract.onClickEventId = game_enums_1.Game_Events.BOUGHT_DAMAGE;
            let damage_contract_fist = this.add.sprite("shop_fist", "shop");
            damage_contract_fist.position.set(495, 160);
            // add e to exit to shop ui
            let shop_exit = this.add.uiElement(UIElementTypes_1.UIElementType.LABEL, "shop", { position: new Vec2_1.default(320, 300), text: "Press 'E' to exit the shop" });
            shop_exit.font = "HellText";
            shop_exit.textColor = Color_1.default.BLACK;
            shop_exit.fontSize = 48;
            shop_exit.borderColor = Color_1.default.TRANSPARENT;
            shop_exit.backgroundColor = Color_1.default.TRANSPARENT;
            //Hide shop to start
            this.getLayer("shop").disable();
        }
    }
    initializeWeapons() {
        let weapon_data = this.load.getObject("weaponData");
        for (let i = 0; i < weapon_data.numWeapons; i++) {
            let weapon = weapon_data.weapons[i];
            let constr = RegistryManager_1.default.getRegistry("weaponTemplates").get(weapon.weaponType);
            let weaponType = new constr();
            weaponType.initialize(weapon);
            RegistryManager_1.default.getRegistry("weaponTypes").registerItem(weapon.name, weaponType);
        }
    }
    createWeapon(type) {
        let weaponType = RegistryManager_1.default.getRegistry("weaponTypes").get(type);
        let sprite = null;
        if (type === "punch1" || type === "punch2" || type === "punch3" || type === "punch4") {
            sprite = this.add.sprite(weaponType.sprite_key, "above");
        }
        else {
            sprite = this.add.sprite(weaponType.sprite_key, "below");
        }
        return new Weapon_1.default(sprite, weaponType, this.battle_manager);
    }
    addUI() {
        // Zara Health
        let prev_loc = new Vec2_1.default(2, 20);
        this.health_sprites = new Array();
        for (let i = 0; i < this.player_health; i++) {
            let spriteToAdd = this.add.sprite("heart", "UI");
            spriteToAdd.position = new Vec2_1.default(prev_loc.x + 25, prev_loc.y);
            this.health_sprites.push(spriteToAdd);
            prev_loc = new Vec2_1.default(prev_loc.x + 25, prev_loc.y);
        }
        let coin_sprite = this.add.sprite("static_coin", "UI");
        coin_sprite.position = new Vec2_1.default(575, 20);
        this.coin_count_label = this.add.uiElement(UIElementTypes_1.UIElementType.LABEL, "UI", { position: new Vec2_1.default(595, 21), text: " :  " + this.player_coins });
        this.coin_count_label.font = "HellText";
        // End of level label (start off screen)
        this.level_start_label = this.add.uiElement(UIElementTypes_1.UIElementType.LABEL, "UI", { position: new Vec2_1.default(-320, 100), text: this.start_level_text });
        this.level_start_label.size.set(1280, 60);
        this.level_start_label.borderRadius = 0;
        this.level_start_label.backgroundColor = Color_1.default.BLACK;
        this.level_start_label.textColor = this.level_text_color;
        this.level_start_label.fontSize = 48;
        this.level_start_label.font = "HellText";
        this.level_end_label = this.add.uiElement(UIElementTypes_1.UIElementType.LABEL, "UI", { position: new Vec2_1.default(-320, 100), text: this.end_level_text });
        this.level_end_label.size.set(1280, 60);
        this.level_end_label.borderRadius = 0;
        this.level_end_label.backgroundColor = Color_1.default.BLACK;
        this.level_end_label.textColor = this.level_text_color;
        this.level_end_label.fontSize = 48;
        this.level_end_label.font = "HellText";
        // Add a tween to move the label on screen
        this.level_start_label.tweens.add("slideIn", {
            startDelay: 0,
            endDelay: 2000,
            duration: 2000,
            reverseOnComplete: true,
            effects: [
                {
                    property: GameNode_1.TweenableProperties.posX,
                    start: -320,
                    end: 320,
                    ease: EaseFunctions_1.EaseFunctionType.OUT_SINE
                }
            ],
            onEnd: game_enums_1.Game_Events.INTRO_END
        });
        this.level_end_label.tweens.add("slideIn", {
            startDelay: 0,
            endDelay: 2000,
            duration: 2000,
            reverseOnComplete: true,
            effects: [
                {
                    property: GameNode_1.TweenableProperties.posX,
                    start: -320,
                    end: 320,
                    ease: EaseFunctions_1.EaseFunctionType.OUT_SINE
                }
            ],
            onEnd: game_enums_1.Game_Events.NEXT_LEVEL
        });
    }
    initializeBossRoom() {
        this.boss_room = this.add.graphic(GraphicTypes_1.GraphicType.RECT, "primary", { position: this.boss_room_pos, size: this.boss_room_size });
        this.boss_room.addPhysics(undefined, undefined, false, true);
        this.boss_room.setTrigger("player", game_enums_1.Game_Events.ENTER_BOSS_FIGHT, "enter boss fight");
        this.boss_room.color = Color_1.default.TRANSPARENT;
    }
    subscribeToEvents() {
        this.receiver.subscribe([
            game_enums_1.Game_Events.ENEMY_DIED,
            game_enums_1.Game_Events.BOSS_DIED,
            game_enums_1.Game_Events.ENEMY_COLLISION,
            game_enums_1.Game_Events.GAME_OVER,
            game_enums_1.Game_Events.IFRAMES_OVER,
            game_enums_1.Game_Events.INTRO_END,
            game_enums_1.Game_Events.BOSS_COLLISION,
            game_enums_1.Game_Events.ON_PAUSE,
            game_enums_1.Game_Events.ON_UNPAUSE,
            game_enums_1.Game_Events.GLUT_ATTACK,
            game_enums_1.Game_Events.ATTACK_OVER,
            game_enums_1.Game_Events.BOUGHT_HEART,
            game_enums_1.Game_Events.BOUGHT_DAMAGE,
            game_enums_1.Game_Events.ENTERED_SHOP,
            game_enums_1.Game_Events.EXITED_SHOP,
            game_enums_1.Game_Events.GET_COIN,
            game_enums_1.Game_Events.ENTER_BOSS_FIGHT,
            game_enums_1.Game_Events.NEXT_LEVEL,
            game_enums_1.Game_Events.GREED_ATTACK,
            game_enums_1.Game_Events.WRATH_ATTACK_UP,
            game_enums_1.Game_Events.WRATH_ATTACK_DOWN,
            game_enums_1.Game_Events.ENVY_PUNCH,
            game_enums_1.Game_Events.EXIT_TO_MAIN
        ]);
    }
}
exports.default = GameLevel;
},{"../AI/BatAI":1,"../AI/CoinEnemyAI":6,"../AI/EnvyAI":9,"../AI/GluttonyAI":17,"../AI/GreedAI":23,"../AI/HoundAI":29,"../AI/LustAI":37,"../AI/PlayerController":43,"../AI/SlothAI":50,"../AI/WrathAI":59,"../GameSystems/BattleManager":70,"../GameSystems/Weapon":74,"../Wolfie2D/DataTypes/Shapes/AABB":104,"../Wolfie2D/DataTypes/Vec2":111,"../Wolfie2D/Debug/Debug":112,"../Wolfie2D/Events/GameEvent":116,"../Wolfie2D/Events/GameEventType":117,"../Wolfie2D/Input/Input":119,"../Wolfie2D/Nodes/Graphics/GraphicTypes":129,"../Wolfie2D/Nodes/UIElements/UIElementTypes":142,"../Wolfie2D/Registry/RegistryManager":151,"../Wolfie2D/Scene/Scene":178,"../Wolfie2D/Utils/Color":184,"./../GameSystems/game_enums":80,"./../Wolfie2D/Nodes/GameNode":127,"./../Wolfie2D/Utils/EaseFunctions":185,"./GameOver":83,"./MainMenu":87}],83:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("../Wolfie2D/DataTypes/Vec2");
const UIElementTypes_1 = require("../Wolfie2D/Nodes/UIElements/UIElementTypes");
const Scene_1 = require("../Wolfie2D/Scene/Scene");
const Color_1 = require("../Wolfie2D/Utils/Color");
const MainMenu_1 = require("./MainMenu");
class GameOver extends Scene_1.default {
    loadScene() {
        this.load.image("gameOverImage", "game_assets/images/game_over_background.png");
    }
    startScene() {
        const center = this.viewport.getCenter();
        // The splash screen
        this.game_over = this.addUILayer("gameOver");
        // Add a background to the scene
        this.game_over_background = this.addParallaxLayer("game_over_background", new Vec2_1.default(0.5, 1), -1);
        let go = this.add.sprite("gameOverImage", "game_over_background");
        go.position.set(go.size.x / 2, go.size.y / 2);
        // Add transparent button
        const confirm = this.add.uiElement(UIElementTypes_1.UIElementType.BUTTON, "gameOver", { position: new Vec2_1.default(center.x, center.y), text: "" });
        confirm.size.set(1280, 720);
        confirm.borderWidth = 0;
        confirm.borderColor = Color_1.default.TRANSPARENT;
        confirm.backgroundColor = Color_1.default.TRANSPARENT;
        confirm.onClickEventId = "confirm";
        // Subscribe to the button events
        this.receiver.subscribe("confirm");
    }
    updateScene() {
        while (this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();
            if (event.type === "confirm") {
                this.game_over_background.disable();
                this.sceneManager.changeToScene(MainMenu_1.default, {});
            }
        }
    }
}
exports.default = GameOver;
},{"../Wolfie2D/DataTypes/Vec2":111,"../Wolfie2D/Nodes/UIElements/UIElementTypes":142,"../Wolfie2D/Scene/Scene":178,"../Wolfie2D/Utils/Color":184,"./MainMenu":87}],84:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("../Wolfie2D/DataTypes/Vec2");
const Color_1 = require("../Wolfie2D/Utils/Color");
const GameLevel_1 = require("./GameLevel");
const GraphicTypes_1 = require("../Wolfie2D/Nodes/Graphics/GraphicTypes");
const UIElementTypes_1 = require("../Wolfie2D/Nodes/UIElements/UIElementTypes");
const Input_1 = require("../Wolfie2D/Input/Input");
const GameEventType_1 = require("../Wolfie2D/Events/GameEventType");
const LustLevel_1 = require("./LustLevel");
const SlothLevel_1 = require("./SlothLevel");
class GluttonyLevel extends GameLevel_1.default {
    initScene(init) {
        super.initScene(init);
        this.level_music_key = "gluttony_music";
        this.level_music_path = "game_assets/sounds/music/gluttony.mp3";
        this.boss_audios = {
            gluttony_attack: "game_assets/sounds/gluttony_attack.mp3",
            gluttony_damage: "game_assets/sounds/gluttony_damage.mp3",
            gluttony_death: "game_assets/sounds/gluttony_death.mp3"
        };
        this.boss_sprite = {
            gluttony: "game_assets/spritesheets/gluttony.json",
            boss_hitbox: "game_assets/spritesheets/boss_hitbox.json"
        };
        this.boss_attack_image = {
            slam: "game_assets/spritesheets/smash.png"
        };
        this.boss_attack_sprite = {
            slam: "game_assets/spritesheets/smash.json"
        };
        this.enemy_data = {
            enemyData: "game_assets/data/gluttony_enemy.json"
        };
        this.level_tilemap = {
            gluttonyLevel: "game_assets/tilemaps/gluttony_level.json"
        };
        this.next_level_constructor = SlothLevel_1.default;
        this.shop_pos = new Vec2_1.default(350, 1333);
        this.player_start_pos = new Vec2_1.default(1018, 330);
        this.player_speed = 150;
        this.player_slippery = true;
        this.level_text_color = new Color_1.default(95, 90, 76);
        this.start_level_text = "Gluttony's Greasy Grotto";
        this.end_level_text = "Gluttony has been defeated!";
        this.boss_room_pos = new Vec2_1.default(1024, 1320);
        this.boss_room_size = new Vec2_1.default(6 * 32, 3 * 32);
        this.upper_boss_door = [new Vec2_1.default(1008, 1424), new Vec2_1.default(1040, 1424)];
        this.lower_boss_door = [new Vec2_1.default(1008, 1456), new Vec2_1.default(1008, 1488), new Vec2_1.default(1040, 1456), new Vec2_1.default(1040, 1488)];
    }
    startScene() {
        super.startScene();
        this.initializeLabels();
    }
    updateScene(deltaT) {
        let scene_options = {
            health: 5,
            coins: 0,
            damage: 1
        };
        let physics_options = {
            physics: {
                groupNames: ["wall", "player", "enemy", "coin"],
                collisions: [
                    [0, 1, 1, 1],
                    [1, 0, 0, 0],
                    [1, 0, 0, 0],
                    [1, 0, 0, 0]
                ]
            }
        };
        if (Input_1.default.isJustPressed("lust")) {
            this.emitter.fireEvent(GameEventType_1.GameEventType.STOP_SOUND, { key: this.level_music_key });
            this.sceneManager.changeToScene(LustLevel_1.default, scene_options, physics_options);
        }
        else if (Input_1.default.isJustPressed("gluttony")) {
            this.emitter.fireEvent(GameEventType_1.GameEventType.STOP_SOUND, { key: this.level_music_key });
            this.sceneManager.changeToScene(GluttonyLevel, scene_options, physics_options);
        }
        super.updateScene(deltaT);
    }
    initializeLabels() {
        this.tutorial_labels = new Array();
        this.tutorial_zones = new Array();
        let tutorial_zone_1 = this.add.graphic(GraphicTypes_1.GraphicType.RECT, "primary", { position: new Vec2_1.default(1025, 416), size: new Vec2_1.default(7 * 32, 5 * 32) });
        tutorial_zone_1.addPhysics(undefined, undefined, false, true);
        tutorial_zone_1.color = Color_1.default.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_1);
        let tutorial_label_1 = this.add.uiElement(UIElementTypes_1.UIElementType.LABEL, "primary", { position: new Vec2_1.default(1025, 430), text: "Careful... The floor here is slick with grease." });
        tutorial_label_1.font = "HellText";
        tutorial_label_1.textColor = Color_1.default.BLACK;
        tutorial_label_1.fontSize = 32;
        tutorial_label_1.size.set(30, 14);
        tutorial_label_1.borderWidth = 2;
        tutorial_label_1.borderColor = Color_1.default.TRANSPARENT;
        tutorial_label_1.backgroundColor = Color_1.default.TRANSPARENT;
        tutorial_label_1.visible = false;
        this.tutorial_labels.push(tutorial_label_1);
    }
}
exports.default = GluttonyLevel;
},{"../Wolfie2D/DataTypes/Vec2":111,"../Wolfie2D/Events/GameEventType":117,"../Wolfie2D/Input/Input":119,"../Wolfie2D/Nodes/Graphics/GraphicTypes":129,"../Wolfie2D/Nodes/UIElements/UIElementTypes":142,"../Wolfie2D/Utils/Color":184,"./GameLevel":82,"./LustLevel":86,"./SlothLevel":88}],85:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("../Wolfie2D/DataTypes/Vec2");
const Color_1 = require("../Wolfie2D/Utils/Color");
const GameLevel_1 = require("./GameLevel");
const MainMenu_1 = require("./MainMenu");
const GraphicTypes_1 = require("../Wolfie2D/Nodes/Graphics/GraphicTypes");
const UIElementTypes_1 = require("../Wolfie2D/Nodes/UIElements/UIElementTypes");
const Input_1 = require("../Wolfie2D/Input/Input");
const GameEventType_1 = require("../Wolfie2D/Events/GameEventType");
const LustLevel_1 = require("./LustLevel");
const GluttonyLevel_1 = require("./GluttonyLevel");
class GreedLevel extends GameLevel_1.default {
    initScene(init) {
        super.initScene(init);
        // TODO
        this.level_music_key = "lust_music";
        this.level_music_path = "game_assets/sounds/music/lust.mp3";
        this.boss_audios = {
            greed_attack: "game_assets/sounds/greed_attack.mp3",
            greed_damage: "game_assets/sounds/greed_damage.mp3",
            greed_death: "game_assets/sounds/greed_death.mp3"
        };
        this.boss_sprite = {
            greed: "game_assets/spritesheets/greed.json"
        };
        this.boss_attack_image = {};
        this.boss_attack_sprite = {};
        this.enemy_data = {
            enemyData: "game_assets/data/greed_enemy.json"
        };
        this.level_tilemap = {
            greedLevel: "game_assets/tilemaps/greed_level.json"
        };
        this.next_level_constructor = MainMenu_1.default;
        // this.player_start_pos = new Vec2(1009, 1756);
        this.player_start_pos = new Vec2_1.default(1008, 1233);
        this.player_speed = 150;
        this.level_text_color = new Color_1.default(252, 219, 3);
        this.start_level_text = "Greed's Golden Gorge";
        this.end_level_text = "Greed has been defeated!";
        this.boss_room_pos = new Vec2_1.default(1008, 1233);
        this.boss_room_size = new Vec2_1.default(7 * 32, 3 * 32);
        this.coin_hurt = true;
        this.has_shop = false;
        this.greed_tiles = true;
        this.upper_boss_door = [new Vec2_1.default(944, 1326), new Vec2_1.default(976, 1326), new Vec2_1.default(1008, 1326), new Vec2_1.default(1040, 1326), new Vec2_1.default(1072, 1326)];
        this.lower_boss_door = [new Vec2_1.default(944, 1356), new Vec2_1.default(944, 1388), new Vec2_1.default(976, 1356), new Vec2_1.default(976, 1388), new Vec2_1.default(1008, 1356), new Vec2_1.default(1008, 1388), new Vec2_1.default(1040, 1356), new Vec2_1.default(1040, 1388), new Vec2_1.default(1072, 1356), new Vec2_1.default(1072, 1388)];
    }
    startScene() {
        super.startScene();
        this.initializeLabels();
    }
    updateScene(deltaT) {
        let scene_options = {
            health: 5,
            coins: 0
        };
        let physics_options = {
            physics: {
                groupNames: ["wall", "player", "enemy", "coin"],
                collisions: [
                    [0, 1, 1, 1],
                    [1, 0, 0, 0],
                    [1, 0, 0, 0],
                    [1, 0, 0, 0]
                ]
            }
        };
        if (Input_1.default.isJustPressed("lust")) {
            this.emitter.fireEvent(GameEventType_1.GameEventType.STOP_SOUND, { key: this.level_music_key });
            this.sceneManager.changeToScene(LustLevel_1.default, scene_options, physics_options);
        }
        else if (Input_1.default.isJustPressed("gluttony")) {
            this.emitter.fireEvent(GameEventType_1.GameEventType.STOP_SOUND, { key: this.level_music_key });
            this.sceneManager.changeToScene(GluttonyLevel_1.default, scene_options, physics_options);
        }
        super.updateScene(deltaT);
    }
    initializeLabels() {
        this.tutorial_labels = new Array();
        this.tutorial_zones = new Array();
        let tutorial_zone_1 = this.add.graphic(GraphicTypes_1.GraphicType.RECT, "primary", { position: new Vec2_1.default(1010, 1773), size: new Vec2_1.default(7 * 32, 5 * 32) });
        tutorial_zone_1.addPhysics(undefined, undefined, false, true);
        tutorial_zone_1.color = Color_1.default.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_1);
        let tutorial_label_1 = this.add.uiElement(UIElementTypes_1.UIElementType.LABEL, "primary", { position: new Vec2_1.default(1010, 1733), text: "Don't let your greed consume you, coins hurt!" });
        tutorial_label_1.font = "HellText";
        tutorial_label_1.textColor = Color_1.default.BLACK;
        tutorial_label_1.fontSize = 32;
        tutorial_label_1.size.set(30, 14);
        tutorial_label_1.borderWidth = 2;
        tutorial_label_1.borderColor = Color_1.default.TRANSPARENT;
        tutorial_label_1.backgroundColor = Color_1.default.TRANSPARENT;
        tutorial_label_1.visible = false;
        this.tutorial_labels.push(tutorial_label_1);
    }
}
exports.default = GreedLevel;
},{"../Wolfie2D/DataTypes/Vec2":111,"../Wolfie2D/Events/GameEventType":117,"../Wolfie2D/Input/Input":119,"../Wolfie2D/Nodes/Graphics/GraphicTypes":129,"../Wolfie2D/Nodes/UIElements/UIElementTypes":142,"../Wolfie2D/Utils/Color":184,"./GameLevel":82,"./GluttonyLevel":84,"./LustLevel":86,"./MainMenu":87}],86:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("../Wolfie2D/DataTypes/Vec2");
const Color_1 = require("../Wolfie2D/Utils/Color");
const GameLevel_1 = require("./GameLevel");
const GraphicTypes_1 = require("../Wolfie2D/Nodes/Graphics/GraphicTypes");
const UIElementTypes_1 = require("../Wolfie2D/Nodes/UIElements/UIElementTypes");
const GluttonyLevel_1 = require("./GluttonyLevel");
const Input_1 = require("../Wolfie2D/Input/Input");
const GameEventType_1 = require("../Wolfie2D/Events/GameEventType");
const WrathLevel_1 = require("./WrathLevel");
class LustLevel extends GameLevel_1.default {
    initScene(init) {
        super.initScene(init);
        this.level_music_key = "lust_music";
        this.level_music_path = "game_assets/sounds/music/lust.mp3";
        this.boss_audios = {
            lust_move: "game_assets/sounds/lust_move.mp3",
            lust_death: "game_assets/sounds/lust_death.mp3",
            lust_damage: "game_assets/sounds/lust_damage.mp3"
        };
        this.boss_sprite = {
            lust: "game_assets/spritesheets/lust.json"
        };
        this.boss_attack_image = {};
        this.boss_attack_sprite = {};
        this.enemy_data = {
            enemyData: "game_assets/data/lust_enemy.json"
        };
        this.level_tilemap = {
            lustLevel: "game_assets/tilemaps/lust_level.json"
        };
        this.next_level_constructor = WrathLevel_1.default;
        this.shop_pos = new Vec2_1.default(780, 608);
        this.player_start_pos = new Vec2_1.default(1138, 116);
        this.player_speed = 150;
        this.player_slippery = false;
        this.level_text_color = new Color_1.default(255, 0, 196);
        this.start_level_text = "Lust's Lascivious Lair";
        this.end_level_text = "Lust has been defeated!";
        this.boss_room_pos = new Vec2_1.default(1024, 1224);
        this.boss_room_size = new Vec2_1.default(6 * 32, 3 * 32);
        this.upper_boss_door = [new Vec2_1.default(1008, 1360), new Vec2_1.default(1040, 1360)];
        this.lower_boss_door = [new Vec2_1.default(1008, 1392), new Vec2_1.default(1008, 1424), new Vec2_1.default(1040, 1392), new Vec2_1.default(1040, 1424)];
    }
    startScene() {
        super.startScene();
        this.initializeTutorial();
    }
    updateScene(deltaT) {
        let scene_options = {
            health: 5,
            coins: 0,
            damage: 1
        };
        let physics_options = {
            physics: {
                groupNames: ["wall", "player", "enemy", "coin"],
                collisions: [
                    [0, 1, 1, 1],
                    [1, 0, 0, 0],
                    [1, 0, 0, 0],
                    [1, 0, 0, 0]
                ]
            }
        };
        if (Input_1.default.isJustPressed("lust")) {
            this.emitter.fireEvent(GameEventType_1.GameEventType.STOP_SOUND, { key: this.level_music_key });
            this.sceneManager.changeToScene(LustLevel, scene_options, physics_options);
        }
        else if (Input_1.default.isJustPressed("gluttony")) {
            this.emitter.fireEvent(GameEventType_1.GameEventType.STOP_SOUND, { key: this.level_music_key });
            this.sceneManager.changeToScene(GluttonyLevel_1.default, scene_options, physics_options);
        }
        super.updateScene(deltaT);
    }
    initializeTutorial() {
        this.tutorial_labels = new Array();
        this.tutorial_zones = new Array();
        let tutorial_zone_1 = this.add.graphic(GraphicTypes_1.GraphicType.RECT, "primary", { position: new Vec2_1.default(1138, 116), size: new Vec2_1.default(7 * 32, 5 * 32) });
        tutorial_zone_1.addPhysics(undefined, undefined, false, true);
        tutorial_zone_1.color = Color_1.default.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_1);
        let tutorial_label_1 = this.add.uiElement(UIElementTypes_1.UIElementType.LABEL, "primary", { position: new Vec2_1.default(1138, 48), text: "Use WASD to move" });
        tutorial_label_1.font = "HellText";
        tutorial_label_1.textColor = Color_1.default.BLACK;
        tutorial_label_1.fontSize = 32;
        tutorial_label_1.size.set(30, 14);
        tutorial_label_1.borderWidth = 2;
        tutorial_label_1.borderColor = Color_1.default.TRANSPARENT;
        tutorial_label_1.backgroundColor = Color_1.default.TRANSPARENT;
        tutorial_label_1.visible = false;
        this.tutorial_labels.push(tutorial_label_1);
        let tutorial_zone_2 = this.add.graphic(GraphicTypes_1.GraphicType.RECT, "primary", { position: new Vec2_1.default(1680, 426), size: new Vec2_1.default(10 * 32, 5 * 32) });
        tutorial_zone_2.addPhysics(undefined, undefined, false, true);
        tutorial_zone_2.color = Color_1.default.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_2);
        let tutorial_label_2 = this.add.uiElement(UIElementTypes_1.UIElementType.LABEL, "primary", { position: new Vec2_1.default(1616, 360), text: "Click to attack in the direction of your mouse" });
        tutorial_label_2.font = "HellText";
        tutorial_label_2.textColor = Color_1.default.BLACK;
        tutorial_label_2.fontSize = 32;
        tutorial_label_2.size.set(30, 14);
        tutorial_label_2.borderWidth = 2;
        tutorial_label_2.borderColor = Color_1.default.TRANSPARENT;
        tutorial_label_2.backgroundColor = Color_1.default.TRANSPARENT;
        tutorial_label_2.visible = false;
        this.tutorial_labels.push(tutorial_label_2);
        let tutorial_zone_3 = this.add.graphic(GraphicTypes_1.GraphicType.RECT, "primary", { position: new Vec2_1.default(1776, 722), size: new Vec2_1.default(10 * 32, 4 * 32) });
        tutorial_zone_3.addPhysics(undefined, undefined, false, true);
        tutorial_zone_3.color = Color_1.default.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_3);
        let tutorial_label_3 = this.add.uiElement(UIElementTypes_1.UIElementType.LABEL, "primary", { position: new Vec2_1.default(1776, 642), text: "Hellbats take 2 punches to kill" });
        tutorial_label_3.font = "HellText";
        tutorial_label_3.textColor = Color_1.default.BLACK;
        tutorial_label_3.fontSize = 32;
        tutorial_label_3.size.set(30, 14);
        tutorial_label_3.borderWidth = 2;
        tutorial_label_3.borderColor = Color_1.default.TRANSPARENT;
        tutorial_label_3.backgroundColor = Color_1.default.TRANSPARENT;
        tutorial_label_3.visible = false;
        this.tutorial_labels.push(tutorial_label_3);
        let tutorial_zone_4 = this.add.graphic(GraphicTypes_1.GraphicType.RECT, "primary", { position: new Vec2_1.default(1808, 1164), size: new Vec2_1.default(9 * 32, 4 * 32) });
        tutorial_zone_4.addPhysics(undefined, undefined, false, true);
        tutorial_zone_4.color = Color_1.default.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_4);
        let tutorial_label_4 = this.add.uiElement(UIElementTypes_1.UIElementType.LABEL, "primary", { position: new Vec2_1.default(1808, 1084), text: "Walk over coins to pick them up" });
        tutorial_label_4.font = "HellText";
        tutorial_label_4.textColor = Color_1.default.BLACK;
        tutorial_label_4.fontSize = 32;
        tutorial_label_4.size.set(30, 14);
        tutorial_label_4.borderWidth = 2;
        tutorial_label_4.borderColor = Color_1.default.TRANSPARENT;
        tutorial_label_4.backgroundColor = Color_1.default.TRANSPARENT;
        tutorial_label_4.visible = false;
        this.tutorial_labels.push(tutorial_label_4);
        let tutorial_zone_5 = this.add.graphic(GraphicTypes_1.GraphicType.RECT, "primary", { position: new Vec2_1.default(1716, 1462), size: new Vec2_1.default(9 * 32, 4 * 32) });
        tutorial_zone_5.addPhysics(undefined, undefined, false, true);
        tutorial_zone_5.color = Color_1.default.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_5);
        let tutorial_label_5 = this.add.uiElement(UIElementTypes_1.UIElementType.LABEL, "primary", { position: new Vec2_1.default(1732, 1380), text: "Hellbats are scattered across" });
        tutorial_label_5.font = "HellText";
        tutorial_label_5.textColor = Color_1.default.BLACK;
        tutorial_label_5.fontSize = 32;
        tutorial_label_5.size.set(30, 14);
        tutorial_label_5.borderWidth = 2;
        tutorial_label_5.borderColor = Color_1.default.TRANSPARENT;
        tutorial_label_5.backgroundColor = Color_1.default.TRANSPARENT;
        tutorial_label_5.visible = false;
        this.tutorial_labels.push(tutorial_label_5);
        let tutorial_zone_6 = this.add.graphic(GraphicTypes_1.GraphicType.RECT, "primary", { position: new Vec2_1.default(292, 1392), size: new Vec2_1.default(9 * 32, 4 * 32) });
        tutorial_zone_6.addPhysics(undefined, undefined, false, true);
        tutorial_zone_6.color = Color_1.default.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_6);
        let tutorial_label_6 = this.add.uiElement(UIElementTypes_1.UIElementType.LABEL, "primary", { position: new Vec2_1.default(292, 1302), text: "Hellhounds take 3 hits to kill" });
        tutorial_label_6.font = "HellText";
        tutorial_label_6.textColor = Color_1.default.BLACK;
        tutorial_label_6.fontSize = 32;
        tutorial_label_6.size.set(30, 14);
        tutorial_label_6.borderWidth = 2;
        tutorial_label_6.borderColor = Color_1.default.TRANSPARENT;
        tutorial_label_6.backgroundColor = Color_1.default.TRANSPARENT;
        tutorial_label_6.visible = false;
        this.tutorial_labels.push(tutorial_label_6);
        let tutorial_zone_7 = this.add.graphic(GraphicTypes_1.GraphicType.RECT, "primary", { position: new Vec2_1.default(1080, 370), size: new Vec2_1.default(9 * 32, 5 * 32) });
        tutorial_zone_7.addPhysics(undefined, undefined, false, true);
        tutorial_zone_7.color = Color_1.default.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_7);
        let tutorial_label_7 = this.add.uiElement(UIElementTypes_1.UIElementType.LABEL, "primary", { position: new Vec2_1.default(1100, 460), text: "You can find Lust at the center of the floor" });
        tutorial_label_7.font = "HellText";
        tutorial_label_7.textColor = Color_1.default.BLACK;
        tutorial_label_7.fontSize = 32;
        tutorial_label_7.size.set(30, 14);
        tutorial_label_7.borderWidth = 2;
        tutorial_label_7.borderColor = Color_1.default.TRANSPARENT;
        tutorial_label_7.backgroundColor = Color_1.default.TRANSPARENT;
        tutorial_label_7.visible = false;
        this.tutorial_labels.push(tutorial_label_7);
        let tutorial_zone_8 = this.add.graphic(GraphicTypes_1.GraphicType.RECT, "primary", { position: new Vec2_1.default(1028, 1488), size: new Vec2_1.default(6 * 32, 7 * 32) });
        tutorial_zone_8.addPhysics(undefined, undefined, false, true);
        tutorial_zone_8.color = Color_1.default.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_8);
        let tutorial_label_8 = this.add.uiElement(UIElementTypes_1.UIElementType.LABEL, "primary", { position: new Vec2_1.default(1028, 1432), text: "You can enter the boss room here..." });
        tutorial_label_8.font = "HellText";
        tutorial_label_8.textColor = Color_1.default.BLACK;
        tutorial_label_8.fontSize = 32;
        tutorial_label_8.size.set(30, 14);
        tutorial_label_8.borderWidth = 2;
        tutorial_label_8.borderColor = Color_1.default.TRANSPARENT;
        tutorial_label_8.backgroundColor = Color_1.default.TRANSPARENT;
        tutorial_label_8.visible = false;
        this.tutorial_labels.push(tutorial_label_8);
        let tutorial_zone_9 = this.add.graphic(GraphicTypes_1.GraphicType.RECT, "primary", { position: new Vec2_1.default(1028, 1488), size: new Vec2_1.default(6 * 32, 7 * 32) });
        tutorial_zone_9.addPhysics(undefined, undefined, false, true);
        tutorial_zone_9.color = Color_1.default.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_9);
        let tutorial_label_9 = this.add.uiElement(UIElementTypes_1.UIElementType.LABEL, "primary", { position: new Vec2_1.default(884, 1470), text: "or you can look for the shop" });
        tutorial_label_9.font = "HellText";
        tutorial_label_9.textColor = Color_1.default.BLACK;
        tutorial_label_9.fontSize = 32;
        tutorial_label_9.size.set(30, 14);
        tutorial_label_9.borderWidth = 2;
        tutorial_label_9.borderColor = Color_1.default.TRANSPARENT;
        tutorial_label_9.backgroundColor = Color_1.default.TRANSPARENT;
        tutorial_label_9.visible = false;
        this.tutorial_labels.push(tutorial_label_9);
        let tutorial_zone_10 = this.add.graphic(GraphicTypes_1.GraphicType.RECT, "primary", { position: new Vec2_1.default(1716, 1462), size: new Vec2_1.default(9 * 32, 4 * 32) });
        tutorial_zone_10.addPhysics(undefined, undefined, false, true);
        tutorial_zone_10.color = Color_1.default.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_10);
        let tutorial_label_10 = this.add.uiElement(UIElementTypes_1.UIElementType.LABEL, "primary", { position: new Vec2_1.default(1732, 1398), text: "the Circles of Hell" });
        tutorial_label_10.font = "HellText";
        tutorial_label_10.textColor = Color_1.default.BLACK;
        tutorial_label_10.fontSize = 32;
        tutorial_label_10.size.set(30, 14);
        tutorial_label_10.borderWidth = 2;
        tutorial_label_10.borderColor = Color_1.default.TRANSPARENT;
        tutorial_label_10.backgroundColor = Color_1.default.TRANSPARENT;
        tutorial_label_10.visible = false;
        this.tutorial_labels.push(tutorial_label_10);
    }
}
exports.default = LustLevel;
},{"../Wolfie2D/DataTypes/Vec2":111,"../Wolfie2D/Events/GameEventType":117,"../Wolfie2D/Input/Input":119,"../Wolfie2D/Nodes/Graphics/GraphicTypes":129,"../Wolfie2D/Nodes/UIElements/UIElementTypes":142,"../Wolfie2D/Utils/Color":184,"./GameLevel":82,"./GluttonyLevel":84,"./WrathLevel":90}],87:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("../Wolfie2D/DataTypes/Vec2");
const UIElementTypes_1 = require("../Wolfie2D/Nodes/UIElements/UIElementTypes");
const Scene_1 = require("../Wolfie2D/Scene/Scene");
const Color_1 = require("../Wolfie2D/Utils/Color");
const GluttonyLevel_1 = require("./GluttonyLevel");
const LustLevel_1 = require("./LustLevel");
const GameEventType_1 = require("../Wolfie2D/Events/GameEventType");
const GreedLevel_1 = require("./GreedLevel");
const WrathLevel_1 = require("./WrathLevel");
const SlothLevel_1 = require("./SlothLevel");
const EnvyLevel_1 = require("./EnvyLevel");
class MainMenu extends Scene_1.default {
    loadScene() {
        this.load.image("mainMenuImage", "game_assets/images/general_background.png");
        this.load.image("levelSelectImage", "game_assets/images/level_select_background.png");
        this.load.image("helpImage", "game_assets/images/help_background.png");
        this.load.image("controlsImage", "game_assets/images/controls_background.png");
        this.load.audio("main_menu_music", "game_assets/sounds/music/main_menu.mp3");
    }
    startScene() {
        const center = this.viewport.getCenter();
        // subscribe to button events
        this.receiver.subscribe("newGame");
        this.receiver.subscribe("levelSelect");
        this.receiver.subscribe("help");
        this.receiver.subscribe("controls");
        this.receiver.subscribe("mainMenu");
        this.receiver.subscribe("levelGluttony");
        this.receiver.subscribe("levelLust");
        this.receiver.subscribe("levelWrath");
        this.receiver.subscribe("levelGreed");
        this.receiver.subscribe("levelSloth");
        this.receiver.subscribe("levelEnvy");
        this.receiver.subscribe("levelPride");
        /* ################ MAIN MENU ################ */
        // create main menu layer
        this.main_menu = this.addUILayer("mainMenu");
        // add main menu background image
        let mmb = this.add.sprite("mainMenuImage", "mainMenu");
        mmb.position.set(mmb.size.x / 2, mmb.size.y / 2);
        // Add new game button, and give it an event to emit on press
        const new_game_text = this.add.uiElement(UIElementTypes_1.UIElementType.LABEL, "mainMenu", { position: new Vec2_1.default(center.x - 14, center.y - 170), text: "New Game" });
        new_game_text.font = "HellText";
        new_game_text.textColor = Color_1.default.WHITE;
        new_game_text.fontSize = 66;
        new_game_text.size.set(330, 70);
        const new_game_button = this.add.uiElement(UIElementTypes_1.UIElementType.BUTTON, "mainMenu", { position: new Vec2_1.default(center.x - 14, center.y - 170), text: "New Game" });
        new_game_button.font = "HellText";
        new_game_button.textColor = Color_1.default.BLACK;
        new_game_button.fontSize = 64;
        new_game_button.size.set(330, 70);
        new_game_button.borderWidth = 2;
        new_game_button.borderColor = Color_1.default.TRANSPARENT;
        new_game_button.backgroundColor = Color_1.default.TRANSPARENT;
        new_game_button.onClickEventId = "newGame";
        // Add level select button
        const level_text = this.add.uiElement(UIElementTypes_1.UIElementType.LABEL, "mainMenu", { position: new Vec2_1.default(center.x - 13, center.y - 60), text: "Level Select" });
        level_text.font = "HellText";
        level_text.textColor = Color_1.default.WHITE;
        level_text.fontSize = 66;
        level_text.size.set(420, 70);
        const level_select_button = this.add.uiElement(UIElementTypes_1.UIElementType.BUTTON, "mainMenu", { position: new Vec2_1.default(center.x - 13, center.y - 60), text: "Level Select" });
        level_select_button.font = "HellText";
        level_select_button.textColor = Color_1.default.BLACK;
        level_select_button.fontSize = 64;
        level_select_button.size.set(420, 70);
        level_select_button.borderWidth = 2;
        level_select_button.borderColor = Color_1.default.TRANSPARENT;
        level_select_button.backgroundColor = Color_1.default.TRANSPARENT;
        level_select_button.onClickEventId = "levelSelect";
        // Add help button
        const help_text = this.add.uiElement(UIElementTypes_1.UIElementType.LABEL, "mainMenu", { position: new Vec2_1.default(center.x - 21, center.y + 55), text: "Help" });
        help_text.font = "HellText";
        help_text.textColor = Color_1.default.WHITE;
        help_text.fontSize = 67;
        help_text.size.set(145, 75);
        const help_button = this.add.uiElement(UIElementTypes_1.UIElementType.BUTTON, "mainMenu", { position: new Vec2_1.default(center.x - 21, center.y + 55), text: "Help" });
        help_button.font = "HellText";
        help_button.textColor = Color_1.default.BLACK;
        help_button.fontSize = 64;
        help_button.size.set(145, 75);
        help_button.borderWidth = 2;
        help_button.borderColor = Color_1.default.TRANSPARENT;
        help_button.backgroundColor = Color_1.default.TRANSPARENT;
        help_button.onClickEventId = "help";
        // Add controls
        const controls_text = this.add.uiElement(UIElementTypes_1.UIElementType.LABEL, "mainMenu", { position: new Vec2_1.default(center.x - 13, center.y + 150), text: "Controls" });
        controls_text.font = "HellText";
        controls_text.textColor = Color_1.default.WHITE;
        controls_text.fontSize = 67;
        controls_text.size.set(268, 70);
        const controls_button = this.add.uiElement(UIElementTypes_1.UIElementType.BUTTON, "mainMenu", { position: new Vec2_1.default(center.x - 13, center.y + 150), text: "Controls" });
        controls_button.font = "HellText";
        controls_button.textColor = Color_1.default.BLACK;
        controls_button.fontSize = 64;
        controls_button.size.set(268, 70);
        controls_button.borderWidth = 2;
        controls_button.borderColor = Color_1.default.TRANSPARENT;
        controls_button.backgroundColor = Color_1.default.TRANSPARENT;
        controls_button.onClickEventId = "controls";
        /* ################ LEVEL SELECT ################ */
        // create level select layer
        this.level_select = this.addUILayer("levelSelect");
        this.level_select.setHidden(true);
        // add level select background image
        let lsb = this.add.sprite("levelSelectImage", "levelSelect");
        lsb.position.set(lsb.size.x / 2, lsb.size.y / 2);
        const level_select_back = this.add.uiElement(UIElementTypes_1.UIElementType.BUTTON, "levelSelect", { position: new Vec2_1.default(center.x + 518, center.y + 308), text: "Back" });
        level_select_back.font = "HellText";
        level_select_back.textColor = Color_1.default.BLACK;
        level_select_back.fontSize = 64;
        level_select_back.size.set(168, 65);
        level_select_back.borderWidth = 2;
        level_select_back.borderColor = Color_1.default.TRANSPARENT;
        level_select_back.backgroundColor = Color_1.default.TRANSPARENT;
        level_select_back.onClickEventId = "mainMenu";
        const level_select_lust = this.add.uiElement(UIElementTypes_1.UIElementType.BUTTON, "levelSelect", { position: new Vec2_1.default(center.x - 20, center.y - 195), text: "Lust" });
        level_select_lust.font = "HellText";
        level_select_lust.textColor = Color_1.default.WHITE;
        level_select_lust.fontSize = 64;
        level_select_lust.size.set(140, 58);
        level_select_lust.borderWidth = 2;
        level_select_lust.borderColor = Color_1.default.TRANSPARENT;
        level_select_lust.backgroundColor = Color_1.default.TRANSPARENT;
        level_select_lust.onClickEventId = "levelLust";
        const level_select_wrath = this.add.uiElement(UIElementTypes_1.UIElementType.BUTTON, "levelSelect", { position: new Vec2_1.default(center.x - 20, center.y - 95), text: "Wrath" });
        level_select_wrath.font = "HellText";
        level_select_wrath.textColor = Color_1.default.WHITE;
        level_select_wrath.fontSize = 64;
        level_select_wrath.size.set(164, 54);
        level_select_wrath.borderWidth = 2;
        level_select_wrath.borderColor = Color_1.default.TRANSPARENT;
        level_select_wrath.backgroundColor = Color_1.default.TRANSPARENT;
        level_select_wrath.onClickEventId = "levelWrath";
        const level_select_gluttony = this.add.uiElement(UIElementTypes_1.UIElementType.BUTTON, "levelSelect", { position: new Vec2_1.default(center.x - 21, center.y + 3), text: "Gluttony" });
        level_select_gluttony.font = "HellText";
        level_select_gluttony.textColor = Color_1.default.WHITE;
        level_select_gluttony.fontSize = 64;
        level_select_gluttony.size.set(285, 75);
        level_select_gluttony.borderWidth = 2;
        level_select_gluttony.borderColor = Color_1.default.TRANSPARENT;
        level_select_gluttony.backgroundColor = Color_1.default.TRANSPARENT;
        level_select_gluttony.onClickEventId = "levelGluttony";
        const level_select_greed = this.add.uiElement(UIElementTypes_1.UIElementType.BUTTON, "levelSelect", { position: new Vec2_1.default(center.x - 20, center.y + 230), text: "Greed" });
        level_select_greed.font = "HellText";
        level_select_greed.textColor = Color_1.default.WHITE;
        level_select_greed.fontSize = 52;
        level_select_greed.size.set(150, 50);
        level_select_greed.borderWidth = 2;
        level_select_greed.borderColor = Color_1.default.TRANSPARENT;
        level_select_greed.backgroundColor = Color_1.default.TRANSPARENT;
        level_select_greed.onClickEventId = "levelGreed";
        const level_select_sloth = this.add.uiElement(UIElementTypes_1.UIElementType.BUTTON, "levelSelect", { position: new Vec2_1.default(center.x - 21, center.y + 85), text: "Sloth" });
        level_select_sloth.font = "HellText";
        level_select_sloth.textColor = Color_1.default.WHITE;
        level_select_sloth.fontSize = 60;
        level_select_sloth.size.set(135, 50);
        level_select_sloth.borderWidth = 2;
        level_select_sloth.borderColor = Color_1.default.TRANSPARENT;
        level_select_sloth.backgroundColor = Color_1.default.TRANSPARENT;
        level_select_sloth.onClickEventId = "levelSloth";
        const level_select_envy = this.add.uiElement(UIElementTypes_1.UIElementType.BUTTON, "levelSelect", { position: new Vec2_1.default(center.x - 19, center.y + 160), text: "Envy" });
        level_select_envy.font = "HellText";
        level_select_envy.textColor = Color_1.default.WHITE;
        level_select_envy.fontSize = 56;
        level_select_envy.size.set(114, 50);
        level_select_envy.borderWidth = 2;
        level_select_envy.borderColor = Color_1.default.TRANSPARENT;
        level_select_envy.backgroundColor = Color_1.default.TRANSPARENT;
        level_select_envy.onClickEventId = "levelEnvy";
        const level_select_pride = this.add.uiElement(UIElementTypes_1.UIElementType.BUTTON, "levelSelect", { position: new Vec2_1.default(center.x - 22, center.y + 295), text: "Pride" });
        level_select_pride.font = "HellText";
        level_select_pride.textColor = Color_1.default.WHITE;
        level_select_pride.fontSize = 48;
        level_select_pride.size.set(107, 47);
        level_select_pride.borderWidth = 2;
        level_select_pride.borderColor = Color_1.default.TRANSPARENT;
        level_select_pride.backgroundColor = Color_1.default.TRANSPARENT;
        level_select_pride.onClickEventId = "levelPride";
        /* ################ HELP ################ */
        // create help layer
        this.help = this.addUILayer("help");
        this.help.setHidden(true);
        // add help background image
        let hb = this.add.sprite("helpImage", "help");
        hb.position.set(hb.size.x / 2, hb.size.y / 2);
        const help_back = this.add.uiElement(UIElementTypes_1.UIElementType.BUTTON, "help", { position: new Vec2_1.default(center.x + 518, center.y + 308), text: "Back" });
        help_back.font = "HellText";
        help_back.textColor = Color_1.default.BLACK;
        help_back.fontSize = 64;
        help_back.size.set(168, 65);
        help_back.borderWidth = 2;
        help_back.borderColor = Color_1.default.TRANSPARENT;
        help_back.backgroundColor = Color_1.default.TRANSPARENT;
        help_back.onClickEventId = "mainMenu";
        /* ################ CONTROLS ################ */
        // create controls layer
        this.controls = this.addUILayer("controls");
        this.controls.setHidden(true);
        // add controls background image
        let cb = this.add.sprite("controlsImage", "controls");
        cb.position.set(cb.size.x / 2, cb.size.y / 2);
        const controls_back = this.add.uiElement(UIElementTypes_1.UIElementType.BUTTON, "controls", { position: new Vec2_1.default(center.x + 518, center.y + 308), text: "Back" });
        controls_back.font = "HellText";
        controls_back.textColor = Color_1.default.BLACK;
        controls_back.fontSize = 64;
        controls_back.size.set(168, 65);
        controls_back.borderWidth = 2;
        controls_back.borderColor = Color_1.default.TRANSPARENT;
        controls_back.backgroundColor = Color_1.default.TRANSPARENT;
        controls_back.onClickEventId = "mainMenu";
        //music
        this.emitter.fireEvent(GameEventType_1.GameEventType.PLAY_SOUND, { key: "main_menu_music", loop: true, holdReference: true });
    }
    updateScene() {
        while (this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();
            let scene_options = {
                health: 5,
                coins: 0,
                damage: 1
            };
            let physics_options = {
                physics: {
                    groupNames: ["wall", "player", "enemy", "coin"],
                    collisions: [
                        [0, 1, 1, 1],
                        [1, 0, 0, 0],
                        [1, 0, 0, 0],
                        [1, 0, 0, 0]
                    ]
                }
            };
            if (event.type === "newGame") {
                // setup new game scene from here (maybe add options)
                this.emitter.fireEvent(GameEventType_1.GameEventType.STOP_SOUND, { key: "main_menu_music" });
                this.sceneManager.changeToScene(LustLevel_1.default, scene_options, physics_options);
            }
            if (event.type === "mainMenu") {
                this.main_menu.setHidden(false);
                this.level_select.setHidden(true);
                this.help.setHidden(true);
                this.controls.setHidden(true);
            }
            if (event.type === "levelSelect") {
                this.main_menu.setHidden(true);
                this.level_select.setHidden(false);
            }
            if (event.type === "help") {
                this.main_menu.setHidden(true);
                this.help.setHidden(false);
            }
            if (event.type === "controls") {
                this.main_menu.setHidden(true);
                this.controls.setHidden(false);
            }
            if (event.type === "levelGluttony") {
                // go to gluttony level (level 3)
                this.emitter.fireEvent(GameEventType_1.GameEventType.STOP_SOUND, { key: "main_menu_music" });
                this.sceneManager.changeToScene(GluttonyLevel_1.default, scene_options, physics_options);
            }
            if (event.type === "levelLust") {
                // TODO PROJECT - go to lust level (level 1)
                this.emitter.fireEvent(GameEventType_1.GameEventType.STOP_SOUND, { key: "main_menu_music" });
                this.sceneManager.changeToScene(LustLevel_1.default, scene_options, physics_options);
            }
            if (event.type === "levelWrath") {
                // TODO PROJECT - go to wrath level (level 2)
                this.emitter.fireEvent(GameEventType_1.GameEventType.STOP_SOUND, { key: "main_menu_music" });
                this.sceneManager.changeToScene(WrathLevel_1.default, scene_options, physics_options);
            }
            if (event.type === "levelSloth") {
                // TODO PROJECT - go to sloth level (level 4)
                this.emitter.fireEvent(GameEventType_1.GameEventType.STOP_SOUND, { key: "main_menu_music" });
                this.sceneManager.changeToScene(SlothLevel_1.default, scene_options, physics_options);
            }
            if (event.type === "levelEnvy") {
                // TODO PROJECT - go to envy level (level 5)
                this.emitter.fireEvent(GameEventType_1.GameEventType.STOP_SOUND, { key: "main_menu_music" });
                this.sceneManager.changeToScene(EnvyLevel_1.default, scene_options, physics_options);
            }
            if (event.type === "levelGreed") {
                // TODO PROJECT - go to greed level (level 6)
                this.emitter.fireEvent(GameEventType_1.GameEventType.STOP_SOUND, { key: "main_menu_music" });
                this.sceneManager.changeToScene(GreedLevel_1.default, scene_options, physics_options);
            }
            if (event.type === "levelPride") {
                // TODO PROJECT - go to pride level (level 7)
                console.log("Pride Level");
            }
        }
    }
}
exports.default = MainMenu;
},{"../Wolfie2D/DataTypes/Vec2":111,"../Wolfie2D/Events/GameEventType":117,"../Wolfie2D/Nodes/UIElements/UIElementTypes":142,"../Wolfie2D/Scene/Scene":178,"../Wolfie2D/Utils/Color":184,"./EnvyLevel":81,"./GluttonyLevel":84,"./GreedLevel":85,"./LustLevel":86,"./SlothLevel":88,"./WrathLevel":90}],88:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("../Wolfie2D/DataTypes/Vec2");
const Color_1 = require("../Wolfie2D/Utils/Color");
const GameLevel_1 = require("./GameLevel");
const GraphicTypes_1 = require("../Wolfie2D/Nodes/Graphics/GraphicTypes");
const UIElementTypes_1 = require("../Wolfie2D/Nodes/UIElements/UIElementTypes");
const Input_1 = require("../Wolfie2D/Input/Input");
const GameEventType_1 = require("../Wolfie2D/Events/GameEventType");
const LustLevel_1 = require("./LustLevel");
const GluttonyLevel_1 = require("./GluttonyLevel");
const EnvyLevel_1 = require("./EnvyLevel");
class SlothLevel extends GameLevel_1.default {
    initScene(init) {
        super.initScene(init);
        // TODO
        this.level_music_key = "lust_music";
        this.level_music_path = "game_assets/sounds/music/lust.mp3";
        this.boss_audios = {
            sloth_catch: "game_assets/sounds/sloth_catch.mp3",
            sloth_damage: "game_assets/sounds/sloth_damage.mp3",
            sloth_death: "game_assets/sounds/sloth_death.mp3",
            sloth_throw: "game_assets/sounds/sloth_throw.mp3"
        };
        this.boss_sprite = {
            sloth: "game_assets/spritesheets/sloth.json"
        };
        this.boss_attack_image = {};
        this.boss_attack_sprite = {};
        this.enemy_data = {
            enemyData: "game_assets/data/sloth_enemy.json"
        };
        this.level_tilemap = {
            greedLevel: "game_assets/tilemaps/sloth_level.json"
        };
        this.next_level_constructor = EnvyLevel_1.default;
        this.shop_pos = new Vec2_1.default(1298, 500);
        this.player_start_pos = new Vec2_1.default(1480, 1663);
        this.player_speed = 110;
        this.level_text_color = new Color_1.default(0, 0, 190);
        this.start_level_text = "Sloth's Sluggish Slum";
        this.end_level_text = "Sloth has been defeated!";
        this.boss_room_pos = new Vec2_1.default(1024, 1072);
        this.boss_room_size = new Vec2_1.default(7 * 32, 3 * 32);
        this.upper_boss_door = [new Vec2_1.default(976, 1200), new Vec2_1.default(1008, 1200), new Vec2_1.default(1040, 1200), new Vec2_1.default(1072, 1200)];
        this.lower_boss_door = [new Vec2_1.default(976, 1232), new Vec2_1.default(1008, 1232), new Vec2_1.default(1040, 1232), new Vec2_1.default(1072, 1232)];
    }
    startScene() {
        super.startScene();
        this.initializeLabels();
    }
    updateScene(deltaT) {
        let scene_options = {
            health: 5,
            coins: 0
        };
        let physics_options = {
            physics: {
                groupNames: ["wall", "player", "enemy", "coin"],
                collisions: [
                    [0, 1, 1, 1],
                    [1, 0, 0, 0],
                    [1, 0, 0, 0],
                    [1, 0, 0, 0]
                ]
            }
        };
        if (Input_1.default.isJustPressed("lust")) {
            this.emitter.fireEvent(GameEventType_1.GameEventType.STOP_SOUND, { key: this.level_music_key });
            this.sceneManager.changeToScene(LustLevel_1.default, scene_options, physics_options);
        }
        else if (Input_1.default.isJustPressed("gluttony")) {
            this.emitter.fireEvent(GameEventType_1.GameEventType.STOP_SOUND, { key: this.level_music_key });
            this.sceneManager.changeToScene(GluttonyLevel_1.default, scene_options, physics_options);
        }
        super.updateScene(deltaT);
    }
    initializeLabels() {
        this.tutorial_labels = new Array();
        this.tutorial_zones = new Array();
        let tutorial_zone_1 = this.add.graphic(GraphicTypes_1.GraphicType.RECT, "primary", { position: new Vec2_1.default(1480, 1663), size: new Vec2_1.default(7 * 32, 5 * 32) });
        tutorial_zone_1.addPhysics(undefined, undefined, false, true);
        tutorial_zone_1.color = Color_1.default.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_1);
        let tutorial_label_1 = this.add.uiElement(UIElementTypes_1.UIElementType.LABEL, "primary", { position: new Vec2_1.default(1480, 1732), text: "You feel sluggish..." });
        tutorial_label_1.font = "HellText";
        tutorial_label_1.textColor = Color_1.default.BLACK;
        tutorial_label_1.fontSize = 32;
        tutorial_label_1.size.set(30, 14);
        tutorial_label_1.borderWidth = 2;
        tutorial_label_1.borderColor = Color_1.default.TRANSPARENT;
        tutorial_label_1.backgroundColor = Color_1.default.TRANSPARENT;
        tutorial_label_1.visible = false;
        this.tutorial_labels.push(tutorial_label_1);
    }
}
exports.default = SlothLevel;
},{"../Wolfie2D/DataTypes/Vec2":111,"../Wolfie2D/Events/GameEventType":117,"../Wolfie2D/Input/Input":119,"../Wolfie2D/Nodes/Graphics/GraphicTypes":129,"../Wolfie2D/Nodes/UIElements/UIElementTypes":142,"../Wolfie2D/Utils/Color":184,"./EnvyLevel":81,"./GameLevel":82,"./GluttonyLevel":84,"./LustLevel":86}],89:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("../Wolfie2D/DataTypes/Vec2");
const UIElementTypes_1 = require("../Wolfie2D/Nodes/UIElements/UIElementTypes");
const Scene_1 = require("../Wolfie2D/Scene/Scene");
const Color_1 = require("../Wolfie2D/Utils/Color");
const MainMenu_1 = require("./MainMenu");
class SplashScreen extends Scene_1.default {
    loadScene() {
        this.load.image("splashImage", "game_assets/images/splash_screen.png");
    }
    startScene() {
        const center = this.viewport.getCenter();
        // The splash screen
        this.splash = this.addUILayer("splashScreen");
        // Add a background to the scene
        this.splash_background = this.addParallaxLayer("splash_background", new Vec2_1.default(0.5, 1), -1);
        let sb = this.add.sprite("splashImage", "splash_background");
        sb.position.set(sb.size.x / 2, sb.size.y / 2);
        // Add transparent button
        const confirm = this.add.uiElement(UIElementTypes_1.UIElementType.BUTTON, "splashScreen", { position: new Vec2_1.default(center.x, center.y), text: "" });
        confirm.size.set(1280, 720);
        confirm.borderWidth = 0;
        confirm.borderColor = Color_1.default.TRANSPARENT;
        confirm.backgroundColor = Color_1.default.TRANSPARENT;
        confirm.onClickEventId = "confirm";
        // Subscribe to the button events
        this.receiver.subscribe("confirm");
    }
    updateScene() {
        while (this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();
            if (event.type === "confirm") {
                this.splash_background.disable();
                this.sceneManager.changeToScene(MainMenu_1.default, {});
            }
        }
    }
}
exports.default = SplashScreen;
},{"../Wolfie2D/DataTypes/Vec2":111,"../Wolfie2D/Nodes/UIElements/UIElementTypes":142,"../Wolfie2D/Scene/Scene":178,"../Wolfie2D/Utils/Color":184,"./MainMenu":87}],90:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("../Wolfie2D/DataTypes/Vec2");
const Color_1 = require("../Wolfie2D/Utils/Color");
const GameLevel_1 = require("./GameLevel");
const GluttonyLevel_1 = require("./GluttonyLevel");
const Input_1 = require("../Wolfie2D/Input/Input");
const GameEventType_1 = require("../Wolfie2D/Events/GameEventType");
const LustLevel_1 = require("./LustLevel");
class WrathLevel extends GameLevel_1.default {
    initScene(init) {
        super.initScene(init);
        this.level_music_key = "wrath_music";
        this.level_music_path = "game_assets/sounds/music/wrath.mp3";
        this.boss_audios = {
            wrath_attack: "game_assets/sounds/wrath_attack.mp3",
            wrath_damage: "game_assets/sounds/wrath_damage.mp3",
            wrath_death: "game_assets/sounds/wrath_death.mp3"
        };
        this.boss_sprite = {
            wrath: "game_assets/spritesheets/wrath.json"
        };
        this.boss_attack_image = {
            slice: "game_assets/spritesheets/wrath_slice.png"
        };
        this.boss_attack_sprite = {
            slice: "game_assets/spritesheets/wrath_slice.json"
        };
        this.enemy_data = {
            enemyData: "game_assets/data/wrath_enemy.json"
        };
        this.level_tilemap = {
            wrathLevel: "game_assets/tilemaps/wrath_level.json"
        };
        this.next_level_constructor = GluttonyLevel_1.default;
        this.shop_pos = new Vec2_1.default(383, 959);
        this.player_start_pos = new Vec2_1.default(1026, 1874);
        this.player_speed = 150;
        this.player_slippery = false;
        this.level_text_color = new Color_1.default(194, 0, 13);
        this.start_level_text = "Wrath's Wretched Wasteland";
        this.end_level_text = "Wrath has been defeated!";
        this.boss_room_pos = new Vec2_1.default(1024, 432);
        this.boss_room_size = new Vec2_1.default(6 * 32, 3 * 32);
        this.upper_boss_door = [new Vec2_1.default(976, 528), new Vec2_1.default(1008, 528), new Vec2_1.default(1040, 528), new Vec2_1.default(1072, 528)];
        this.lower_boss_door = [new Vec2_1.default(976, 560), new Vec2_1.default(1010, 560), new Vec2_1.default(1038, 560), new Vec2_1.default(1072, 560)];
    }
    startScene() {
        super.startScene();
        this.total_enemies = this.enemies.length;
        this.initializeLabels();
    }
    updateScene(deltaT) {
        let scene_options = {
            health: 5,
            coins: 0,
            damage: 1
        };
        let physics_options = {
            physics: {
                groupNames: ["ground", "player", "enemy", "coin"],
                collisions: [
                    [0, 1, 1, 1],
                    [1, 0, 0, 0],
                    [1, 0, 0, 0],
                    [1, 0, 0, 0]
                ]
            }
        };
        if (Input_1.default.isJustPressed("lust")) {
            this.emitter.fireEvent(GameEventType_1.GameEventType.STOP_SOUND, { key: this.level_music_key });
            this.sceneManager.changeToScene(LustLevel_1.default, scene_options, physics_options);
        }
        else if (Input_1.default.isJustPressed("gluttony")) {
            this.emitter.fireEvent(GameEventType_1.GameEventType.STOP_SOUND, { key: this.level_music_key });
            this.sceneManager.changeToScene(GluttonyLevel_1.default, scene_options, physics_options);
        }
        let enemies_killed = this.total_enemies - this.enemies.length;
        if (enemies_killed === 2) {
            this.openDoor([new Vec2_1.default(976, 1264), new Vec2_1.default(1008, 1264), new Vec2_1.default(1040, 1264), new Vec2_1.default(1072, 1264), new Vec2_1.default(976, 1232), new Vec2_1.default(1008, 1232), new Vec2_1.default(1040, 1232), new Vec2_1.default(1072, 1232)], []);
        }
        if (enemies_killed === 3) {
            this.openDoor([new Vec2_1.default(1168, 1042), new Vec2_1.default(1168, 1074), new Vec2_1.default(1168, 1106), new Vec2_1.default(1168, 1138)], [new Vec2_1.default(1168, 1010)]);
        }
        if (enemies_killed === 5) {
            this.openDoor([new Vec2_1.default(1488, 1042), new Vec2_1.default(1488, 1074), new Vec2_1.default(1488, 1106), new Vec2_1.default(1488, 1138)], [new Vec2_1.default(1488, 1010)]);
        }
        if (enemies_killed === 6) {
            this.openDoor([new Vec2_1.default(880, 1042), new Vec2_1.default(880, 1074), new Vec2_1.default(880, 1106), new Vec2_1.default(880, 1138)], [new Vec2_1.default(880, 1010)]);
        }
        if (enemies_killed === 8) {
            this.openDoor([new Vec2_1.default(560, 1042), new Vec2_1.default(560, 1074), new Vec2_1.default(560, 1106), new Vec2_1.default(560, 1138)], [new Vec2_1.default(560, 1010)]);
        }
        if (enemies_killed === 9) {
            this.openDoor([new Vec2_1.default(976, 910), new Vec2_1.default(1008, 910), new Vec2_1.default(1040, 910), new Vec2_1.default(1072, 910), new Vec2_1.default(976, 878), new Vec2_1.default(1008, 878), new Vec2_1.default(1040, 878), new Vec2_1.default(1072, 878)], []);
        }
        if (enemies_killed === 11) {
            this.openDoor([new Vec2_1.default(976, 560), new Vec2_1.default(1008, 560), new Vec2_1.default(1040, 560), new Vec2_1.default(1072, 560), new Vec2_1.default(976, 528), new Vec2_1.default(1008, 528), new Vec2_1.default(1040, 528), new Vec2_1.default(1072, 528)], []);
            this.total_enemies = 0;
        }
        super.updateScene(deltaT);
    }
    openDoor(remove_tiles, lower_walls) {
        let tilemap = this.getTilemap("Wall");
        for (let v of remove_tiles) {
            let tile_coords = tilemap.getColRowAt(v);
            tilemap.setTile(tile_coords.y * tilemap.getDimensions().x + tile_coords.x, 0);
        }
        for (let v of lower_walls) {
            let tile_coords = tilemap.getColRowAt(v);
            tilemap.setTile(tile_coords.y * tilemap.getDimensions().x + tile_coords.x, 18);
        }
    }
    initializeLabels() {
        this.tutorial_labels = new Array();
        this.tutorial_zones = new Array();
    }
}
exports.default = WrathLevel;
},{"../Wolfie2D/DataTypes/Vec2":111,"../Wolfie2D/Events/GameEventType":117,"../Wolfie2D/Input/Input":119,"../Wolfie2D/Utils/Color":184,"./GameLevel":82,"./GluttonyLevel":84,"./LustLevel":86}],91:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Map_1 = require("../DataTypes/Map");
/**
 * A manager class for all of the AI in a scene.
 * Keeps a list of registered actors and handles AI generation for actors.
 */
class AIManager {
    constructor() {
        this.actors = new Array();
        this.registeredAI = new Map_1.default();
    }
    /**
     * Registers an actor with the AIManager
     * @param actor The actor to register
     */
    registerActor(actor) {
        this.actors.push(actor);
    }
    removeActor(actor) {
        let index = this.actors.indexOf(actor);
        if (index !== -1) {
            this.actors.splice(index, 1);
        }
    }
    /**
     * Registers an AI with the AIManager for use later on
     * @param name The name of the AI to register
     * @param constr The constructor for the AI
     */
    registerAI(name, constr) {
        this.registeredAI.add(name, constr);
    }
    /**
     * Generates an AI instance from its name
     * @param name The name of the AI to add
     * @returns A new AI instance
     */
    generateAI(name) {
        if (this.registeredAI.has(name)) {
            return new (this.registeredAI.get(name))();
        }
        else {
            throw `Cannot create AI with name ${name}, no AI with that name is registered`;
        }
    }
    update(deltaT) {
        // Run the ai for every active actor
        this.actors.forEach(actor => { if (actor.aiActive)
            actor.ai.update(deltaT); });
    }
}
exports.default = AIManager;
},{"../DataTypes/Map":98}],92:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StateMachine_1 = require("../DataTypes/State/StateMachine");
/**
 * A version of a @reference[StateMachine] that is configured to work as an AI controller for a @reference[GameNode]
 */
class StateMachineAI extends StateMachine_1.default {
    // @implemented
    initializeAI(owner, config) { }
    // @implemented
    destroy() {
        // Get rid of our reference to the owner
        delete this.owner;
        this.receiver.destroy();
    }
    // @implemented
    activate(options) { }
}
exports.default = StateMachineAI;
},{"../DataTypes/State/StateMachine":109}],93:[function(require,module,exports){
"use strict";
// @ignorePage
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A placeholder function for No Operation. Does nothing
 */
const NullFunc = () => { };
exports.default = NullFunc;
},{}],94:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A linked-list for the edges in a @reference[Graph].
 */
class EdgeNode {
    /**
     * Creates a new EdgeNode
     * @param index The index of the node this edge connects to
     * @param weight The weight of this edge
     */
    constructor(index, weight) {
        this.y = index;
        this.next = null;
        this.weight = weight ? weight : 1;
    }
}
exports.default = EdgeNode;
},{}],95:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_V = void 0;
const EdgeNode_1 = require("./EdgeNode");
exports.MAX_V = 100;
/**
 * An implementation of a graph data structure using edge lists. Inspired by The Algorithm Design Manual.
 */
class Graph {
    /**
     * Constructs a new graph
     * @param directed Whether or not this graph is directed
     */
    constructor(directed = false) {
        this.directed = directed;
        this.weighted = false;
        this.numVertices = 0;
        this.numEdges = 0;
        this.edges = new Array(exports.MAX_V);
        this.degree = new Array(exports.MAX_V);
    }
    /** Adds a node to this graph and returns the index of it
     * @returns The index of the new node
    */
    addNode() {
        this.numVertices++;
        return this.numVertices;
    }
    /** Adds an edge between node x and y, with an optional weight
     * @param x The index of the start of the edge
     * @param y The index of the end of the edge
     * @param weight The optional weight of the new edge
    */
    addEdge(x, y, weight) {
        let edge = new EdgeNode_1.default(y, weight);
        if (this.edges[x]) {
            edge.next = this.edges[x];
        }
        this.edges[x] = edge;
        if (!this.directed) {
            edge = new EdgeNode_1.default(x, weight);
            if (this.edges[y]) {
                edge.next = this.edges[y];
            }
            this.edges[y] = edge;
        }
        this.numEdges += 1;
    }
    /**
     * Checks whether or not an edge exists between two nodes.
     * This check is directional if this is a directed graph.
     * @param x The first node
     * @param y The second node
     * @returns true if an edge exists, false otherwise
     */
    edgeExists(x, y) {
        let edge = this.edges[x];
        while (edge !== null) {
            if (edge.y === y) {
                return true;
            }
            edge = edge.next;
        }
    }
    /**
     * Gets the edge list associated with node x
     * @param x The index of the node
     * @returns The head of a linked-list of edges
     */
    getEdges(x) {
        return this.edges[x];
    }
    /**
     * Gets the degree associated with node x
     * @param x The index of the node
     */
    getDegree(x) {
        return this.degree[x];
    }
    /**
     * Converts the specifed node into a string
     * @param index The index of the node to convert to a string
     * @returns The string representation of the node: "Node x"
     */
    nodeToString(index) {
        return "Node " + index;
    }
    /**
     * Converts the Graph into a string format
     * @returns The graph as a string
     */
    toString() {
        let retval = "";
        for (let i = 0; i < this.numVertices; i++) {
            let edge = this.edges[i];
            let edgeStr = "";
            while (edge !== null) {
                edgeStr += edge.y.toString();
                if (this.weighted) {
                    edgeStr += " (" + edge.weight + ")";
                }
                if (edge.next !== null) {
                    edgeStr += ", ";
                }
                edge = edge.next;
            }
            retval += this.nodeToString(i) + ": " + edgeStr + "\n";
        }
        return retval;
    }
}
exports.default = Graph;
},{"./EdgeNode":94}],96:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = require("./Graph");
/**
 * An extension of Graph that has nodes with positions in 2D space.
 * This is a weighted graph (though not inherently directd)
*/
class PositionGraph extends Graph_1.default {
    /**
     * Createes a new PositionGraph
     * @param directed Whether or not this graph is directed
     */
    constructor(directed = false) {
        super(directed);
        this.debugRender = () => {
            // for(let point of this.positions){
            // 	ctx.fillRect((point.x - origin.x - 4)*zoom, (point.y - origin.y - 4)*zoom, 8, 8);
            // }
        };
        this.positions = new Array(Graph_1.MAX_V);
    }
    /**
     * Adds a positioned node to this graph
     * @param position The position of the node to add
     * @returns The index of the added node
     */
    addPositionedNode(position) {
        this.positions[this.numVertices] = position;
        return this.addNode();
    }
    /**
     * Changes the position of a node.
     * Automatically adjusts the weights of the graph tied to this node.
     * As such, be warned that this function has an O(n + m) running time, and use it sparingly.
     * @param index The index of the node
     * @param position The new position of the node
     */
    setNodePosition(index, position) {
        this.positions[index] = position;
        // Recalculate all weights associated with this index
        for (let i = 0; i < this.numEdges; i++) {
            let edge = this.edges[i];
            while (edge !== null) {
                // If this node is on either side of the edge, recalculate weight
                if (i === index || edge.y === index) {
                    edge.weight = this.positions[i].distanceTo(this.positions[edge.y]);
                }
                edge = edge.next;
            }
        }
    }
    /**
     * Gets the position of a node
     * @param index The index of the node
     * @returns The position of the node
     */
    getNodePosition(index) {
        return this.positions[index];
    }
    /**
     * Adds an edge to this graph between node x and y.
     * Automatically calculates the weight of the edge as the distance between the nodes.
     * @param x The beginning of the edge
     * @param y The end of the edge
     */
    addEdge(x, y) {
        if (!this.positions[x] || !this.positions[y]) {
            throw "Can't add edge to un-positioned node!";
        }
        // Weight is the distance between the nodes
        let weight = this.positions[x].distanceTo(this.positions[y]);
        super.addEdge(x, y, weight);
    }
    // @override
    nodeToString(index) {
        return "Node " + index + " - " + this.positions[index].toString();
    }
}
exports.default = PositionGraph;
},{"./Graph":95}],97:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRegion = void 0;
function isRegion(arg) {
    return arg && arg.size && arg.scale && arg.boundary;
}
exports.isRegion = isRegion;
},{}],98:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Associates strings with elements of type T
 */
class Map {
    /** Creates a new map */
    constructor() {
        this.map = {};
    }
    /**
     * Adds a value T stored at a key.
     * @param key The key of the item to be stored
     * @param value The item to be stored
     */
    add(key, value) {
        this.map[key] = value;
    }
    /**
     * Get the value associated with a key.
     * @param key The key of the item
     * @returns The item at the key or undefined
     */
    get(key) {
        return this.map[key];
    }
    /**
     * An alias of add. Sets the value stored at key to the new specified value
     * @param key The key of the item to be stored
     * @param value The item to be stored
     */
    set(key, value) {
        this.add(key, value);
    }
    /**
     * Returns true if there is a value stored at the specified key, false otherwise.
     * @param key The key to check
     * @returns A boolean representing whether or not there is an item at the given key.
     */
    has(key) {
        return this.map[key] !== undefined;
    }
    /**
     * Returns an array of all of the keys in this map.
     * @returns An array containing all keys in the map.
     */
    keys() {
        return Object.keys(this.map);
    }
    // @implemented
    forEach(func) {
        Object.keys(this.map).forEach(key => func(key));
    }
    /**
     * Deletes an item associated with a key
     * @param key The key at which to delete an item
     */
    delete(key) {
        delete this.map[key];
    }
    // @implemented
    clear() {
        this.forEach(key => delete this.map[key]);
    }
    /**
     * Converts this map to a string representation.
     * @returns The string representation of this map.
     */
    toString() {
        let str = "";
        this.forEach((key) => str += key + " -> " + this.get(key).toString() + "\n");
        return str;
    }
}
exports.default = Map;
},{}],99:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("./Vec2");
/** A 4x4 matrix0 */
class Mat4x4 {
    constructor() {
        this.mat = new Float32Array([
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0
        ]);
    }
    // Static members
    static get IDENTITY() {
        return new Mat4x4().identity();
    }
    static get ZERO() {
        return new Mat4x4().zero();
    }
    // Accessors
    set _00(x) {
        this.mat[0] = x;
    }
    set(col, row, value) {
        if (col < 0 || col > 3 || row < 0 || row > 3) {
            throw `Error - index (${col}, ${row}) is out of bounds for Mat4x4`;
        }
        this.mat[row * 4 + col] = value;
        return this;
    }
    get(col, row) {
        return this.mat[row * 4 + col];
    }
    setAll(...items) {
        this.mat.set(items);
        return this;
    }
    identity() {
        return this.setAll(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    }
    zero() {
        return this.setAll(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
    /**
     * Makes this Mat4x4 a rotation matrix of the specified number of radians ccw
     * @param zRadians The number of radians to rotate
     * @returns this Mat4x4
     */
    rotate(zRadians) {
        return this.setAll(Math.cos(zRadians), -Math.sin(zRadians), 0, 0, Math.sin(zRadians), Math.cos(zRadians), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    }
    /**
     * Turns this Mat4x4 into a translation matrix of the specified translation
     * @param translation The translation in x and y
     * @returns this Mat4x4
     */
    translate(translation) {
        // If translation is a vec, get its array
        if (translation instanceof Vec2_1.default) {
            translation = translation.toArray();
        }
        return this.setAll(1, 0, 0, translation[0], 0, 1, 0, translation[1], 0, 0, 1, 0, 0, 0, 0, 1);
    }
    scale(scale) {
        // Make sure scale is a float32Array
        if (scale instanceof Vec2_1.default) {
            scale = scale.toArray();
        }
        else if (!(scale instanceof Float32Array)) {
            scale = new Float32Array([scale, scale]);
        }
        return this.setAll(scale[0], 0, 0, 0, 0, scale[1], 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    }
    /**
     * Returns a new Mat4x4 that represents the right side multiplication THIS x OTHER
     * @param other The other Mat4x4 to multiply by
     * @returns a new Mat4x4 containing the product of these two Mat4x4s
     */
    mult(other, out) {
        let temp = new Float32Array(16);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let value = 0;
                for (let k = 0; k < 4; k++) {
                    value += this.get(k, i) * other.get(j, k);
                }
                temp[j * 4 + i] = value;
            }
        }
        if (out !== undefined) {
            return out.setAll(...temp);
        }
        else {
            return new Mat4x4().setAll(...temp);
        }
    }
    /**
     * Multiplies all given matricies in order. e.g. MULT(A, B, C) -> A*B*C
     * @param mats A list of Mat4x4s to multiply in order
     * @returns A new Mat4x4 holding the result of the operation
     */
    static MULT(...mats) {
        // Create a new array
        let temp = Mat4x4.IDENTITY;
        // Multiply by every array in order, in place
        for (let i = 0; i < mats.length; i++) {
            temp.mult(mats[i], temp);
        }
        return temp;
    }
    toArray() {
        return this.mat;
    }
    toString() {
        return `|${this.mat[0].toFixed(2)}, ${this.mat[1].toFixed(2)}, ${this.mat[2].toFixed(2)}, ${this.mat[3].toFixed(2)}|\n` +
            `|${this.mat[4].toFixed(2)}, ${this.mat[5].toFixed(2)}, ${this.mat[6].toFixed(2)}, ${this.mat[7].toFixed(2)}|\n` +
            `|${this.mat[8].toFixed(2)}, ${this.mat[9].toFixed(2)}, ${this.mat[10].toFixed(2)}, ${this.mat[11].toFixed(2)}|\n` +
            `|${this.mat[12].toFixed(2)}, ${this.mat[13].toFixed(2)}, ${this.mat[14].toFixed(2)}, ${this.mat[15].toFixed(2)}|`;
    }
}
exports.default = Mat4x4;
},{"./Vec2":111}],100:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A class that contains the area of overlap of two colliding objects to allow for sorting by the physics system.
 */
class AreaCollision {
    /**
     * Creates a new AreaCollision object
     * @param area The area of the collision
     * @param collider The other collider
     */
    constructor(area, collider, other, type, tile) {
        this.area = area;
        this.collider = collider;
        this.other = other;
        this.type = type;
        this.tile = tile;
    }
}
exports.default = AreaCollision;
},{}],101:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("../Vec2");
/**
 * An object representing the data collected from a physics hit between two geometric objects.
 * Inspired by the helpful collision documentation @link(here)(https://noonat.github.io/intersect/).
 */
class Hit {
    constructor() {
        /** The near times of the collision */
        this.nearTimes = Vec2_1.default.ZERO;
        /** The position of the collision */
        this.pos = Vec2_1.default.ZERO;
        /** The overlap distance of the hit */
        this.delta = Vec2_1.default.ZERO;
        /** The normal vector of the hit */
        this.normal = Vec2_1.default.ZERO;
    }
}
exports.default = Hit;
},{"../Vec2":111}],102:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A FIFO queue with elements of type T
 */
class Queue {
    /**
     * Constructs a new queue
     * @param maxElements The maximum size of the stack
     */
    constructor(maxElements = 100) {
        this.MAX_ELEMENTS = maxElements;
        this.q = new Array(this.MAX_ELEMENTS);
        this.head = 0;
        this.tail = 0;
        this.size = 0;
    }
    /**
     * Adds an item to the back of the queue
     * @param item The item to add to the back of the queue
     */
    enqueue(item) {
        if ((this.tail + 1) % this.MAX_ELEMENTS === this.head) {
            throw new Error("Queue full - cannot add element");
        }
        this.size += 1;
        this.q[this.tail] = item;
        this.tail = (this.tail + 1) % this.MAX_ELEMENTS;
    }
    /**
     * Retrieves an item from the front of the queue
     * @returns The item at the front of the queue
     */
    dequeue() {
        if (this.head === this.tail) {
            throw new Error("Queue empty - cannot remove element");
        }
        this.size -= 1;
        let item = this.q[this.head];
        // Now delete the item
        delete this.q[this.head];
        this.head = (this.head + 1) % this.MAX_ELEMENTS;
        return item;
    }
    /**
     * Returns the item at the front of the queue, but does not remove it
     * @returns The item at the front of the queue
     */
    peekNext() {
        if (this.head === this.tail) {
            throw "Queue empty - cannot get element";
        }
        let item = this.q[this.head];
        return item;
    }
    /**
     * Returns true if the queue has items in it, false otherwise
     * @returns A boolean representing whether or not this queue has items
     */
    hasItems() {
        return this.head !== this.tail;
    }
    /**
     * Returns the number of elements in the queue.
     * @returns The size of the queue
     */
    getSize() {
        return this.size;
    }
    // @implemented
    clear() {
        this.forEach((item, index) => delete this.q[index]);
        this.size = 0;
        this.head = this.tail;
    }
    // @implemented
    forEach(func) {
        let i = this.head;
        while (i !== this.tail) {
            func(this.q[i], i);
            i = (i + 1) % this.MAX_ELEMENTS;
        }
    }
    /**
     * Converts this queue into a string format
     * @returns A string representing this queue
     */
    toString() {
        let retval = "";
        this.forEach((item, index) => {
            let str = item.toString();
            if (index !== 0) {
                str += " -> ";
            }
            retval = str + retval;
        });
        return "Top -> " + retval;
    }
}
exports.default = Queue;
},{}],103:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** A container for info about a webGL shader program */
class WebGLProgramType {
    /**
     * Deletes this shader program
     */
    delete(gl) {
        // Clean up all aspects of this program
        if (this.program) {
            gl.deleteProgram(this.program);
        }
        if (this.vertexShader) {
            gl.deleteShader(this.vertexShader);
        }
        if (this.fragmentShader) {
            gl.deleteShader(this.fragmentShader);
        }
    }
}
exports.default = WebGLProgramType;
},{}],104:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Shape_1 = require("./Shape");
const Vec2_1 = require("../Vec2");
const MathUtils_1 = require("../../Utils/MathUtils");
const Circle_1 = require("./Circle");
const Hit_1 = require("../Physics/Hit");
/**
 * An Axis-Aligned Bounding Box. In other words, a rectangle that is always aligned to the x-y grid.
 * Inspired by the helpful collision documentation @link(here)(https://noonat.github.io/intersect/).
 */
class AABB extends Shape_1.default {
    /**
     * Creates a new AABB
     * @param center The center of the AABB
     * @param halfSize The half size of the AABB - The distance from the center to an edge in x and y
     */
    constructor(center, halfSize) {
        super();
        this.center = center ? center : new Vec2_1.default(0, 0);
        this.halfSize = halfSize ? halfSize : new Vec2_1.default(0, 0);
    }
    /** Returns a point representing the top left corner of the AABB */
    get topLeft() {
        return new Vec2_1.default(this.left, this.top);
    }
    /** Returns a point representing the top right corner of the AABB */
    get topRight() {
        return new Vec2_1.default(this.right, this.top);
    }
    /** Returns a point representing the bottom left corner of the AABB */
    get bottomLeft() {
        return new Vec2_1.default(this.left, this.bottom);
    }
    /** Returns a point representing the bottom right corner of the AABB */
    get bottomRight() {
        return new Vec2_1.default(this.right, this.bottom);
    }
    // @override
    getBoundingRect() {
        return this.clone();
    }
    // @override
    getBoundingCircle() {
        let r = Math.max(this.hw, this.hh);
        return new Circle_1.default(this.center.clone(), r);
    }
    // @deprecated
    getHalfSize() {
        return this.halfSize;
    }
    // @deprecated
    setHalfSize(halfSize) {
        this.halfSize = halfSize;
    }
    // TODO - move these all to the Shape class
    /**
     * A simple boolean check of whether this AABB contains a point
     * @param point The point to check
     * @returns A boolean representing whether this AABB contains the specified point
     */
    containsPoint(point) {
        return point.x >= this.x - this.hw && point.x <= this.x + this.hw
            && point.y >= this.y - this.hh && point.y <= this.y + this.hh;
    }
    /**
     * A simple boolean check of whether this AABB contains a point
     * @param point The point to check
     * @returns A boolean representing whether this AABB contains the specified point
     */
    intersectPoint(point) {
        let dx = point.x - this.x;
        let px = this.hw - Math.abs(dx);
        if (px <= 0) {
            return false;
        }
        let dy = point.y - this.y;
        let py = this.hh - Math.abs(dy);
        if (py <= 0) {
            return false;
        }
        return true;
    }
    /**
     * A boolean check of whether this AABB contains a point with soft left and top boundaries.
     * In other words, if the top left is (0, 0), the point (0, 0) is not in the AABB
     * @param point The point to check
     * @returns A boolean representing whether this AABB contains the specified point
     */
    containsPointSoft(point) {
        return point.x > this.x - this.hw && point.x <= this.x + this.hw
            && point.y > this.y - this.hh && point.y <= this.y + this.hh;
    }
    /**
     * Returns the data from the intersection of this AABB with a line segment from a point in a direction
     * @param point The point that the line segment starts from
     * @param delta The direction and distance of the segment
     * @param padding Pads the AABB to make it wider for the intersection test
     * @returns The Hit object representing the intersection, or null if there was no intersection
     */
    intersectSegment(point, delta, padding) {
        let paddingX = padding ? padding.x : 0;
        let paddingY = padding ? padding.y : 0;
        let scaleX = 1 / delta.x;
        let scaleY = 1 / delta.y;
        let signX = MathUtils_1.default.sign(scaleX);
        let signY = MathUtils_1.default.sign(scaleY);
        let tnearx = scaleX * (this.x - signX * (this.hw + paddingX) - point.x);
        let tneary = scaleY * (this.y - signY * (this.hh + paddingY) - point.y);
        let tfarx = scaleX * (this.x + signX * (this.hw + paddingX) - point.x);
        let tfary = scaleY * (this.y + signY * (this.hh + paddingY) - point.y);
        if (tnearx > tfary || tneary > tfarx) {
            // We aren't colliding - we clear one axis before intersecting another
            return null;
        }
        let tnear = Math.max(tnearx, tneary);
        // Double check for NaNs
        if (tnearx !== tnearx) {
            tnear = tneary;
        }
        else if (tneary !== tneary) {
            tnear = tnearx;
        }
        let tfar = Math.min(tfarx, tfary);
        if (tnear === -Infinity) {
            return null;
        }
        if (tnear >= 1 || tfar <= 0) {
            return null;
        }
        // We are colliding
        let hit = new Hit_1.default();
        hit.time = MathUtils_1.default.clamp01(tnear);
        hit.nearTimes.x = tnearx;
        hit.nearTimes.y = tneary;
        if (tnearx > tneary) {
            // We hit on the left or right size
            hit.normal.x = -signX;
            hit.normal.y = 0;
        }
        else if (Math.abs(tnearx - tneary) < 0.0001) {
            // We hit on the corner
            hit.normal.x = -signX;
            hit.normal.y = -signY;
            hit.normal.normalize();
        }
        else {
            // We hit on the top or bottom
            hit.normal.x = 0;
            hit.normal.y = -signY;
        }
        hit.delta.x = (1.0 - hit.time) * -delta.x;
        hit.delta.y = (1.0 - hit.time) * -delta.y;
        hit.pos.x = point.x + delta.x * hit.time;
        hit.pos.y = point.y + delta.y * hit.time;
        return hit;
    }
    // @override
    overlaps(other) {
        if (other instanceof AABB) {
            return this.overlapsAABB(other);
        }
        throw "Overlap not defined between these shapes.";
    }
    /**
     * A simple boolean check of whether this AABB overlaps another
     * @param other The other AABB to check against
     * @returns True if this AABB overlaps the other, false otherwise
     */
    overlapsAABB(other) {
        let dx = other.x - this.x;
        let px = this.hw + other.hw - Math.abs(dx);
        if (px <= 0) {
            return false;
        }
        let dy = other.y - this.y;
        let py = this.hh + other.hh - Math.abs(dy);
        if (py <= 0) {
            return false;
        }
        return true;
    }
    /**
     * Determines whether these AABBs are JUST touching - not overlapping.
     * Vec2.x is -1 if the other is to the left, 1 if to the right.
     * Likewise, Vec2.y is -1 if the other is on top, 1 if on bottom.
     * @param other The other AABB to check
     * @returns The collision sides stored in a Vec2 if the AABBs are touching, null otherwise
     */
    touchesAABB(other) {
        let dx = other.x - this.x;
        let px = this.hw + other.hw - Math.abs(dx);
        let dy = other.y - this.y;
        let py = this.hh + other.hh - Math.abs(dy);
        // If one axis is just touching and the other is overlapping, true
        if ((px === 0 && py >= 0) || (py === 0 && px >= 0)) {
            let ret = new Vec2_1.default();
            if (px === 0) {
                ret.x = other.x < this.x ? -1 : 1;
            }
            if (py === 0) {
                ret.y = other.y < this.y ? -1 : 1;
            }
            return ret;
        }
        else {
            return null;
        }
    }
    /**
     * Determines whether these AABBs are JUST touching - not overlapping.
     * Also, if they are only touching corners, they are considered not touching.
     * Vec2.x is -1 if the other is to the left, 1 if to the right.
     * Likewise, Vec2.y is -1 if the other is on top, 1 if on bottom.
     * @param other The other AABB to check
     * @returns The side of the touch, stored as a Vec2, or null if there is no touch
     */
    touchesAABBWithoutCorners(other) {
        let dx = other.x - this.x;
        let px = this.hw + other.hw - Math.abs(dx);
        let dy = other.y - this.y;
        let py = this.hh + other.hh - Math.abs(dy);
        // If one axis is touching, and the other is strictly overlapping
        if ((px === 0 && py > 0) || (py === 0 && px > 0)) {
            let ret = new Vec2_1.default();
            if (px === 0) {
                ret.x = other.x < this.x ? -1 : 1;
            }
            else {
                ret.y = other.y < this.y ? -1 : 1;
            }
            return ret;
        }
        else {
            return null;
        }
    }
    /**
     * Calculates the area of the overlap between this AABB and another
     * @param other The other AABB
     * @returns The area of the overlap between the AABBs
     */
    overlapArea(other) {
        let leftx = Math.max(this.x - this.hw, other.x - other.hw);
        let rightx = Math.min(this.x + this.hw, other.x + other.hw);
        let dx = rightx - leftx;
        let lefty = Math.max(this.y - this.hh, other.y - other.hh);
        let righty = Math.min(this.y + this.hh, other.y + other.hh);
        let dy = righty - lefty;
        if (dx < 0 || dy < 0)
            return 0;
        return dx * dy;
    }
    /**
     * Moves and resizes this rect from its current position to the position specified
     * @param velocity The movement of the rect from its position
     * @param fromPosition A position specified to be the starting point of sweeping
     * @param halfSize The halfSize of the sweeping rect
     */
    sweep(velocity, fromPosition, halfSize) {
        if (!fromPosition) {
            fromPosition = this.center;
        }
        if (!halfSize) {
            halfSize = this.halfSize;
        }
        let centerX = fromPosition.x + velocity.x / 2;
        let centerY = fromPosition.y + velocity.y / 2;
        let minX = Math.min(fromPosition.x - halfSize.x, fromPosition.x + velocity.x - halfSize.x);
        let minY = Math.min(fromPosition.y - halfSize.y, fromPosition.y + velocity.y - halfSize.y);
        this.center.set(centerX, centerY);
        this.halfSize.set(centerX - minX, centerY - minY);
    }
    // @override
    clone() {
        return new AABB(this.center.clone(), this.halfSize.clone());
    }
    /**
     * Converts this AABB to a string format
     * @returns (center: (x, y), halfSize: (x, y))
     */
    toString() {
        return "(center: " + this.center.toString() + ", half-size: " + this.halfSize.toString() + ")";
    }
}
exports.default = AABB;
},{"../../Utils/MathUtils":187,"../Physics/Hit":101,"../Vec2":111,"./Circle":105,"./Shape":106}],105:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("../Vec2");
const AABB_1 = require("./AABB");
const Shape_1 = require("./Shape");
/**
 * A Circle
 */
class Circle extends Shape_1.default {
    /**
     * Creates a new Circle
     * @param center The center of the circle
     * @param radius The radius of the circle
     */
    constructor(center, radius) {
        super();
        this._center = center ? center : new Vec2_1.default(0, 0);
        this.radius = radius ? radius : 0;
    }
    get center() {
        return this._center;
    }
    set center(center) {
        this._center = center;
    }
    get halfSize() {
        return new Vec2_1.default(this.radius, this.radius);
    }
    get r() {
        return this.radius;
    }
    set r(radius) {
        this.radius = radius;
    }
    // @override
    /**
     * A simple boolean check of whether this AABB contains a point
     * @param point The point to check
     * @returns A boolean representing whether this AABB contains the specified point
     */
    containsPoint(point) {
        return this.center.distanceSqTo(point) <= this.radius * this.radius;
    }
    // @override
    getBoundingRect() {
        return new AABB_1.default(this._center.clone(), new Vec2_1.default(this.radius, this.radius));
    }
    // @override
    getBoundingCircle() {
        return this.clone();
    }
    // @override
    overlaps(other) {
        throw new Error("Method not implemented.");
    }
    // @override
    clone() {
        return new Circle(this._center.clone(), this.radius);
    }
    toString() {
        return "(center: " + this.center.toString() + ", radius: " + this.radius + ")";
    }
}
exports.default = Circle;
},{"../Vec2":111,"./AABB":104,"./Shape":106}],106:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("../Vec2");
const AABB_1 = require("./AABB");
/**
 * An abstract Shape class that acts as an interface for better interactions with subclasses.
 */
class Shape {
    get x() {
        return this.center.x;
    }
    get y() {
        return this.center.y;
    }
    get hw() {
        return this.halfSize.x;
    }
    get hh() {
        return this.halfSize.y;
    }
    get top() {
        return this.y - this.hh;
    }
    get bottom() {
        return this.y + this.hh;
    }
    get left() {
        return this.x - this.hw;
    }
    get right() {
        return this.x + this.hw;
    }
    static getTimeOfCollision(A, velA, B, velB) {
        if (A instanceof AABB_1.default && B instanceof AABB_1.default) {
            return Shape.getTimeOfCollision_AABB_AABB(A, velA, B, velB);
        }
    }
    static getTimeOfCollision_AABB_AABB(A, velA, B, velB) {
        let posSmaller = A.center;
        let posLarger = B.center;
        let sizeSmaller = A.halfSize;
        let sizeLarger = B.halfSize;
        let firstContact = new Vec2_1.default(0, 0);
        let lastContact = new Vec2_1.default(0, 0);
        let collidingX = false;
        let collidingY = false;
        // Sort by position
        if (posLarger.x < posSmaller.x) {
            // Swap, because smaller is further right than larger
            let temp;
            temp = sizeSmaller;
            sizeSmaller = sizeLarger;
            sizeLarger = temp;
            temp = posSmaller;
            posSmaller = posLarger;
            posLarger = temp;
            temp = velA;
            velA = velB;
            velB = temp;
        }
        // A is left, B is right
        firstContact.x = Infinity;
        lastContact.x = Infinity;
        if (posLarger.x - sizeLarger.x >= posSmaller.x + sizeSmaller.x) {
            // If we aren't currently colliding
            let relVel = velA.x - velB.x;
            if (relVel > 0) {
                // If they are moving towards each other
                firstContact.x = ((posLarger.x - sizeLarger.x) - (posSmaller.x + sizeSmaller.x)) / (relVel);
                lastContact.x = ((posLarger.x + sizeLarger.x) - (posSmaller.x - sizeSmaller.x)) / (relVel);
            }
        }
        else {
            collidingX = true;
        }
        if (posLarger.y < posSmaller.y) {
            // Swap, because smaller is further up than larger
            let temp;
            temp = sizeSmaller;
            sizeSmaller = sizeLarger;
            sizeLarger = temp;
            temp = posSmaller;
            posSmaller = posLarger;
            posLarger = temp;
            temp = velA;
            velA = velB;
            velB = temp;
        }
        // A is top, B is bottom
        firstContact.y = Infinity;
        lastContact.y = Infinity;
        if (posLarger.y - sizeLarger.y >= posSmaller.y + sizeSmaller.y) {
            // If we aren't currently colliding
            let relVel = velA.y - velB.y;
            if (relVel > 0) {
                // If they are moving towards each other
                firstContact.y = ((posLarger.y - sizeLarger.y) - (posSmaller.y + sizeSmaller.y)) / (relVel);
                lastContact.y = ((posLarger.y + sizeLarger.y) - (posSmaller.y - sizeSmaller.y)) / (relVel);
            }
        }
        else {
            collidingY = true;
        }
        return [firstContact, lastContact, collidingX, collidingY];
    }
}
exports.default = Shape;
},{"../Vec2":111,"./AABB":104}],107:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A LIFO stack with items of type T
 */
class Stack {
    /**
     * Constructs a new stack
     * @param maxElements The maximum size of the stack
     */
    constructor(maxElements = 100) {
        this.MAX_ELEMENTS = maxElements;
        this.stack = new Array(this.MAX_ELEMENTS);
        this.head = -1;
    }
    /**
     * Adds an item to the top of the stack
     * @param item The new item to add to the stack
     */
    push(item) {
        if (this.head + 1 === this.MAX_ELEMENTS) {
            throw "Stack full - cannot add element";
        }
        this.head += 1;
        this.stack[this.head] = item;
    }
    /**
     * Removes an item from the top of the stack
     * @returns The item at the top of the stack
     */
    pop() {
        if (this.head === -1) {
            throw "Stack empty - cannot remove element";
        }
        this.head -= 1;
        return this.stack[this.head + 1];
    }
    /**
     * Returns the element currently at the top of the stack
     * @returns The item at the top of the stack
     */
    peek() {
        if (this.head === -1) {
            throw "Stack empty - cannot get element";
        }
        return this.stack[this.head];
    }
    /** Returns true if this stack is empty
     * @returns A boolean that represents whether or not the stack is empty
    */
    isEmpty() {
        return this.head === -1;
    }
    // @implemented
    clear() {
        this.forEach((item, index) => delete this.stack[index]);
        this.head = -1;
    }
    /**
     * Returns the number of items currently in the stack
     * @returns The number of items in the stack
     */
    size() {
        return this.head + 1;
    }
    // @implemented
    forEach(func) {
        let i = 0;
        while (i <= this.head) {
            func(this.stack[i], i);
            i += 1;
        }
    }
    /**
     * Converts this stack into a string format
     * @returns A string representing this stack
     */
    toString() {
        let retval = "";
        this.forEach((item, index) => {
            let str = item.toString();
            if (index !== 0) {
                str += " -> ";
            }
            retval = str + retval;
        });
        return "Top -> " + retval;
    }
}
exports.default = Stack;
},{}],108:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Emitter_1 = require("../../Events/Emitter");
/**
 * An abstract implementation of a state for a @reference[StateMachine].
 * This class should be extended to allow for custom state behaviors.
 */
class State {
    /**
     * Constructs a new State
     * @param parent The parent StateMachine of this state
     */
    constructor(parent) {
        this.parent = parent;
        this.emitter = new Emitter_1.default();
    }
    /**
     * Tells the state machine that this state has ended, and makes it transition to the new state specified
     * @param stateName The name of the state to transition to
     */
    finished(stateName) {
        this.parent.changeState(stateName);
    }
}
exports.default = State;
},{"../../Events/Emitter":114}],109:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Stack_1 = require("../Stack");
const Map_1 = require("../Map");
const Receiver_1 = require("../../Events/Receiver");
const Emitter_1 = require("../../Events/Emitter");
/**
 * An implementation of a Push Down Automata State machine. States can also be hierarchical
 * for more flexibility, as described in @link(Game Programming Patterns)(https://gameprogrammingpatterns.com/state.html).
 */
class StateMachine {
    /**
     * Creates a new StateMachine
     */
    constructor() {
        this.stack = new Stack_1.default();
        this.stateMap = new Map_1.default();
        this.receiver = new Receiver_1.default();
        this.emitter = new Emitter_1.default();
        this.emitEventOnStateChange = false;
    }
    /**
     * Sets the activity state of this state machine
     * @param flag True if you want to set this machine running, false otherwise
     */
    setActive(flag) {
        this.active = flag;
    }
    /**
     * Makes this state machine emit an event any time its state changes
     * @param stateChangeEventName The name of the event to emit
     */
    setEmitEventOnStateChange(stateChangeEventName) {
        this.emitEventOnStateChange = true;
        this.stateChangeEventName = stateChangeEventName;
    }
    /**
     * Stops this state machine from emitting events on state change.
     */
    cancelEmitEventOnStateChange() {
        this.emitEventOnStateChange = false;
    }
    /**
     * Initializes this state machine with an initial state and sets it running
     * @param initialState The name of initial state of the state machine
     */
    initialize(initialState, options = {}) {
        this.stack.push(this.stateMap.get(initialState));
        this.currentState = this.stack.peek();
        this.currentState.onEnter(options);
        this.setActive(true);
    }
    /**
     * Adds a state to this state machine
     * @param stateName The name of the state to add
     * @param state The state to add
     */
    addState(stateName, state) {
        this.stateMap.add(stateName, state);
    }
    /**
     * Changes the state of this state machine to the provided string
     * @param state The string name of the state to change to
     */
    changeState(state) {
        // Exit the current state
        let options = this.currentState.onExit();
        // Make sure the correct state is at the top of the stack
        if (state === "previous") {
            // Pop the current state off the stack
            this.stack.pop();
        }
        else {
            // Retrieve the new state from the statemap and put it at the top of the stack
            this.stack.pop();
            this.stack.push(this.stateMap.get(state));
        }
        // Retreive the new state from the stack
        this.currentState = this.stack.peek();
        // Emit an event if turned on
        if (this.emitEventOnStateChange) {
            this.emitter.fireEvent(this.stateChangeEventName, { state: this.currentState });
        }
        // Enter the new state
        this.currentState.onEnter(options);
    }
    /**
     * Handles input. This happens at the very beginning of this state machine's update cycle.
     * @param event The game event to process
     */
    handleEvent(event) {
        if (this.active) {
            this.currentState.handleInput(event);
        }
    }
    // @implemented
    update(deltaT) {
        // Distribute events
        while (this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();
            this.handleEvent(event);
        }
        // Delegate the update to the current state
        this.currentState.update(deltaT);
    }
}
exports.default = StateMachine;
},{"../../Events/Emitter":114,"../../Events/Receiver":118,"../Map":98,"../Stack":107}],110:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ResourceManager_1 = require("../../ResourceManager/ResourceManager");
const Vec2_1 = require("../Vec2");
/**
 * The data representation of a Tileset for the game engine. This represents one image,
 * with a startIndex if required (as it is with Tiled using two images in one tilset).
 */
class Tileset {
    // TODO: Change this to be more general and work with other tileset formats
    constructor(tilesetData) {
        // Defer handling of the data to a helper class
        this.initFromTiledData(tilesetData);
    }
    /**
     * Initialize the tileset from the data from a Tiled json file
     * @param tiledData The parsed object from a Tiled json file
     */
    initFromTiledData(tiledData) {
        this.numRows = tiledData.tilecount / tiledData.columns;
        this.numCols = tiledData.columns;
        this.startIndex = tiledData.firstgid;
        this.endIndex = this.startIndex + tiledData.tilecount - 1;
        this.tileSize = new Vec2_1.default(tiledData.tilewidth, tiledData.tilewidth);
        this.imageKey = tiledData.image;
        this.imageSize = new Vec2_1.default(tiledData.imagewidth, tiledData.imageheight);
    }
    /**
     * Gets the image key associated with this tilemap
     * @returns The image key of this tilemap
     */
    getImageKey() {
        return this.imageKey;
    }
    /**
     * Returns a Vec2 containing the left and top offset from the image origin for this tile.
     * @param tileIndex The index of the tile from startIndex to endIndex of this tileset
     * @returns A Vec2 containing the offset for the specified tile.
     */
    getImageOffsetForTile(tileIndex) {
        // Get the true index
        let index = tileIndex - this.startIndex;
        let row = Math.floor(index / this.numCols);
        let col = index % this.numCols;
        let width = this.tileSize.x;
        let height = this.tileSize.y;
        // Calculate the position to start a crop in the tileset image
        let left = col * width;
        let top = row * height;
        return new Vec2_1.default(left, top);
    }
    /**
     * Gets the start index
     * @returns The start index
     */
    getStartIndex() {
        return this.startIndex;
    }
    /**
     * Gets the tile set
     * @returns A Vec2 containing the tile size
     */
    getTileSize() {
        return this.tileSize;
    }
    /**
     * Gets the number of rows in the tileset
     * @returns The number of rows
     */
    getNumRows() {
        return this.numRows;
    }
    /**
     * Gets the number of columns in the tilset
     * @returns The number of columns
     */
    getNumCols() {
        return this.numCols;
    }
    getTileCount() {
        return this.endIndex - this.startIndex + 1;
    }
    /**
     * Checks whether or not this tilset contains the specified tile index. This is used for rendering.
     * @param tileIndex The index of the tile to check
     * @returns A boolean representing whether or not this tilset uses the specified index
     */
    hasTile(tileIndex) {
        return tileIndex >= this.startIndex && tileIndex <= this.endIndex;
    }
    /**
     * Render a singular tile with index tileIndex from the tileset located at position dataIndex
     * @param ctx The rendering context
     * @param tileIndex The value of the tile to render
     * @param dataIndex The index of the tile in the data array
     * @param worldSize The size of the world
     * @param origin The viewport origin in the current layer
     * @param scale The scale of the tilemap
     */
    renderTile(ctx, tileIndex, dataIndex, maxCols, origin, scale, zoom) {
        let image = ResourceManager_1.default.getInstance().getImage(this.imageKey);
        // Get the true index
        let index = tileIndex - this.startIndex;
        let row = Math.floor(index / this.numCols);
        let col = index % this.numCols;
        let width = this.tileSize.x;
        let height = this.tileSize.y;
        // Calculate the position to start a crop in the tileset image
        let left = col * width;
        let top = row * height;
        // Calculate the position in the world to render the tile
        let x = Math.floor((dataIndex % maxCols) * width * scale.x);
        let y = Math.floor(Math.floor(dataIndex / maxCols) * height * scale.y);
        ctx.drawImage(image, left, top, width, height, Math.floor((x - origin.x) * zoom), Math.floor((y - origin.y) * zoom), Math.ceil(width * scale.x * zoom), Math.ceil(height * scale.y * zoom));
    }
}
exports.default = Tileset;
},{"../../ResourceManager/ResourceManager":168,"../Vec2":111}],111:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MathUtils_1 = require("../Utils/MathUtils");
/**
 * A two-dimensional vector (x, y)
 */
class Vec2 {
    /**
     * Creates a new Vec2
     * @param x The x value of the vector
     * @param y The y value of the vector
     */
    constructor(x = 0, y = 0) {
        /**
         * When this vector changes its value, do something
         */
        this.onChange = () => { };
        this.vec = new Float32Array(2);
        this.vec[0] = x;
        this.vec[1] = y;
    }
    // Expose x and y with getters and setters
    get x() {
        return this.vec[0];
    }
    set x(x) {
        this.vec[0] = x;
        if (this.onChange) {
            this.onChange();
        }
    }
    get y() {
        return this.vec[1];
    }
    set y(y) {
        this.vec[1] = y;
        if (this.onChange) {
            this.onChange();
        }
    }
    static get ZERO() {
        return new Vec2(0, 0);
    }
    static get INF() {
        return new Vec2(Infinity, Infinity);
    }
    static get UP() {
        return new Vec2(0, -1);
    }
    static get DOWN() {
        return new Vec2(0, 1);
    }
    static get LEFT() {
        return new Vec2(-1, 0);
    }
    static get RIGHT() {
        return new Vec2(1, 0);
    }
    /**
     * The squared magnitude of the vector. This tends to be faster, so use it in situations where taking the
     * square root doesn't matter, like for comparing distances.
     * @returns The squared magnitude of the vector
     */
    magSq() {
        return this.x * this.x + this.y * this.y;
    }
    /**
     * The magnitude of the vector.
     * @returns The magnitude of the vector.
     */
    mag() {
        return Math.sqrt(this.magSq());
    }
    /**
     * Divdes x and y by the magnitude to obtain the unit vector in the direction of this vector.
     * @returns This vector as a unit vector.
     */
    normalize() {
        if (this.x === 0 && this.y === 0)
            return this;
        let mag = this.mag();
        this.x /= mag;
        this.y /= mag;
        return this;
    }
    /**
     * Works like normalize(), but returns a new Vec2
     * @returns A new vector that is the unit vector for this one
     */
    normalized() {
        if (this.isZero()) {
            return this;
        }
        let mag = this.mag();
        return new Vec2(this.x / mag, this.y / mag);
    }
    /**
     * Sets the x and y elements of this vector to zero.
     * @returns This vector, with x and y set to zero.
     */
    zero() {
        return this.set(0, 0);
    }
    /**
     * Sets the vector's x and y based on the angle provided. Goes counter clockwise.
     * @param angle The angle in radians
     * @param radius The magnitude of the vector at the specified angle
     * @returns This vector.
     */
    setToAngle(angle, radius = 1) {
        this.x = MathUtils_1.default.floorToPlace(Math.cos(angle) * radius, 5);
        this.y = MathUtils_1.default.floorToPlace(-Math.sin(angle) * radius, 5);
        return this;
    }
    /**
     * Returns a vector that point from this vector to another one
     * @param other The vector to point to
     * @returns A new Vec2 that points from this vector to the one provided
     */
    vecTo(other) {
        return new Vec2(other.x - this.x, other.y - this.y);
    }
    /**
     * Returns a vector containing the direction from this vector to another
     * @param other The vector to point to
     * @returns A new Vec2 that points from this vector to the one provided. This new Vec2 will be a unit vector.
     */
    dirTo(other) {
        return this.vecTo(other).normalize();
    }
    /**
     * Keeps the vector's direction, but sets its magnitude to be the provided magnitude
     * @param magnitude The magnitude the vector should be
     * @returns This vector with its magnitude set to the new magnitude
     */
    scaleTo(magnitude) {
        return this.normalize().scale(magnitude);
    }
    /**
     * Scales x and y by the number provided, or if two number are provided, scales them individually.
     * @param factor The scaling factor for the vector, or for only the x-component if yFactor is provided
     * @param yFactor The scaling factor for the y-component of the vector
     * @returns This vector after scaling
     */
    scale(factor, yFactor = null) {
        if (yFactor !== null) {
            this.x *= factor;
            this.y *= yFactor;
            return this;
        }
        this.x *= factor;
        this.y *= factor;
        return this;
    }
    /**
     * Returns a scaled version of this vector without modifying it.
     * @param factor The scaling factor for the vector, or for only the x-component if yFactor is provided
     * @param yFactor The scaling factor for the y-component of the vector
     * @returns A new vector that has the values of this vector after scaling
     */
    scaled(factor, yFactor = null) {
        return this.clone().scale(factor, yFactor);
    }
    /**
     * Rotates the vector counter-clockwise by the angle amount specified
     * @param angle The angle to rotate by in radians
     * @returns This vector after rotation.
     */
    rotateCCW(angle) {
        let cs = Math.cos(angle);
        let sn = Math.sin(angle);
        let tempX = this.x * cs - this.y * sn;
        let tempY = this.x * sn + this.y * cs;
        this.x = tempX;
        this.y = tempY;
        return this;
    }
    /**
     * Sets the vectors coordinates to be the ones provided
     * @param x The new x value for this vector
     * @param y The new y value for this vector
     * @returns This vector
     */
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    /**
     * Copies the values of the other Vec2 into this one.
     * @param other The Vec2 to copy
     * @returns This vector with its values set to the vector provided
     */
    copy(other) {
        return this.set(other.x, other.y);
    }
    /**
     * Adds this vector the another vector
     * @param other The Vec2 to add to this one
     * @returns This vector after adding the one provided
     */
    add(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
    /**
     * Increments the fields of this vector. Both are incremented with a, if only a is provided.
     * @param a The first number to increment by
     * @param b The second number to increment by
     * @returnss This vector after incrementing
     */
    inc(a, b) {
        if (b === undefined) {
            this.x += a;
            this.y += a;
        }
        else {
            this.x += a;
            this.y += b;
        }
        return this;
    }
    /**
     * Subtracts another vector from this vector
     * @param other The Vec2 to subtract from this one
     * @returns This vector after subtracting the one provided
     */
    sub(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }
    /**
     * Multiplies this vector with another vector element-wise. In other words, this.x *= other.x and this.y *= other.y
     * @param other The Vec2 to multiply this one by
     * @returns This vector after multiplying its components by this one
     */
    mult(other) {
        this.x *= other.x;
        this.y *= other.y;
        return this;
    }
    /**
     * Divides this vector with another vector element-wise. In other words, this.x /= other.x and this.y /= other.y
     * @param other The vector to divide this one by
     * @returns This vector after division
     */
    div(other) {
        if (other.x === 0 || other.y === 0)
            throw "Divide by zero error";
        this.x /= other.x;
        this.y /= other.y;
        return this;
    }
    /**
     * Does an element wise remainder operation on this vector. this.x %= other.x and this.y %= other.y
     * @param other The other vector
     * @returns this vector
     */
    remainder(other) {
        this.x = this.x % other.x;
        this.y = this.y % other.y;
        return this;
    }
    /**
     * Returns the squared distance between this vector and another vector
     * @param other The vector to compute distance squared to
     * @returns The squared distance between this vector and the one provided
     */
    distanceSqTo(other) {
        return (this.x - other.x) * (this.x - other.x) + (this.y - other.y) * (this.y - other.y);
    }
    /**
     * Returns the distance between this vector and another vector
     * @param other The vector to compute distance to
     * @returns The distance between this vector and the one provided
     */
    distanceTo(other) {
        return Math.sqrt(this.distanceSqTo(other));
    }
    /**
     * Returns the dot product of this vector and another
     * @param other The vector to compute the dot product with
     * @returns The dot product of this vector and the one provided.
     */
    dot(other) {
        return this.x * other.x + this.y * other.y;
    }
    /**
     * Returns the angle counter-clockwise in radians from this vector to another vector
     * @param other The vector to compute the angle to
     * @returns The angle, rotating CCW, from this vector to the other vector
     */
    angleToCCW(other) {
        let dot = this.dot(other);
        let det = this.x * other.y - this.y * other.x;
        let angle = -Math.atan2(det, dot);
        if (angle < 0) {
            angle += 2 * Math.PI;
        }
        return angle;
    }
    /**
     * Returns a string representation of this vector rounded to 1 decimal point
     * @returns This vector as a string
     */
    toString() {
        return this.toFixed();
    }
    /**
     * Returns a string representation of this vector rounded to the specified number of decimal points
     * @param numDecimalPoints The number of decimal points to create a string to
     * @returns This vector as a string
     */
    toFixed(numDecimalPoints = 1) {
        return "(" + this.x.toFixed(numDecimalPoints) + ", " + this.y.toFixed(numDecimalPoints) + ")";
    }
    /**
     * Returns a new vector with the same coordinates as this one.
     * @returns A new Vec2 with the same values as this one
     */
    clone() {
        return new Vec2(this.x, this.y);
    }
    /**
     * Returns true if this vector and other have the EXACT same x and y (not assured to be safe for floats)
     * @param other The vector to check against
     * @returns A boolean representing the equality of the two vectors
     */
    strictEquals(other) {
        return this.x === other.x && this.y === other.y;
    }
    /**
     * Returns true if this vector and other have the same x and y
     * @param other The vector to check against
     * @returns A boolean representing the equality of the two vectors
     */
    equals(other) {
        let xEq = Math.abs(this.x - other.x) < 0.0000001;
        let yEq = Math.abs(this.y - other.y) < 0.0000001;
        return xEq && yEq;
    }
    /**
     * Returns true if this vector is the zero vector exactly (not assured to be safe for floats).
     * @returns A boolean representing the equality of this vector and the zero vector
     */
    strictIsZero() {
        return this.x === 0 && this.y === 0;
    }
    /**
     * Returns true if this x and y for this vector are both zero.
     * @returns A boolean representing the equality of this vector and the zero vector
     */
    isZero() {
        return Math.abs(this.x) < 0.0000001 && Math.abs(this.y) < 0.0000001;
    }
    /**
     * Sets the function that is called whenever this vector is changed.
     * @param f The function to be called
     */
    setOnChange(f) {
        this.onChange = f;
    }
    toArray() {
        return this.vec;
    }
    /**
     * Performs linear interpolation between two vectors
     * @param a The first vector
     * @param b The second vector
     * @param t The time of the lerp, with 0 being vector A, and 1 being vector B
     * @returns A new Vec2 representing the lerp between vector a and b.
     */
    static lerp(a, b, t) {
        return new Vec2(MathUtils_1.default.lerp(a.x, b.x, t), MathUtils_1.default.lerp(a.y, b.y, t));
    }
}
exports.default = Vec2;
Vec2.ZERO_STATIC = new Vec2(0, 0);
},{"../Utils/MathUtils":187}],112:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Map_1 = require("../DataTypes/Map");
const Vec2_1 = require("../DataTypes/Vec2");
const Color_1 = require("../Utils/Color");
/**
 * A util class for rendering Debug messages to the canvas.
 */
class Debug {
    /**
     * Add a message to display on the debug screen
     * @param id A unique ID for this message
     * @param messages The messages to print to the debug screen
     */
    static log(id, ...messages) {
        // let message = "";
        // for(let i = 0; i < messages.length; i++){
        // 	message += messages[i].toString();
        // }
        // Join all messages with spaces
        let message = messages.map((m) => m.toString()).join(" ");
        this.logMessages.add(id, message);
    }
    /**
     * Deletes a a key from the log and stops it from keeping up space on the screen
     * @param id The id of the log item to clear
     */
    static clearLogItem(id) {
        this.logMessages.delete(id);
    }
    /**
     * Sets the list of nodes to render with the debugger
     * @param nodes The new list of nodes
     */
    static setNodes(nodes) {
        this.nodes = nodes;
    }
    /**
     * Draws a box at the specified position
     * @param center The center of the box
     * @param halfSize The dimensions of the box
     * @param filled A boolean for whether or not the box is filled
     * @param color The color of the box to draw
     */
    static drawBox(center, halfSize, filled, color) {
        let alpha = this.debugRenderingContext.globalAlpha;
        this.debugRenderingContext.globalAlpha = color.a;
        if (filled) {
            this.debugRenderingContext.fillStyle = color.toString();
            this.debugRenderingContext.fillRect(center.x - halfSize.x, center.y - halfSize.y, halfSize.x * 2, halfSize.y * 2);
        }
        else {
            let lineWidth = 2;
            this.debugRenderingContext.lineWidth = lineWidth;
            this.debugRenderingContext.strokeStyle = color.toString();
            this.debugRenderingContext.strokeRect(center.x - halfSize.x, center.y - halfSize.y, halfSize.x * 2, halfSize.y * 2);
        }
        this.debugRenderingContext.globalAlpha = alpha;
    }
    /**
     * Draws a circle at the specified position
     * @param center The center of the circle
     * @param radius The dimensions of the box
     * @param filled A boolean for whether or not the circle is filled
     * @param color The color of the circle
     */
    static drawCircle(center, radius, filled, color) {
        let alpha = this.debugRenderingContext.globalAlpha;
        this.debugRenderingContext.globalAlpha = color.a;
        if (filled) {
            this.debugRenderingContext.fillStyle = color.toString();
            this.debugRenderingContext.beginPath();
            this.debugRenderingContext.arc(center.x, center.y, radius, 0, 2 * Math.PI);
            this.debugRenderingContext.closePath();
            this.debugRenderingContext.fill();
        }
        else {
            let lineWidth = 2;
            this.debugRenderingContext.lineWidth = lineWidth;
            this.debugRenderingContext.strokeStyle = color.toString();
            this.debugRenderingContext.beginPath();
            this.debugRenderingContext.arc(center.x, center.y, radius, 0, 2 * Math.PI);
            this.debugRenderingContext.closePath();
            this.debugRenderingContext.stroke();
        }
        this.debugRenderingContext.globalAlpha = alpha;
    }
    /**
     * Draws a ray at the specified position
     * @param from The starting position of the ray
     * @param to The ending position of the ray
     * @param color The color of the ray
     */
    static drawRay(from, to, color) {
        this.debugRenderingContext.lineWidth = 2;
        this.debugRenderingContext.strokeStyle = color.toString();
        this.debugRenderingContext.beginPath();
        this.debugRenderingContext.moveTo(from.x, from.y);
        this.debugRenderingContext.lineTo(to.x, to.y);
        this.debugRenderingContext.closePath();
        this.debugRenderingContext.stroke();
    }
    /**
     * Draws a point at the specified position
     * @param pos The position of the point
     * @param color The color of the point
     */
    static drawPoint(pos, color) {
        let pointSize = 6;
        this.debugRenderingContext.fillStyle = color.toString();
        this.debugRenderingContext.fillRect(pos.x - pointSize / 2, pos.y - pointSize / 2, pointSize, pointSize);
    }
    /**
     * Sets the default rendering color for text for the debugger
     * @param color The color to render the text
     */
    static setDefaultTextColor(color) {
        this.defaultTextColor = color;
    }
    /**
     * Performs any necessary setup operations on the Debug canvas
     * @param canvas The debug canvas
     * @param width The desired width of the canvas
     * @param height The desired height of the canvas
     * @returns The rendering context extracted from the canvas
     */
    static initializeDebugCanvas(canvas, width, height) {
        canvas.width = width;
        canvas.height = height;
        this.debugCanvasSize = new Vec2_1.default(width, height);
        this.debugRenderingContext = canvas.getContext("2d");
        return this.debugRenderingContext;
    }
    /** Clears the debug canvas */
    static clearCanvas() {
        this.debugRenderingContext.clearRect(0, 0, this.debugCanvasSize.x, this.debugCanvasSize.y);
    }
    /** Renders the text and nodes sent to the Debug system */
    static render() {
        this.renderText();
        this.renderNodes();
    }
    /** Renders the text sent to the Debug canvas */
    static renderText() {
        let y = 20;
        this.debugRenderingContext.font = "20px Arial";
        this.debugRenderingContext.fillStyle = this.defaultTextColor.toString();
        // Draw all of the text
        this.logMessages.forEach((key) => {
            this.debugRenderingContext.fillText(this.logMessages.get(key), 10, y);
            y += 30;
        });
    }
    /** Renders the nodes registered with the debug canvas */
    static renderNodes() {
        if (this.nodes) {
            this.nodes.forEach(node => {
                node.debugRender();
            });
        }
    }
}
exports.default = Debug;
/** A map of log messages to display on the screen */
Debug.logMessages = new Map_1.default();
/** The rendering color for text */
Debug.defaultTextColor = Color_1.default.WHITE;
},{"../DataTypes/Map":98,"../DataTypes/Vec2":111,"../Utils/Color":184}],113:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Color_1 = require("../Utils/Color");
// @ignorePage
class Stats extends Object {
    static initStats() {
        let canvas = document.getElementById("stats-canvas");
        canvas.width = this.CANVAS_WIDTH;
        canvas.height = this.CANVAS_HEIGHT;
        this.ctx = canvas.getContext("2d");
        this.statsDiv = document.getElementById("stats-display");
        this.prevfps = new Array();
        this.prevClearTimes = new Array();
        this.SGClearTimes = new Array();
        this.avgSGClearTime = 0;
        this.prevFillTimes = new Array();
        this.SGFillTimes = new Array();
        this.avgSGFillTime = 0;
        this.prevUpdateTimes = new Array();
        this.SGUpdateTimes = new Array();
        this.avgSGUpdateTime = 0;
        this.prevQueryTimes = new Array();
        this.SGQueryTimes = new Array();
        this.avgSGQueryTime = 0;
        let clearTime = document.createElement("span");
        clearTime.setAttribute("id", "sgclear");
        let fillTime = document.createElement("span");
        fillTime.setAttribute("id", "sgfill");
        let updateTime = document.createElement("span");
        updateTime.setAttribute("id", "sgupdate");
        let queryTime = document.createElement("span");
        queryTime.setAttribute("id", "sgquery");
        let br1 = document.createElement("br");
        let br2 = document.createElement("br");
        let br3 = document.createElement("br");
        this.statsDiv.append(clearTime, br1, fillTime, br2, updateTime, br3, queryTime);
        this.graphChoices = document.getElementById("chart-option");
        let option1 = document.createElement("option");
        option1.value = "prevfps";
        option1.label = "FPS";
        let option2 = document.createElement("option");
        option2.value = "prevClearTimes";
        option2.label = "Clear Time";
        let option3 = document.createElement("option");
        option3.value = "prevFillTimes";
        option3.label = "Fill time";
        let option4 = document.createElement("option");
        option4.value = "prevUpdateTimes";
        option4.label = "Update time";
        let option5 = document.createElement("option");
        option5.value = "prevQueryTimes";
        option5.label = "Query Time";
        let optionAll = document.createElement("option");
        optionAll.value = "all";
        optionAll.label = "All";
        this.graphChoices.append(option1, option2, option3, option4, option5, optionAll);
    }
    static updateFPS(fps) {
        this.prevfps.push(fps);
        if (this.prevfps.length > Stats.NUM_POINTS) {
            this.prevfps.shift();
        }
        if (this.SGClearTimes.length > 0) {
            this.prevClearTimes.push(this.avgSGClearTime);
            if (this.prevClearTimes.length > this.NUM_POINTS) {
                this.prevClearTimes.shift();
            }
        }
        if (this.SGFillTimes.length > 0) {
            this.prevFillTimes.push(this.avgSGFillTime);
            if (this.prevFillTimes.length > this.NUM_POINTS) {
                this.prevFillTimes.shift();
            }
        }
        if (this.SGUpdateTimes.length > 0) {
            this.prevUpdateTimes.push(this.avgSGUpdateTime);
            if (this.prevUpdateTimes.length > this.NUM_POINTS) {
                this.prevUpdateTimes.shift();
            }
        }
        if (this.SGQueryTimes.length > 0) {
            this.prevQueryTimes.push(this.avgSGQueryTime);
            if (this.prevQueryTimes.length > this.NUM_POINTS) {
                this.prevQueryTimes.shift();
            }
        }
        this.updateSGStats();
    }
    static log(key, data) {
        if (key === "sgclear") {
            this.SGClearTimes.push(data);
            if (this.SGClearTimes.length > 100) {
                this.SGClearTimes.shift();
            }
        }
        else if (key === "sgfill") {
            this.SGFillTimes.push(data);
            if (this.SGFillTimes.length > 100) {
                this.SGFillTimes.shift();
            }
        }
        else if (key === "sgupdate") {
            this.SGUpdateTimes.push(data);
            if (this.SGUpdateTimes.length > 100) {
                this.SGUpdateTimes.shift();
            }
        }
        else if (key === "sgquery") {
            this.SGQueryTimes.push(data);
            if (this.SGQueryTimes.length > 1000) {
                this.SGQueryTimes.shift();
            }
        }
    }
    static render() {
        // Display stats
        this.drawCharts();
    }
    static drawCharts() {
        this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        let paramString = this.graphChoices.value;
        if (paramString === "prevfps" || paramString === "all") {
            let param = this.prevfps;
            let color = Color_1.default.BLUE.toString();
            this.drawChart(param, color);
        }
        if (paramString === "prevClearTimes" || paramString === "all") {
            let param = this.prevClearTimes;
            let color = Color_1.default.RED.toString();
            this.drawChart(param, color);
        }
        if (paramString === "prevFillTimes" || paramString === "all") {
            let param = this.prevFillTimes;
            let color = Color_1.default.GREEN.toString();
            this.drawChart(param, color);
        }
        if (paramString === "prevUpdateTimes" || paramString === "all") {
            let param = this.prevUpdateTimes;
            let color = Color_1.default.CYAN.toString();
            this.drawChart(param, color);
        }
        if (paramString === "prevQueryTimes" || paramString === "all") {
            let param = this.prevQueryTimes;
            let color = Color_1.default.ORANGE.toString();
            this.drawChart(param, color);
        }
    }
    static drawChart(param, color) {
        this.ctx.strokeStyle = Color_1.default.BLACK.toString();
        this.ctx.beginPath();
        this.ctx.moveTo(10, 10);
        this.ctx.lineTo(10, this.CANVAS_HEIGHT - 10);
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(10, this.CANVAS_HEIGHT - 10);
        this.ctx.lineTo(this.CANVAS_WIDTH - 10, this.CANVAS_HEIGHT - 10);
        this.ctx.closePath();
        this.ctx.stroke();
        let max = Math.max(...param);
        let prevX = 10;
        let prevY = this.CANVAS_HEIGHT - 10 - param[0] / max * (this.CANVAS_HEIGHT - 20);
        this.ctx.strokeStyle = color;
        for (let i = 1; i < param.length; i++) {
            let fps = param[i];
            let x = 10 + i * (this.CANVAS_WIDTH - 20) / this.NUM_POINTS;
            let y = this.CANVAS_HEIGHT - 10 - fps / max * (this.CANVAS_HEIGHT - 20);
            this.ctx.beginPath();
            this.ctx.moveTo(prevX, prevY);
            this.ctx.lineTo(x, y);
            this.ctx.closePath();
            this.ctx.stroke();
            prevX = x;
            prevY = y;
        }
    }
    static updateSGStats() {
        if (this.SGClearTimes.length > 0) {
            this.avgSGClearTime = this.SGClearTimes.reduce((acc, val) => acc + val) / this.SGClearTimes.length;
        }
        if (this.SGFillTimes.length > 0) {
            this.avgSGFillTime = this.SGFillTimes.reduce((acc, val) => acc + val) / this.SGFillTimes.length;
        }
        if (this.SGUpdateTimes.length > 0) {
            this.avgSGUpdateTime = this.SGUpdateTimes.reduce((acc, val) => acc + val) / this.SGUpdateTimes.length;
        }
        if (this.SGQueryTimes.length > 0) {
            this.avgSGQueryTime = this.SGQueryTimes.reduce((acc, val) => acc + val) / this.SGQueryTimes.length;
        }
        document.getElementById("sgclear").innerHTML = "Avg SG clear time: " + this.avgSGClearTime;
        document.getElementById("sgfill").innerHTML = "Avg SG fill time: " + this.avgSGFillTime;
        document.getElementById("sgupdate").innerHTML = "Avg SG update time: " + this.avgSGUpdateTime;
        document.getElementById("sgquery").innerHTML = "Avg SG query time: " + this.avgSGQueryTime;
    }
}
exports.default = Stats;
Stats.NUM_POINTS = 60;
Stats.CANVAS_WIDTH = 300;
Stats.CANVAS_HEIGHT = 300;
},{"../Utils/Color":184}],114:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventQueue_1 = require("./EventQueue");
const GameEvent_1 = require("./GameEvent");
/**
 * An event emitter object other systems can use to hook into the EventQueue.
 * Provides an easy interface for firing off events.
 */
class Emitter {
    /** Creates a new Emitter */
    constructor() {
        this.eventQueue = EventQueue_1.default.getInstance();
    }
    /**
     * Emit and event of type eventType with the data packet data
     * @param eventType The name of the event to fire off
     * @param data A @reference[Map] or record containing any data about the event
     */
    fireEvent(eventType, data = null) {
        this.eventQueue.addEvent(new GameEvent_1.default(eventType, data));
    }
}
exports.default = Emitter;
},{"./EventQueue":115,"./GameEvent":116}],115:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Queue_1 = require("../DataTypes/Queue");
const Map_1 = require("../DataTypes/Map");
const GameEventType_1 = require("./GameEventType");
/**
 * The main event system of the game engine.
 * Events are sent to the EventQueue, which handles distribution to any systems that are listening for those events.
 * This allows for handling of input without having classes directly hook into javascript event handles,
 * and allows otherwise separate classes to communicate with each other cleanly, such as a Player object
 * requesting a sound be played by the audio system.
 *
 * The distribution of @reference[GameEvent]s happens as follows:
 *
 * Events are recieved throughout a frame and are queued up by the EventQueue.
 * At the beginning of the next frame, events are sent out to any receivers that are hooked into the event type.
 * @reference[Receiver]s are then free to process events as they see fit.
 *
 * Overall, the EventQueue can be considered as something similar to an email server,
 * and the @reference[Receiver]s can be considered as the client inboxes.
 *
 * See @link(Game Programming Patterns)(https://gameprogrammingpatterns.com/event-queue.html) for more discussion on EventQueues
 */
class EventQueue {
    constructor() {
        this.MAX_SIZE = 100;
        this.q = new Queue_1.default(this.MAX_SIZE);
        this.receivers = new Map_1.default();
    }
    /** Retrieves the instance of the Singleton EventQueue */
    static getInstance() {
        if (this.instance === null) {
            this.instance = new EventQueue();
        }
        return this.instance;
    }
    /** Adds an event to the EventQueue.
     * This is exposed to the rest of the game engine through the @reference[Emitter] class */
    addEvent(event) {
        this.q.enqueue(event);
    }
    /**
     * Associates a receiver with a type of event. Every time this event appears in the future,
     * it will be given to the receiver (and any others watching that type).
     * This is exposed to the rest of the game engine through the @reference[Receiver] class
     * @param receiver The event receiver
     * @param type The type or types of events to subscribe to
     */
    subscribe(receiver, type) {
        if (type instanceof Array) {
            // If it is an array, subscribe to all event types
            for (let t of type) {
                this.addListener(receiver, t);
            }
        }
        else {
            this.addListener(receiver, type);
        }
    }
    /**
     * Unsubscribes the specified receiver from all events, or from whatever events are provided
     * @param receiver The receiver to unsubscribe
     * @param keys The events to unsubscribe from. If none are provided, unsubscribe from all
     */
    unsubscribe(receiver, ...events) {
        this.receivers.forEach(eventName => {
            // If keys were provided, only continue if this key is one of them
            if (events.length > 0 && events.indexOf(eventName) === -1)
                return;
            // Find the index of our receiver for this key
            let index = this.receivers.get(eventName).indexOf(receiver);
            // If an index was found, remove the receiver
            if (index !== -1) {
                this.receivers.get(eventName).splice(index, 1);
            }
        });
    }
    // Associate the receiver and the type
    addListener(receiver, type) {
        if (this.receivers.has(type)) {
            this.receivers.get(type).push(receiver);
        }
        else {
            this.receivers.add(type, [receiver]);
        }
    }
    update(deltaT) {
        while (this.q.hasItems()) {
            // Retrieve each event
            let event = this.q.dequeue();
            // If a receiver has this event type, send it the event
            if (this.receivers.has(event.type)) {
                for (let receiver of this.receivers.get(event.type)) {
                    receiver.receive(event);
                }
            }
            // If a receiver is subscribed to all events, send it the event
            if (this.receivers.has(GameEventType_1.GameEventType.ALL)) {
                for (let receiver of this.receivers.get(GameEventType_1.GameEventType.ALL)) {
                    receiver.receive(event);
                }
            }
        }
    }
}
exports.default = EventQueue;
EventQueue.instance = null;
},{"../DataTypes/Map":98,"../DataTypes/Queue":102,"./GameEventType":117}],116:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Map_1 = require("../DataTypes/Map");
/**
 * A representation of an in-game event that is passed through the @reference[EventQueue]
 */
class GameEvent {
    /**
     * Creates a new GameEvent.
     * This is handled implicitly through the @reference[Emitter] class
     * @param type The type of the GameEvent
     * @param data The data contained by the GameEvent
     */
    constructor(type, data = null) {
        // Parse the game event data
        if (data === null) {
            this.data = new Map_1.default();
        }
        else if (!(data instanceof Map_1.default)) {
            // data is a raw object, unpack
            this.data = new Map_1.default();
            for (let key in data) {
                this.data.add(key, data[key]);
            }
        }
        else {
            this.data = data;
        }
        this.type = type;
        this.time = Date.now();
    }
    /**
     * Checks the type of the GameEvent
     * @param type The type to check
     * @returns True if the GameEvent is the specified type, false otherwise.
     */
    isType(type) {
        return this.type === type;
    }
    /**
     * Returns this GameEvent as a string
     * @returns The string representation of the GameEvent
     */
    toString() {
        return this.type + ": @" + this.time;
    }
}
exports.default = GameEvent;
},{"../DataTypes/Map":98}],117:[function(require,module,exports){
"use strict";
// @ignorePage
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEventType = void 0;
var GameEventType;
(function (GameEventType) {
    /**
     * Mouse Down event. Has data: {position: Vec2 - Mouse Position}
     */
    GameEventType["MOUSE_DOWN"] = "mouse_down";
    /**
     * Mouse Up event. Has data: {position: Vec2 - Mouse Position}
     */
    GameEventType["MOUSE_UP"] = "mouse_up";
    /**
     * Mouse Move event. Has data: {position: Vec2 - Mouse Position}
     */
    GameEventType["MOUSE_MOVE"] = "mouse_move";
    /**
     * Key Down event. Has data: {key: string - The key that is down}
     */
    GameEventType["KEY_DOWN"] = "key_down";
    /**
     * Key Up event. Has data: {key: string - The key that is up}
     */
    GameEventType["KEY_UP"] = "key_up";
    /**
     * Canvas Blur event. Has data: {}
     */
    GameEventType["CANVAS_BLUR"] = "canvas_blur";
    /**
     * Mouse wheel up event. Has data: {}
     */
    GameEventType["WHEEL_UP"] = "wheel_up";
    /**
     * Mouse wheel down event. Has data: {}
     */
    GameEventType["WHEEL_DOWN"] = "wheel_down";
    /**
     * Start Recording event. Has data: {}
     */
    GameEventType["START_RECORDING"] = "start_recording";
    /**
     * Stop Recording event. Has data: {}
     */
    GameEventType["STOP_RECORDING"] = "stop_recording";
    /**
     * Play Recording event. Has data: {}
     */
    GameEventType["PLAY_RECORDING"] = "play_recording";
    /**
     * Play Sound event. Has data: {key: string, loop: boolean, holdReference: boolean }
     */
    GameEventType["PLAY_SOUND"] = "play_sound";
    /**
     * Play Sound event. Has data: {key: string}
     */
    GameEventType["STOP_SOUND"] = "stop_sound";
    /**
     * Play Sound event. Has data: {key: string, loop: boolean, holdReference: boolean, channel: AudioChannelType }
     */
    GameEventType["PLAY_SFX"] = "play_sfx";
    /**
     * Play Sound event. Has data: {key: string, loop: boolean, holdReference: boolean }
     */
    GameEventType["PLAY_MUSIC"] = "play_music";
    /**
     * Mute audio channel event. Has data: {channel: AudioChannelType}
     */
    GameEventType["MUTE_CHANNEL"] = "mute_channel";
    /**
     * Unmute audio channel event. Has data: {channel: AudioChannelType}
     */
    GameEventType["UNMUTE_CHANNEL"] = "unmute_channel";
    /**
     * Encompasses all event types. Used for receivers only.
     */
    GameEventType["ALL"] = "all";
})(GameEventType = exports.GameEventType || (exports.GameEventType = {}));
},{}],118:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Queue_1 = require("../DataTypes/Queue");
const EventQueue_1 = require("./EventQueue");
/**
 * Receives subscribed events from the EventQueue.
 */
class Receiver {
    /** Creates a new Receiver */
    constructor() {
        this.MAX_SIZE = 100;
        this.q = new Queue_1.default(this.MAX_SIZE);
    }
    destroy() {
        EventQueue_1.default.getInstance().unsubscribe(this);
    }
    /**
     * Adds these types of events to this receiver's queue every update.
     * @param eventTypes The types of events this receiver will be subscribed to
     */
    subscribe(eventTypes) {
        EventQueue_1.default.getInstance().subscribe(this, eventTypes);
        this.q.clear();
    }
    /**
     * Adds an event to the queue of this reciever. This is used by the @reference[EventQueue] to distribute events
     * @param event The event to receive
     */
    receive(event) {
        try {
            this.q.enqueue(event);
        }
        catch (e) {
            console.warn("Receiver overflow for event " + event.toString());
            throw e;
        }
    }
    /**
     * Retrieves the next event from the receiver's queue
     * @returns The next GameEvent
     */
    getNextEvent() {
        return this.q.dequeue();
    }
    /**
     * Looks at the next event in the receiver's queue, but doesn't remove it from the queue
     * @returns The next GameEvent
     */
    peekNextEvent() {
        return this.q.peekNext();
    }
    /**
     * Returns true if the receiver has any events in its queue
     * @returns True if the receiver has another event, false otherwise
     */
    hasNextEvent() {
        return this.q.hasItems();
    }
    /**
     * Ignore all events this frame
     */
    ignoreEvents() {
        this.q.clear();
    }
}
exports.default = Receiver;
},{"../DataTypes/Queue":102,"./EventQueue":115}],119:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Receiver_1 = require("../Events/Receiver");
const Map_1 = require("../DataTypes/Map");
const Vec2_1 = require("../DataTypes/Vec2");
const EventQueue_1 = require("../Events/EventQueue");
const GameEventType_1 = require("../Events/GameEventType");
/**
 * Receives input events from the @reference[EventQueue] and allows for easy access of information about input by other systems
 */
class Input {
    /**
     * Initializes the Input object
     * @param viewport A reference to the viewport of the game
     */
    static initialize(viewport, keyMap) {
        Input.viewport = viewport;
        Input.mousePressed = false;
        Input.mouseJustPressed = false;
        Input.receiver = new Receiver_1.default();
        Input.keyJustPressed = new Map_1.default();
        Input.keyPressed = new Map_1.default();
        Input.mousePosition = new Vec2_1.default(0, 0);
        Input.mousePressPosition = new Vec2_1.default(0, 0);
        Input.scrollDirection = 0;
        Input.justScrolled = false;
        Input.keysDisabled = false;
        Input.mouseDisabled = false;
        // Initialize the keymap
        Input.keyMap = new Map_1.default();
        // Add all keys to the keymap
        for (let entry in keyMap) {
            let name = keyMap[entry].name;
            let keys = keyMap[entry].keys;
            Input.keyMap.add(name, keys);
        }
        Input.eventQueue = EventQueue_1.default.getInstance();
        // Subscribe to all input events
        Input.eventQueue.subscribe(Input.receiver, [GameEventType_1.GameEventType.MOUSE_DOWN, GameEventType_1.GameEventType.MOUSE_UP, GameEventType_1.GameEventType.MOUSE_MOVE,
            GameEventType_1.GameEventType.KEY_DOWN, GameEventType_1.GameEventType.KEY_UP, GameEventType_1.GameEventType.CANVAS_BLUR, GameEventType_1.GameEventType.WHEEL_UP, GameEventType_1.GameEventType.WHEEL_DOWN]);
    }
    static update(deltaT) {
        // Reset the justPressed values to false
        Input.mouseJustPressed = false;
        Input.keyJustPressed.forEach((key) => Input.keyJustPressed.set(key, false));
        Input.justScrolled = false;
        Input.scrollDirection = 0;
        while (Input.receiver.hasNextEvent()) {
            let event = Input.receiver.getNextEvent();
            // Handle each event type
            if (event.type === GameEventType_1.GameEventType.MOUSE_DOWN) {
                Input.mouseJustPressed = true;
                Input.mousePressed = true;
                Input.mousePressPosition = event.data.get("position");
            }
            if (event.type === GameEventType_1.GameEventType.MOUSE_UP) {
                Input.mousePressed = false;
            }
            if (event.type === GameEventType_1.GameEventType.MOUSE_MOVE) {
                Input.mousePosition = event.data.get("position");
            }
            if (event.type === GameEventType_1.GameEventType.KEY_DOWN) {
                let key = event.data.get("key");
                // Handle space bar
                if (key === " ") {
                    key = "space";
                }
                if (!Input.keyPressed.get(key)) {
                    Input.keyJustPressed.set(key, true);
                    Input.keyPressed.set(key, true);
                }
            }
            if (event.type === GameEventType_1.GameEventType.KEY_UP) {
                let key = event.data.get("key");
                // Handle space bar
                if (key === " ") {
                    key = "space";
                }
                Input.keyPressed.set(key, false);
            }
            if (event.type === GameEventType_1.GameEventType.CANVAS_BLUR) {
                Input.clearKeyPresses();
            }
            if (event.type === GameEventType_1.GameEventType.WHEEL_UP) {
                Input.scrollDirection = -1;
                Input.justScrolled = true;
            }
            else if (event.type === GameEventType_1.GameEventType.WHEEL_DOWN) {
                Input.scrollDirection = 1;
                Input.justScrolled = true;
            }
        }
    }
    static clearKeyPresses() {
        Input.keyJustPressed.forEach((key) => Input.keyJustPressed.set(key, false));
        Input.keyPressed.forEach((key) => Input.keyPressed.set(key, false));
    }
    /**
     * Returns whether or not a key was newly pressed Input frame.
     * If the key is still pressed from last frame and wasn't re-pressed, Input will return false.
     * @param key The key
     * @returns True if the key was just pressed, false otherwise
     */
    static isKeyJustPressed(key) {
        if (Input.keysDisabled)
            return false;
        if (Input.keyJustPressed.has(key)) {
            return Input.keyJustPressed.get(key);
        }
        else {
            return false;
        }
    }
    /**
     * Returns an array of all of the keys that are newly pressed Input frame.
     * If a key is still pressed from last frame and wasn't re-pressed, it will not be in Input list.
     * @returns An array of all of the newly pressed keys.
     */
    static getKeysJustPressed() {
        if (Input.keysDisabled)
            return [];
        let keys = Array();
        Input.keyJustPressed.forEach(key => {
            if (Input.keyJustPressed.get(key)) {
                keys.push(key);
            }
        });
        return keys;
    }
    /**
     * Returns whether or not a key is being pressed.
     * @param key The key
     * @returns True if the key is currently pressed, false otherwise
     */
    static isKeyPressed(key) {
        if (Input.keysDisabled)
            return false;
        if (Input.keyPressed.has(key)) {
            return Input.keyPressed.get(key);
        }
        else {
            return false;
        }
    }
    /**
     * Changes the binding of an input name to keys
     * @param inputName The name of the input
     * @param keys The corresponding keys
     */
    static changeKeyBinding(inputName, keys) {
        Input.keyMap.set(inputName, keys);
    }
    /**
     * Clears all key bindings
     */
    static clearAllKeyBindings() {
        Input.keyMap.clear();
    }
    /**
     * Returns whether or not an input was just pressed this frame
     * @param inputName The name of the input
     * @returns True if the input was just pressed, false otherwise
     */
    static isJustPressed(inputName) {
        if (Input.keysDisabled)
            return false;
        if (Input.keyMap.has(inputName)) {
            const keys = Input.keyMap.get(inputName);
            let justPressed = false;
            for (let key of keys) {
                justPressed = justPressed || Input.isKeyJustPressed(key);
            }
            return justPressed;
        }
        else {
            return false;
        }
    }
    /**
     * Returns whether or not an input is currently pressed
     * @param inputName The name of the input
     * @returns True if the input is pressed, false otherwise
     */
    static isPressed(inputName) {
        if (Input.keysDisabled)
            return false;
        if (Input.keyMap.has(inputName)) {
            const keys = Input.keyMap.get(inputName);
            let pressed = false;
            for (let key of keys) {
                pressed = pressed || Input.isKeyPressed(key);
            }
            return pressed;
        }
        else {
            return false;
        }
    }
    /**
     * Returns whether or not the mouse was newly pressed Input frame
     * @returns True if the mouse was just pressed, false otherwise
     */
    static isMouseJustPressed() {
        return Input.mouseJustPressed && !Input.mouseDisabled;
    }
    /**
     * Returns whether or not the mouse is currently pressed
     * @returns True if the mouse is currently pressed, false otherwise
     */
    static isMousePressed() {
        return Input.mousePressed && !Input.mouseDisabled;
    }
    /**
     * Returns whether the user scrolled or not
     * @returns True if the user just scrolled Input frame, false otherwise
     */
    static didJustScroll() {
        return Input.justScrolled && !Input.mouseDisabled;
    }
    /**
     * Gets the direction of the scroll
     * @returns -1 if the user scrolled up, 1 if they scrolled down
     */
    static getScrollDirection() {
        return Input.scrollDirection;
    }
    /**
     * Gets the position of the player's mouse
     * @returns The mouse position stored as a Vec2
     */
    static getMousePosition() {
        return Input.mousePosition.scaled(1 / this.viewport.getZoomLevel());
    }
    /**
     * Gets the position of the player's mouse in the game world,
     * taking into consideration the scrolling of the viewport
     * @returns The mouse position stored as a Vec2
     */
    static getGlobalMousePosition() {
        return Input.mousePosition.clone().scale(1 / this.viewport.getZoomLevel()).add(Input.viewport.getOrigin());
    }
    /**
     * Gets the position of the last mouse press
     * @returns The mouse position stored as a Vec2
     */
    static getMousePressPosition() {
        return Input.mousePressPosition;
    }
    /**
     * Gets the position of the last mouse press in the game world,
     * taking into consideration the scrolling of the viewport
     * @returns The mouse position stored as a Vec2
     */
    static getGlobalMousePressPosition() {
        return Input.mousePressPosition.clone().add(Input.viewport.getOrigin());
    }
    /**
     * Disables all keypress and mouse click inputs
     */
    static disableInput() {
        Input.keysDisabled = true;
        Input.mouseDisabled = true;
    }
    /**
     * Enables all keypress and mouse click inputs
     */
    static enableInput() {
        Input.keysDisabled = false;
        Input.mouseDisabled = false;
    }
}
exports.default = Input;
},{"../DataTypes/Map":98,"../DataTypes/Vec2":111,"../Events/EventQueue":115,"../Events/GameEventType":117,"../Events/Receiver":118}],120:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventQueue_1 = require("../Events/EventQueue");
const Vec2_1 = require("../DataTypes/Vec2");
const GameEvent_1 = require("../Events/GameEvent");
const GameEventType_1 = require("../Events/GameEventType");
/**
 * Handles communication with the web browser to receive asynchronous events and send them to the @reference[EventQueue]
 */
class InputHandler {
    /**
     * Creates a new InputHandler
     * @param canvas The game canvas
     */
    constructor(canvas) {
        this.handleMouseDown = (event, canvas) => {
            let pos = this.getMousePosition(event, canvas);
            let gameEvent = new GameEvent_1.default(GameEventType_1.GameEventType.MOUSE_DOWN, { position: pos });
            this.eventQueue.addEvent(gameEvent);
        };
        this.handleMouseUp = (event, canvas) => {
            let pos = this.getMousePosition(event, canvas);
            let gameEvent = new GameEvent_1.default(GameEventType_1.GameEventType.MOUSE_UP, { position: pos });
            this.eventQueue.addEvent(gameEvent);
        };
        this.handleMouseMove = (event, canvas) => {
            let pos = this.getMousePosition(event, canvas);
            let gameEvent = new GameEvent_1.default(GameEventType_1.GameEventType.MOUSE_MOVE, { position: pos });
            this.eventQueue.addEvent(gameEvent);
        };
        this.handleKeyDown = (event) => {
            let key = this.getKey(event);
            let gameEvent = new GameEvent_1.default(GameEventType_1.GameEventType.KEY_DOWN, { key: key });
            this.eventQueue.addEvent(gameEvent);
        };
        this.handleKeyUp = (event) => {
            let key = this.getKey(event);
            let gameEvent = new GameEvent_1.default(GameEventType_1.GameEventType.KEY_UP, { key: key });
            this.eventQueue.addEvent(gameEvent);
        };
        this.handleBlur = (event) => {
            let gameEvent = new GameEvent_1.default(GameEventType_1.GameEventType.CANVAS_BLUR, {});
            this.eventQueue.addEvent(gameEvent);
        };
        this.handleContextMenu = (event) => {
            event.preventDefault();
            event.stopPropagation();
        };
        this.handleWheel = (event) => {
            event.preventDefault();
            event.stopPropagation();
            let gameEvent;
            if (event.deltaY < 0) {
                gameEvent = new GameEvent_1.default(GameEventType_1.GameEventType.WHEEL_UP, {});
            }
            else {
                gameEvent = new GameEvent_1.default(GameEventType_1.GameEventType.WHEEL_DOWN, {});
            }
            this.eventQueue.addEvent(gameEvent);
        };
        this.eventQueue = EventQueue_1.default.getInstance();
        canvas.onmousedown = (event) => this.handleMouseDown(event, canvas);
        canvas.onmouseup = (event) => this.handleMouseUp(event, canvas);
        canvas.oncontextmenu = this.handleContextMenu;
        canvas.onmousemove = (event) => this.handleMouseMove(event, canvas);
        document.onkeydown = this.handleKeyDown;
        document.onkeyup = this.handleKeyUp;
        document.onblur = this.handleBlur;
        document.oncontextmenu = this.handleBlur;
        document.onwheel = this.handleWheel;
    }
    getKey(keyEvent) {
        return keyEvent.key.toLowerCase();
    }
    getMousePosition(mouseEvent, canvas) {
        let rect = canvas.getBoundingClientRect();
        let x = mouseEvent.clientX - rect.left;
        let y = mouseEvent.clientY - rect.top;
        return new Vec2_1.default(x, y);
    }
}
exports.default = InputHandler;
},{"../DataTypes/Vec2":111,"../Events/EventQueue":115,"../Events/GameEvent":116,"../Events/GameEventType":117}],121:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ignorePage
/**
 * Sets up the environment of the game engine
 */
class EnvironmentInitializer {
    static setup() {
        CanvasRenderingContext2D.prototype.roundedRect = function (x, y, w, h, r) {
            // Clamp the radius between 0 and the min of the width or height
            if (r < 0)
                r = 0;
            if (r > Math.min(w, h))
                r = Math.min(w, h);
            // Draw the rounded rect
            this.beginPath();
            // Top
            this.moveTo(x + r, y);
            this.lineTo(x + w - r, y);
            this.arcTo(x + w, y, x + w, y + r, r);
            // Right
            this.lineTo(x + w, y + h - r);
            this.arcTo(x + w, y + h, x + w - r, y + h, r);
            // Bottom
            this.lineTo(x + r, y + h);
            this.arcTo(x, y + h, x, y + h - r, r);
            // Left
            this.lineTo(x, y + r);
            this.arcTo(x, y, x + r, y, r);
            this.closePath();
        };
        CanvasRenderingContext2D.prototype.strokeRoundedRect = function (x, y, w, h, r) {
            this.roundedRect(x, y, w, h, r);
            this.stroke();
        };
        CanvasRenderingContext2D.prototype.fillRoundedRect = function (x, y, w, h, r) {
            this.roundedRect(x, y, w, h, r);
            this.fill();
        };
    }
}
exports.default = EnvironmentInitializer;
},{}],122:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameLoop_1 = require("./GameLoop");
const Debug_1 = require("../Debug/Debug");
const Stats_1 = require("../Debug/Stats");
/**
 * A game loop with a fixed update time and a variable render time.
 * Every frame, the game updates until all time since the last frame has been processed.
 * If too much time has passed, such as if the last update was too slow,
 * or if the browser was put into the background, the loop will panic and discard time.
 * A render happens at the end of every frame. This happens as fast as possible unless specified.
 * A loop of this type allows for deterministic behavior - No matter what the frame rate is, the update should behave the same,
 * as it is occuring in a fixed interval.
 */
class FixedUpdateGameLoop extends GameLoop_1.default {
    constructor() {
        super();
        /**
         * The main loop of the game. Updates until the current time is reached. Renders once
         * @param timestamp The current time in ms
         */
        this.doFrame = (timestamp) => {
            // If a pause was executed, stop doing the loop.
            if (this.paused) {
                return;
            }
            // Request animation frame to prepare for another update or render
            window.requestAnimationFrame((t) => this.doFrame(t));
            // If we are trying to render too soon, do nothing.
            if (timestamp < this.lastFrameTime + this.minFrameDelay) {
                return;
            }
            // A frame is actually happening
            this.startFrame(timestamp);
            // Update while there is still time to make up. If we do too many update steps, panic and exit the loop.
            this.numUpdateSteps = 0;
            let panic = false;
            while (this.frameDelta >= this.updateTimestep) {
                // Do an update
                this._doUpdate(this.updateTimestep / 1000);
                // Remove the update step time from the time we have to process
                this.frameDelta -= this.updateTimestep;
                // Increment steps and check if we've done too many
                this.numUpdateSteps++;
                if (this.numUpdateSteps > 100) {
                    panic = true;
                    break;
                }
            }
            // Updates are done, render
            this._doRender();
            // Wrap up the frame
            this.finishFrame(panic);
        };
        this.maxUpdateFPS = 60;
        this.updateTimestep = Math.floor(1000 / this.maxUpdateFPS);
        this.frameDelta = 0;
        this.lastFrameTime = 0;
        this.minFrameDelay = 0;
        this.frame = 0;
        this.fps = this.maxUpdateFPS; // Initialize the fps to the max allowed fps
        this.fpsUpdateInterval = 1000;
        this.lastFpsUpdate = 0;
        this.framesSinceLastFpsUpdate = 0;
        this.started = false;
        this.paused = false;
        this.running = false;
        this.numUpdateSteps = 0;
    }
    getFPS() {
        return 0;
    }
    /**
     * Updates the frame count and sum of time for the framerate of the game
     * @param timestep The current time in ms
     */
    updateFPS(timestamp) {
        this.fps = 0.9 * this.framesSinceLastFpsUpdate * 1000 / (timestamp - this.lastFpsUpdate) + (1 - 0.9) * this.fps;
        this.lastFpsUpdate = timestamp;
        this.framesSinceLastFpsUpdate = 0;
        Debug_1.default.log("fps", "FPS: " + this.fps.toFixed(1));
        Stats_1.default.updateFPS(this.fps);
    }
    /**
 * Changes the maximum allowed physics framerate of the game
 * @param initMax The max framerate
 */
    setMaxUpdateFPS(initMax) {
        this.maxUpdateFPS = initMax;
        this.updateTimestep = Math.floor(1000 / this.maxUpdateFPS);
    }
    /**
     * Sets the maximum rendering framerate
     * @param maxFPS The max framerate
     */
    setMaxFPS(maxFPS) {
        this.minFrameDelay = 1000 / maxFPS;
    }
    /**
     * This function is called when the game loop panics, i.e. it tries to process too much time in an entire frame.
     * This will reset the amount of time back to zero.
     * @returns The amount of time we are discarding from processing.
     */
    resetFrameDelta() {
        let oldFrameDelta = this.frameDelta;
        this.frameDelta = 0;
        return oldFrameDelta;
    }
    /**
     * Starts up the game loop and calls the first requestAnimationFrame
     */
    start() {
        if (!this.started) {
            this.started = true;
            window.requestAnimationFrame((timestamp) => this.doFirstFrame(timestamp));
        }
    }
    pause() {
        this.paused = true;
    }
    resume() {
        this.paused = false;
    }
    /**
     * The first game frame - initializes the first frame time and begins the render
     * @param timestamp The current time in ms
     */
    doFirstFrame(timestamp) {
        this.running = true;
        this._doRender();
        this.lastFrameTime = timestamp;
        this.lastFpsUpdate = timestamp;
        this.framesSinceLastFpsUpdate = 0;
        window.requestAnimationFrame((t) => this.doFrame(t));
    }
    /**
     * Handles any processing that needs to be done at the start of the frame
     * @param timestamp The time of the frame in ms
     */
    startFrame(timestamp) {
        // Update the amount of time we need our update to process
        this.frameDelta += timestamp - this.lastFrameTime;
        // Set the new time of the last frame
        this.lastFrameTime = timestamp;
        // Update the estimate of the framerate
        if (timestamp > this.lastFpsUpdate + this.fpsUpdateInterval) {
            this.updateFPS(timestamp);
        }
        // Increment the number of frames
        this.frame++;
        this.framesSinceLastFpsUpdate++;
    }
    /**
     * Wraps up the frame and handles the panic state if there is one
     * @param panic Whether or not the loop panicked
     */
    finishFrame(panic) {
        if (panic) {
            var discardedTime = Math.round(this.resetFrameDelta());
            console.warn('Main loop panicked, probably because the browser tab was put in the background. Discarding ' + discardedTime + 'ms');
        }
    }
}
exports.default = FixedUpdateGameLoop;
},{"../Debug/Debug":112,"../Debug/Stats":113,"./GameLoop":124}],123:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventQueue_1 = require("../Events/EventQueue");
const Input_1 = require("../Input/Input");
const InputHandler_1 = require("../Input/InputHandler");
const Recorder_1 = require("../Playback/Recorder");
const Debug_1 = require("../Debug/Debug");
const ResourceManager_1 = require("../ResourceManager/ResourceManager");
const Viewport_1 = require("../SceneGraph/Viewport");
const SceneManager_1 = require("../Scene/SceneManager");
const AudioManager_1 = require("../Sound/AudioManager");
const Stats_1 = require("../Debug/Stats");
const CanvasRenderer_1 = require("../Rendering/CanvasRenderer");
const Color_1 = require("../Utils/Color");
const GameOptions_1 = require("./GameOptions");
const FixedUpdateGameLoop_1 = require("./FixedUpdateGameLoop");
const EnvironmentInitializer_1 = require("./EnvironmentInitializer");
const Vec2_1 = require("../DataTypes/Vec2");
const RegistryManager_1 = require("../Registry/RegistryManager");
const WebGLRenderer_1 = require("../Rendering/WebGLRenderer");
/**
 * The main loop of the game engine.
 * Handles the update order, and initializes all subsystems.
 * The Game manages the update cycle, and requests animation frames to render to the browser.
 */
class Game {
    /**
     * Creates a new Game
     * @param options The options for Game initialization
     */
    constructor(options) {
        // Before anything else, build the environment
        EnvironmentInitializer_1.default.setup();
        // Typecast the config object to a GameConfig object
        this.gameOptions = GameOptions_1.default.parse(options);
        this.showDebug = this.gameOptions.showDebug;
        this.showStats = this.gameOptions.showStats;
        // Create an instance of a game loop
        this.loop = new FixedUpdateGameLoop_1.default();
        // Get the game canvas and give it a background color
        this.GAME_CANVAS = document.getElementById("game-canvas");
        this.DEBUG_CANVAS = document.getElementById("debug-canvas");
        // Give the canvas a size and get the rendering context
        this.WIDTH = this.gameOptions.canvasSize.x;
        this.HEIGHT = this.gameOptions.canvasSize.y;
        // This step MUST happen before the resource manager does anything
        if (this.gameOptions.useWebGL) {
            this.renderingManager = new WebGLRenderer_1.default();
        }
        else {
            this.renderingManager = new CanvasRenderer_1.default();
        }
        this.initializeGameWindow();
        this.ctx = this.renderingManager.initializeCanvas(this.GAME_CANVAS, this.WIDTH, this.HEIGHT);
        this.clearColor = new Color_1.default(this.gameOptions.clearColor.r, this.gameOptions.clearColor.g, this.gameOptions.clearColor.b);
        // Initialize debugging and stats
        Debug_1.default.initializeDebugCanvas(this.DEBUG_CANVAS, this.WIDTH, this.HEIGHT);
        Stats_1.default.initStats();
        if (this.gameOptions.showStats) {
            // Find the stats output and make it no longer hidden
            document.getElementById("stats").hidden = false;
        }
        // Size the viewport to the game canvas
        const canvasSize = new Vec2_1.default(this.WIDTH, this.HEIGHT);
        this.viewport = new Viewport_1.default(canvasSize, this.gameOptions.zoomLevel);
        // Initialize all necessary game subsystems
        this.eventQueue = EventQueue_1.default.getInstance();
        this.inputHandler = new InputHandler_1.default(this.GAME_CANVAS);
        Input_1.default.initialize(this.viewport, this.gameOptions.inputs);
        this.recorder = new Recorder_1.default();
        this.resourceManager = ResourceManager_1.default.getInstance();
        this.sceneManager = new SceneManager_1.default(this.viewport, this.renderingManager);
        this.audioManager = AudioManager_1.default.getInstance();
    }
    /**
     * Set up the game window that holds the canvases
     */
    initializeGameWindow() {
        const gameWindow = document.getElementById("game-window");
        // Set the height of the game window
        gameWindow.style.width = this.WIDTH + "px";
        gameWindow.style.height = this.HEIGHT + "px";
    }
    /**
     * Retreives the SceneManager from the Game
     * @returns The SceneManager
     */
    getSceneManager() {
        return this.sceneManager;
    }
    /**
     * Starts the game
     */
    start(InitialScene, options) {
        // Set the update function of the loop
        this.loop.doUpdate = (deltaT) => this.update(deltaT);
        // Set the render function of the loop
        this.loop.doRender = () => this.render();
        // Preload registry items
        RegistryManager_1.default.preload();
        // Load the items with the resource manager
        this.resourceManager.loadResourcesFromQueue(() => {
            // When we're done loading, start the loop
            console.log("Finished Preload - loading first scene");
            this.sceneManager.changeToScene(InitialScene, options);
            this.loop.start();
        });
    }
    /**
     * Updates all necessary subsystems of the game. Defers scene updates to the sceneManager
     * @param deltaT The time sine the last update
     */
    update(deltaT) {
        try {
            // Handle all events that happened since the start of the last loop
            this.eventQueue.update(deltaT);
            // Update the input data structures so game objects can see the input
            Input_1.default.update(deltaT);
            // Update the recording of the game
            this.recorder.update(deltaT);
            // Update all scenes
            this.sceneManager.update(deltaT);
            // Update all sounds
            this.audioManager.update(deltaT);
            // Load or unload any resources if needed
            this.resourceManager.update(deltaT);
        }
        catch (e) {
            this.loop.pause();
            console.warn("Uncaught Error in Update - Crashing gracefully");
            console.error(e);
        }
    }
    /**
     * Clears the canvas and defers scene rendering to the sceneManager. Renders the debug canvas
     */
    render() {
        try {
            // Clear the canvases
            Debug_1.default.clearCanvas();
            this.renderingManager.clear(this.clearColor);
            this.sceneManager.render();
            // Hacky debug mode
            if (Input_1.default.isKeyJustPressed("g")) {
                this.showDebug = !this.showDebug;
            }
            // Debug render
            if (this.showDebug) {
                Debug_1.default.render();
            }
            if (this.showStats) {
                Stats_1.default.render();
            }
        }
        catch (e) {
            this.loop.pause();
            console.warn("Uncaught Error in Render - Crashing gracefully");
            console.error(e);
        }
    }
    //Getter method for game loop added by le edward carey
    getGameLoop() {
        return this.loop;
    }
}
exports.default = Game;
},{"../DataTypes/Vec2":111,"../Debug/Debug":112,"../Debug/Stats":113,"../Events/EventQueue":115,"../Input/Input":119,"../Input/InputHandler":120,"../Playback/Recorder":148,"../Registry/RegistryManager":151,"../Rendering/CanvasRenderer":156,"../Rendering/WebGLRenderer":161,"../ResourceManager/ResourceManager":168,"../Scene/SceneManager":179,"../SceneGraph/Viewport":171,"../Sound/AudioManager":181,"../Utils/Color":184,"./EnvironmentInitializer":121,"./FixedUpdateGameLoop":122,"./GameOptions":125}],124:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NullFunc_1 = require("../DataTypes/Functions/NullFunc");
/**
 * The main game loop of the game. Keeps track of fps and handles scheduling of updates and rendering.
 * This class is left abstract, so that a subclass can handle exactly how the loop is scheduled.
 * For an example of different types of game loop scheduling, check out @link(Game Programming Patterns)(https://gameprogrammingpatterns.com/game-loop.html)
 */
class GameLoop {
    constructor() {
        /** The function to call when an update occurs */
        this._doUpdate = NullFunc_1.default;
        /** The function to call when a render occurs */
        this._doRender = NullFunc_1.default;
    }
    set doUpdate(update) {
        this._doUpdate = update;
    }
    set doRender(render) {
        this._doRender = render;
    }
}
exports.default = GameLoop;
},{"../DataTypes/Functions/NullFunc":93}],125:[function(require,module,exports){
"use strict";
// @ignorePage
Object.defineProperty(exports, "__esModule", { value: true });
/** The options for initializing the @reference[GameLoop] */
class GameOptions {
    /**
     * Parses the data in the raw options object
     * @param options The game options as a Record
     * @returns A version of the options converted to a GameOptions object
     */
    static parse(options) {
        let gOpt = new GameOptions();
        gOpt.canvasSize = options.canvasSize ? options.canvasSize : { x: 800, y: 600 };
        gOpt.zoomLevel = options.zoomLevel ? options.zoomLevel : 1;
        gOpt.clearColor = options.clearColor ? options.clearColor : { r: 255, g: 255, b: 255 };
        gOpt.inputs = options.inputs ? options.inputs : [];
        gOpt.showDebug = !!options.showDebug;
        gOpt.showStats = !!options.showStats;
        gOpt.useWebGL = !!options.useWebGL;
        return gOpt;
    }
}
exports.default = GameOptions;
},{}],126:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameNode_1 = require("./GameNode");
const Vec2_1 = require("../DataTypes/Vec2");
const AABB_1 = require("../DataTypes/Shapes/AABB");
const Debug_1 = require("../Debug/Debug");
const Color_1 = require("../Utils/Color");
/**
 * The representation of an object in the game world that can be drawn to the screen
 */
class CanvasNode extends GameNode_1.default {
    constructor() {
        super();
        /** A flag for whether or not the CanvasNode is visible */
        this.visible = true;
        this._size = new Vec2_1.default(0, 0);
        this._size.setOnChange(() => this.sizeChanged());
        this._scale = new Vec2_1.default(1, 1);
        this._scale.setOnChange(() => this.scaleChanged());
        this._boundary = new AABB_1.default();
        this.updateBoundary();
        this._hasCustomShader = false;
    }
    get alpha() {
        return this._alpha;
    }
    set alpha(a) {
        this._alpha = a;
    }
    get size() {
        return this._size;
    }
    set size(size) {
        this._size = size;
        // Enter as a lambda to bind "this"
        this._size.setOnChange(() => this.sizeChanged());
        this.sizeChanged();
    }
    get scale() {
        return this._scale;
    }
    set scale(scale) {
        this._scale = scale;
        // Enter as a lambda to bind "this"
        this._scale.setOnChange(() => this.scaleChanged());
        this.scaleChanged();
    }
    set scaleX(value) {
        this.scale.x = value;
    }
    set scaleY(value) {
        this.scale.y = value;
    }
    get hasCustomShader() {
        return this._hasCustomShader;
    }
    get customShaderKey() {
        return this._customShaderKey;
    }
    // @override
    positionChanged() {
        super.positionChanged();
        this.updateBoundary();
    }
    /** Called if the size vector is changed or replaced. */
    sizeChanged() {
        this.updateBoundary();
    }
    /** Called if the scale vector is changed or replaced */
    scaleChanged() {
        this.updateBoundary();
    }
    // @docIgnore
    /** Called if the position, size, or scale of the CanvasNode is changed. Updates the boundary. */
    updateBoundary() {
        this._boundary.center.set(this.position.x, this.position.y);
        this._boundary.halfSize.set(this.size.x * this.scale.x / 2, this.size.y * this.scale.y / 2);
    }
    get boundary() {
        return this._boundary;
    }
    get sizeWithZoom() {
        let zoom = this.scene.getViewScale();
        return this.boundary.halfSize.clone().scaled(zoom, zoom);
    }
    /**
     * Adds a custom shader to this CanvasNode
     * @param key The registry key of the ShaderType
     */
    useCustomShader(key) {
        this._hasCustomShader = true;
        this._customShaderKey = key;
    }
    /**
     * Returns true if the point (x, y) is inside of this canvas object
     * @param x The x position of the point
     * @param y The y position of the point
     * @returns A flag representing whether or not this node contains the point.
     */
    contains(x, y) {
        return this._boundary.containsPoint(new Vec2_1.default(x, y));
    }
    // @implemented
    debugRender() {
        Debug_1.default.drawBox(this.relativePosition, this.sizeWithZoom, false, Color_1.default.BLUE);
        super.debugRender();
    }
}
exports.default = CanvasNode;
},{"../DataTypes/Shapes/AABB":104,"../DataTypes/Vec2":111,"../Debug/Debug":112,"../Utils/Color":184,"./GameNode":127}],127:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TweenableProperties = void 0;
const Vec2_1 = require("../DataTypes/Vec2");
const Receiver_1 = require("../Events/Receiver");
const Emitter_1 = require("../Events/Emitter");
const Region_1 = require("../DataTypes/Interfaces/Region");
const AABB_1 = require("../DataTypes/Shapes/AABB");
const TweenController_1 = require("../Rendering/Animations/TweenController");
const Debug_1 = require("../Debug/Debug");
const Color_1 = require("../Utils/Color");
const Circle_1 = require("../DataTypes/Shapes/Circle");
/**
 * The representation of an object in the game world.
 * To construct GameNodes, see the @reference[Scene] documentation.
 */
class GameNode {
    // Constructor docs are ignored, as the user should NOT create new GameNodes with a raw constructor
    constructor() {
        /*---------- PHYSICAL ----------*/
        this.hasPhysics = false;
        this.moving = false;
        this.frozen = false;
        this.onGround = false;
        this.onWall = false;
        this.onCeiling = false;
        this.active = false;
        this.isColliding = false;
        this.pathfinding = false;
        this._position = new Vec2_1.default(0, 0);
        this._position.setOnChange(() => this.positionChanged());
        this.receiver = new Receiver_1.default();
        this.emitter = new Emitter_1.default();
        this.tweens = new TweenController_1.default(this);
        this.rotation = 0;
    }
    destroy() {
        this.tweens.destroy();
        this.receiver.destroy();
        if (this.hasPhysics) {
            this.removePhysics();
        }
        if (this._ai) {
            this._ai.destroy();
            delete this._ai;
            this.scene.getAIManager().removeActor(this);
        }
        this.scene.remove(this);
        this.layer.removeNode(this);
    }
    /*---------- POSITIONED ----------*/
    get position() {
        return this._position;
    }
    set position(pos) {
        this._position = pos;
        this._position.setOnChange(() => this.positionChanged());
        this.positionChanged();
    }
    get relativePosition() {
        return this.inRelativeCoordinates(this.position);
    }
    /**
     * Converts a point to coordinates relative to the zoom and origin of this node
     * @param point The point to conver
     * @returns A new Vec2 representing the point in relative coordinates
     */
    inRelativeCoordinates(point) {
        let origin = this.scene.getViewTranslation(this);
        let zoom = this.scene.getViewScale();
        return point.clone().sub(origin).scale(zoom);
    }
    /*---------- UNIQUE ----------*/
    get id() {
        return this._id;
    }
    set id(id) {
        // id can only be set once
        if (this._id === undefined) {
            this._id = id;
        }
        else {
            throw "Attempted to assign id to object that already has id.";
        }
    }
    /*---------- PHYSICAL ----------*/
    // @implemented
    /**
     * @param velocity The velocity with which to move the object.
     */
    move(velocity) {
        if (this.frozen)
            return;
        this.moving = true;
        this._velocity = velocity;
    }
    ;
    moveOnPath(speed, path) {
        if (this.frozen)
            return;
        this.path = path;
        let dir = path.getMoveDirection(this);
        this.moving = true;
        this.pathfinding = true;
        this._velocity = dir.scale(speed);
    }
    // @implemented
    /**
     * @param velocity The velocity with which the object will move.
     */
    finishMove() {
        this.moving = false;
        this.position.add(this._velocity);
        if (this.pathfinding) {
            this.path.handlePathProgress(this);
            this.path = null;
            this.pathfinding = false;
        }
    }
    // @implemented
    /**
     * @param collisionShape The collider for this object. If this has a region (implements Region),
     * it will be used when no collision shape is specified (or if collision shape is null).
     * @param isCollidable Whether this is collidable or not. True by default.
     * @param isStatic Whether this is static or not. False by default
     */
    addPhysics(collisionShape, colliderOffset, isCollidable = true, isStatic = false) {
        // Initialize the physics variables
        this.hasPhysics = true;
        this.moving = false;
        this.onGround = false;
        this.onWall = false;
        this.onCeiling = false;
        this.active = true;
        this.isCollidable = isCollidable;
        this.isStatic = isStatic;
        this.isTrigger = false;
        this.triggerMask = 0;
        this.triggerEnters = new Array(32);
        this.triggerExits = new Array(32);
        this._velocity = Vec2_1.default.ZERO;
        this.sweptRect = new AABB_1.default();
        this.collidedWithTilemap = false;
        this.group = -1; // The default group, collides with everything
        // Set the collision shape if provided, or simply use the the region if there is one.
        if (collisionShape) {
            this.collisionShape = collisionShape;
            this.collisionShape.center = this.position;
        }
        else if (Region_1.isRegion(this)) {
            // If the gamenode has a region and no other is specified, use that
            this.collisionShape = this.boundary.clone();
        }
        else {
            throw "No collision shape specified for physics object.";
        }
        // If we were provided with a collider offset, set it. Otherwise there is no offset, so use the zero vector
        if (colliderOffset) {
            this.colliderOffset = colliderOffset;
        }
        else {
            this.colliderOffset = Vec2_1.default.ZERO;
        }
        // Initialize the swept rect
        this.sweptRect = this.collisionShape.getBoundingRect();
        // Register the object with physics
        this.scene.getPhysicsManager().registerObject(this);
    }
    /** Removes this object from the physics system */
    removePhysics() {
        // Remove this from the physics manager
        this.scene.getPhysicsManager().deregisterObject(this);
        // Nullify all physics fields
        this.hasPhysics = false;
        this.moving = false;
        this.onGround = false;
        this.onWall = false;
        this.onCeiling = false;
        this.active = false;
        this.isCollidable = false;
        this.isStatic = false;
        this.isTrigger = false;
        this.triggerMask = 0;
        this.triggerEnters = null;
        this.triggerExits = null;
        this._velocity = Vec2_1.default.ZERO;
        this.sweptRect = null;
        this.collidedWithTilemap = false;
        this.group = -1;
        this.collisionShape = null;
        this.colliderOffset = Vec2_1.default.ZERO;
        this.sweptRect = null;
    }
    /** Disables physics movement for this node */
    freeze() {
        this.frozen = true;
    }
    /** Reenables physics movement for this node */
    unfreeze() {
        this.frozen = false;
    }
    /** Prevents this object from participating in all collisions and triggers. It can still move. */
    disablePhysics() {
        this.active = false;
    }
    /** Enables this object to participate in collisions and triggers. This is only necessary if disablePhysics was called */
    enablePhysics() {
        this.active = true;
    }
    /**
     * Sets the collider for this GameNode
     * @param collider The new collider to use
     */
    setCollisionShape(collider) {
        this.collisionShape = collider;
        this.collisionShape.center.copy(this.position);
    }
    // @implemented
    /**
     * Sets this object to be a trigger for a specific group
     * @param group The name of the group that activates the trigger
     * @param onEnter The name of the event to send when this trigger is activated
     * @param onExit The name of the event to send when this trigger stops being activated
     */
    setTrigger(group, onEnter, onExit) {
        // Make this object a trigger
        this.isTrigger = true;
        // Get the number of the physics layer
        let layerNumber = this.scene.getPhysicsManager().getGroupNumber(group);
        if (layerNumber === 0) {
            console.warn(`Trigger for GameNode ${this.id} not set - group "${group}" was not recognized by the physics manager.`);
            return;
        }
        // Add this to the trigger mask
        this.triggerMask |= layerNumber;
        // Layer numbers are bits, so get which bit it is
        let index = Math.log2(layerNumber);
        // Set the event names
        this.triggerEnters[index] = onEnter;
        this.triggerExits[index] = onExit;
    }
    ;
    // @implemented
    /**
     * @param group The physics group this node should belong to
     */
    setGroup(group) {
        this.scene.getPhysicsManager().setGroup(this, group);
    }
    // @implemened
    getLastVelocity() {
        return this._velocity;
    }
    /*---------- ACTOR ----------*/
    get ai() {
        return this._ai;
    }
    set ai(ai) {
        if (!this._ai) {
            // If we haven't been previously had an ai, register us with the ai manager
            this.scene.getAIManager().registerActor(this);
        }
        this._ai = ai;
        this.aiActive = true;
    }
    // @implemented
    addAI(ai, options) {
        if (!this._ai) {
            this.scene.getAIManager().registerActor(this);
        }
        if (typeof ai === "string") {
            this._ai = this.scene.getAIManager().generateAI(ai);
        }
        else {
            this._ai = new ai();
        }
        this._ai.initializeAI(this, options);
        this.aiActive = true;
    }
    // @implemented
    setAIActive(active, options) {
        this.aiActive = active;
        if (this.aiActive) {
            this.ai.activate(options);
        }
    }
    /*---------- TWEENABLE PROPERTIES ----------*/
    set positionX(value) {
        this.position.x = value;
    }
    set positionY(value) {
        this.position.y = value;
    }
    /*---------- GAME NODE ----------*/
    /**
     * Sets the scene for this object.
     * @param scene The scene this object belongs to.
     */
    setScene(scene) {
        this.scene = scene;
    }
    /**
     * Gets the scene this object is in.
     * @returns The scene this object belongs to
    */
    getScene() {
        return this.scene;
    }
    /**
     * Sets the layer of this object.
     * @param layer The layer this object will be on.
     */
    setLayer(layer) {
        this.layer = layer;
    }
    /**
     * Returns the layer this object is on.
     * @returns This layer this object is on.
    */
    getLayer() {
        return this.layer;
    }
    /** Called if the position vector is modified or replaced */
    positionChanged() {
        if (this.collisionShape) {
            if (this.colliderOffset) {
                this.collisionShape.center = this.position.clone().add(this.colliderOffset);
            }
            else {
                this.collisionShape.center = this.position.clone();
            }
        }
    }
    ;
    /**
     * Updates this GameNode
     * @param deltaT The timestep of the update.
     */
    update(deltaT) {
        // Defer event handling to AI.
        while (this.receiver.hasNextEvent()) {
            this._ai.handleEvent(this.receiver.getNextEvent());
        }
    }
    // @implemented
    debugRender() {
        // Draw the position of this GameNode
        Debug_1.default.drawPoint(this.relativePosition, Color_1.default.BLUE);
        // If velocity is not zero, draw a vector for it
        if (this._velocity && !this._velocity.isZero()) {
            Debug_1.default.drawRay(this.relativePosition, this._velocity.clone().scaleTo(20).add(this.relativePosition), Color_1.default.BLUE);
        }
        // If this has a collider, draw it
        if (this.collisionShape) {
            let color = this.isColliding ? Color_1.default.RED : Color_1.default.GREEN;
            if (this.isTrigger) {
                color = Color_1.default.MAGENTA;
            }
            color.a = 0.2;
            if (this.collisionShape instanceof AABB_1.default) {
                Debug_1.default.drawBox(this.inRelativeCoordinates(this.collisionShape.center), this.collisionShape.halfSize.scaled(this.scene.getViewScale()), true, color);
            }
            else if (this.collisionShape instanceof Circle_1.default) {
                Debug_1.default.drawCircle(this.inRelativeCoordinates(this.collisionShape.center), this.collisionShape.hw * this.scene.getViewScale(), true, color);
            }
        }
    }
}
exports.default = GameNode;
var TweenableProperties;
(function (TweenableProperties) {
    TweenableProperties["posX"] = "positionX";
    TweenableProperties["posY"] = "positionY";
    TweenableProperties["scaleX"] = "scaleX";
    TweenableProperties["scaleY"] = "scaleY";
    TweenableProperties["rotation"] = "rotation";
    TweenableProperties["alpha"] = "alpha";
})(TweenableProperties = exports.TweenableProperties || (exports.TweenableProperties = {}));
},{"../DataTypes/Interfaces/Region":97,"../DataTypes/Shapes/AABB":104,"../DataTypes/Shapes/Circle":105,"../DataTypes/Vec2":111,"../Debug/Debug":112,"../Events/Emitter":114,"../Events/Receiver":118,"../Rendering/Animations/TweenController":154,"../Utils/Color":184}],128:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CanvasNode_1 = require("./CanvasNode");
const Color_1 = require("../Utils/Color");
/**
 * The representation of a game object that doesn't rely on any resources to render - it is drawn to the screen by the canvas
 */
class Graphic extends CanvasNode_1.default {
    constructor() {
        super();
        this.color = Color_1.default.RED;
    }
    get alpha() {
        return this.color.a;
    }
    set alpha(a) {
        this.color.a = a;
    }
    // @deprecated
    /**
     * Sets the color of the Graphic. DEPRECATED
     * @param color The new color of the Graphic.
     */
    setColor(color) {
        this.color = color;
    }
}
exports.default = Graphic;
},{"../Utils/Color":184,"./CanvasNode":126}],129:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphicType = void 0;
var GraphicType;
(function (GraphicType) {
    GraphicType["POINT"] = "POINT";
    GraphicType["RECT"] = "RECT";
    GraphicType["LINE"] = "LINE";
})(GraphicType = exports.GraphicType || (exports.GraphicType = {}));
},{}],130:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Graphic_1 = require("../Graphic");
class Line extends Graphic_1.default {
    constructor(start, end) {
        super();
        this.start = start;
        this.end = end;
        this.thickness = 2;
        // Does this really have a meaning for lines?
        this.size.set(5, 5);
    }
    set start(pos) {
        this.position = pos;
    }
    get start() {
        return this.position;
    }
    set end(pos) {
        this._end = pos;
    }
    get end() {
        return this._end;
    }
}
exports.default = Line;
},{"../Graphic":128}],131:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Graphic_1 = require("../Graphic");
/** A basic point to be drawn on the screen. */
class Point extends Graphic_1.default {
    constructor(position) {
        super();
        this.position = position;
        this.size.set(5, 5);
    }
}
exports.default = Point;
},{"../Graphic":128}],132:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Graphic_1 = require("../Graphic");
const Color_1 = require("../../Utils/Color");
/** A basic rectangle to be drawn on the screen. */
class Rect extends Graphic_1.default {
    constructor(position, size) {
        super();
        this.position = position;
        this.size = size;
        this.borderColor = Color_1.default.TRANSPARENT;
        this.borderWidth = 0;
    }
    /**
     * Sets the border color of this rectangle
     * @param color The border color
     */
    setBorderColor(color) {
        this.borderColor = color;
    }
    // @deprecated
    getBorderColor() {
        return this.borderColor;
    }
    /**
     * Sets the border width of this rectangle
     * @param width The width of the rectangle in pixels
     */
    setBorderWidth(width) {
        this.borderWidth = width;
    }
    getBorderWidth() {
        return this.borderWidth;
    }
}
exports.default = Rect;
},{"../../Utils/Color":184,"../Graphic":128}],133:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sprite_1 = require("./Sprite");
const AnimationManager_1 = require("../../Rendering/Animations/AnimationManager");
const Vec2_1 = require("../../DataTypes/Vec2");
/** An sprite with specified animation frames. */
class AnimatedSprite extends Sprite_1.default {
    constructor(spritesheet) {
        super(spritesheet.name);
        this.numCols = spritesheet.columns;
        this.numRows = spritesheet.rows;
        // Set the size of the sprite to the sprite size specified by the spritesheet
        this.size.set(spritesheet.spriteWidth, spritesheet.spriteHeight);
        this.animation = new AnimationManager_1.default(this);
        // Add the animations to the animated sprite
        for (let animation of spritesheet.animations) {
            this.animation.add(animation.name, animation);
        }
    }
    get cols() {
        return this.numCols;
    }
    get rows() {
        return this.numRows;
    }
    /**
     * Gets the image offset for the current index of animation
     * @param index The index we're at in the animation
     * @returns A Vec2 containing the image offset
     */
    getAnimationOffset(index) {
        return new Vec2_1.default((index % this.numCols) * this.size.x, Math.floor(index / this.numCols) * this.size.y);
    }
}
exports.default = AnimatedSprite;
},{"../../DataTypes/Vec2":111,"../../Rendering/Animations/AnimationManager":152,"./Sprite":134}],134:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CanvasNode_1 = require("../CanvasNode");
const ResourceManager_1 = require("../../ResourceManager/ResourceManager");
const Vec2_1 = require("../../DataTypes/Vec2");
/**
 * The representation of a sprite - an in-game image
 */
class Sprite extends CanvasNode_1.default {
    constructor(imageId) {
        super();
        this.imageId = imageId;
        let image = ResourceManager_1.default.getInstance().getImage(this.imageId);
        this.size = new Vec2_1.default(image.width, image.height);
        this.imageOffset = Vec2_1.default.ZERO;
        this.invertX = false;
        this.invertY = false;
    }
    /**
     * Sets the offset of the sprite from (0, 0) in the image's coordinates
     * @param offset The offset of the sprite from (0, 0) in image coordinates
     */
    setImageOffset(offset) {
        this.imageOffset = offset;
    }
}
exports.default = Sprite;
},{"../../DataTypes/Vec2":111,"../../ResourceManager/ResourceManager":168,"../CanvasNode":126}],135:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("../DataTypes/Vec2");
const CanvasNode_1 = require("./CanvasNode");
/**
 * The representation of a tilemap - this can consist of a combination of tilesets in one layer
 */
class Tilemap extends CanvasNode_1.default {
    // TODO: Make this no longer be specific to Tiled
    constructor(tilemapData, layer, tilesets, scale) {
        super();
        this.tilesets = tilesets;
        this.tileSize = new Vec2_1.default(0, 0);
        this.name = layer.name;
        let tilecount = 0;
        for (let tileset of tilesets) {
            tilecount += tileset.getTileCount() + 1;
        }
        this.collisionMap = new Array(tilecount);
        for (let i = 0; i < this.collisionMap.length; i++) {
            this.collisionMap[i] = false;
        }
        // Defer parsing of the data to child classes - this allows for isometric vs. orthographic tilemaps and handling of Tiled data or other data
        this.parseTilemapData(tilemapData, layer);
        this.scale.set(scale.x, scale.y);
    }
    /**
     * Returns an array of the tilesets associated with this tilemap
     * @returns An array of all of the tilesets assocaited with this tilemap.
     */
    getTilesets() {
        return this.tilesets;
    }
    /**
     * Returns the size of tiles in this tilemap as they appear in the game world after scaling
     * @returns A vector containing the size of tiles in this tilemap as they appear in the game world after scaling.
     */
    getTileSize() {
        return this.tileSize.scaled(this.scale.x, this.scale.y);
    }
    /**
     * Gets the tile size taking zoom into account
     * @returns The tile size with zoom
    */
    getTileSizeWithZoom() {
        let zoom = this.scene.getViewScale();
        return this.getTileSize().scale(zoom);
    }
    /**
     * Adds this tilemap to the physics system
    */
    addPhysics() {
        this.hasPhysics = true;
        this.active = true;
        this.group = -1;
        this.scene.getPhysicsManager().registerTilemap(this);
    }
}
exports.default = Tilemap;
},{"../DataTypes/Vec2":111,"./CanvasNode":126}],136:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Tilemap_1 = require("../Tilemap");
const Vec2_1 = require("../../DataTypes/Vec2");
const Debug_1 = require("../../Debug/Debug");
const Color_1 = require("../../Utils/Color");
/**
 * The representation of an orthogonal tilemap - i.e. a top down or platformer tilemap
 */
class OrthogonalTilemap extends Tilemap_1.default {
    // @override
    parseTilemapData(tilemapData, layer) {
        // The size of the tilemap in local space
        this.numCols = tilemapData.width;
        this.numRows = tilemapData.height;
        // The size of tiles
        this.tileSize.set(tilemapData.tilewidth, tilemapData.tileheight);
        // The size of the tilemap on the canvas
        this.size.set(this.numCols * this.tileSize.x, this.numRows * this.tileSize.y);
        this.position.copy(this.size.scaled(0.5));
        this.data = layer.data;
        this.visible = layer.visible;
        // Whether the tilemap is collidable or not
        this.isCollidable = false;
        if (layer.properties) {
            for (let item of layer.properties) {
                if (item.name === "Collidable") {
                    this.isCollidable = item.value;
                    // Set all tiles besides "empty: 0" to be collidable
                    for (let i = 1; i < this.collisionMap.length; i++) {
                        this.collisionMap[i] = true;
                    }
                }
            }
        }
    }
    /**
     * Gets the dimensions of the tilemap
     * @returns A Vec2 containing the number of columns and the number of rows in the tilemap.
     */
    getDimensions() {
        return new Vec2_1.default(this.numCols, this.numRows);
    }
    /**
     * Gets the data value of the tile at the specified world position
     * @param worldCoords The coordinates in world space
     * @returns The data value of the tile
     */
    getTileAtWorldPosition(worldCoords) {
        let localCoords = this.getColRowAt(worldCoords);
        return this.getTileAtRowCol(localCoords);
    }
    /**
     * Get the tile at the specified row and column
     * @param rowCol The coordinates in tilemap space
     * @returns The data value of the tile
     */
    getTileAtRowCol(rowCol) {
        if (rowCol.x < 0 || rowCol.x >= this.numCols || rowCol.y < 0 || rowCol.y >= this.numRows) {
            return -1;
        }
        return this.data[rowCol.y * this.numCols + rowCol.x];
    }
    /**
     * Gets the world position of the tile at the specified index
     * @param index The index of the tile
     * @returns A Vec2 containing the world position of the tile
     */
    getTileWorldPosition(index) {
        // Get the local position
        let col = index % this.numCols;
        let row = Math.floor(index / this.numCols);
        // Get the world position
        let x = col * this.tileSize.x;
        let y = row * this.tileSize.y;
        return new Vec2_1.default(x, y);
    }
    /**
     * Gets the data value of the tile at the specified index
     * @param index The index of the tile
     * @returns The data value of the tile
     */
    getTile(index) {
        return this.data[index];
    }
    // @override
    setTile(index, type) {
        this.data[index] = type;
    }
    /**
     * Sets the tile at the specified row and column
     * @param rowCol The position of the tile in tilemap space
     * @param type The new data value of the tile
     */
    setTileAtRowCol(rowCol, type) {
        let index = rowCol.y * this.numCols + rowCol.x;
        this.setTile(index, type);
    }
    /**
     * Returns true if the tile at the specified row and column of the tilemap is collidable
     * @param indexOrCol The index of the tile or the column it is in
     * @param row The row the tile is in
     * @returns A flag representing whether or not the tile is collidable.
     */
    isTileCollidable(indexOrCol, row) {
        // The value of the tile
        let tile = 0;
        if (row) {
            // We have a column and a row
            tile = this.getTileAtRowCol(new Vec2_1.default(indexOrCol, row));
            if (tile < 0) {
                return false;
            }
        }
        else {
            if (indexOrCol < 0 || indexOrCol >= this.data.length) {
                // Tiles that don't exist aren't collidable
                return false;
            }
            // We have an index
            tile = this.getTile(indexOrCol);
        }
        return this.collisionMap[tile];
    }
    /**
     * Takes in world coordinates and returns the row and column of the tile at that position
     * @param worldCoords The coordinates of the potential tile in world space
     * @returns A Vec2 containing the coordinates of the potential tile in tilemap space
     */
    getColRowAt(worldCoords) {
        let col = Math.floor(worldCoords.x / this.tileSize.x / this.scale.x);
        let row = Math.floor(worldCoords.y / this.tileSize.y / this.scale.y);
        return new Vec2_1.default(col, row);
    }
    // @override
    update(deltaT) { }
    // @override
    debugRender() {
        // Half of the tile size
        let zoomedHalfTileSize = this.getTileSizeWithZoom().scaled(0.5);
        let halfTileSize = this.getTileSize().scaled(0.5);
        // The center of the top left tile
        let topLeft = this.position.clone().sub(this.size.scaled(0.5));
        // A vec to store the center
        let center = Vec2_1.default.ZERO;
        for (let col = 0; col < this.numCols; col++) {
            // Calculate the x-position
            center.x = topLeft.x + col * 2 * halfTileSize.x + halfTileSize.x;
            for (let row = 0; row < this.numRows; row++) {
                if (this.isCollidable && this.isTileCollidable(col, row)) {
                    // Calculate the y-position
                    center.y = topLeft.y + row * 2 * halfTileSize.y + halfTileSize.y;
                    // Draw a box for this tile
                    Debug_1.default.drawBox(this.inRelativeCoordinates(center), zoomedHalfTileSize, false, Color_1.default.BLUE);
                }
            }
        }
    }
}
exports.default = OrthogonalTilemap;
},{"../../DataTypes/Vec2":111,"../../Debug/Debug":112,"../../Utils/Color":184,"../Tilemap":135}],137:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CanvasNode_1 = require("./CanvasNode");
const Color_1 = require("../Utils/Color");
const Vec2_1 = require("../DataTypes/Vec2");
const Input_1 = require("../Input/Input");
/**
 * The representation of a UIElement - the parent class of things like buttons
 */
class UIElement extends CanvasNode_1.default {
    constructor(position) {
        super();
        this.position = position;
        this.backgroundColor = new Color_1.default(0, 0, 0, 0);
        this.borderColor = new Color_1.default(0, 0, 0, 0);
        this.borderRadius = 5;
        this.borderWidth = 1;
        this.padding = Vec2_1.default.ZERO;
        this.onClick = null;
        this.onClickEventId = null;
        this.onRelease = null;
        this.onReleaseEventId = null;
        this.onEnter = null;
        this.onEnterEventId = null;
        this.onLeave = null;
        this.onLeaveEventId = null;
        this.isClicked = false;
        this.isEntered = false;
    }
    // @deprecated
    setBackgroundColor(color) {
        this.backgroundColor = color;
    }
    // @deprecated
    setPadding(padding) {
        this.padding.copy(padding);
    }
    update(deltaT) {
        super.update(deltaT);
        // See of this object was just clicked
        if (Input_1.default.isMouseJustPressed()) {
            let clickPos = Input_1.default.getMousePosition();
            if (this.contains(clickPos.x, clickPos.y) && this.visible && !this.layer.isHidden()) {
                this.isClicked = true;
                if (this.onClick !== null) {
                    this.onClick();
                }
                if (this.onClickEventId !== null) {
                    let data = {};
                    this.emitter.fireEvent(this.onClickEventId, data);
                }
            }
        }
        // If the mouse wasn't just pressed, then we definitely weren't clicked
        if (!Input_1.default.isMousePressed()) {
            if (this.isClicked) {
                this.isClicked = false;
            }
        }
        // Check if the mouse is hovering over this element
        let mousePos = Input_1.default.getMousePosition();
        if (mousePos && this.contains(mousePos.x, mousePos.y)) {
            this.isEntered = true;
            if (this.onEnter !== null) {
                this.onEnter();
            }
            if (this.onEnterEventId !== null) {
                let data = {};
                this.emitter.fireEvent(this.onEnterEventId, data);
            }
        }
        else if (this.isEntered) {
            this.isEntered = false;
            if (this.onLeave !== null) {
                this.onLeave();
            }
            if (this.onLeaveEventId !== null) {
                let data = {};
                this.emitter.fireEvent(this.onLeaveEventId, data);
            }
        }
        else if (this.isClicked) {
            // If mouse is dragged off of element while down, it is not clicked anymore
            this.isClicked = false;
        }
    }
    /**
     * Overridable method for calculating background color - useful for elements that want to be colored on different after certain events
     * @returns The background color of the UIElement
     */
    calculateBackgroundColor() {
        return this.backgroundColor;
    }
    /**
     * Overridable method for calculating border color - useful for elements that want to be colored on different after certain events
     * @returns The border color of the UIElement
     */
    calculateBorderColor() {
        return this.borderColor;
    }
}
exports.default = UIElement;
},{"../DataTypes/Vec2":111,"../Input/Input":119,"../Utils/Color":184,"./CanvasNode":126}],138:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Label_1 = require("./Label");
const Color_1 = require("../../Utils/Color");
/** A clickable button UIElement */
class Button extends Label_1.default {
    constructor(position, text) {
        super(position, text);
        this.backgroundColor = new Color_1.default(150, 75, 203);
        this.borderColor = new Color_1.default(41, 46, 30);
        this.textColor = new Color_1.default(255, 255, 255);
    }
    // @override
    calculateBackgroundColor() {
        // Change the background color if clicked or hovered
        if (this.isEntered && !this.isClicked) {
            return this.backgroundColor.lighten();
        }
        else if (this.isClicked) {
            return this.backgroundColor.darken();
        }
        else {
            return this.backgroundColor;
        }
    }
}
exports.default = Button;
},{"../../Utils/Color":184,"./Label":139}],139:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HAlign = exports.VAlign = void 0;
const Vec2_1 = require("../../DataTypes/Vec2");
const Color_1 = require("../../Utils/Color");
const UIElement_1 = require("../UIElement");
/** A basic text-containing label */
class Label extends UIElement_1.default {
    constructor(position, text) {
        super(position);
        this.text = text;
        this.textColor = new Color_1.default(0, 0, 0, 1);
        this.font = "Arial";
        this.fontSize = 30;
        this.hAlign = "center";
        this.vAlign = "center";
        this.sizeAssigned = false;
    }
    // @deprecated
    setText(text) {
        this.text = text;
    }
    // @deprecated
    setTextColor(color) {
        this.textColor = color;
    }
    /**
     * Gets a string containg the font details for rendering
     * @returns A string containing the font details
     */
    getFontString() {
        return this.fontSize + "px " + this.font;
    }
    /**
     * Overridable method for calculating text color - useful for elements that want to be colored on different after certain events
     * @returns a string containg the text color
     */
    calculateTextColor() {
        return this.textColor.toStringRGBA();
    }
    /**
     * Uses the canvas to calculate the width of the text
     * @param ctx The rendering context
     * @returns A number representing the rendered text width
     */
    calculateTextWidth(ctx) {
        ctx.font = this.fontSize + "px " + this.font;
        return ctx.measureText(this.text).width;
    }
    setHAlign(align) {
        this.hAlign = align;
    }
    setVAlign(align) {
        this.vAlign = align;
    }
    /**
     * Calculate the offset of the text - this is used for rendering text with different alignments
     * @param ctx The rendering context
     * @returns The offset of the text in a Vec2
     */
    calculateTextOffset(ctx) {
        let textWidth = this.calculateTextWidth(ctx);
        let offset = new Vec2_1.default(0, 0);
        let hDiff = this.size.x - textWidth;
        if (this.hAlign === HAlign.CENTER) {
            offset.x = hDiff / 2;
        }
        else if (this.hAlign === HAlign.RIGHT) {
            offset.x = hDiff;
        }
        if (this.vAlign === VAlign.TOP) {
            ctx.textBaseline = "top";
            offset.y = 0;
        }
        else if (this.vAlign === VAlign.BOTTOM) {
            ctx.textBaseline = "bottom";
            offset.y = this.size.y;
        }
        else {
            ctx.textBaseline = "middle";
            offset.y = this.size.y / 2;
        }
        return offset;
    }
    sizeChanged() {
        super.sizeChanged();
        this.sizeAssigned = true;
    }
    /**
     * Automatically sizes the element to the text within it
     * @param ctx The rendering context
     */
    autoSize(ctx) {
        let width = this.calculateTextWidth(ctx);
        let height = this.fontSize;
        this.size.set(width + this.padding.x * 2, height + this.padding.y * 2);
        this.sizeAssigned = true;
    }
    /**
     * Initially assigns a size to the UIElement if none is provided
     * @param ctx The rendering context
     */
    handleInitialSizing(ctx) {
        if (!this.sizeAssigned) {
            this.autoSize(ctx);
        }
    }
    /** On the next render, size this element to it's current text using its current font size */
    sizeToText() {
        this.sizeAssigned = false;
    }
}
exports.default = Label;
var VAlign;
(function (VAlign) {
    VAlign["TOP"] = "top";
    VAlign["CENTER"] = "center";
    VAlign["BOTTOM"] = "bottom";
})(VAlign = exports.VAlign || (exports.VAlign = {}));
var HAlign;
(function (HAlign) {
    HAlign["LEFT"] = "left";
    HAlign["CENTER"] = "center";
    HAlign["RIGHT"] = "right";
})(HAlign = exports.HAlign || (exports.HAlign = {}));
},{"../../DataTypes/Vec2":111,"../../Utils/Color":184,"../UIElement":137}],140:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("../../DataTypes/Vec2");
const Input_1 = require("../../Input/Input");
const Color_1 = require("../../Utils/Color");
const MathUtils_1 = require("../../Utils/MathUtils");
const UIElement_1 = require("../UIElement");
/** A slider UIElement */
class Slider extends UIElement_1.default {
    constructor(position, initValue) {
        super(position);
        this.value = initValue;
        this.nibColor = Color_1.default.RED;
        this.sliderColor = Color_1.default.BLACK;
        this.backgroundColor = Color_1.default.TRANSPARENT;
        this.borderColor = Color_1.default.TRANSPARENT;
        this.nibSize = new Vec2_1.default(10, 20);
        // Set a default size
        this.size.set(200, 20);
    }
    /**
     * Retrieves the value of the slider
     * @returns The value of the slider
     */
    getValue() {
        return this.value;
    }
    /** A method called in response to the value changing */
    valueChanged() {
        if (this.onValueChange) {
            this.onValueChange(this.value);
        }
        if (this.onValueChangeEventId) {
            this.emitter.fireEvent(this.onValueChangeEventId, { target: this, value: this.value });
        }
    }
    update(deltaT) {
        super.update(deltaT);
        if (this.isClicked) {
            let val = MathUtils_1.default.invLerp(this.position.x - this.size.x / 2, this.position.x + this.size.x / 2, Input_1.default.getMousePosition().x);
            this.value = MathUtils_1.default.clamp01(val);
            this.valueChanged();
        }
    }
}
exports.default = Slider;
},{"../../DataTypes/Vec2":111,"../../Input/Input":119,"../../Utils/Color":184,"../../Utils/MathUtils":187,"../UIElement":137}],141:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Color_1 = require("../../Utils/Color");
const Label_1 = require("./Label");
const Input_1 = require("../../Input/Input");
/** A text input UIElement */
class TextInput extends Label_1.default {
    constructor(position) {
        super(position, "");
        this.focused = false;
        this.cursorCounter = 0;
        // Give a default size to the x only
        this.size.set(200, this.fontSize);
        this.hAlign = "left";
        this.borderColor = Color_1.default.BLACK;
        this.backgroundColor = Color_1.default.WHITE;
    }
    update(deltaT) {
        super.update(deltaT);
        if (Input_1.default.isMouseJustPressed()) {
            let clickPos = Input_1.default.getMousePressPosition();
            if (this.contains(clickPos.x, clickPos.y)) {
                this.focused = true;
                this.cursorCounter = 30;
            }
            else {
                this.focused = false;
            }
        }
        if (this.focused) {
            let keys = Input_1.default.getKeysJustPressed();
            let nums = "1234567890";
            let specialChars = "`~!@#$%^&*()-_=+[{]}\\|;:'\",<.>/?";
            let letters = "qwertyuiopasdfghjklzxcvbnm";
            let mask = nums + specialChars + letters;
            keys = keys.filter(key => mask.includes(key));
            let shiftPressed = Input_1.default.isKeyPressed("shift");
            let backspacePressed = Input_1.default.isKeyJustPressed("backspace");
            let spacePressed = Input_1.default.isKeyJustPressed("space");
            if (backspacePressed) {
                this.text = this.text.substring(0, this.text.length - 1);
            }
            else if (spacePressed) {
                this.text += " ";
            }
            else if (keys.length > 0) {
                if (shiftPressed) {
                    this.text += keys[0].toUpperCase();
                }
                else {
                    this.text += keys[0];
                }
            }
        }
    }
}
exports.default = TextInput;
},{"../../Input/Input":119,"../../Utils/Color":184,"./Label":139}],142:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UIElementType = void 0;
var UIElementType;
(function (UIElementType) {
    UIElementType["BUTTON"] = "BUTTON";
    UIElementType["LABEL"] = "LABEL";
    UIElementType["SLIDER"] = "SLIDER";
    UIElementType["TEXT_INPUT"] = "TEXTINPUT";
})(UIElementType = exports.UIElementType || (exports.UIElementType = {}));
},{}],143:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Map_1 = require("../DataTypes/Map");
/**
 * The manager class for navigation.
 * Handles all navigable entities, such and allows them to be accessed by outside systems by requesting a path
 * from one position to another.
 */
class NavigationManager {
    constructor() {
        this.navigableEntities = new Map_1.default();
    }
    /**
     * Adds a navigable entity to the NavigationManager
     * @param navName The name of the navigable entitry
     * @param nav The actual Navigable instance
     */
    addNavigableEntity(navName, nav) {
        this.navigableEntities.add(navName, nav);
    }
    /**
     * Gets a path frome one point to another using a specified Navigable object
     * @param navName The name of the registered Navigable object
     * @param fromPosition The starting position of navigation
     * @param toPosition The ending position of Navigation
     * @returns A NavigationPath containing the route to take over the Navigable entity to get between the provided positions.
     */
    getPath(navName, fromPosition, toPosition) {
        let nav = this.navigableEntities.get(navName);
        return nav.getNavigationPath(fromPosition.clone(), toPosition.clone());
    }
}
exports.default = NavigationManager;
},{"../DataTypes/Map":98}],144:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("../DataTypes/Vec2");
/**
 * A path that AIs can follow. Uses finishMove() in Physical to determine progress on the route
 */
class NavigationPath {
    /**
     * Constructs a new NavigationPath
     * @param path The path of nodes to take
     */
    constructor(path) {
        this.path = path;
        this.currentMoveDirection = Vec2_1.default.ZERO;
        this.distanceThreshold = 4;
    }
    /**
     * Returns the status of navigation along this NavigationPath
     * @returns True if the node has reached the end of the path, false otherwise
     */
    isDone() {
        return this.path.isEmpty();
    }
    /**
     * Gets the movement direction in the current position along the path
     * @param node The node to move along the path
     * @returns The movement direction as a Vec2
     */
    getMoveDirection(node) {
        // Return direction to next point in the nav
        return node.position.dirTo(this.path.peek());
    }
    /**
     * Updates this NavigationPath to the current state of the GameNode
     * @param node The node moving along the path
     */
    handlePathProgress(node) {
        if (node.position.distanceSqTo(this.path.peek()) < this.distanceThreshold * this.distanceThreshold) {
            // We've reached our node, move on to the next destination
            this.path.pop();
        }
    }
    toString() {
        return this.path.toString();
    }
}
exports.default = NavigationPath;
},{"../DataTypes/Vec2":111}],145:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Stack_1 = require("../DataTypes/Stack");
const GraphUtils_1 = require("../Utils/GraphUtils");
const NavigationPath_1 = require("./NavigationPath");
/**
 * An implementation of a Navmesh. Navmeshes are graphs in the game world along which nodes can move.
 */
class Navmesh {
    /**
     * Creates a new Navmesh from the points in the speecified graph
     * @param graph The graph to construct a navmesh from
     */
    constructor(graph) {
        this.graph = graph;
    }
    // @implemented
    getNavigationPath(fromPosition, toPosition) {
        let start = this.getClosestNode(fromPosition);
        let end = this.getClosestNode(toPosition);
        let parent = GraphUtils_1.default.djikstra(this.graph, start);
        let pathStack = new Stack_1.default(this.graph.numVertices);
        // Push the final position and the final position in the graph
        pathStack.push(toPosition.clone());
        pathStack.push(this.graph.positions[end]);
        // Add all parents along the path
        let i = end;
        while (parent[i] !== -1) {
            pathStack.push(this.graph.positions[parent[i]]);
            i = parent[i];
        }
        return new NavigationPath_1.default(pathStack);
    }
    /**
     * Gets the closest node in this Navmesh to the specified position
     * @param position The position to query
     * @returns The index of the closest node in the Navmesh to the position
     */
    getClosestNode(position) {
        let n = this.graph.numVertices;
        let i = 1;
        let index = 0;
        let dist = position.distanceSqTo(this.graph.positions[0]);
        while (i < n) {
            let d = position.distanceSqTo(this.graph.positions[i]);
            if (d < dist) {
                dist = d;
                index = i;
            }
            i++;
        }
        return index;
    }
}
exports.default = Navmesh;
},{"../DataTypes/Stack":107,"../Utils/GraphUtils":186,"./NavigationPath":144}],146:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PhysicsManager_1 = require("./PhysicsManager");
const Vec2_1 = require("../DataTypes/Vec2");
const AABB_1 = require("../DataTypes/Shapes/AABB");
const OrthogonalTilemap_1 = require("../Nodes/Tilemaps/OrthogonalTilemap");
const AreaCollision_1 = require("../DataTypes/Physics/AreaCollision");
/**
 * ALGORITHM:
 * 	In an effort to keep things simple and working effectively, each dynamic node will resolve its
 * 	collisions considering the rest of the world as static.
 *
 * 	Collision detecting will happen first. This can be considered a broad phase, but it is not especially
 * 	efficient, as it does not need to be for this game engine. Every dynamic node is checked against every
 * 	other node for collision area. If collision area is non-zero (meaning the current node sweeps into another),
 * 	it is added to a list of hits.
 *
 * 	INITIALIZATION:
 * 		- Physics constants are reset
 * 		- Swept shapes are recalculated. If a node isn't moving, it is skipped.
 *
 * 	COLLISION DETECTION:
 * 		- For a node, collision area will be calculated using the swept AABB of the node against every other AABB in a static state
 * 		- These collisions will be sorted by area in descending order
 *
 * 	COLLISION RESOLUTION:
 * 		- For each hit, time of collision is calculated using a swept line through the AABB of the static node expanded
 * 			with minkowski sums (discretely, but the concept is there)
 * 		- The collision is resolved based on the near time of the collision (from method of separated axes)
 * 			- X is resolved by near x, Y by near y.
 * 			- There is some fudging to allow for sliding along walls of separate colliders. Sorting by area also helps with this.
 * 			- Corner to corner collisions are resolve to favor x-movement. This is in consideration of platformers, to give
 * 				the player some help with jumps
 *
 * 	Pros:
 * 		- Everything happens with a consistent time. There is a distinct before and after for each resolution.
 * 		- No back-tracking needs to be done. Once we resolve a node, it is definitively resolved.
 *
 * 	Cons:
 * 		- Nodes that are processed early have movement priority over other nodes. This can lead to some undesirable interactions.
 */
class BasicPhysicsManager extends PhysicsManager_1.default {
    constructor(options) {
        super();
        this.staticNodes = new Array();
        this.dynamicNodes = new Array();
        this.tilemaps = new Array();
        this.collisionMasks = new Array(32);
        // Parse options
        this.parseOptions(options);
    }
    /**
     * Parses the options for constructing the physics manager
     * @param options A record of options
     */
    parseOptions(options) {
        if (options.groupNames !== undefined && options.collisions !== undefined) {
            for (let i = 0; i < options.groupNames.length; i++) {
                let group = options.groupNames[i];
                // Register the group name and number
                this.groupNames[i] = group;
                this.groupMap.set(group, 1 << i);
                let collisionMask = 0;
                for (let j = 0; j < options.collisions[i].length; j++) {
                    if (options.collisions[i][j]) {
                        collisionMask |= 1 << j;
                    }
                }
                this.collisionMasks[i] = collisionMask;
            }
        }
    }
    // @override
    registerObject(node) {
        if (node.isStatic) {
            // Static and not collidable
            this.staticNodes.push(node);
        }
        else {
            // Dynamic and not collidable
            this.dynamicNodes.push(node);
        }
    }
    // @override
    deregisterObject(node) {
        console.log("Deregistering physics object");
        if (node.isStatic) {
            // Remove the node from the static list
            const index = this.staticNodes.indexOf(node);
            this.staticNodes.splice(index, 1);
        }
        else {
            // Remove the node from the dynamic list
            const index = this.dynamicNodes.indexOf(node);
            this.dynamicNodes.splice(index, 1);
        }
    }
    // @override
    registerTilemap(tilemap) {
        this.tilemaps.push(tilemap);
    }
    // @override
    deregisterTilemap(tilemap) {
        const index = this.tilemaps.indexOf(tilemap);
        this.tilemaps.splice(index, 1);
    }
    // @override
    update(deltaT) {
        for (let node of this.dynamicNodes) {
            /*---------- INITIALIZATION PHASE ----------*/
            // Clear frame dependent boolean values for each node
            node.onGround = false;
            node.onCeiling = false;
            node.onWall = false;
            node.collidedWithTilemap = false;
            node.isColliding = false;
            // If this node is not active, don't process it
            if (!node.active) {
                continue;
            }
            // Update the swept shapes of each node
            if (node.moving) {
                // If moving, reflect that in the swept shape
                node.sweptRect.sweep(node._velocity, node.collisionShape.center, node.collisionShape.halfSize);
            }
            else {
                // If our node isn't moving, don't bother to check it (other nodes will detect if they run into it)
                node._velocity.zero();
                continue;
            }
            /*---------- DETECTION PHASE ----------*/
            // Gather a set of overlaps
            let overlaps = new Array();
            let groupIndex = Math.log2(node.group);
            // First, check this node against every static node (order doesn't actually matter here, since we sort anyways)
            for (let other of this.staticNodes) {
                // Ignore inactive nodes
                if (!other.active)
                    continue;
                let collider = other.collisionShape.getBoundingRect();
                let area = node.sweptRect.overlapArea(collider);
                if (area > 0) {
                    // We had a collision
                    overlaps.push(new AreaCollision_1.default(area, collider, other, "GameNode", null));
                }
            }
            // Then, check it against every dynamic node
            for (let other of this.dynamicNodes) {
                // Ignore ourselves
                if (node === other)
                    continue;
                // Ignore inactive nodes
                if (!other.active)
                    continue;
                let collider = other.collisionShape.getBoundingRect();
                let area = node.sweptRect.overlapArea(collider);
                if (area > 0) {
                    // We had a collision
                    overlaps.push(new AreaCollision_1.default(area, collider, other, "GameNode", null));
                }
            }
            // Lastly, gather a set of AABBs from the tilemap.
            // This step involves the most extra work, so it is abstracted into a method
            for (let tilemap of this.tilemaps) {
                // Ignore inactive tilemaps
                if (!tilemap.active)
                    continue;
                if (tilemap instanceof OrthogonalTilemap_1.default) {
                    this.collideWithOrthogonalTilemap(node, tilemap, overlaps);
                }
            }
            // Sort the overlaps by area
            overlaps = overlaps.sort((a, b) => b.area - a.area);
            // Keep track of hits to use later
            let hits = [];
            /*---------- RESOLUTION PHASE ----------*/
            // For every overlap, determine if we need to collide with it and when
            for (let overlap of overlaps) {
                // Ignore nodes we don't interact with
                if (this.collisionMasks[groupIndex] !== undefined && (this.collisionMasks[groupIndex] & overlap.other.group) === 0)
                    continue;
                // Do a swept line test on the static AABB with this AABB size as padding (this is basically using a minkowski sum!)
                // Start the sweep at the position of this node with a delta of _velocity
                const point = node.collisionShape.center;
                const delta = node._velocity;
                const padding = node.collisionShape.halfSize;
                const otherAABB = overlap.collider;
                const hit = otherAABB.intersectSegment(node.collisionShape.center, node._velocity, node.collisionShape.halfSize);
                overlap.hit = hit;
                if (hit !== null) {
                    hits.push(hit);
                    // We got a hit, resolve with the time inside of the hit
                    let tnearx = hit.nearTimes.x;
                    let tneary = hit.nearTimes.y;
                    // Allow edge clipping (edge overlaps don't count, only area overlaps)
                    // Importantly don't allow both cases to be true. Then we clip through corners. Favor x to help players land jumps
                    if (tnearx < 1.0 && (point.y === otherAABB.top - padding.y || point.y === otherAABB.bottom + padding.y) && delta.x !== 0) {
                        tnearx = 1.0;
                    }
                    else if (tneary < 1.0 && (point.x === otherAABB.left - padding.x || point.x === otherAABB.right + padding.x) && delta.y !== 0) {
                        tneary = 1.0;
                    }
                    if (hit.nearTimes.x >= 0 && hit.nearTimes.x < 1) {
                        // Any tilemap objects that made it here are collidable
                        if (overlap.type === "Tilemap" || overlap.other.isCollidable) {
                            node._velocity.x = node._velocity.x * tnearx;
                            node.isColliding = true;
                        }
                    }
                    if (hit.nearTimes.y >= 0 && hit.nearTimes.y < 1) {
                        // Any tilemap objects that made it here are collidable
                        if (overlap.type === "Tilemap" || overlap.other.isCollidable) {
                            node._velocity.y = node._velocity.y * tneary;
                            node.isColliding = true;
                        }
                    }
                }
            }
            /*---------- INFORMATION/TRIGGER PHASE ----------*/
            // Check if we ended up on the ground, ceiling or wall
            // Also check for triggers
            for (let overlap of overlaps) {
                // Check for a trigger. If we care about the trigger, react
                if (overlap.other.isTrigger && (overlap.other.triggerMask & node.group)) {
                    // Get the bit that this group is represented by
                    let index = Math.floor(Math.log2(node.group));
                    // Extract the triggerEnter event name
                    this.emitter.fireEvent(overlap.other.triggerEnters[index], {
                        node: node.id,
                        other: overlap.other.id
                    });
                }
                // Ignore collision sides for nodes we don't interact with
                if ((this.collisionMasks[groupIndex] & overlap.other.group) === 0)
                    continue;
                // Only check for direction if the overlap was collidable
                if (overlap.type === "Tilemap" || overlap.other.isCollidable) {
                    let collisionSide = overlap.collider.touchesAABBWithoutCorners(node.collisionShape.getBoundingRect());
                    if (collisionSide !== null) {
                        // If we touch, not including corner cases, check the collision normal
                        if (overlap.hit !== null) {
                            // If we hit a tilemap, keep track of it
                            if (overlap.type == "Tilemap") {
                                node.collidedWithTilemap = true;
                            }
                            if (collisionSide.y === -1) {
                                // Node is on top of overlap, so onGround
                                node.onGround = true;
                            }
                            else if (collisionSide.y === 1) {
                                // Node is on bottom of overlap, so onCeiling
                                node.onCeiling = true;
                            }
                            else {
                                // Node wasn't touching on y, so it is touching on x
                                node.onWall = true;
                            }
                        }
                    }
                }
            }
            // Resolve the collision with the node, and move it
            node.finishMove();
        }
    }
    /**
     * Handles a collision between this node and an orthogonal tilemap
     * @param node The node
     * @param tilemap The tilemap the node may be colliding with
     * @param overlaps The list of overlaps
     */
    collideWithOrthogonalTilemap(node, tilemap, overlaps) {
        // Get the min and max x and y coordinates of the moving node
        let min = new Vec2_1.default(node.sweptRect.left, node.sweptRect.top);
        let max = new Vec2_1.default(node.sweptRect.right, node.sweptRect.bottom);
        // Convert the min/max x/y to the min and max row/col in the tilemap array
        let minIndex = tilemap.getColRowAt(min);
        let maxIndex = tilemap.getColRowAt(max);
        let tileSize = tilemap.getTileSize();
        // Loop over all possible tiles (which isn't many in the scope of the velocity per frame)
        for (let col = minIndex.x; col <= maxIndex.x; col++) {
            for (let row = minIndex.y; row <= maxIndex.y; row++) {
                if (tilemap.isTileCollidable(col, row)) {
                    // Get the position of this tile
                    let tilePos = new Vec2_1.default(col * tileSize.x + tileSize.x / 2, row * tileSize.y + tileSize.y / 2);
                    // Create a new collider for this tile
                    let collider = new AABB_1.default(tilePos, tileSize.scaled(1 / 2));
                    // Calculate collision area between the node and the tile
                    let area = node.sweptRect.overlapArea(collider);
                    if (area > 0) {
                        // We had a collision
                        overlaps.push(new AreaCollision_1.default(area, collider, tilemap, "Tilemap", new Vec2_1.default(col, row)));
                    }
                }
            }
        }
    }
}
exports.default = BasicPhysicsManager;
},{"../DataTypes/Physics/AreaCollision":100,"../DataTypes/Shapes/AABB":104,"../DataTypes/Vec2":111,"../Nodes/Tilemaps/OrthogonalTilemap":136,"./PhysicsManager":147}],147:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Receiver_1 = require("../Events/Receiver");
const Emitter_1 = require("../Events/Emitter");
const Map_1 = require("../DataTypes/Map");
/**
 * An abstract physics manager.
 * This class exposes functions for subclasses to implement that should allow for a working physics system to be created.
 */
class PhysicsManager {
    constructor() {
        this.receiver = new Receiver_1.default();
        this.emitter = new Emitter_1.default();
        // The creation and implementation of layers is deferred to the subclass
        this.groupMap = new Map_1.default();
        this.groupNames = new Array();
    }
    destroy() {
        this.receiver.destroy();
    }
    /**
     * Sets the physics layer of the GameNode
     * @param node The GameNode
     * @param group The group that the GameNode should be on
     */
    setGroup(node, group) {
        node.group = this.groupMap.get(group);
    }
    /**
     * Retrieves the layer number associated with the provided name
     * @param layer The name of the layer
     * @returns The layer number, or 0 if there is not a layer with that name registered
     */
    getGroupNumber(group) {
        if (this.groupMap.has(group)) {
            return this.groupMap.get(group);
        }
        else {
            return 0;
        }
    }
    /**
     * Gets all group names associated with the number provided
     * @param groups A mask of groups
     * @returns All groups contained in the mask
     */
    getGroupNames(groups) {
        if (groups === -1) {
            return [PhysicsManager.DEFAULT_GROUP];
        }
        else {
            let g = 1;
            let names = [];
            for (let i = 0; i < 32; i++) {
                if (g & groups) {
                    // This group is in the groups number
                    names.push(this.groupNames[i]);
                }
                // Shift the bit over
                g = g << 1;
            }
        }
    }
}
exports.default = PhysicsManager;
/** The default group name */
PhysicsManager.DEFAULT_GROUP = "Default";
},{"../DataTypes/Map":98,"../Events/Emitter":114,"../Events/Receiver":118}],148:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Queue_1 = require("../DataTypes/Queue");
const Receiver_1 = require("../Events/Receiver");
const EventQueue_1 = require("../Events/EventQueue");
const GameEventType_1 = require("../Events/GameEventType");
// @ignorePage
class Recorder {
    constructor() {
        this.receiver = new Receiver_1.default();
        this.log = new Queue_1.default(1000);
        this.recording = false;
        this.playing = false;
        this.frame = 0;
        this.eventQueue = EventQueue_1.default.getInstance();
        this.eventQueue.subscribe(this.receiver, "all");
    }
    update(deltaT) {
        if (this.recording) {
            this.frame += 1;
        }
        if (this.playing) {
            // If playing, ignore events, just feed the record to the event queue
            this.receiver.ignoreEvents();
            /*
                While there is a next item, and while it should occur in this frame,
                send the event. i.e., while current_frame * current_delta_t is greater
                than recorded_frame * recorded_delta_t
            */
            while (this.log.hasItems()
                && this.log.peekNext().frame * this.log.peekNext().delta < this.frame * deltaT) {
                let event = this.log.dequeue().event;
                console.log(event);
                this.eventQueue.addEvent(event);
            }
            if (!this.log.hasItems()) {
                this.playing = false;
            }
            this.frame += 1;
        }
        else {
            // If not playing, handle events
            while (this.receiver.hasNextEvent()) {
                let event = this.receiver.getNextEvent();
                if (event.type === GameEventType_1.GameEventType.STOP_RECORDING) {
                    this.recording = false;
                }
                if (this.recording) {
                    this.log.enqueue(new LogItem(this.frame, deltaT, event));
                }
                if (event.type === GameEventType_1.GameEventType.START_RECORDING) {
                    this.log.clear();
                    this.recording = true;
                    this.frame = 0;
                }
                if (event.type === GameEventType_1.GameEventType.PLAY_RECORDING) {
                    this.frame = 0;
                    this.recording = false;
                    this.playing = true;
                }
            }
        }
    }
}
exports.default = Recorder;
class LogItem {
    constructor(frame, deltaT, event) {
        this.frame = frame;
        this.delta = deltaT;
        this.event = event;
    }
}
},{"../DataTypes/Queue":102,"../Events/EventQueue":115,"../Events/GameEventType":117,"../Events/Receiver":118}],149:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Map_1 = require("../../DataTypes/Map");
class Registry extends Map_1.default {
}
exports.default = Registry;
},{"../../DataTypes/Map":98}],150:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LabelShaderType_1 = require("../../Rendering/WebGLRendering/ShaderTypes/LabelShaderType");
const PointShaderType_1 = require("../../Rendering/WebGLRendering/ShaderTypes/PointShaderType");
const RectShaderType_1 = require("../../Rendering/WebGLRendering/ShaderTypes/RectShaderType");
const SpriteShaderType_1 = require("../../Rendering/WebGLRendering/ShaderTypes/SpriteShaderType");
const ResourceManager_1 = require("../../ResourceManager/ResourceManager");
const Registry_1 = require("./Registry");
/**
 * A registry that handles shaders
 */
class ShaderRegistry extends Registry_1.default {
    constructor() {
        super(...arguments);
        this.registryItems = new Array();
    }
    /**
     * Preloads all built-in shaders
     */
    preload() {
        // Get the resourceManager and queue all built-in shaders for preloading
        const rm = ResourceManager_1.default.getInstance();
        // Queue a load for the point shader
        this.registerAndPreloadItem(ShaderRegistry.POINT_SHADER, PointShaderType_1.default, "builtin/shaders/point.vshader", "builtin/shaders/point.fshader");
        // Queue a load for the rect shader
        this.registerAndPreloadItem(ShaderRegistry.RECT_SHADER, RectShaderType_1.default, "builtin/shaders/rect.vshader", "builtin/shaders/rect.fshader");
        // Queue a load for the sprite shader
        this.registerAndPreloadItem(ShaderRegistry.SPRITE_SHADER, SpriteShaderType_1.default, "builtin/shaders/sprite.vshader", "builtin/shaders/sprite.fshader");
        // Queue a load for the label shader
        this.registerAndPreloadItem(ShaderRegistry.LABEL_SHADER, LabelShaderType_1.default, "builtin/shaders/label.vshader", "builtin/shaders/label.fshader");
        // Queue a load for any preloaded items
        for (let item of this.registryItems) {
            const shader = new item.constr(item.key);
            shader.initBufferObject();
            this.add(item.key, shader);
            // Load if desired
            if (item.preload !== undefined) {
                rm.shader(item.key, item.preload.vshaderLocation, item.preload.fshaderLocation);
            }
        }
    }
    /**
     * Registers a shader in the registry and loads it before the game begins
     * @param key The key you wish to assign to the shader
     * @param constr The constructor of the ShaderType
     * @param vshaderLocation The location of the vertex shader
     * @param fshaderLocation the location of the fragment shader
     */
    registerAndPreloadItem(key, constr, vshaderLocation, fshaderLocation) {
        let shaderPreload = new ShaderPreload();
        shaderPreload.vshaderLocation = vshaderLocation;
        shaderPreload.fshaderLocation = fshaderLocation;
        let registryItem = new ShaderRegistryItem();
        registryItem.key = key;
        registryItem.constr = constr;
        registryItem.preload = shaderPreload;
        this.registryItems.push(registryItem);
    }
    /**
     * Registers a shader in the registry. NOTE: If you use this, you MUST load the shader before use.
     * If you wish to preload the shader, use registerAndPreloadItem()
     * @param key The key you wish to assign to the shader
     * @param constr The constructor of the ShaderType
     */
    registerItem(key, constr) {
        let registryItem = new ShaderRegistryItem();
        registryItem.key = key;
        registryItem.constr = constr;
        this.registryItems.push(registryItem);
    }
}
exports.default = ShaderRegistry;
// Shader names
ShaderRegistry.POINT_SHADER = "point";
ShaderRegistry.RECT_SHADER = "rect";
ShaderRegistry.SPRITE_SHADER = "sprite";
ShaderRegistry.LABEL_SHADER = "label";
class ShaderRegistryItem {
}
class ShaderPreload {
}
},{"../../Rendering/WebGLRendering/ShaderTypes/LabelShaderType":163,"../../Rendering/WebGLRendering/ShaderTypes/PointShaderType":164,"../../Rendering/WebGLRendering/ShaderTypes/RectShaderType":166,"../../Rendering/WebGLRendering/ShaderTypes/SpriteShaderType":167,"../../ResourceManager/ResourceManager":168,"./Registry":149}],151:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Map_1 = require("../DataTypes/Map");
const ShaderRegistry_1 = require("./Registries/ShaderRegistry");
/**
 * The Registry is the system's way of converting classes and types into string
 * representations for use elsewhere in the application.
 * It allows classes to be accessed without explicitly using constructors in code,
 * and for resources to be loaded at Game creation time.
 */
class RegistryManager {
    static preload() {
        this.shaders.preload();
        this.registries.forEach((key) => this.registries.get(key).preload());
    }
    static addCustomRegistry(name, registry) {
        this.registries.add(name, registry);
    }
    static getRegistry(key) {
        return this.registries.get(key);
    }
}
exports.default = RegistryManager;
RegistryManager.shaders = new ShaderRegistry_1.default();
/** Additional custom registries to add to the registry manager */
RegistryManager.registries = new Map_1.default();
},{"../DataTypes/Map":98,"./Registries/ShaderRegistry":150}],152:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Map_1 = require("../../DataTypes/Map");
const Emitter_1 = require("../../Events/Emitter");
const AnimationTypes_1 = require("./AnimationTypes");
/**
 * An animation manager class for an animated CanvasNode.
 * This class keeps track of the possible animations, as well as the current animation state,
 * and abstracts all interactions with playing, pausing, and stopping animations as well as
 * creating new animations from the CanvasNode.
 */
class AnimationManager {
    /**
     * Creates a new AnimationManager
     * @param owner The owner of the AnimationManager
     */
    constructor(owner) {
        this.owner = owner;
        this.animationState = AnimationTypes_1.AnimationState.STOPPED;
        this.currentAnimation = "";
        this.currentFrame = 0;
        this.frameProgress = 0;
        this.loop = false;
        this.animations = new Map_1.default();
        this.onEndEvent = null;
        this.emitter = new Emitter_1.default();
    }
    /**
     * Add an animation to this sprite
     * @param key The unique key of the animation
     * @param animation The animation data
     */
    add(key, animation) {
        this.animations.add(key, animation);
    }
    /**
     * Gets the index specified by the current animation and current frame
     * @returns The index in the current animation
     */
    getIndex() {
        if (this.animations.has(this.currentAnimation)) {
            return this.animations.get(this.currentAnimation).frames[this.currentFrame].index;
        }
        else {
            // No current animation, warn the user
            console.warn(`Animation index was requested, but the current animation: ${this.currentAnimation} was invalid`);
            return 0;
        }
    }
    /**
     * Determines whether the specified animation is currently playing
     * @param key The key of the animation to check
     * @returns true if the specified animation is playing, false otherwise
     */
    isPlaying(key) {
        return this.currentAnimation === key && this.animationState === AnimationTypes_1.AnimationState.PLAYING;
    }
    /**
     * Retrieves the current animation index and advances the animation frame
     * @returns The index of the animation frame
     */
    getIndexAndAdvanceAnimation() {
        // If we aren't playing, we won't be advancing the animation
        if (!(this.animationState === AnimationTypes_1.AnimationState.PLAYING)) {
            return this.getIndex();
        }
        if (this.animations.has(this.currentAnimation)) {
            let currentAnimation = this.animations.get(this.currentAnimation);
            let index = currentAnimation.frames[this.currentFrame].index;
            // Advance the animation
            this.frameProgress += 1;
            if (this.frameProgress >= currentAnimation.frames[this.currentFrame].duration) {
                // We have been on this frame for its whole duration, go to the next one
                this.frameProgress = 0;
                this.currentFrame += 1;
                if (this.currentFrame >= currentAnimation.frames.length) {
                    // We have reached the end of this animation
                    if (this.loop) {
                        this.currentFrame = 0;
                        this.frameProgress = 0;
                    }
                    else {
                        this.endCurrentAnimation();
                    }
                }
            }
            // Return the current index
            return index;
        }
        else {
            // No current animation, can't advance. Warn the user
            console.warn(`Animation index and advance was requested, but the current animation (${this.currentAnimation}) in node with id: ${this.owner.id} was invalid`);
            return 0;
        }
    }
    /** Ends the current animation and fires any necessary events, as well as starting any new animations */
    endCurrentAnimation() {
        this.currentFrame = 0;
        this.animationState = AnimationTypes_1.AnimationState.STOPPED;
        if (this.onEndEvent !== null) {
            this.emitter.fireEvent(this.onEndEvent, { owner: this.owner.id, animation: this.currentAnimation });
            this.onEndEvent = null;
        }
        // If there is a pending animation, play it
        if (this.pendingAnimation !== null) {
            this.play(this.pendingAnimation, this.pendingLoop, this.pendingOnEnd);
        }
    }
    /**
     * Plays the specified animation. Does not restart it if it is already playing
     * @param animation The name of the animation to play
     * @param loop Whether or not to loop the animation. False by default
     * @param onEnd The name of an event to send when this animation naturally stops playing. This only matters if loop is false.
     */
    playIfNotAlready(animation, loop, onEnd) {
        if (this.currentAnimation !== animation) {
            this.play(animation, loop, onEnd);
        }
    }
    /**
     * Plays the specified animation
     * @param animation The name of the animation to play
     * @param loop Whether or not to loop the animation. False by default
     * @param onEnd The name of an event to send when this animation naturally stops playing. This only matters if loop is false.
     */
    play(animation, loop, onEnd) {
        this.currentAnimation = animation;
        this.currentFrame = 0;
        this.frameProgress = 0;
        this.animationState = AnimationTypes_1.AnimationState.PLAYING;
        // If loop arg was provided, use that
        if (loop !== undefined) {
            this.loop = loop;
        }
        else {
            // Otherwise, use what the json file specified
            this.loop = this.animations.get(animation).repeat;
        }
        if (onEnd !== undefined) {
            this.onEndEvent = onEnd;
        }
        else {
            this.onEndEvent = null;
        }
        // Reset pending animation
        this.pendingAnimation = null;
    }
    /**
     * Queues a single animation to be played after the current one. Does NOT stack.
     * Queueing additional animations past 1 will just replace the queued animation
     * @param animation The animation to queue
     * @param loop Whether or not the loop the queued animation
     * @param onEnd The event to fire when the queued animation ends
     */
    queue(animation, loop = false, onEnd) {
        this.pendingAnimation = animation;
        this.pendingLoop = loop;
        if (onEnd !== undefined) {
            this.pendingOnEnd = onEnd;
        }
        else {
            this.pendingOnEnd = null;
        }
    }
    /** Pauses the current animation */
    pause() {
        this.animationState = AnimationTypes_1.AnimationState.PAUSED;
    }
    /** Resumes the current animation if possible */
    resume() {
        if (this.animationState === AnimationTypes_1.AnimationState.PAUSED) {
            this.animationState = AnimationTypes_1.AnimationState.PLAYING;
        }
    }
    /** Stops the current animation. The animation cannot be resumed after this. */
    stop() {
        this.animationState = AnimationTypes_1.AnimationState.STOPPED;
    }
}
exports.default = AnimationManager;
},{"../../DataTypes/Map":98,"../../Events/Emitter":114,"./AnimationTypes":153}],153:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TweenData = exports.TweenEffect = exports.AnimationData = exports.AnimationState = void 0;
// @ignorePage
var AnimationState;
(function (AnimationState) {
    AnimationState[AnimationState["STOPPED"] = 0] = "STOPPED";
    AnimationState[AnimationState["PAUSED"] = 1] = "PAUSED";
    AnimationState[AnimationState["PLAYING"] = 2] = "PLAYING";
})(AnimationState = exports.AnimationState || (exports.AnimationState = {}));
class AnimationData {
    constructor() {
        this.repeat = false;
    }
}
exports.AnimationData = AnimationData;
class TweenEffect {
}
exports.TweenEffect = TweenEffect;
class TweenData {
}
exports.TweenData = TweenData;
},{}],154:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Map_1 = require("../../DataTypes/Map");
const AnimationTypes_1 = require("./AnimationTypes");
const EaseFunctions_1 = require("../../Utils/EaseFunctions");
const MathUtils_1 = require("../../Utils/MathUtils");
const TweenManager_1 = require("./TweenManager");
const Emitter_1 = require("../../Events/Emitter");
/**
 * A manager for the tweens of a GameNode.
 * Tweens are short animations played by interpolating between two properties using an easing function.
 * For a good visual representation of easing functions, check out @link(https://easings.net/)(https://easings.net/).
 * Multiple tween can be played at the same time, as long as they don't change the same property.
 * This allows for some interesting polishes or animations that may be very difficult to do with sprite work alone
 * - especially pixel art (such as rotations or scaling).
 */
class TweenController {
    /**
     * Creates a new TweenController
     * @param owner The owner of the TweenController
     */
    constructor(owner) {
        this.owner = owner;
        this.tweens = new Map_1.default();
        this.emitter = new Emitter_1.default();
        // Give ourselves to the TweenManager
        TweenManager_1.default.getInstance().registerTweenController(this);
    }
    /**
     * Destroys this TweenController
     */
    destroy() {
        // Only the gamenode and the tween manager should have a reference to this
        delete this.owner.tweens;
        TweenManager_1.default.getInstance().deregisterTweenController(this);
    }
    /**
     * Add a tween to this game node
     * @param key The name of the tween
     * @param tween The data of the tween
     */
    add(key, tween) {
        let typedTween = tween;
        // Initialize members that we need (and the user didn't provide)
        typedTween.progress = 0;
        typedTween.elapsedTime = 0;
        typedTween.animationState = AnimationTypes_1.AnimationState.STOPPED;
        this.tweens.add(key, typedTween);
    }
    /**
     * Play a tween with a certain name
     * @param key The name of the tween to play
     * @param loop Whether or not the tween should loop
     */
    play(key, loop) {
        if (this.tweens.has(key)) {
            let tween = this.tweens.get(key);
            // Set loop if needed
            if (loop !== undefined) {
                tween.loop = loop;
            }
            // Set the initial values
            for (let effect of tween.effects) {
                if (effect.resetOnComplete) {
                    effect.initialValue = this.owner[effect.property];
                }
            }
            // Start the tween running
            tween.animationState = AnimationTypes_1.AnimationState.PLAYING;
            tween.elapsedTime = 0;
            tween.progress = 0;
            tween.reversing = false;
        }
        else {
            console.warn(`Tried to play tween "${key}" on node with id ${this.owner.id}, but no such tween exists`);
        }
    }
    /**
     * Pauses a playing tween. Does not affect tweens that are stopped.
     * @param key The name of the tween to pause.
     */
    pause(key) {
        if (this.tweens.has(key)) {
            this.tweens.get(key).animationState = AnimationTypes_1.AnimationState.PAUSED;
        }
    }
    /**
     * Resumes a paused tween.
     * @param key The name of the tween to resume
     */
    resume(key) {
        if (this.tweens.has(key)) {
            let tween = this.tweens.get(key);
            if (tween.animationState === AnimationTypes_1.AnimationState.PAUSED)
                tween.animationState = AnimationTypes_1.AnimationState.PLAYING;
        }
    }
    /**
     * Stops a currently playing tween
     * @param key The key of the tween
     */
    stop(key) {
        if (this.tweens.has(key)) {
            let tween = this.tweens.get(key);
            tween.animationState = AnimationTypes_1.AnimationState.STOPPED;
            // Return to the initial values
            for (let effect of tween.effects) {
                if (effect.resetOnComplete) {
                    this.owner[effect.property] = effect.initialValue;
                }
            }
        }
    }
    /**
     * The natural stop of a currently playing tween
     * @param key The key of the tween
     */
    end(key) {
        this.stop(key);
        if (this.tweens.has(key)) {
            // Get the tween
            let tween = this.tweens.get(key);
            // If it has an onEnd, send an event
            if (tween.onEnd) {
                this.emitter.fireEvent(tween.onEnd, { key: key, node: this.owner.id });
            }
        }
    }
    /**
     * Stops all currently playing tweens
     */
    stopAll() {
        this.tweens.forEach(key => this.stop(key));
    }
    update(deltaT) {
        this.tweens.forEach(key => {
            let tween = this.tweens.get(key);
            if (tween.animationState === AnimationTypes_1.AnimationState.PLAYING) {
                // Update the progress of the tween
                tween.elapsedTime += deltaT * 1000;
                // If we're past the startDelay, do the tween
                if (tween.elapsedTime >= tween.startDelay) {
                    if (!tween.reversing && tween.elapsedTime >= tween.startDelay + tween.duration + tween.endDelay) {
                        // If we're over time, stop the tween, loop, or reverse
                        if (tween.reverseOnComplete) {
                            // If we're over time and can reverse, do so
                            tween.reversing = true;
                        }
                        else if (tween.loop) {
                            // If we can't reverse and can loop, do so
                            tween.elapsedTime -= tween.duration;
                        }
                        else {
                            // We aren't looping and can't reverse, so stop
                            this.end(key);
                        }
                    }
                    // Check for the end of reversing
                    if (tween.reversing && tween.elapsedTime >= tween.startDelay + 2 * tween.duration + tween.endDelay) {
                        if (tween.loop) {
                            tween.reversing = false;
                            tween.elapsedTime -= 2 * tween.duration;
                        }
                        else {
                            this.end(key);
                        }
                    }
                    // Update the progress, make sure it is between 0 and 1. Errors from this should never be large
                    if (tween.reversing) {
                        tween.progress = MathUtils_1.default.clamp01((2 * tween.duration - (tween.elapsedTime - (tween.startDelay + tween.endDelay))) / tween.duration);
                    }
                    else {
                        tween.progress = MathUtils_1.default.clamp01((tween.elapsedTime - tween.startDelay) / tween.duration);
                    }
                    for (let effect of tween.effects) {
                        // Get the value from the ease function that corresponds to our progress
                        let ease = EaseFunctions_1.default[effect.ease](tween.progress);
                        // Use the value to lerp the property
                        let value = MathUtils_1.default.lerp(effect.start, effect.end, ease);
                        // Assign the value of the property
                        this.owner[effect.property] = value;
                    }
                }
            }
        });
    }
}
exports.default = TweenController;
},{"../../DataTypes/Map":98,"../../Events/Emitter":114,"../../Utils/EaseFunctions":185,"../../Utils/MathUtils":187,"./AnimationTypes":153,"./TweenManager":155}],155:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TweenManager {
    constructor() {
        this.tweenControllers = new Array();
    }
    static getInstance() {
        if (TweenManager.instance === null) {
            TweenManager.instance = new TweenManager();
        }
        return TweenManager.instance;
    }
    registerTweenController(controller) {
        this.tweenControllers.push(controller);
    }
    deregisterTweenController(controller) {
        let index = this.tweenControllers.indexOf(controller);
        this.tweenControllers.splice(index, 1);
    }
    clearTweenControllers() {
        this.tweenControllers = new Array();
    }
    update(deltaT) {
        for (let tweenController of this.tweenControllers) {
            tweenController.update(deltaT);
        }
    }
}
exports.default = TweenManager;
TweenManager.instance = null;
},{}],156:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Graphic_1 = require("../Nodes/Graphic");
const Point_1 = require("../Nodes/Graphics/Point");
const Rect_1 = require("../Nodes/Graphics/Rect");
const Sprite_1 = require("../Nodes/Sprites/Sprite");
const OrthogonalTilemap_1 = require("../Nodes/Tilemaps/OrthogonalTilemap");
const UIElement_1 = require("../Nodes/UIElement");
const GraphicRenderer_1 = require("./CanvasRendering/GraphicRenderer");
const RenderingManager_1 = require("./RenderingManager");
const TilemapRenderer_1 = require("./CanvasRendering/TilemapRenderer");
const UIElementRenderer_1 = require("./CanvasRendering/UIElementRenderer");
const Label_1 = require("../Nodes/UIElements/Label");
const Button_1 = require("../Nodes/UIElements/Button");
const Slider_1 = require("../Nodes/UIElements/Slider");
const TextInput_1 = require("../Nodes/UIElements/TextInput");
const AnimatedSprite_1 = require("../Nodes/Sprites/AnimatedSprite");
const Vec2_1 = require("../DataTypes/Vec2");
const Line_1 = require("../Nodes/Graphics/Line");
const Debug_1 = require("../Debug/Debug");
/**
 * An implementation of the RenderingManager class using CanvasRenderingContext2D.
 */
class CanvasRenderer extends RenderingManager_1.default {
    constructor() {
        super();
    }
    // @override
    setScene(scene) {
        this.scene = scene;
        this.graphicRenderer.setScene(scene);
        this.tilemapRenderer.setScene(scene);
        this.uiElementRenderer.setScene(scene);
    }
    // @override
    initializeCanvas(canvas, width, height) {
        canvas.width = width;
        canvas.height = height;
        this.worldSize = new Vec2_1.default(width, height);
        this.ctx = canvas.getContext("2d");
        this.graphicRenderer = new GraphicRenderer_1.default(this.ctx);
        this.tilemapRenderer = new TilemapRenderer_1.default(this.ctx);
        this.uiElementRenderer = new UIElementRenderer_1.default(this.ctx);
        // For crisp pixel art
        this.ctx.imageSmoothingEnabled = false;
        return this.ctx;
    }
    // @override
    render(visibleSet, tilemaps, uiLayers) {
        // Sort by depth, then by visible set by y-value
        visibleSet.sort((a, b) => {
            if (a.getLayer().getDepth() === b.getLayer().getDepth()) {
                return (a.boundary.bottom) - (b.boundary.bottom);
            }
            else {
                return a.getLayer().getDepth() - b.getLayer().getDepth();
            }
        });
        let tilemapIndex = 0;
        let tilemapLength = tilemaps.length;
        let visibleSetIndex = 0;
        let visibleSetLength = visibleSet.length;
        while (tilemapIndex < tilemapLength || visibleSetIndex < visibleSetLength) {
            // Check conditions where we've already reached the edge of one list
            if (tilemapIndex >= tilemapLength) {
                // Only render the remaining visible set
                let node = visibleSet[visibleSetIndex++];
                if (node.visible) {
                    this.renderNode(node);
                }
                continue;
            }
            if (visibleSetIndex >= visibleSetLength) {
                // Only render tilemaps
                this.renderTilemap(tilemaps[tilemapIndex++]);
                continue;
            }
            // Render whichever is further down
            if (tilemaps[tilemapIndex].getLayer().getDepth() <= visibleSet[visibleSetIndex].getLayer().getDepth()) {
                this.renderTilemap(tilemaps[tilemapIndex++]);
            }
            else {
                let node = visibleSet[visibleSetIndex++];
                if (node.visible) {
                    this.renderNode(node);
                }
            }
        }
        // Render the uiLayers on top of everything else
        let sortedUILayers = new Array();
        uiLayers.forEach(key => sortedUILayers.push(uiLayers.get(key)));
        sortedUILayers = sortedUILayers.sort((ui1, ui2) => ui1.getDepth() - ui2.getDepth());
        sortedUILayers.forEach(uiLayer => {
            if (!uiLayer.isHidden())
                uiLayer.getItems().forEach(node => {
                    if (node.visible) {
                        this.renderNode(node);
                    }
                });
        });
    }
    /**
     * Renders a specified CanvasNode
     * @param node The CanvasNode to render
     */
    renderNode(node) {
        // Calculate the origin of the viewport according to this sprite
        this.origin = this.scene.getViewTranslation(node);
        // Get the zoom level of the scene
        this.zoom = this.scene.getViewScale();
        // Move the canvas to the position of the node and rotate
        let xScale = 1;
        let yScale = 1;
        if (node instanceof Sprite_1.default) {
            xScale = node.invertX ? -1 : 1;
            yScale = node.invertY ? -1 : 1;
        }
        this.ctx.setTransform(xScale, 0, 0, yScale, (node.position.x - this.origin.x) * this.zoom, (node.position.y - this.origin.y) * this.zoom);
        this.ctx.rotate(-node.rotation);
        let globalAlpha = this.ctx.globalAlpha;
        if (node instanceof Rect_1.default) {
            Debug_1.default.log("node" + node.id, "Node" + node.id + " Alpha: " + node.alpha);
        }
        this.ctx.globalAlpha = node.alpha;
        if (node instanceof AnimatedSprite_1.default) {
            this.renderAnimatedSprite(node);
        }
        else if (node instanceof Sprite_1.default) {
            this.renderSprite(node);
        }
        else if (node instanceof Graphic_1.default) {
            this.renderGraphic(node);
        }
        else if (node instanceof UIElement_1.default) {
            this.renderUIElement(node);
        }
        this.ctx.globalAlpha = globalAlpha;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    // @override
    renderSprite(sprite) {
        // Get the image from the resource manager
        let image = this.resourceManager.getImage(sprite.imageId);
        /*
            Coordinates in the space of the image:
                image crop start -> x, y
                image crop size  -> w, h
            Coordinates in the space of the world
                image draw start -> x, y
                image draw size  -> w, h
        */
        this.ctx.drawImage(image, sprite.imageOffset.x, sprite.imageOffset.y, sprite.size.x, sprite.size.y, (-sprite.size.x * sprite.scale.x / 2) * this.zoom, (-sprite.size.y * sprite.scale.y / 2) * this.zoom, sprite.size.x * sprite.scale.x * this.zoom, sprite.size.y * sprite.scale.y * this.zoom);
    }
    // @override
    renderAnimatedSprite(sprite) {
        // Get the image from the resource manager
        let image = this.resourceManager.getImage(sprite.imageId);
        let animationIndex = sprite.animation.getIndexAndAdvanceAnimation();
        let animationOffset = sprite.getAnimationOffset(animationIndex);
        /*
            Coordinates in the space of the image:
                image crop start -> x, y
                image crop size  -> w, h
            Coordinates in the space of the world (given we moved)
                image draw start -> -w/2, -h/2
                image draw size  -> w, h
        */
        this.ctx.drawImage(image, sprite.imageOffset.x + animationOffset.x, sprite.imageOffset.y + animationOffset.y, sprite.size.x, sprite.size.y, (-sprite.size.x * sprite.scale.x / 2) * this.zoom, (-sprite.size.y * sprite.scale.y / 2) * this.zoom, sprite.size.x * sprite.scale.x * this.zoom, sprite.size.y * sprite.scale.y * this.zoom);
    }
    // @override
    renderGraphic(graphic) {
        if (graphic instanceof Point_1.default) {
            this.graphicRenderer.renderPoint(graphic, this.zoom);
        }
        else if (graphic instanceof Line_1.default) {
            this.graphicRenderer.renderLine(graphic, this.origin, this.zoom);
        }
        else if (graphic instanceof Rect_1.default) {
            this.graphicRenderer.renderRect(graphic, this.zoom);
        }
    }
    // @override
    renderTilemap(tilemap) {
        if (tilemap instanceof OrthogonalTilemap_1.default) {
            this.tilemapRenderer.renderOrthogonalTilemap(tilemap);
        }
    }
    // @override
    renderUIElement(uiElement) {
        if (uiElement instanceof Label_1.default) {
            this.uiElementRenderer.renderLabel(uiElement);
        }
        else if (uiElement instanceof Button_1.default) {
            this.uiElementRenderer.renderButton(uiElement);
        }
        else if (uiElement instanceof Slider_1.default) {
            this.uiElementRenderer.renderSlider(uiElement);
        }
        else if (uiElement instanceof TextInput_1.default) {
            this.uiElementRenderer.renderTextInput(uiElement);
        }
    }
    clear(clearColor) {
        this.ctx.clearRect(0, 0, this.worldSize.x, this.worldSize.y);
        this.ctx.fillStyle = clearColor.toString();
        this.ctx.fillRect(0, 0, this.worldSize.x, this.worldSize.y);
    }
}
exports.default = CanvasRenderer;
},{"../DataTypes/Vec2":111,"../Debug/Debug":112,"../Nodes/Graphic":128,"../Nodes/Graphics/Line":130,"../Nodes/Graphics/Point":131,"../Nodes/Graphics/Rect":132,"../Nodes/Sprites/AnimatedSprite":133,"../Nodes/Sprites/Sprite":134,"../Nodes/Tilemaps/OrthogonalTilemap":136,"../Nodes/UIElement":137,"../Nodes/UIElements/Button":138,"../Nodes/UIElements/Label":139,"../Nodes/UIElements/Slider":140,"../Nodes/UIElements/TextInput":141,"./CanvasRendering/GraphicRenderer":157,"./CanvasRendering/TilemapRenderer":158,"./CanvasRendering/UIElementRenderer":159,"./RenderingManager":160}],157:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ResourceManager_1 = require("../../ResourceManager/ResourceManager");
/**
 * A utility class to help the @reference[CanvasRenderer] render @reference[Graphic]s
 */
class GraphicRenderer {
    constructor(ctx) {
        this.resourceManager = ResourceManager_1.default.getInstance();
        this.ctx = ctx;
    }
    /**
     * Sets the scene of this GraphicRenderer
     * @param scene The current scene
     */
    setScene(scene) {
        this.scene = scene;
    }
    /**
     * Renders a point
     * @param point The point to render
     * @param zoom The zoom level
     */
    renderPoint(point, zoom) {
        this.ctx.fillStyle = point.color.toStringRGBA();
        this.ctx.fillRect((-point.size.x / 2) * zoom, (-point.size.y / 2) * zoom, point.size.x * zoom, point.size.y * zoom);
    }
    renderLine(line, origin, zoom) {
        this.ctx.strokeStyle = line.color.toStringRGBA();
        this.ctx.lineWidth = line.thickness;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo((line.end.x - line.start.x) * zoom, (line.end.y - line.start.y) * zoom);
        this.ctx.closePath();
        this.ctx.stroke();
    }
    /**
     * Renders a rect
     * @param rect The rect to render
     * @param zoom The zoom level
     */
    renderRect(rect, zoom) {
        // Draw the interior of the rect
        if (rect.color.a !== 0) {
            this.ctx.fillStyle = rect.color.toStringRGB();
            this.ctx.fillRect((-rect.size.x / 2) * zoom, (-rect.size.y / 2) * zoom, rect.size.x * zoom, rect.size.y * zoom);
        }
        // Draw the border of the rect if it isn't transparent
        if (rect.borderColor.a !== 0) {
            this.ctx.strokeStyle = rect.getBorderColor().toStringRGB();
            this.ctx.lineWidth = rect.getBorderWidth();
            this.ctx.strokeRect((-rect.size.x / 2) * zoom, (-rect.size.y / 2) * zoom, rect.size.x * zoom, rect.size.y * zoom);
        }
    }
}
exports.default = GraphicRenderer;
},{"../../ResourceManager/ResourceManager":168}],158:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ResourceManager_1 = require("../../ResourceManager/ResourceManager");
const Vec2_1 = require("../../DataTypes/Vec2");
/**
 * A utility class for the @reference[CanvasRenderer] to render @reference[Tilemap]s
 */
class TilemapRenderer {
    constructor(ctx) {
        this.resourceManager = ResourceManager_1.default.getInstance();
        this.ctx = ctx;
    }
    /**
     * Sets the scene of this TilemapRenderer
     * @param scene The current scene
     */
    setScene(scene) {
        this.scene = scene;
    }
    /**
     * Renders an orthogonal tilemap
     * @param tilemap The tilemap to render
     */
    renderOrthogonalTilemap(tilemap) {
        let previousAlpha = this.ctx.globalAlpha;
        this.ctx.globalAlpha = tilemap.getLayer().getAlpha();
        let origin = this.scene.getViewTranslation(tilemap);
        let size = this.scene.getViewport().getHalfSize();
        let zoom = this.scene.getViewScale();
        let bottomRight = origin.clone().add(size.scaled(2 * zoom));
        if (tilemap.visible) {
            let minColRow = tilemap.getColRowAt(origin);
            let maxColRow = tilemap.getColRowAt(bottomRight);
            for (let x = minColRow.x; x <= maxColRow.x; x++) {
                for (let y = minColRow.y; y <= maxColRow.y; y++) {
                    // Get the tile at this position
                    let tile = tilemap.getTileAtRowCol(new Vec2_1.default(x, y));
                    // Extract the rot/flip parameters if there are any
                    const mask = (0xE << 28);
                    const rotFlip = ((mask & tile) >> 28) & 0xF;
                    tile = tile & ~mask;
                    // Find the tileset that owns this tile index and render
                    for (let tileset of tilemap.getTilesets()) {
                        if (tileset.hasTile(tile)) {
                            this.renderTile(tileset, tile, x, y, origin, tilemap.scale, zoom, rotFlip);
                        }
                    }
                }
            }
        }
        this.ctx.globalAlpha = previousAlpha;
    }
    /**
     * Renders a tile
     * @param tileset The tileset this tile belongs to
     * @param tileIndex The index of the tile
     * @param tilemapRow The row of the tile in the tilemap
     * @param tilemapCol The column of the tile in the tilemap
     * @param origin The origin of the viewport
     * @param scale The scale of the tilemap
     * @param zoom The zoom level of the viewport
     */
    renderTile(tileset, tileIndex, tilemapRow, tilemapCol, origin, scale, zoom, rotFlip) {
        let image = this.resourceManager.getImage(tileset.getImageKey());
        // Get the true index
        let index = tileIndex - tileset.getStartIndex();
        // Get the row and col of the tile in image space
        let row = Math.floor(index / tileset.getNumCols());
        let col = index % tileset.getNumCols();
        let width = tileset.getTileSize().x;
        let height = tileset.getTileSize().y;
        // Calculate the position to start a crop in the tileset image
        let left = col * width;
        let top = row * height;
        // Calculate the position in the world to render the tile
        let x = Math.floor(tilemapRow * width * scale.x);
        let y = Math.floor(tilemapCol * height * scale.y);
        let worldX = Math.floor((x - origin.x) * zoom);
        let worldY = Math.floor((y - origin.y) * zoom);
        let worldWidth = Math.ceil(width * scale.x * zoom);
        let worldHeight = Math.ceil(height * scale.y * zoom);
        if (rotFlip !== 0) {
            let scaleX = 1;
            let scaleY = 1;
            let shearX = 0;
            let shearY = 0;
            // Flip on the x-axis
            if (rotFlip & 8) {
                scaleX = -1;
            }
            // Flip on the y-axis
            if (rotFlip & 4) {
                scaleY = -1;
            }
            // Flip over the line y=x
            if (rotFlip & 2) {
                shearX = scaleY;
                shearY = scaleX;
                scaleX = 0;
                scaleY = 0;
            }
            this.ctx.setTransform(scaleX, shearX, shearY, scaleY, worldX + worldWidth / 2, worldY + worldHeight / 2);
            // Render the tile
            this.ctx.drawImage(image, left, top, width, height, -worldWidth / 2, -worldHeight / 2, worldWidth, worldHeight);
            if (rotFlip !== 0) {
                this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            }
        }
        else {
            // No rotations, don't do the calculations, just render the tile
            // Render the tile
            this.ctx.drawImage(image, left, top, width, height, worldX, worldY, worldWidth, worldHeight);
        }
    }
}
exports.default = TilemapRenderer;
},{"../../DataTypes/Vec2":111,"../../ResourceManager/ResourceManager":168}],159:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("../../DataTypes/Vec2");
const ResourceManager_1 = require("../../ResourceManager/ResourceManager");
const MathUtils_1 = require("../../Utils/MathUtils");
/**
 * A utility class to help the @reference[CanvasRenderer] render @reference[UIElement]s
 */
class UIElementRenderer {
    constructor(ctx) {
        this.resourceManager = ResourceManager_1.default.getInstance();
        this.ctx = ctx;
    }
    /**
     * Sets the scene of this UIElementRenderer
     * @param scene The current scene
     */
    setScene(scene) {
        this.scene = scene;
    }
    /**
     * Renders a label
     * @param label The label to render
     */
    renderLabel(label) {
        // If the size is unassigned (by the user or automatically) assign it
        label.handleInitialSizing(this.ctx);
        // Grab the global alpha so we can adjust it for this render
        let previousAlpha = this.ctx.globalAlpha;
        // Get the font and text position in label
        this.ctx.font = label.getFontString();
        let offset = label.calculateTextOffset(this.ctx);
        // Stroke and fill a rounded rect and give it text
        this.ctx.globalAlpha = label.backgroundColor.a;
        this.ctx.fillStyle = label.calculateBackgroundColor().toStringRGBA();
        this.ctx.fillRoundedRect(-label.size.x / 2, -label.size.y / 2, label.size.x, label.size.y, label.borderRadius);
        this.ctx.strokeStyle = label.calculateBorderColor().toStringRGBA();
        this.ctx.globalAlpha = label.borderColor.a;
        this.ctx.lineWidth = label.borderWidth;
        this.ctx.strokeRoundedRect(-label.size.x / 2, -label.size.y / 2, label.size.x, label.size.y, label.borderRadius);
        this.ctx.fillStyle = label.calculateTextColor();
        this.ctx.globalAlpha = label.textColor.a;
        this.ctx.fillText(label.text, offset.x - label.size.x / 2, offset.y - label.size.y / 2);
        this.ctx.globalAlpha = previousAlpha;
    }
    /**
     * Renders a button
     * @param button The button to render
     */
    renderButton(button) {
        this.renderLabel(button);
    }
    /**
     * Renders a slider
     * @param slider The slider to render
     */
    renderSlider(slider) {
        // Grab the global alpha so we can adjust it for this render
        let previousAlpha = this.ctx.globalAlpha;
        this.ctx.globalAlpha = slider.getLayer().getAlpha();
        // Calcualate the slider size
        let sliderSize = new Vec2_1.default(slider.size.x, 2);
        // Draw the slider
        this.ctx.fillStyle = slider.sliderColor.toString();
        this.ctx.fillRoundedRect(-sliderSize.x / 2, -sliderSize.y / 2, sliderSize.x, sliderSize.y, slider.borderRadius);
        // Calculate the nib size and position
        let x = MathUtils_1.default.lerp(-slider.size.x / 2, slider.size.x / 2, slider.getValue());
        // Draw the nib
        this.ctx.fillStyle = slider.nibColor.toString();
        this.ctx.fillRoundedRect(x - slider.nibSize.x / 2, -slider.nibSize.y / 2, slider.nibSize.x, slider.nibSize.y, slider.borderRadius);
        // Reset the alpha
        this.ctx.globalAlpha = previousAlpha;
    }
    /**
     * Renders a textInput
     * @param textInput The textInput to render
     */
    renderTextInput(textInput) {
        // Show a cursor sometimes
        if (textInput.focused && textInput.cursorCounter % 60 > 30) {
            textInput.text += "|";
        }
        this.renderLabel(textInput);
        if (textInput.focused) {
            if (textInput.cursorCounter % 60 > 30) {
                textInput.text = textInput.text.substring(0, textInput.text.length - 1);
            }
            textInput.cursorCounter += 1;
            if (textInput.cursorCounter >= 60) {
                textInput.cursorCounter = 0;
            }
        }
    }
}
exports.default = UIElementRenderer;
},{"../../DataTypes/Vec2":111,"../../ResourceManager/ResourceManager":168,"../../Utils/MathUtils":187}],160:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ResourceManager_1 = require("../ResourceManager/ResourceManager");
/**
 * An abstract framework to put all rendering in once place in the application
 */
class RenderingManager {
    constructor() {
        this.resourceManager = ResourceManager_1.default.getInstance();
    }
    /**
     * Sets the scene currently being rendered
     * @param scene The current Scene
     */
    setScene(scene) {
        this.scene = scene;
    }
}
exports.default = RenderingManager;
},{"../ResourceManager/ResourceManager":168}],161:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("../DataTypes/Vec2");
const Graphic_1 = require("../Nodes/Graphic");
const Point_1 = require("../Nodes/Graphics/Point");
const Rect_1 = require("../Nodes/Graphics/Rect");
const AnimatedSprite_1 = require("../Nodes/Sprites/AnimatedSprite");
const Sprite_1 = require("../Nodes/Sprites/Sprite");
const UIElement_1 = require("../Nodes/UIElement");
const Label_1 = require("../Nodes/UIElements/Label");
const ShaderRegistry_1 = require("../Registry/Registries/ShaderRegistry");
const RegistryManager_1 = require("../Registry/RegistryManager");
const ResourceManager_1 = require("../ResourceManager/ResourceManager");
const ParallaxLayer_1 = require("../Scene/Layers/ParallaxLayer");
const RenderingManager_1 = require("./RenderingManager");
class WebGLRenderer extends RenderingManager_1.default {
    initializeCanvas(canvas, width, height) {
        canvas.width = width;
        canvas.height = height;
        this.worldSize = Vec2_1.default.ZERO;
        this.worldSize.x = width;
        this.worldSize.y = height;
        // Get the WebGL context
        this.gl = canvas.getContext("webgl");
        this.gl.viewport(0, 0, canvas.width, canvas.height);
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.enable(this.gl.CULL_FACE);
        // Tell the resource manager we're using WebGL
        ResourceManager_1.default.getInstance().useWebGL(true, this.gl);
        // Show the text canvas and get its context
        let textCanvas = document.getElementById("text-canvas");
        textCanvas.hidden = false;
        this.textCtx = textCanvas.getContext("2d");
        // Size the text canvas to be the same as the game canvas
        textCanvas.height = height;
        textCanvas.width = width;
        return this.gl;
    }
    render(visibleSet, tilemaps, uiLayers) {
        for (let node of visibleSet) {
            this.renderNode(node);
        }
        uiLayers.forEach(key => {
            if (!uiLayers.get(key).isHidden())
                uiLayers.get(key).getItems().forEach(node => this.renderNode(node));
        });
    }
    clear(color) {
        this.gl.clearColor(color.r, color.g, color.b, color.a);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.textCtx.clearRect(0, 0, this.worldSize.x, this.worldSize.y);
    }
    renderNode(node) {
        // Calculate the origin of the viewport according to this sprite
        this.origin = this.scene.getViewTranslation(node);
        // Get the zoom level of the scene
        this.zoom = this.scene.getViewScale();
        if (node.hasCustomShader) {
            // If the node has a custom shader, render using that
            this.renderCustom(node);
        }
        else if (node instanceof Graphic_1.default) {
            this.renderGraphic(node);
        }
        else if (node instanceof Sprite_1.default) {
            if (node instanceof AnimatedSprite_1.default) {
                this.renderAnimatedSprite(node);
            }
            else {
                this.renderSprite(node);
            }
        }
        else if (node instanceof UIElement_1.default) {
            this.renderUIElement(node);
        }
    }
    renderSprite(sprite) {
        let shader = RegistryManager_1.default.shaders.get(ShaderRegistry_1.default.SPRITE_SHADER);
        let options = this.addOptions(shader.getOptions(sprite), sprite);
        shader.render(this.gl, options);
    }
    renderAnimatedSprite(sprite) {
        let shader = RegistryManager_1.default.shaders.get(ShaderRegistry_1.default.SPRITE_SHADER);
        let options = this.addOptions(shader.getOptions(sprite), sprite);
        shader.render(this.gl, options);
    }
    renderGraphic(graphic) {
        if (graphic instanceof Point_1.default) {
            let shader = RegistryManager_1.default.shaders.get(ShaderRegistry_1.default.POINT_SHADER);
            let options = this.addOptions(shader.getOptions(graphic), graphic);
            shader.render(this.gl, options);
        }
        else if (graphic instanceof Rect_1.default) {
            let shader = RegistryManager_1.default.shaders.get(ShaderRegistry_1.default.RECT_SHADER);
            let options = this.addOptions(shader.getOptions(graphic), graphic);
            shader.render(this.gl, options);
        }
    }
    renderTilemap(tilemap) {
        throw new Error("Method not implemented.");
    }
    renderUIElement(uiElement) {
        if (uiElement instanceof Label_1.default) {
            let shader = RegistryManager_1.default.shaders.get(ShaderRegistry_1.default.LABEL_SHADER);
            let options = this.addOptions(shader.getOptions(uiElement), uiElement);
            shader.render(this.gl, options);
            this.textCtx.setTransform(1, 0, 0, 1, (uiElement.position.x - this.origin.x) * this.zoom, (uiElement.position.y - this.origin.y) * this.zoom);
            this.textCtx.rotate(-uiElement.rotation);
            let globalAlpha = this.textCtx.globalAlpha;
            this.textCtx.globalAlpha = uiElement.alpha;
            // Render text
            this.textCtx.font = uiElement.getFontString();
            let offset = uiElement.calculateTextOffset(this.textCtx);
            this.textCtx.fillStyle = uiElement.calculateTextColor();
            this.textCtx.globalAlpha = uiElement.textColor.a;
            this.textCtx.fillText(uiElement.text, offset.x - uiElement.size.x / 2, offset.y - uiElement.size.y / 2);
            this.textCtx.globalAlpha = globalAlpha;
            this.textCtx.setTransform(1, 0, 0, 1, 0, 0);
        }
    }
    renderCustom(node) {
        let shader = RegistryManager_1.default.shaders.get(node.customShaderKey);
        let options = this.addOptions(shader.getOptions(node), node);
        shader.render(this.gl, options);
    }
    addOptions(options, node) {
        // Give the shader access to the world size
        options.worldSize = this.worldSize;
        // Adjust the origin position to the parallax
        let layer = node.getLayer();
        let parallax = new Vec2_1.default(1, 1);
        if (layer instanceof ParallaxLayer_1.default) {
            parallax = layer.parallax;
        }
        options.origin = this.origin.clone().mult(parallax);
        return options;
    }
}
exports.default = WebGLRenderer;
},{"../DataTypes/Vec2":111,"../Nodes/Graphic":128,"../Nodes/Graphics/Point":131,"../Nodes/Graphics/Rect":132,"../Nodes/Sprites/AnimatedSprite":133,"../Nodes/Sprites/Sprite":134,"../Nodes/UIElement":137,"../Nodes/UIElements/Label":139,"../Registry/Registries/ShaderRegistry":150,"../Registry/RegistryManager":151,"../ResourceManager/ResourceManager":168,"../Scene/Layers/ParallaxLayer":176,"./RenderingManager":160}],162:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ResourceManager_1 = require("../../ResourceManager/ResourceManager");
/**
 * A wrapper class for WebGL shaders.
 * This class is a singleton, and there is only one for each shader type.
 * All objects that use this shader type will refer to and modify this same type.
 */
class ShaderType {
    constructor(programKey) {
        this.programKey = programKey;
        this.resourceManager = ResourceManager_1.default.getInstance();
    }
    /**
     * Extracts the options from the CanvasNode and gives them to the render function
     * @param node The node to get options from
     * @returns An object containing the options that should be passed to the render function
     */
    getOptions(node) { return {}; }
}
exports.default = ShaderType;
},{"../../ResourceManager/ResourceManager":168}],163:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Mat4x4_1 = require("../../../DataTypes/Mat4x4");
const Vec2_1 = require("../../../DataTypes/Vec2");
const ResourceManager_1 = require("../../../ResourceManager/ResourceManager");
const QuadShaderType_1 = require("./QuadShaderType");
class LabelShaderType extends QuadShaderType_1.default {
    constructor(programKey) {
        super(programKey);
        this.resourceManager = ResourceManager_1.default.getInstance();
    }
    initBufferObject() {
        this.bufferObjectKey = "label";
        this.resourceManager.createBuffer(this.bufferObjectKey);
    }
    render(gl, options) {
        const backgroundColor = options.backgroundColor.toWebGL();
        const borderColor = options.borderColor.toWebGL();
        const program = this.resourceManager.getShaderProgram(this.programKey);
        const buffer = this.resourceManager.getBuffer(this.bufferObjectKey);
        gl.useProgram(program);
        const vertexData = this.getVertices(options.size.x, options.size.y);
        const FSIZE = vertexData.BYTES_PER_ELEMENT;
        // Bind the buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
        // Attributes
        const a_Position = gl.getAttribLocation(program, "a_Position");
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 2 * FSIZE, 0 * FSIZE);
        gl.enableVertexAttribArray(a_Position);
        // Uniforms
        const u_BackgroundColor = gl.getUniformLocation(program, "u_BackgroundColor");
        gl.uniform4fv(u_BackgroundColor, backgroundColor);
        const u_BorderColor = gl.getUniformLocation(program, "u_BorderColor");
        gl.uniform4fv(u_BorderColor, borderColor);
        const u_MaxSize = gl.getUniformLocation(program, "u_MaxSize");
        gl.uniform2f(u_MaxSize, -vertexData[0], vertexData[1]);
        // Get transformation matrix
        // We want a square for our rendering space, so get the maximum dimension of our quad
        let maxDimension = Math.max(options.size.x, options.size.y);
        const u_BorderWidth = gl.getUniformLocation(program, "u_BorderWidth");
        gl.uniform1f(u_BorderWidth, options.borderWidth / maxDimension);
        const u_BorderRadius = gl.getUniformLocation(program, "u_BorderRadius");
        gl.uniform1f(u_BorderRadius, options.borderRadius / maxDimension);
        // The size of the rendering space will be a square with this maximum dimension
        let size = new Vec2_1.default(maxDimension, maxDimension).scale(2 / options.worldSize.x, 2 / options.worldSize.y);
        // Center our translations around (0, 0)
        const translateX = (options.position.x - options.origin.x - options.worldSize.x / 2) / maxDimension;
        const translateY = -(options.position.y - options.origin.y - options.worldSize.y / 2) / maxDimension;
        // Create our transformation matrix
        this.translation.translate(new Float32Array([translateX, translateY]));
        this.scale.scale(size);
        this.rotation.rotate(options.rotation);
        let transformation = Mat4x4_1.default.MULT(this.translation, this.scale, this.rotation);
        // Pass the translation matrix to our shader
        const u_Transform = gl.getUniformLocation(program, "u_Transform");
        gl.uniformMatrix4fv(u_Transform, false, transformation.toArray());
        // Draw the quad
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    /**
     * The rendering space always has to be a square, so make sure its square w.r.t to the largest dimension
     * @param w The width of the quad in pixels
     * @param h The height of the quad in pixels
     * @returns An array of the vertices of the quad
     */
    getVertices(w, h) {
        let x, y;
        if (h > w) {
            y = 0.5;
            x = w / (2 * h);
        }
        else {
            x = 0.5;
            y = h / (2 * w);
        }
        return new Float32Array([
            -x, y,
            -x, -y,
            x, y,
            x, -y
        ]);
    }
    getOptions(rect) {
        let options = {
            position: rect.position,
            backgroundColor: rect.calculateBackgroundColor(),
            borderColor: rect.calculateBorderColor(),
            borderWidth: rect.borderWidth,
            borderRadius: rect.borderRadius,
            size: rect.size,
            rotation: rect.rotation
        };
        return options;
    }
}
exports.default = LabelShaderType;
},{"../../../DataTypes/Mat4x4":99,"../../../DataTypes/Vec2":111,"../../../ResourceManager/ResourceManager":168,"./QuadShaderType":165}],164:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RenderingUtils_1 = require("../../../Utils/RenderingUtils");
const ShaderType_1 = require("../ShaderType");
class PointShaderType extends ShaderType_1.default {
    constructor(programKey) {
        super(programKey);
    }
    initBufferObject() {
        this.bufferObjectKey = "point";
        this.resourceManager.createBuffer(this.bufferObjectKey);
    }
    render(gl, options) {
        let position = RenderingUtils_1.default.toWebGLCoords(options.position, options.origin, options.worldSize);
        let color = RenderingUtils_1.default.toWebGLColor(options.color);
        const program = this.resourceManager.getShaderProgram(this.programKey);
        const buffer = this.resourceManager.getBuffer(this.bufferObjectKey);
        gl.useProgram(program);
        const vertexData = position;
        const FSIZE = vertexData.BYTES_PER_ELEMENT;
        // Bind the buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
        // Attributes
        const a_Position = gl.getAttribLocation(program, "a_Position");
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 2 * FSIZE, 0 * FSIZE);
        gl.enableVertexAttribArray(a_Position);
        // Uniforms
        const u_Color = gl.getUniformLocation(program, "u_Color");
        gl.uniform4fv(u_Color, color);
        const u_PointSize = gl.getUniformLocation(program, "u_PointSize");
        gl.uniform1f(u_PointSize, options.pointSize);
        gl.drawArrays(gl.POINTS, 0, 1);
    }
    getOptions(point) {
        let options = {
            position: point.position,
            color: point.color,
            pointSize: point.size,
        };
        return options;
    }
}
exports.default = PointShaderType;
},{"../../../Utils/RenderingUtils":188,"../ShaderType":162}],165:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Mat4x4_1 = require("../../../DataTypes/Mat4x4");
const ShaderType_1 = require("../ShaderType");
/** Represents any WebGL objects that have a quad mesh (i.e. a rectangular game object composed of only two triangles) */
class QuadShaderType extends ShaderType_1.default {
    constructor(programKey) {
        super(programKey);
        this.scale = Mat4x4_1.default.IDENTITY;
        this.rotation = Mat4x4_1.default.IDENTITY;
        this.translation = Mat4x4_1.default.IDENTITY;
    }
}
exports.default = QuadShaderType;
},{"../../../DataTypes/Mat4x4":99,"../ShaderType":162}],166:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Mat4x4_1 = require("../../../DataTypes/Mat4x4");
const Vec2_1 = require("../../../DataTypes/Vec2");
const ResourceManager_1 = require("../../../ResourceManager/ResourceManager");
const QuadShaderType_1 = require("./QuadShaderType");
class RectShaderType extends QuadShaderType_1.default {
    constructor(programKey) {
        super(programKey);
        this.resourceManager = ResourceManager_1.default.getInstance();
    }
    initBufferObject() {
        this.bufferObjectKey = "rect";
        this.resourceManager.createBuffer(this.bufferObjectKey);
    }
    render(gl, options) {
        const color = options.color.toWebGL();
        const program = this.resourceManager.getShaderProgram(this.programKey);
        const buffer = this.resourceManager.getBuffer(this.bufferObjectKey);
        gl.useProgram(program);
        const vertexData = this.getVertices(options.size.x, options.size.y);
        const FSIZE = vertexData.BYTES_PER_ELEMENT;
        // Bind the buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
        // Attributes
        const a_Position = gl.getAttribLocation(program, "a_Position");
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 2 * FSIZE, 0 * FSIZE);
        gl.enableVertexAttribArray(a_Position);
        // Uniforms
        const u_Color = gl.getUniformLocation(program, "u_Color");
        gl.uniform4fv(u_Color, color);
        // Get transformation matrix
        // We want a square for our rendering space, so get the maximum dimension of our quad
        let maxDimension = Math.max(options.size.x, options.size.y);
        // The size of the rendering space will be a square with this maximum dimension
        let size = new Vec2_1.default(maxDimension, maxDimension).scale(2 / options.worldSize.x, 2 / options.worldSize.y);
        // Center our translations around (0, 0)
        const translateX = (options.position.x - options.origin.x - options.worldSize.x / 2) / maxDimension;
        const translateY = -(options.position.y - options.origin.y - options.worldSize.y / 2) / maxDimension;
        // Create our transformation matrix
        this.translation.translate(new Float32Array([translateX, translateY]));
        this.scale.scale(size);
        this.rotation.rotate(options.rotation);
        let transformation = Mat4x4_1.default.MULT(this.translation, this.scale, this.rotation);
        // Pass the translation matrix to our shader
        const u_Transform = gl.getUniformLocation(program, "u_Transform");
        gl.uniformMatrix4fv(u_Transform, false, transformation.toArray());
        // Draw the quad
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    /*
        So as it turns out, WebGL has an issue with non-square quads.
        It doesn't like when you don't have a 1-1 scale, and rotations are entirely messed up if this is not the case.
        To solve this, I used the scale of the LARGEST dimension of the quad to make a square, then adjusted the vertex coordinates inside of that.
        A diagram of the solution follows.

        There is a bounding square for the quad with dimensions hxh (in this case, since height is the largest dimension).
        The offset in the vertical direction is therefore 0.5, as it is normally.
        However, the offset in the horizontal direction is not so straightforward, but isn't conceptually hard.
        All we really have to do is a range change from [0, height/2] to [0, 0.5], where our value is t = width/2, and 0 <= t <= height/2.

        So now we have our rect, in a space scaled with respect to the largest dimension.
        Rotations work as you would expect, even for long rectangles.

                    0.5
            __ __ __ __ __ __ __
            |	|88888888888|	|
            |	|88888888888|	|
            |	|88888888888|	|
        -0.5|_ _|88888888888|_ _|0.5
            |	|88888888888|	|
            |	|88888888888|	|
            |	|88888888888|	|
            |___|88888888888|___|
                    -0.5

        The getVertices function below does as described, and converts the range
    */
    /**
     * The rendering space always has to be a square, so make sure its square w.r.t to the largest dimension
     * @param w The width of the quad in pixels
     * @param h The height of the quad in pixels
     * @returns An array of the vertices of the quad
     */
    getVertices(w, h) {
        let x, y;
        if (h > w) {
            y = 0.5;
            x = w / (2 * h);
        }
        else {
            x = 0.5;
            y = h / (2 * w);
        }
        return new Float32Array([
            -x, y,
            -x, -y,
            x, y,
            x, -y
        ]);
    }
    getOptions(rect) {
        let options = {
            position: rect.position,
            color: rect.color,
            size: rect.size,
            rotation: rect.rotation
        };
        return options;
    }
}
exports.default = RectShaderType;
},{"../../../DataTypes/Mat4x4":99,"../../../DataTypes/Vec2":111,"../../../ResourceManager/ResourceManager":168,"./QuadShaderType":165}],167:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Mat4x4_1 = require("../../../DataTypes/Mat4x4");
const Vec2_1 = require("../../../DataTypes/Vec2");
const AnimatedSprite_1 = require("../../../Nodes/Sprites/AnimatedSprite");
const ResourceManager_1 = require("../../../ResourceManager/ResourceManager");
const QuadShaderType_1 = require("./QuadShaderType");
/** A shader for sprites and animated sprites */
class SpriteShaderType extends QuadShaderType_1.default {
    constructor(programKey) {
        super(programKey);
        this.resourceManager = ResourceManager_1.default.getInstance();
    }
    initBufferObject() {
        this.bufferObjectKey = "sprite";
        this.resourceManager.createBuffer(this.bufferObjectKey);
    }
    render(gl, options) {
        const program = this.resourceManager.getShaderProgram(this.programKey);
        const buffer = this.resourceManager.getBuffer(this.bufferObjectKey);
        const texture = this.resourceManager.getTexture(options.imageKey);
        gl.useProgram(program);
        const vertexData = this.getVertices(options.size.x, options.size.y, options.scale);
        const FSIZE = vertexData.BYTES_PER_ELEMENT;
        // Bind the buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
        // Attributes
        const a_Position = gl.getAttribLocation(program, "a_Position");
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 4 * FSIZE, 0 * FSIZE);
        gl.enableVertexAttribArray(a_Position);
        const a_TexCoord = gl.getAttribLocation(program, "a_TexCoord");
        gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 4 * FSIZE, 2 * FSIZE);
        gl.enableVertexAttribArray(a_TexCoord);
        // Uniforms
        // Get transformation matrix
        // We want a square for our rendering space, so get the maximum dimension of our quad
        let maxDimension = Math.max(options.size.x, options.size.y);
        // The size of the rendering space will be a square with this maximum dimension
        let size = new Vec2_1.default(maxDimension, maxDimension).scale(2 / options.worldSize.x, 2 / options.worldSize.y);
        // Center our translations around (0, 0)
        const translateX = (options.position.x - options.origin.x - options.worldSize.x / 2) / maxDimension;
        const translateY = -(options.position.y - options.origin.y - options.worldSize.y / 2) / maxDimension;
        // Create our transformation matrix
        this.translation.translate(new Float32Array([translateX, translateY]));
        this.scale.scale(size);
        this.rotation.rotate(options.rotation);
        let transformation = Mat4x4_1.default.MULT(this.translation, this.scale, this.rotation);
        // Pass the translation matrix to our shader
        const u_Transform = gl.getUniformLocation(program, "u_Transform");
        gl.uniformMatrix4fv(u_Transform, false, transformation.toArray());
        // Set up our sampler with our assigned texture unit
        const u_Sampler = gl.getUniformLocation(program, "u_Sampler");
        gl.uniform1i(u_Sampler, texture);
        // Pass in texShift
        const u_texShift = gl.getUniformLocation(program, "u_texShift");
        gl.uniform2fv(u_texShift, options.texShift);
        // Pass in texScale
        const u_texScale = gl.getUniformLocation(program, "u_texScale");
        gl.uniform2fv(u_texScale, options.texScale);
        // Draw the quad
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    /**
     * The rendering space always has to be a square, so make sure its square w.r.t to the largest dimension
     * @param w The width of the quad in pixels
     * @param h The height of the quad in pixels
     * @returns An array of the vertices of the quad
     */
    getVertices(w, h, scale) {
        let x, y;
        if (h > w) {
            y = 0.5;
            x = w / (2 * h);
        }
        else {
            x = 0.5;
            y = h / (2 * w);
        }
        // Scale the rendering space if needed
        x *= scale[0];
        y *= scale[1];
        return new Float32Array([
            -x, y, 0.0, 0.0,
            -x, -y, 0.0, 1.0,
            x, y, 1.0, 0.0,
            x, -y, 1.0, 1.0
        ]);
    }
    getOptions(sprite) {
        let texShift;
        let texScale;
        if (sprite instanceof AnimatedSprite_1.default) {
            let animationIndex = sprite.animation.getIndexAndAdvanceAnimation();
            let offset = sprite.getAnimationOffset(animationIndex);
            texShift = new Float32Array([offset.x / (sprite.cols * sprite.size.x), offset.y / (sprite.rows * sprite.size.y)]);
            texScale = new Float32Array([1 / (sprite.cols), 1 / (sprite.rows)]);
        }
        else {
            texShift = new Float32Array([0, 0]);
            texScale = new Float32Array([1, 1]);
        }
        let options = {
            position: sprite.position,
            rotation: sprite.rotation,
            size: sprite.size,
            scale: sprite.scale.toArray(),
            imageKey: sprite.imageId,
            texShift,
            texScale
        };
        return options;
    }
}
exports.default = SpriteShaderType;
},{"../../../DataTypes/Mat4x4":99,"../../../DataTypes/Vec2":111,"../../../Nodes/Sprites/AnimatedSprite":133,"../../../ResourceManager/ResourceManager":168,"./QuadShaderType":165}],168:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Map_1 = require("../DataTypes/Map");
const Queue_1 = require("../DataTypes/Queue");
const StringUtils_1 = require("../Utils/StringUtils");
const AudioManager_1 = require("../Sound/AudioManager");
const WebGLProgramType_1 = require("../DataTypes/Rendering/WebGLProgramType");
/**
 * The resource manager for the game engine.
 * The resource manager interfaces with the loadable assets of a game such as images, data files,
 * and sounds, which are all found in the dist folder.
 * This class controls loading and updates the @reference[Scene] with the loading progress, so that the scene does
 * not start before all necessary assets are loaded.
 */
class ResourceManager {
    constructor() {
        this.loading = false;
        this.justLoaded = false;
        this.loadonly_imagesLoaded = 0;
        this.loadonly_imagesToLoad = 0;
        this.loadonly_imageLoadingQueue = new Queue_1.default();
        this.images = new Map_1.default();
        this.loadonly_spritesheetsLoaded = 0;
        this.loadonly_spritesheetsToLoad = 0;
        this.loadonly_spritesheetLoadingQueue = new Queue_1.default();
        this.spritesheets = new Map_1.default();
        this.loadonly_tilemapsLoaded = 0;
        this.loadonly_tilemapsToLoad = 0;
        this.loadonly_tilemapLoadingQueue = new Queue_1.default();
        this.tilemaps = new Map_1.default();
        this.loadonly_audioLoaded = 0;
        this.loadonly_audioToLoad = 0;
        this.loadonly_audioLoadingQueue = new Queue_1.default();
        this.audioBuffers = new Map_1.default();
        this.loadonly_jsonLoaded = 0;
        this.loadonly_jsonToLoad = 0;
        this.loadonly_jsonLoadingQueue = new Queue_1.default();
        this.jsonObjects = new Map_1.default();
        this.loadonly_gl_ShaderProgramsLoaded = 0;
        this.loadonly_gl_ShaderProgramsToLoad = 0;
        this.loadonly_gl_ShaderLoadingQueue = new Queue_1.default();
        this.gl_ShaderPrograms = new Map_1.default();
        this.gl_Textures = new Map_1.default();
        this.gl_NextTextureID = 0;
        this.gl_Buffers = new Map_1.default();
        this.resourcesToUnload = new Array();
        this.resourcesToKeep = new Array();
    }
    ;
    /* ######################################## SINGLETON ########################################*/
    /**
     * Returns the current instance of this class or a new instance if none exist
     * @returns The resource manager
     */
    static getInstance() {
        if (!this.instance) {
            this.instance = new ResourceManager();
        }
        return this.instance;
    }
    /* ######################################## PUBLIC FUNCTION ########################################*/
    /**
     * Activates or deactivates the use of WebGL
     * @param flag True if WebGL should be used, false otherwise
     * @param gl The instance of the graphics context, if applicable
     */
    useWebGL(flag, gl) {
        this.gl_WebGLActive = flag;
        if (this.gl_WebGLActive) {
            this.gl = gl;
        }
    }
    /**
     * Loads an image from file
     * @param key The key to associate the loaded image with
     * @param path The path to the image to load
     */
    image(key, path) {
        this.loadonly_imageLoadingQueue.enqueue({ key: key, path: path });
    }
    /**
     * Tells the resource manager to keep this resource
     * @param key The key of the resource
     */
    keepImage(key) {
        this.keepResource(key, ResourceType.IMAGE);
    }
    /**
     * Retrieves a loaded image
     * @param key The key of the loaded image
     * @returns The image element associated with this key
     */
    getImage(key) {
        let image = this.images.get(key);
        if (image === undefined) {
            throw `There is no image associated with key "${key}"`;
        }
        return image;
    }
    /**
     * Loads a spritesheet from file
     * @param key The key to associate the loaded spritesheet with
     * @param path The path to the spritesheet to load
     */
    spritesheet(key, path) {
        this.loadonly_spritesheetLoadingQueue.enqueue({ key: key, path: path });
    }
    /**
     * Tells the resource manager to keep this resource
     * @param key The key of the resource
     */
    keepSpritesheet(key) {
        this.keepResource(key, ResourceType.SPRITESHEET);
    }
    /**
     * Retrieves a loaded spritesheet
     * @param key The key of the spritesheet to load
     * @returns The loaded Spritesheet
     */
    getSpritesheet(key) {
        return this.spritesheets.get(key);
    }
    /**
     * Loads an audio file
     * @param key The key to associate with the loaded audio file
     * @param path The path to the audio file to load
     */
    audio(key, path) {
        this.loadonly_audioLoadingQueue.enqueue({ key: key, path: path });
    }
    /**
     * Tells the resource manager to keep this resource
     * @param key The key of the resource
     */
    keepAudio(key) {
        this.keepResource(key, ResourceType.AUDIO);
    }
    /**
     * Retrieves a loaded audio file
     * @param key The key of the audio file to load
     * @returns The AudioBuffer created from the loaded audio fle
     */
    getAudio(key) {
        return this.audioBuffers.get(key);
    }
    /**
     * Load a tilemap from a json file. Automatically loads related images
     * @param key The key to associate with the loaded tilemap
     * @param path The path to the tilemap to load
     */
    tilemap(key, path) {
        this.loadonly_tilemapLoadingQueue.enqueue({ key: key, path: path });
    }
    /**
     * Tells the resource manager to keep this resource
     * @param key The key of the resource
     */
    keepTilemap(key) {
        this.keepResource(key, ResourceType.TILEMAP);
    }
    /**
     * Retreives a loaded tilemap
     * @param key The key of the loaded tilemap
     * @returns The tilemap data associated with the key
     */
    getTilemap(key) {
        return this.tilemaps.get(key);
    }
    /**
     * Loads an object from a json file.
     * @param key The key to associate with the loaded object
     * @param path The path to the json file to load
     */
    object(key, path) {
        this.loadonly_jsonLoadingQueue.enqueue({ key: key, path: path });
    }
    /**
     * Tells the resource manager to keep this resource
     * @param key The key of the resource
     */
    keepObject(key) {
        this.keepResource(key, ResourceType.JSON);
    }
    /**
     * Retreives a loaded object
     * @param key The key of the loaded object
     * @returns The object data associated with the key
     */
    getObject(key) {
        return this.jsonObjects.get(key);
    }
    /* ######################################## LOAD FUNCTION ########################################*/
    /**
     * Loads all resources currently in the queue
     * @param callback The function to cal when the resources are finished loading
     */
    loadResourcesFromQueue(callback) {
        this.loadonly_typesToLoad = 5;
        this.loading = true;
        // Load everything in the queues. Tilemaps have to come before images because they will add new images to the queue
        this.loadTilemapsFromQueue(() => {
            console.log("Loaded Tilemaps");
            this.loadSpritesheetsFromQueue(() => {
                console.log("Loaded Spritesheets");
                this.loadImagesFromQueue(() => {
                    console.log("Loaded Images");
                    this.loadAudioFromQueue(() => {
                        console.log("Loaded Audio");
                        this.loadObjectsFromQueue(() => {
                            console.log("Loaded Objects");
                            if (this.gl_WebGLActive) {
                                this.gl_LoadShadersFromQueue(() => {
                                    console.log("Loaded Shaders");
                                    this.finishLoading(callback);
                                });
                            }
                            else {
                                this.finishLoading(callback);
                            }
                        });
                    });
                });
            });
        });
    }
    finishLoading(callback) {
        // Done loading
        this.loading = false;
        this.justLoaded = true;
        callback();
    }
    /* ######################################## UNLOAD FUNCTION ########################################*/
    keepResource(key, type) {
        console.log("Keep resource...");
        for (let i = 0; i < this.resourcesToUnload.length; i++) {
            let resource = this.resourcesToUnload[i];
            if (resource.key === key && resource.resourceType === type) {
                console.log("Found resource " + key + " of type " + type + ". Keeping.");
                let resourceToMove = this.resourcesToUnload.splice(i, 1);
                this.resourcesToKeep.push(...resourceToMove);
                return;
            }
        }
    }
    /**
     * Deletes references to all resources in the resource manager
     */
    unloadAllResources() {
        this.loading = false;
        this.justLoaded = false;
        for (let resource of this.resourcesToUnload) {
            // Unload the resource
            this.unloadResource(resource);
        }
    }
    unloadResource(resource) {
        // Delete the resource itself
        switch (resource.resourceType) {
            case ResourceType.IMAGE:
                this.images.delete(resource.key);
                if (this.gl_WebGLActive) {
                    this.gl_Textures.delete(resource.key);
                }
                break;
            case ResourceType.TILEMAP:
                this.tilemaps.delete(resource.key);
                break;
            case ResourceType.SPRITESHEET:
                this.spritesheets.delete(resource.key);
                break;
            case ResourceType.AUDIO:
                this.audioBuffers.delete(resource.key);
                break;
            case ResourceType.JSON:
                this.jsonObjects.delete(resource.key);
                break;
            case ResourceType.SHADER:
                this.gl_ShaderPrograms.get(resource.key).delete(this.gl);
                this.gl_ShaderPrograms.delete(resource.key);
                break;
        }
        // Delete any dependencies
        for (let dependency of resource.dependencies) {
            this.unloadResource(dependency);
        }
    }
    /* ######################################## WORK FUNCTIONS ########################################*/
    /**
     * Loads all tilemaps currently in the tilemap loading queue
     * @param onFinishLoading The function to call when loading is complete
     */
    loadTilemapsFromQueue(onFinishLoading) {
        this.loadonly_tilemapsToLoad = this.loadonly_tilemapLoadingQueue.getSize();
        this.loadonly_tilemapsLoaded = 0;
        // If no items to load, we're finished
        if (this.loadonly_tilemapsToLoad === 0) {
            onFinishLoading();
            return;
        }
        while (this.loadonly_tilemapLoadingQueue.hasItems()) {
            let tilemap = this.loadonly_tilemapLoadingQueue.dequeue();
            this.loadTilemap(tilemap.key, tilemap.path, onFinishLoading);
        }
    }
    /**
     * Loads a singular tilemap
     * @param key The key of the tilemap
     * @param pathToTilemapJSON The path to the tilemap JSON file
     * @param callbackIfLast The function to call if this is the last tilemap to load
     */
    loadTilemap(key, pathToTilemapJSON, callbackIfLast) {
        this.loadTextFile(pathToTilemapJSON, (fileText) => {
            let tilemapObject = JSON.parse(fileText);
            // We can parse the object later - it's much faster than loading
            this.tilemaps.add(key, tilemapObject);
            let resource = new ResourceReference(key, ResourceType.TILEMAP);
            // Grab the tileset images we need to load and add them to the imageloading queue
            for (let tileset of tilemapObject.tilesets) {
                if (tileset.image) {
                    let key = tileset.image;
                    let path = StringUtils_1.default.getPathFromFilePath(pathToTilemapJSON) + key;
                    this.loadonly_imageLoadingQueue.enqueue({ key: key, path: path, isDependency: true });
                    // Add this image as a dependency to the tilemap
                    resource.addDependency(new ResourceReference(key, ResourceType.IMAGE));
                }
                else if (tileset.tiles) {
                    for (let tile of tileset.tiles) {
                        let key = tile.image;
                        let path = StringUtils_1.default.getPathFromFilePath(pathToTilemapJSON) + key;
                        this.loadonly_imageLoadingQueue.enqueue({ key: key, path: path, isDependency: true });
                        // Add this image as a dependency to the tilemap
                        resource.addDependency(new ResourceReference(key, ResourceType.IMAGE));
                    }
                }
            }
            // Add the resource reference to the list of resource to unload
            this.resourcesToUnload.push(resource);
            // Finish loading
            this.finishLoadingTilemap(callbackIfLast);
        });
    }
    /**
     * Finish loading a tilemap. Calls the callback function if this is the last tilemap being loaded
     * @param callback The function to call if this is the last tilemap to load
     */
    finishLoadingTilemap(callback) {
        this.loadonly_tilemapsLoaded += 1;
        if (this.loadonly_tilemapsLoaded === this.loadonly_tilemapsToLoad) {
            // We're done loading tilemaps
            callback();
        }
    }
    /**
     * Loads all spritesheets currently in the spritesheet loading queue
     * @param onFinishLoading The function to call when the spritesheets are done loading
     */
    loadSpritesheetsFromQueue(onFinishLoading) {
        this.loadonly_spritesheetsToLoad = this.loadonly_spritesheetLoadingQueue.getSize();
        this.loadonly_spritesheetsLoaded = 0;
        // If no items to load, we're finished
        if (this.loadonly_spritesheetsToLoad === 0) {
            onFinishLoading();
            return;
        }
        while (this.loadonly_spritesheetLoadingQueue.hasItems()) {
            let spritesheet = this.loadonly_spritesheetLoadingQueue.dequeue();
            this.loadSpritesheet(spritesheet.key, spritesheet.path, onFinishLoading);
        }
    }
    /**
     * Loads a singular spritesheet
     * @param key The key of the spritesheet to load
     * @param pathToSpritesheetJSON The path to the spritesheet JSON file
     * @param callbackIfLast The function to call if this is the last spritesheet
     */
    loadSpritesheet(key, pathToSpritesheetJSON, callbackIfLast) {
        this.loadTextFile(pathToSpritesheetJSON, (fileText) => {
            let spritesheet = JSON.parse(fileText);
            // We can parse the object later - it's much faster than loading
            this.spritesheets.add(key, spritesheet);
            let resource = new ResourceReference(key, ResourceType.SPRITESHEET);
            // Grab the image we need to load and add it to the imageloading queue
            let path = StringUtils_1.default.getPathFromFilePath(pathToSpritesheetJSON) + spritesheet.spriteSheetImage;
            this.loadonly_imageLoadingQueue.enqueue({ key: spritesheet.name, path: path, isDependency: true });
            resource.addDependency(new ResourceReference(spritesheet.name, ResourceType.IMAGE));
            this.resourcesToUnload.push(resource);
            // Finish loading
            this.finishLoadingSpritesheet(callbackIfLast);
        });
    }
    /**
     * Finish loading a spritesheet. Calls the callback function if this is the last spritesheet being loaded
     * @param callback The function to call if this is the last spritesheet to load
     */
    finishLoadingSpritesheet(callback) {
        this.loadonly_spritesheetsLoaded += 1;
        if (this.loadonly_spritesheetsLoaded === this.loadonly_spritesheetsToLoad) {
            // We're done loading spritesheets
            callback();
        }
    }
    /**
     * Loads all images currently in the image loading queue
     * @param onFinishLoading The function to call when there are no more images to load
     */
    loadImagesFromQueue(onFinishLoading) {
        this.loadonly_imagesToLoad = this.loadonly_imageLoadingQueue.getSize();
        this.loadonly_imagesLoaded = 0;
        // If no items to load, we're finished
        if (this.loadonly_imagesToLoad === 0) {
            onFinishLoading();
            return;
        }
        while (this.loadonly_imageLoadingQueue.hasItems()) {
            let image = this.loadonly_imageLoadingQueue.dequeue();
            this.loadImage(image.key, image.path, image.isDependency, onFinishLoading);
        }
    }
    /**
     * Loads a singular image
     * @param key The key of the image to load
     * @param path The path to the image to load
     * @param callbackIfLast The function to call if this is the last image
     */
    loadImage(key, path, isDependency, callbackIfLast) {
        var image = new Image();
        image.onload = () => {
            // Add to loaded images
            this.images.add(key, image);
            // If not a dependency, push it to the unload list. Otherwise it's managed by something else
            if (!isDependency) {
                this.resourcesToUnload.push(new ResourceReference(key, ResourceType.IMAGE));
            }
            // If WebGL is active, create a texture
            if (this.gl_WebGLActive) {
                this.createWebGLTexture(key, image);
            }
            // Finish image load
            this.finishLoadingImage(callbackIfLast);
        };
        image.src = path;
    }
    /**
     * Finish loading an image. If this is the last image, it calls the callback function
     * @param callback The function to call if this is the last image
     */
    finishLoadingImage(callback) {
        this.loadonly_imagesLoaded += 1;
        if (this.loadonly_imagesLoaded === this.loadonly_imagesToLoad) {
            // We're done loading images
            callback();
        }
    }
    /**
     * Loads all audio currently in the tilemap loading queue
     * @param onFinishLoading The function to call when tilemaps are done loading
     */
    loadAudioFromQueue(onFinishLoading) {
        this.loadonly_audioToLoad = this.loadonly_audioLoadingQueue.getSize();
        this.loadonly_audioLoaded = 0;
        // If no items to load, we're finished
        if (this.loadonly_audioToLoad === 0) {
            onFinishLoading();
            return;
        }
        while (this.loadonly_audioLoadingQueue.hasItems()) {
            let audio = this.loadonly_audioLoadingQueue.dequeue();
            this.loadAudio(audio.key, audio.path, onFinishLoading);
        }
    }
    /**
     * Load a singular audio file
     * @param key The key to the audio file to load
     * @param path The path to the audio file to load
     * @param callbackIfLast The function to call if this is the last audio file to load
     */
    loadAudio(key, path, callbackIfLast) {
        let audioCtx = AudioManager_1.default.getInstance().getAudioContext();
        let request = new XMLHttpRequest();
        request.open('GET', path, true);
        request.responseType = 'arraybuffer';
        request.onload = () => {
            audioCtx.decodeAudioData(request.response, (buffer) => {
                // Add to list of audio buffers
                this.audioBuffers.add(key, buffer);
                this.resourcesToUnload.push(new ResourceReference(key, ResourceType.AUDIO));
                // Finish loading sound
                this.finishLoadingAudio(callbackIfLast);
            }, (error) => {
                throw "Error loading sound";
            });
        };
        request.send();
    }
    /**
     * Finish loading an audio file. Calls the callback functon if this is the last audio sample being loaded.
     * @param callback The function to call if this is the last audio file to load
     */
    finishLoadingAudio(callback) {
        this.loadonly_audioLoaded += 1;
        if (this.loadonly_audioLoaded === this.loadonly_audioToLoad) {
            // We're done loading audio
            callback();
        }
    }
    /**
     * Loads all objects currently in the object loading queue
     * @param onFinishLoading The function to call when there are no more objects to load
     */
    loadObjectsFromQueue(onFinishLoading) {
        this.loadonly_jsonToLoad = this.loadonly_jsonLoadingQueue.getSize();
        this.loadonly_jsonLoaded = 0;
        // If no items to load, we're finished
        if (this.loadonly_jsonToLoad === 0) {
            onFinishLoading();
            return;
        }
        while (this.loadonly_jsonLoadingQueue.hasItems()) {
            let obj = this.loadonly_jsonLoadingQueue.dequeue();
            this.loadObject(obj.key, obj.path, onFinishLoading);
        }
    }
    /**
     * Loads a singular object
     * @param key The key of the object to load
     * @param path The path to the object to load
     * @param callbackIfLast The function to call if this is the last object
     */
    loadObject(key, path, callbackIfLast) {
        this.loadTextFile(path, (fileText) => {
            let obj = JSON.parse(fileText);
            this.jsonObjects.add(key, obj);
            this.resourcesToUnload.push(new ResourceReference(key, ResourceType.JSON));
            this.finishLoadingObject(callbackIfLast);
        });
    }
    /**
     * Finish loading an object. If this is the last object, it calls the callback function
     * @param callback The function to call if this is the last object
     */
    finishLoadingObject(callback) {
        this.loadonly_jsonLoaded += 1;
        if (this.loadonly_jsonLoaded === this.loadonly_jsonToLoad) {
            // We're done loading objects
            callback();
        }
    }
    /* ########## WEBGL SPECIFIC FUNCTIONS ########## */
    getTexture(key) {
        return this.gl_Textures.get(key);
    }
    getShaderProgram(key) {
        return this.gl_ShaderPrograms.get(key).program;
    }
    getBuffer(key) {
        return this.gl_Buffers.get(key);
    }
    createWebGLTexture(imageKey, image) {
        // Get the texture ID
        const textureID = this.getTextureID(this.gl_NextTextureID);
        // Create the texture
        const texture = this.gl.createTexture();
        // Set up the texture
        // Enable texture0
        this.gl.activeTexture(textureID);
        // Bind our texture to texture 0
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        // Set the texture parameters
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        // Set the texture image
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
        // Add the texture to our map with the same key as the image
        this.gl_Textures.add(imageKey, this.gl_NextTextureID);
        // Increment the key
        this.gl_NextTextureID += 1;
    }
    getTextureID(id) {
        // Start with 9 cases - this can be expanded if needed, but for the best performance,
        // Textures should be stitched into an atlas
        switch (id) {
            case 0: return this.gl.TEXTURE0;
            case 1: return this.gl.TEXTURE1;
            case 2: return this.gl.TEXTURE2;
            case 3: return this.gl.TEXTURE3;
            case 4: return this.gl.TEXTURE4;
            case 5: return this.gl.TEXTURE5;
            case 6: return this.gl.TEXTURE6;
            case 7: return this.gl.TEXTURE7;
            case 8: return this.gl.TEXTURE8;
            default: return this.gl.TEXTURE9;
        }
    }
    createBuffer(key) {
        if (this.gl_WebGLActive) {
            let buffer = this.gl.createBuffer();
            this.gl_Buffers.add(key, buffer);
        }
    }
    /**
     * Enqueues loading of a new shader program
     * @param key The key of the shader program
     * @param vShaderFilepath
     * @param fShaderFilepath
     */
    shader(key, vShaderFilepath, fShaderFilepath) {
        let splitPath = vShaderFilepath.split(".");
        let end = splitPath[splitPath.length - 1];
        if (end !== "vshader") {
            throw `${vShaderFilepath} is not a valid vertex shader - must end in ".vshader`;
        }
        splitPath = fShaderFilepath.split(".");
        end = splitPath[splitPath.length - 1];
        if (end !== "fshader") {
            throw `${fShaderFilepath} is not a valid vertex shader - must end in ".fshader`;
        }
        let paths = new KeyPath_Shader();
        paths.key = key;
        paths.vpath = vShaderFilepath;
        paths.fpath = fShaderFilepath;
        this.loadonly_gl_ShaderLoadingQueue.enqueue(paths);
    }
    /**
     * Tells the resource manager to keep this resource
     * @param key The key of the resource
     */
    keepShader(key) {
        this.keepResource(key, ResourceType.IMAGE);
    }
    gl_LoadShadersFromQueue(onFinishLoading) {
        this.loadonly_gl_ShaderProgramsToLoad = this.loadonly_gl_ShaderLoadingQueue.getSize();
        this.loadonly_gl_ShaderProgramsLoaded = 0;
        // If webGL isn'active or there are no items to load, we're finished
        if (!this.gl_WebGLActive || this.loadonly_gl_ShaderProgramsToLoad === 0) {
            onFinishLoading();
            return;
        }
        while (this.loadonly_gl_ShaderLoadingQueue.hasItems()) {
            let shader = this.loadonly_gl_ShaderLoadingQueue.dequeue();
            this.gl_LoadShader(shader.key, shader.vpath, shader.fpath, onFinishLoading);
        }
    }
    gl_LoadShader(key, vpath, fpath, callbackIfLast) {
        this.loadTextFile(vpath, (vFileText) => {
            const vShader = vFileText;
            this.loadTextFile(fpath, (fFileText) => {
                const fShader = fFileText;
                // Extract the program and shaders
                const [shaderProgram, vertexShader, fragmentShader] = this.createShaderProgram(vShader, fShader);
                // Create a wrapper type
                const programWrapper = new WebGLProgramType_1.default();
                programWrapper.program = shaderProgram;
                programWrapper.vertexShader = vertexShader;
                programWrapper.fragmentShader = fragmentShader;
                // Add to our map
                this.gl_ShaderPrograms.add(key, programWrapper);
                this.resourcesToUnload.push(new ResourceReference(key, ResourceType.SHADER));
                // Finish loading
                this.gl_FinishLoadingShader(callbackIfLast);
            });
        });
    }
    gl_FinishLoadingShader(callback) {
        this.loadonly_gl_ShaderProgramsLoaded += 1;
        if (this.loadonly_gl_ShaderProgramsLoaded === this.loadonly_gl_ShaderProgramsToLoad) {
            // We're done loading shaders
            callback();
        }
    }
    createShaderProgram(vShaderSource, fShaderSource) {
        const vertexShader = this.loadVertexShader(vShaderSource);
        const fragmentShader = this.loadFragmentShader(fShaderSource);
        if (vertexShader === null || fragmentShader === null) {
            // We had a problem intializing - error
            return null;
        }
        // Create a shader program
        const program = this.gl.createProgram();
        if (!program) {
            // Error creating
            console.warn("Failed to create program");
            return null;
        }
        // Attach our vertex and fragment shader
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        // Link
        this.gl.linkProgram(program);
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            // Error linking
            const error = this.gl.getProgramInfoLog(program);
            console.warn("Failed to link program: " + error);
            // Clean up
            this.gl.deleteProgram(program);
            this.gl.deleteShader(vertexShader);
            this.gl.deleteShader(fragmentShader);
            return null;
        }
        // We successfully create a program
        return [program, vertexShader, fragmentShader];
    }
    loadVertexShader(shaderSource) {
        // Create a new vertex shader
        return this.loadShader(this.gl.VERTEX_SHADER, shaderSource);
    }
    loadFragmentShader(shaderSource) {
        // Create a new fragment shader
        return this.loadShader(this.gl.FRAGMENT_SHADER, shaderSource);
    }
    loadShader(type, shaderSource) {
        const shader = this.gl.createShader(type);
        // If we couldn't create the shader, error
        if (shader === null) {
            console.warn("Unable to create shader");
            return null;
        }
        // Add the source to the shader and compile
        this.gl.shaderSource(shader, shaderSource);
        this.gl.compileShader(shader);
        // Make sure there were no errors during this process
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            // Not compiled - error
            const error = this.gl.getShaderInfoLog(shader);
            console.warn("Failed to compile shader: " + error);
            // Clean up
            this.gl.deleteShader(shader);
            return null;
        }
        // Sucess, so return the shader
        return shader;
    }
    /* ########## GENERAL LOADING FUNCTIONS ########## */
    loadTextFile(textFilePath, callback) {
        let xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', textFilePath, true);
        xobj.onreadystatechange = function () {
            if ((xobj.readyState == 4) && (xobj.status == 200)) {
                callback(xobj.responseText);
            }
        };
        xobj.send(null);
    }
    /* ########## LOADING BAR INFO ########## */
    getLoadPercent() {
        return (this.loadonly_tilemapsLoaded / this.loadonly_tilemapsToLoad
            + this.loadonly_spritesheetsLoaded / this.loadonly_spritesheetsToLoad
            + this.loadonly_imagesLoaded / this.loadonly_imagesToLoad
            + this.loadonly_audioLoaded / this.loadonly_audioToLoad)
            / this.loadonly_typesToLoad;
    }
    update(deltaT) {
        if (this.loading) {
            if (this.onLoadProgress) {
                this.onLoadProgress(this.getLoadPercent());
            }
        }
        else if (this.justLoaded) {
            this.justLoaded = false;
            if (this.onLoadComplete) {
                this.onLoadComplete();
            }
        }
    }
}
exports.default = ResourceManager;
/**
 * A class representing a reference to a resource.
 * This is used for the exemption list to assure assets and their dependencies don't get
 * destroyed if they are still needed.
 */
class ResourceReference {
    constructor(key, resourceType) {
        this.key = key;
        this.resourceType = resourceType;
        this.dependencies = new Array();
    }
    addDependency(resource) {
        this.dependencies.push(resource);
    }
}
var ResourceType;
(function (ResourceType) {
    ResourceType["IMAGE"] = "IMAGE";
    ResourceType["TILEMAP"] = "TILEMAP";
    ResourceType["SPRITESHEET"] = "SPRITESHEET";
    ResourceType["AUDIO"] = "AUDIO";
    ResourceType["JSON"] = "JSON";
    ResourceType["SHADER"] = "SHADER";
})(ResourceType || (ResourceType = {}));
/**
 * A pair representing a key and the path of the resource to load
 */
class KeyPathPair {
    constructor() {
        this.isDependency = false;
    }
}
class KeyPath_Shader {
}
},{"../DataTypes/Map":98,"../DataTypes/Queue":102,"../DataTypes/Rendering/WebGLProgramType":103,"../Sound/AudioManager":181,"../Utils/StringUtils":189}],169:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("../DataTypes/Vec2");
/**
 * An abstract interface of a SceneGraph.
 * Exposes methods for use by other code, but leaves the implementation up to the subclasses.
 * The SceneGraph manages the positions of all GameNodes, and can easily prune a visible set for rendering.
 */
class SceneGraph {
    /**
     * Creates a new SceneGraph
     * @param viewport The viewport
     * @param scene The Scene this SceneGraph belongs to
     */
    constructor(viewport, scene) {
        this.viewport = viewport;
        this.scene = scene;
        this.nodeMap = new Array();
        this.idCounter = 0;
    }
    /**
     * Add a node to the SceneGraph
     * @param node The CanvasNode to add to the SceneGraph
     * @returns The SceneGraph ID of this newly added CanvasNode
     */
    addNode(node) {
        this.nodeMap[node.id] = node;
        this.addNodeSpecific(node, this.idCounter);
        this.idCounter += 1;
        return this.idCounter - 1;
    }
    ;
    /**
     * Removes a node from the SceneGraph
     * @param node The node to remove
     */
    removeNode(node) {
        // Find and remove node in O(n)
        this.nodeMap[node.id] = undefined;
        this.removeNodeSpecific(node, node.id);
    }
    ;
    /**
     * Get a specific node using its id
     * @param id The id of the CanvasNode to retrieve
     * @returns The node with this ID
     */
    getNode(id) {
        return this.nodeMap[id];
    }
    /**
     * Returns the nodes at specific coordinates
     * @param vecOrX The x-coordinate of the position, or the coordinates in a Vec2
     * @param y The y-coordinate of the position
     * @returns An array of nodes found at the position provided
     */
    getNodesAt(vecOrX, y = null) {
        if (vecOrX instanceof Vec2_1.default) {
            return this.getNodesAtCoords(vecOrX.x, vecOrX.y);
        }
        else {
            return this.getNodesAtCoords(vecOrX, y);
        }
    }
    /**
     * Returns all nodes in the SceneGraph
     * @returns An Array containing all nodes in the SceneGraph
     */
    getAllNodes() {
        let arr = new Array();
        for (let i = 0; i < this.nodeMap.length; i++) {
            if (this.nodeMap[i] !== undefined) {
                arr.push(this.nodeMap[i]);
            }
        }
        return arr;
    }
}
exports.default = SceneGraph;
},{"../DataTypes/Vec2":111}],170:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SceneGraph_1 = require("./SceneGraph");
const Stats_1 = require("../Debug/Stats");
/**
 * An implementation of a SceneGraph that simply stored CanvasNodes in an array.
 */
class SceneGraphArray extends SceneGraph_1.default {
    /**
     * Creates a new SceneGraphArray
     * @param viewport The Viewport
     * @param scene The Scene this SceneGraph belongs to
     */
    constructor(viewport, scene) {
        super(viewport, scene);
        this.nodeList = new Array();
    }
    // @override
    addNodeSpecific(node, id) {
        this.nodeList.push(node);
    }
    // @override
    removeNodeSpecific(node, id) {
        let index = this.nodeList.indexOf(node);
        if (index > -1) {
            this.nodeList.splice(index, 1);
        }
    }
    // @override
    getNodesAtCoords(x, y) {
        let results = [];
        for (let node of this.nodeList) {
            if (node.contains(x, y)) {
                results.push(node);
            }
        }
        return results;
    }
    // @override
    getNodesInRegion(boundary) {
        let t0 = performance.now();
        let results = [];
        for (let node of this.nodeList) {
            if (boundary.overlaps(node.boundary)) {
                results.push(node);
            }
        }
        let t1 = performance.now();
        Stats_1.default.log("sgquery", (t1 - t0));
        return results;
    }
    update(deltaT) {
        let t0 = performance.now();
        for (let node of this.nodeList) {
            if (!node.getLayer().isPaused()) {
                node.update(deltaT);
            }
        }
        let t1 = performance.now();
        Stats_1.default.log("sgupdate", (t1 - t0));
    }
    render(ctx) { }
    // @override
    getVisibleSet() {
        let visibleSet = new Array();
        for (let node of this.nodeList) {
            if (!node.getLayer().isHidden() && node.visible && this.viewport.includes(node)) {
                visibleSet.push(node);
            }
        }
        return visibleSet;
    }
}
exports.default = SceneGraphArray;
},{"../Debug/Stats":113,"./SceneGraph":169}],171:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("../DataTypes/Vec2");
const MathUtils_1 = require("../Utils/MathUtils");
const Queue_1 = require("../DataTypes/Queue");
const AABB_1 = require("../DataTypes/Shapes/AABB");
const Input_1 = require("../Input/Input");
const ParallaxLayer_1 = require("../Scene/Layers/ParallaxLayer");
const UILayer_1 = require("../Scene/Layers/UILayer");
/**
 * The viewport of the game. Corresponds to the visible window displayed in the browser.
 * The viewport keeps track of its position in the game world, and can act as a camera to follow objects.
 */
class Viewport {
    constructor(canvasSize, zoomLevel) {
        /** The amount that is zoomed in or out. */
        this.ZOOM_FACTOR = 1.2;
        this.view = new AABB_1.default(Vec2_1.default.ZERO, Vec2_1.default.ZERO);
        this.boundary = new AABB_1.default(Vec2_1.default.ZERO, Vec2_1.default.ZERO);
        this.lastPositions = new Queue_1.default();
        this.smoothingFactor = 10;
        this.scrollZoomEnabled = false;
        this.canvasSize = Vec2_1.default.ZERO;
        this.focus = Vec2_1.default.ZERO;
        // Set the size of the canvas
        this.setCanvasSize(canvasSize);
        // Set the size of the viewport
        this.setSize(canvasSize);
        this.setZoomLevel(zoomLevel);
        // Set the center (and make the viewport stay there)
        this.setCenter(this.view.halfSize.clone());
        this.setFocus(this.view.halfSize.clone());
    }
    /** Enables the viewport to zoom in and out */
    enableZoom() {
        this.scrollZoomEnabled = true;
    }
    /**
     * Returns the position of the viewport
     * @returns The center of the viewport as a Vec2
     */
    getCenter() {
        return this.view.center;
    }
    /**
     * Returns a new Vec2 with the origin of the viewport
     * @returns The top left cornder of the Vieport as a Vec2
     */
    getOrigin() {
        return new Vec2_1.default(this.view.left, this.view.top);
    }
    /**
     * Returns the region visible to this viewport
     * @returns The AABB containing the region visible to the viewport
     */
    getView() {
        return this.view;
    }
    /**
     * Set the position of the viewport
     * @param vecOrX The new position or the x-coordinate of the new position
     * @param y The y-coordinate of the new position
     */
    setCenter(vecOrX, y = null) {
        let pos;
        if (vecOrX instanceof Vec2_1.default) {
            pos = vecOrX;
        }
        else {
            pos = new Vec2_1.default(vecOrX, y);
        }
        this.view.center = pos;
    }
    /**
     * Returns the size of the viewport as a Vec2
     * @returns The half-size of the viewport as a Vec2
     */
    getHalfSize() {
        return this.view.getHalfSize();
    }
    /**
     * Sets the size of the viewport
     * @param vecOrX The new width of the viewport or the new size as a Vec2
     * @param y The new height of the viewport
     */
    setSize(vecOrX, y = null) {
        if (vecOrX instanceof Vec2_1.default) {
            this.view.setHalfSize(vecOrX.scaled(1 / 2));
        }
        else {
            this.view.setHalfSize(new Vec2_1.default(vecOrX / 2, y / 2));
        }
    }
    /**
     * Sets the half-size of the viewport
     * @param vecOrX The new half-width of the viewport or the new half-size as a Vec2
     * @param y The new height of the viewport
     */
    setHalfSize(vecOrX, y = null) {
        if (vecOrX instanceof Vec2_1.default) {
            this.view.setHalfSize(vecOrX.clone());
        }
        else {
            this.view.setHalfSize(new Vec2_1.default(vecOrX, y));
        }
    }
    /**
     * Updates the viewport with the size of the current Canvas
     * @param vecOrX The width of the canvas, or the canvas size as a Vec2
     * @param y The height of the canvas
     */
    setCanvasSize(vecOrX, y = null) {
        if (vecOrX instanceof Vec2_1.default) {
            this.canvasSize = vecOrX.clone();
        }
        else {
            this.canvasSize = new Vec2_1.default(vecOrX, y);
        }
    }
    /**
     * Sets the zoom level of the viewport
     * @param zoom The zoom level
     */
    setZoomLevel(zoom) {
        this.view.halfSize.copy(this.canvasSize.scaled(1 / zoom / 2));
    }
    /**
     * Gets the zoom level of the viewport
     * @returns The zoom level
     */
    getZoomLevel() {
        return this.canvasSize.x / this.view.hw / 2;
    }
    /**
     * Sets the smoothing factor for the viewport movement.
     * @param smoothingFactor The smoothing factor for the viewport
     */
    setSmoothingFactor(smoothingFactor) {
        if (smoothingFactor < 1)
            smoothingFactor = 1;
        this.smoothingFactor = smoothingFactor;
    }
    /**
     * Tells the viewport to focus on a point. Overidden by "following".
     * @param focus The point the  viewport should focus on
     */
    setFocus(focus) {
        this.focus.copy(focus);
    }
    /**
     * Returns true if the CanvasNode is inside of the viewport
     * @param node The node to check
     * @returns True if the node is currently visible in the viewport, false if not
     */
    includes(node) {
        let parallax = node.getLayer() instanceof ParallaxLayer_1.default || node.getLayer() instanceof UILayer_1.default ? node.getLayer().parallax : new Vec2_1.default(1, 1);
        let center = this.view.center.clone();
        this.view.center.mult(parallax);
        let overlaps = this.view.overlaps(node.boundary);
        this.view.center = center;
        return overlaps;
    }
    // TODO: Put some error handling on this for trying to make the bounds too small for the viewport
    // TODO: This should probably be done automatically, or should consider the aspect ratio or something
    /**
     * Sets the bounds of the viewport
     * @param lowerX The left edge of the viewport
     * @param lowerY The top edge of the viewport
     * @param upperX The right edge of the viewport
     * @param upperY The bottom edge of the viewport
     */
    setBounds(lowerX, lowerY, upperX, upperY) {
        let hwidth = (upperX - lowerX) / 2;
        let hheight = (upperY - lowerY) / 2;
        let x = lowerX + hwidth;
        let y = lowerY + hheight;
        this.boundary.center.set(x, y);
        this.boundary.halfSize.set(hwidth, hheight);
    }
    /**
     * Make the viewport follow the specified GameNode
     * @param node The GameNode to follow
     */
    follow(node) {
        this.following = node;
    }
    stopFollow() {
        this.following = undefined;
    }
    updateView() {
        if (this.lastPositions.getSize() > this.smoothingFactor) {
            this.lastPositions.dequeue();
        }
        // Get the average of the last 10 positions
        let pos = Vec2_1.default.ZERO;
        this.lastPositions.forEach(position => pos.add(position));
        pos.scale(1 / this.lastPositions.getSize());
        // Set this position either to the object or to its bounds
        pos.x = MathUtils_1.default.clamp(pos.x, this.boundary.left + this.view.hw, this.boundary.right - this.view.hw);
        pos.y = MathUtils_1.default.clamp(pos.y, this.boundary.top + this.view.hh, this.boundary.bottom - this.view.hh);
        // Assure there are no lines in the tilemap
        pos.x = Math.floor(pos.x);
        pos.y = Math.floor(pos.y);
        this.view.center.copy(pos);
    }
    update(deltaT) {
        // If zoom is enabled
        if (this.scrollZoomEnabled) {
            if (Input_1.default.didJustScroll()) {
                let currentSize = this.view.getHalfSize().clone();
                if (Input_1.default.getScrollDirection() < 0) {
                    // Zoom in
                    currentSize.scale(1 / this.ZOOM_FACTOR);
                }
                else {
                    // Zoom out
                    currentSize.scale(this.ZOOM_FACTOR);
                }
                if (currentSize.x > this.boundary.hw) {
                    let factor = this.boundary.hw / currentSize.x;
                    currentSize.x = this.boundary.hw;
                    currentSize.y *= factor;
                }
                if (currentSize.y > this.boundary.hh) {
                    let factor = this.boundary.hh / currentSize.y;
                    currentSize.y = this.boundary.hh;
                    currentSize.x *= factor;
                }
                this.view.setHalfSize(currentSize);
            }
        }
        // If viewport is following an object
        if (this.following) {
            // Update our list of previous positions
            this.lastPositions.enqueue(this.following.position.clone());
        }
        else {
            this.lastPositions.enqueue(this.focus);
        }
        this.updateView();
    }
}
exports.default = Viewport;
},{"../DataTypes/Queue":102,"../DataTypes/Shapes/AABB":104,"../DataTypes/Vec2":111,"../Input/Input":119,"../Scene/Layers/ParallaxLayer":176,"../Scene/Layers/UILayer":177,"../Utils/MathUtils":187}],172:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sprite_1 = require("../../Nodes/Sprites/Sprite");
const AnimatedSprite_1 = require("../../Nodes/Sprites/AnimatedSprite");
const GraphicTypes_1 = require("../../Nodes/Graphics/GraphicTypes");
const UIElementTypes_1 = require("../../Nodes/UIElements/UIElementTypes");
const Point_1 = require("../../Nodes/Graphics/Point");
const Vec2_1 = require("../../DataTypes/Vec2");
const Button_1 = require("../../Nodes/UIElements/Button");
const Label_1 = require("../../Nodes/UIElements/Label");
const Slider_1 = require("../../Nodes/UIElements/Slider");
const TextInput_1 = require("../../Nodes/UIElements/TextInput");
const Rect_1 = require("../../Nodes/Graphics/Rect");
const ResourceManager_1 = require("../../ResourceManager/ResourceManager");
const Line_1 = require("../../Nodes/Graphics/Line");
// @ignorePage
/**
 * A factory that abstracts adding @reference[CanvasNode]s to the @reference[Scene].
 * Access methods in this factory through Scene.add.[methodName]().
 */
class CanvasNodeFactory {
    constructor() {
        /**
         * Adds an instance of a UIElement to the current scene - i.e. any class that extends UIElement
         * @param type The type of UIElement to add
         * @param layerName The layer to add the UIElement to
         * @param options Any additional arguments to feed to the constructor
         * @returns A new UIElement
         */
        this.addUIElement = (type, layerName, options) => {
            // Get the layer
            let layer = this.scene.getLayer(layerName);
            let instance;
            switch (type) {
                case UIElementTypes_1.UIElementType.BUTTON:
                    instance = this.buildButton(options);
                    break;
                case UIElementTypes_1.UIElementType.LABEL:
                    instance = this.buildLabel(options);
                    break;
                case UIElementTypes_1.UIElementType.SLIDER:
                    instance = this.buildSlider(options);
                    break;
                case UIElementTypes_1.UIElementType.TEXT_INPUT:
                    instance = this.buildTextInput(options);
                    break;
                default:
                    throw `UIElementType '${type}' does not exist, or is registered incorrectly.`;
            }
            instance.setScene(this.scene);
            instance.id = this.scene.generateId();
            this.scene.getSceneGraph().addNode(instance);
            // Add instance to layer
            layer.addNode(instance);
            return instance;
        };
        /**
         * Adds a sprite to the current scene
         * @param key The key of the image the sprite will represent
         * @param layerName The layer on which to add the sprite
         * @returns A new Sprite
         */
        this.addSprite = (key, layerName) => {
            let layer = this.scene.getLayer(layerName);
            let instance = new Sprite_1.default(key);
            // Add instance to scene
            instance.setScene(this.scene);
            instance.id = this.scene.generateId();
            if (!(this.scene.isParallaxLayer(layerName) || this.scene.isUILayer(layerName))) {
                this.scene.getSceneGraph().addNode(instance);
            }
            // Add instance to layer
            layer.addNode(instance);
            return instance;
        };
        /**
         * Adds an AnimatedSprite to the current scene
         * @param key The key of the image the sprite will represent
         * @param layerName The layer on which to add the sprite
         * @returns A new AnimatedSprite
         */
        this.addAnimatedSprite = (key, layerName) => {
            let layer = this.scene.getLayer(layerName);
            let spritesheet = this.resourceManager.getSpritesheet(key);
            let instance = new AnimatedSprite_1.default(spritesheet);
            // Add instance fo scene
            instance.setScene(this.scene);
            instance.id = this.scene.generateId();
            if (!(this.scene.isParallaxLayer(layerName) || this.scene.isUILayer(layerName))) {
                this.scene.getSceneGraph().addNode(instance);
            }
            // Add instance to layer
            layer.addNode(instance);
            return instance;
        };
        /**
         * Adds a new graphic element to the current Scene
         * @param type The type of graphic to add
         * @param layerName The layer on which to add the graphic
         * @param options Any additional arguments to send to the graphic constructor
         * @returns A new Graphic
         */
        this.addGraphic = (type, layerName, options) => {
            // Get the layer
            let layer = this.scene.getLayer(layerName);
            let instance;
            switch (type) {
                case GraphicTypes_1.GraphicType.POINT:
                    instance = this.buildPoint(options);
                    break;
                case GraphicTypes_1.GraphicType.LINE:
                    instance = this.buildLine(options);
                    break;
                case GraphicTypes_1.GraphicType.RECT:
                    instance = this.buildRect(options);
                    break;
                default:
                    throw `GraphicType '${type}' does not exist, or is registered incorrectly.`;
            }
            // Add instance to scene
            instance.setScene(this.scene);
            instance.id = this.scene.generateId();
            if (!(this.scene.isParallaxLayer(layerName) || this.scene.isUILayer(layerName))) {
                this.scene.getSceneGraph().addNode(instance);
            }
            // Add instance to layer
            layer.addNode(instance);
            return instance;
        };
    }
    init(scene) {
        this.scene = scene;
        this.resourceManager = ResourceManager_1.default.getInstance();
    }
    /* ---------- BUILDERS ---------- */
    buildButton(options) {
        this.checkIfPropExists("Button", options, "position", Vec2_1.default, "Vec2");
        this.checkIfPropExists("Button", options, "text", "string");
        return new Button_1.default(options.position, options.text);
    }
    buildLabel(options) {
        this.checkIfPropExists("Label", options, "position", Vec2_1.default, "Vec2");
        this.checkIfPropExists("Label", options, "text", "string");
        return new Label_1.default(options.position, options.text);
    }
    buildSlider(options) {
        this.checkIfPropExists("Slider", options, "position", Vec2_1.default, "Vec2");
        let initValue = 0;
        if (options.value !== undefined) {
            initValue = options.value;
        }
        return new Slider_1.default(options.position, initValue);
    }
    buildTextInput(options) {
        this.checkIfPropExists("TextInput", options, "position", Vec2_1.default, "Vec2");
        return new TextInput_1.default(options.position);
    }
    buildPoint(options) {
        this.checkIfPropExists("Point", options, "position", Vec2_1.default, "Vec2");
        return new Point_1.default(options.position);
    }
    buildLine(options) {
        this.checkIfPropExists("Line", options, "start", Vec2_1.default, "Vec2");
        this.checkIfPropExists("Line", options, "end", Vec2_1.default, "Vec2");
        return new Line_1.default(options.start, options.end);
    }
    buildRect(options) {
        this.checkIfPropExists("Rect", options, "position", Vec2_1.default, "Vec2");
        this.checkIfPropExists("Rect", options, "size", Vec2_1.default, "Vec2");
        return new Rect_1.default(options.position, options.size);
    }
    /* ---------- ERROR HANDLING ---------- */
    checkIfPropExists(objectName, options, prop, type, typeName) {
        if (!options || options[prop] === undefined) {
            // Check that the options object has the property
            throw `${objectName} object requires argument ${prop} of type ${typeName}, but none was provided.`;
        }
        else {
            // Check that the property has the correct type
            if ((typeof type) === "string") {
                if (!(typeof options[prop] === type)) {
                    throw `${objectName} object requires argument ${prop} of type ${type}, but provided ${prop} was not of type ${type}.`;
                }
            }
            else if (type instanceof Function) {
                // If type is a constructor, check against that
                if (!(options[prop] instanceof type)) {
                    throw `${objectName} object requires argument ${prop} of type ${typeName}, but provided ${prop} was not of type ${typeName}.`;
                }
            }
            else {
                throw `${objectName} object requires argument ${prop} of type ${typeName}, but provided ${prop} was not of type ${typeName}.`;
            }
        }
    }
}
exports.default = CanvasNodeFactory;
},{"../../DataTypes/Vec2":111,"../../Nodes/Graphics/GraphicTypes":129,"../../Nodes/Graphics/Line":130,"../../Nodes/Graphics/Point":131,"../../Nodes/Graphics/Rect":132,"../../Nodes/Sprites/AnimatedSprite":133,"../../Nodes/Sprites/Sprite":134,"../../Nodes/UIElements/Button":138,"../../Nodes/UIElements/Label":139,"../../Nodes/UIElements/Slider":140,"../../Nodes/UIElements/TextInput":141,"../../Nodes/UIElements/UIElementTypes":142,"../../ResourceManager/ResourceManager":168}],173:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CanvasNodeFactory_1 = require("./CanvasNodeFactory");
const TilemapFactory_1 = require("./TilemapFactory");
/**
 * The manager of all factories used for adding @reference[GameNode]s to the @reference[Scene].
 */
class FactoryManager {
    constructor(scene, tilemaps) {
        // Constructors are called here to allow assignment of their functions to functions in this class
        this.canvasNodeFactory = new CanvasNodeFactory_1.default();
        this.tilemapFactory = new TilemapFactory_1.default();
        this.canvasNodeFactory.init(scene);
        this.tilemapFactory.init(scene, tilemaps);
    }
    // Expose all of the factories through the factory manager
    /**
     * Adds an instance of a UIElement to the current scene - i.e. any class that extends UIElement
     * @param type The type of UIElement to add
     * @param layerName The layer to add the UIElement to
     * @param options Any additional arguments to feed to the constructor
     * @returns A new UIElement
     */
    uiElement(type, layerName, options) {
        return this.canvasNodeFactory.addUIElement(type, layerName, options);
    }
    /**
     * Adds a sprite to the current scene
     * @param key The key of the image the sprite will represent
     * @param layerName The layer on which to add the sprite
     * @returns A new Sprite
     */
    sprite(key, layerName) {
        return this.canvasNodeFactory.addSprite(key, layerName);
    }
    /**
     * Adds an AnimatedSprite to the current scene
     * @param key The key of the image the sprite will represent
     * @param layerName The layer on which to add the sprite
     * @returns A new AnimatedSprite
     */
    animatedSprite(key, layerName) {
        return this.canvasNodeFactory.addAnimatedSprite(key, layerName);
    }
    /**
     * Adds a new graphic element to the current Scene
     * @param type The type of graphic to add
     * @param layerName The layer on which to add the graphic
     * @param options Any additional arguments to send to the graphic constructor
     * @returns A new Graphic
     */
    graphic(type, layerName, options) {
        return this.canvasNodeFactory.addGraphic(type, layerName, options);
    }
    /**
     * Adds a tilemap to the scene
     * @param key The key of the loaded tilemap to load
     * @param constr The constructor of the desired tilemap
     * @param args Additional arguments to send to the tilemap constructor
     * @returns An array of Layers, each of which contains a layer of the tilemap as its own Tilemap instance.
     */
    tilemap(key, scale) {
        return this.tilemapFactory.add(key, scale);
    }
}
exports.default = FactoryManager;
},{"./CanvasNodeFactory":172,"./TilemapFactory":174}],174:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ResourceManager_1 = require("../../ResourceManager/ResourceManager");
const OrthogonalTilemap_1 = require("../../Nodes/Tilemaps/OrthogonalTilemap");
const Tileset_1 = require("../../DataTypes/Tilesets/Tileset");
const Vec2_1 = require("../../DataTypes/Vec2");
const PositionGraph_1 = require("../../DataTypes/Graphs/PositionGraph");
const Navmesh_1 = require("../../Pathfinding/Navmesh");
// @ignorePage
/**
 * A factory that abstracts adding @reference[Tilemap]s to the @reference[Scene].
 * Access methods in this factory through Scene.add.[methodName]().
 */
class TilemapFactory {
    constructor() {
        // TODO - This is specifically catered to Tiled tilemaps right now. In the future,
        // it would be good to have a "parseTilemap" function that would convert the tilemap
        // data into a standard format. This could allow for support from other programs
        // or the development of an internal level builder tool
        /**
         * Adds a tilemap to the scene
         * @param key The key of the loaded tilemap to load
         * @param constr The constructor of the desired tilemap
         * @param args Additional arguments to send to the tilemap constructor
         * @returns An array of Layers, each of which contains a layer of the tilemap as its own Tilemap instance.
         */
        this.add = (key, scale = new Vec2_1.default(1, 1)) => {
            // Get Tilemap Data
            let tilemapData = this.resourceManager.getTilemap(key);
            // Set the constructor for this tilemap to either be orthographic or isometric
            let constr;
            if (tilemapData.orientation === "orthographic") {
                constr = OrthogonalTilemap_1.default;
            }
            else {
                // No isometric tilemap support right now, so Orthographic tilemap
                constr = OrthogonalTilemap_1.default;
            }
            // Initialize the return value array
            let sceneLayers = new Array();
            // Create all of the tilesets for this tilemap
            let tilesets = new Array();
            let collectionTiles = new Array();
            for (let tileset of tilemapData.tilesets) {
                if (tileset.image) {
                    // If this is a standard tileset and not a collection, create a tileset for it.
                    // TODO - We are ignoring collection tilesets for now. This is likely not a great idea in practice,
                    // as theoretically someone could want to use one for a standard tilemap. We are assuming for now
                    // that we only want to use them for object layers
                    tilesets.push(new Tileset_1.default(tileset));
                }
                else {
                    tileset.tiles.forEach(tile => tile.id += tileset.firstgid);
                    collectionTiles.push(...tileset.tiles);
                }
            }
            // Loop over the layers of the tilemap and create tiledlayers or object layers
            for (let layer of tilemapData.layers) {
                let sceneLayer;
                let isParallaxLayer = false;
                let depth = 0;
                if (layer.properties) {
                    for (let prop of layer.properties) {
                        if (prop.name === "Parallax") {
                            isParallaxLayer = prop.value;
                        }
                        else if (prop.name === "Depth") {
                            depth = prop.value;
                        }
                    }
                }
                if (isParallaxLayer) {
                    sceneLayer = this.scene.addParallaxLayer(layer.name, new Vec2_1.default(1, 1), depth);
                }
                else {
                    sceneLayer = this.scene.addLayer(layer.name, depth);
                }
                if (layer.type === "tilelayer") {
                    // Create a new tilemap object for the layer
                    let tilemap = new constr(tilemapData, layer, tilesets, scale);
                    tilemap.id = this.scene.generateId();
                    tilemap.setScene(this.scene);
                    // Add tilemap to scene
                    this.tilemaps.push(tilemap);
                    sceneLayer.addNode(tilemap);
                    // Register tilemap with physics if it's collidable
                    if (tilemap.isCollidable) {
                        tilemap.addPhysics();
                        if (layer.properties) {
                            for (let item of layer.properties) {
                                if (item.name === "Group") {
                                    tilemap.setGroup(item.value);
                                }
                            }
                        }
                    }
                }
                else {
                    let isNavmeshPoints = false;
                    let navmeshName;
                    let edges;
                    if (layer.properties) {
                        for (let prop of layer.properties) {
                            if (prop.name === "NavmeshPoints") {
                                isNavmeshPoints = true;
                            }
                            else if (prop.name === "name") {
                                navmeshName = prop.value;
                            }
                            else if (prop.name === "edges") {
                                edges = prop.value;
                            }
                        }
                    }
                    if (isNavmeshPoints) {
                        let g = new PositionGraph_1.default();
                        for (let obj of layer.objects) {
                            g.addPositionedNode(new Vec2_1.default(obj.x, obj.y));
                        }
                        for (let edge of edges) {
                            g.addEdge(edge.from, edge.to);
                        }
                        this.scene.getNavigationManager().addNavigableEntity(navmeshName, new Navmesh_1.default(g));
                        continue;
                    }
                    // Layer is an object layer, so add each object as a sprite to a new layer
                    for (let obj of layer.objects) {
                        // Check if obj is collidable
                        let hasPhysics = false;
                        let isCollidable = false;
                        let isTrigger = false;
                        let onEnter = null;
                        let onExit = null;
                        let triggerGroup = null;
                        let group = "";
                        if (obj.properties) {
                            for (let prop of obj.properties) {
                                if (prop.name === "HasPhysics") {
                                    hasPhysics = prop.value;
                                }
                                else if (prop.name === "Collidable") {
                                    isCollidable = prop.value;
                                }
                                else if (prop.name === "Group") {
                                    group = prop.value;
                                }
                                else if (prop.name === "IsTrigger") {
                                    isTrigger = prop.value;
                                }
                                else if (prop.name === "TriggerGroup") {
                                    triggerGroup = prop.value;
                                }
                                else if (prop.name === "TriggerOnEnter") {
                                    onEnter = prop.value;
                                }
                                else if (prop.name === "TriggerOnExit") {
                                    onExit = prop.value;
                                }
                            }
                        }
                        let sprite;
                        // Check if obj is a tile from a tileset
                        for (let tileset of tilesets) {
                            if (tileset.hasTile(obj.gid)) {
                                // The object is a tile from this set
                                let imageKey = tileset.getImageKey();
                                let offset = tileset.getImageOffsetForTile(obj.gid);
                                sprite = this.scene.add.sprite(imageKey, layer.name);
                                let size = tileset.getTileSize().clone();
                                sprite.position.set((obj.x + size.x / 2) * scale.x, (obj.y - size.y / 2) * scale.y);
                                sprite.setImageOffset(offset);
                                sprite.size.copy(size);
                                sprite.scale.set(scale.x, scale.y);
                            }
                        }
                        // Not in a tileset, must correspond to a collection
                        if (!sprite) {
                            for (let tile of collectionTiles) {
                                if (obj.gid === tile.id) {
                                    let imageKey = tile.image;
                                    sprite = this.scene.add.sprite(imageKey, layer.name);
                                    sprite.position.set((obj.x + tile.imagewidth / 2) * scale.x, (obj.y - tile.imageheight / 2) * scale.y);
                                    sprite.scale.set(scale.x, scale.y);
                                }
                            }
                        }
                        // Now we have sprite. Associate it with our physics object if there is one
                        if (hasPhysics) {
                            // Make the sprite a static physics object
                            sprite.addPhysics(sprite.boundary.clone(), Vec2_1.default.ZERO, isCollidable, true);
                            sprite.setGroup(group);
                            if (isTrigger && triggerGroup !== null) {
                                sprite.setTrigger(triggerGroup, onEnter, onExit);
                            }
                        }
                    }
                }
                // Update the return value
                sceneLayers.push(sceneLayer);
            }
            return sceneLayers;
        };
    }
    init(scene, tilemaps) {
        this.scene = scene;
        this.tilemaps = tilemaps;
        this.resourceManager = ResourceManager_1.default.getInstance();
    }
}
exports.default = TilemapFactory;
},{"../../DataTypes/Graphs/PositionGraph":96,"../../DataTypes/Tilesets/Tileset":110,"../../DataTypes/Vec2":111,"../../Nodes/Tilemaps/OrthogonalTilemap":136,"../../Pathfinding/Navmesh":145,"../../ResourceManager/ResourceManager":168}],175:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MathUtils_1 = require("../Utils/MathUtils");
/**
 * A layer in the scene. Layers are used for sorting @reference[GameNode]s by depth.
 */
class Layer {
    /**
     * Creates a new layer. To do this in a game, use the addLayer() method in @refrence[Scene]
     * @param scene The scene to add the layer to
     * @param name The name of the layer
     */
    constructor(scene, name) {
        this.scene = scene;
        this.name = name;
        this.paused = false;
        this.hidden = false;
        this.alpha = 1;
        this.items = new Array();
        this.ySort = false;
        this.depth = 0;
    }
    /**
     * Retreives the name of the layer
     * @returns The name of the layer
     */
    getName() {
        return this.name;
    }
    /**
     * Pauses/Unpauses the layer. Affects all elements in this layer
     * @param pauseValue True if the layer should be paused, false if not
     */
    setPaused(pauseValue) {
        this.paused = pauseValue;
    }
    /**
     * Returns whether or not the layer is paused
     */
    isPaused() {
        return this.paused;
    }
    /**
     * Sets the opacity of the layer
     * @param alpha The new opacity value in the range [0, 1]
     */
    setAlpha(alpha) {
        this.alpha = MathUtils_1.default.clamp(alpha, 0, 1);
    }
    /**
     * Gets the opacity of the layer
     * @returns The opacity
     */
    getAlpha() {
        return this.alpha;
    }
    /**
     * Sets the layer's hidden value. If hidden, a layer will not be rendered, but will still update
     * @param hidden The hidden value of the layer
     */
    setHidden(hidden) {
        this.hidden = hidden;
    }
    /**
     * Returns the hideen value of the lyaer
     * @returns True if the scene is hidden, false otherwise
     */
    isHidden() {
        return this.hidden;
    }
    /** Pauses this scene and hides it */
    disable() {
        this.paused = true;
        this.hidden = true;
    }
    /** Unpauses this layer and makes it visible */
    enable() {
        this.paused = false;
        this.hidden = false;
    }
    /**
     * Sets whether or not the scene will ySort automatically.
     * ySorting means that CanvasNodes on this layer will have their depth sorted depending on their y-value.
     * This means that if an object is "higher" in the scene, it will sort behind objects that are "lower".
     * This is useful for 3/4 view games, or similar situations, where you sometimes want to be in front of objects,
     * and other times want to be behind the same objects.
     * @param ySort True if ySorting should be active, false if not
     */
    setYSort(ySort) {
        this.ySort = ySort;
    }
    /**
     * Gets the ySort status of the scene
     * @returns True if ySorting is occurring, false otherwise
     */
    getYSort() {
        return this.ySort;
    }
    /**
     * Sets the depth of the layer compared to other layers. A larger number means the layer will be closer to the screen.
     * @param depth The depth of the layer.
     */
    setDepth(depth) {
        this.depth = depth;
    }
    /**
     * Retrieves the depth of the layer.
     * @returns The depth
     */
    getDepth() {
        return this.depth;
    }
    /**
     * Adds a node to this layer
     * @param node The node to add to this layer.
     */
    addNode(node) {
        this.items.push(node);
        node.setLayer(this);
    }
    /**
     * Removes a node from this layer
     * @param node The node to remove
     * @returns true if the node was removed, false otherwise
     */
    removeNode(node) {
        // Find and remove the node
        let index = this.items.indexOf(node);
        if (index !== -1) {
            this.items.splice(index, 1);
            node.setLayer(undefined);
        }
    }
    /**
     * Retreives all GameNodes from this layer
     * @returns an Array that contains all of the GameNodes in this layer.
     */
    getItems() {
        return this.items;
    }
}
exports.default = Layer;
},{"../Utils/MathUtils":187}],176:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Layer_1 = require("../Layer");
/**
 * An extension of a Layer that has a parallax value.
 */
class ParallaxLayer extends Layer_1.default {
    /**
     * Creates a new ParallaxLayer.
     * Use addParallaxLayer() in @reference[Scene] to add a layer of this type to your game.
     * @param scene The Scene to add this ParallaxLayer to
     * @param name The name of the ParallaxLayer
     * @param parallax The parallax level
     */
    constructor(scene, name, parallax) {
        super(scene, name);
        this.parallax = parallax;
    }
}
exports.default = ParallaxLayer;
},{"../Layer":175}],177:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("../../DataTypes/Vec2");
const ParallaxLayer_1 = require("./ParallaxLayer");
/**
 * A Layer strictly to be used for managing UIElements.
 * This is intended to be a Layer that always stays in the same place,
 * and thus renders things like a HUD or an inventory without taking into consideration the \reference[Viewport] scroll.
 */
class UILayer extends ParallaxLayer_1.default {
    /**
     * Creates a new UILayer.
     * Use addUILayer() in @reference[Scene] to add a layer of this type to your game.
     * @param scene The Scene to add this UILayer to
     * @param name The name of the UILayer
     */
    constructor(scene, name) {
        super(scene, name, Vec2_1.default.ZERO);
    }
}
exports.default = UILayer;
},{"../../DataTypes/Vec2":111,"./ParallaxLayer":176}],178:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Layer_1 = require("./Layer");
const Vec2_1 = require("../DataTypes/Vec2");
const BasicPhysicsManager_1 = require("../Physics/BasicPhysicsManager");
const SceneGraphArray_1 = require("../SceneGraph/SceneGraphArray");
const FactoryManager_1 = require("./Factories/FactoryManager");
const ResourceManager_1 = require("../ResourceManager/ResourceManager");
const Receiver_1 = require("../Events/Receiver");
const Emitter_1 = require("../Events/Emitter");
const NavigationManager_1 = require("../Pathfinding/NavigationManager");
const AIManager_1 = require("../AI/AIManager");
const Map_1 = require("../DataTypes/Map");
const ParallaxLayer_1 = require("./Layers/ParallaxLayer");
const UILayer_1 = require("./Layers/UILayer");
const CanvasNode_1 = require("../Nodes/CanvasNode");
const SceneOptions_1 = require("./SceneOptions");
const Debug_1 = require("../Debug/Debug");
const TimerManager_1 = require("../Timing/TimerManager");
const TweenManager_1 = require("../Rendering/Animations/TweenManager");
/**
 * Scenes are the main container in the game engine.
 * Your main scene is the current level or menu of the game, and will contain all of the GameNodes needed.
 * Scenes provide an easy way to load assets, add assets to the game world, and unload assets,
 * and have lifecycle methods exposed for these functions.
 */
class Scene {
    /**
     * Creates a new Scene. To add a new Scene in your game, use changeToScene() in @reference[SceneManager]
     * @param viewport The viewport of the game
     * @param sceneManager The SceneManager that owns this Scene
     * @param renderingManager The RenderingManager that will handle this Scene's rendering
     * @param game The instance of the Game
     * @param options The options for Scene initialization
     */
    constructor(viewport, sceneManager, renderingManager, options) {
        this.sceneOptions = SceneOptions_1.default.parse(options === undefined ? {} : options);
        this.worldSize = new Vec2_1.default(500, 500);
        this.viewport = viewport;
        this.viewport.setBounds(0, 0, 2560, 1280);
        this.running = false;
        this.sceneManager = sceneManager;
        this.receiver = new Receiver_1.default();
        this.emitter = new Emitter_1.default();
        this.tilemaps = new Array();
        this.sceneGraph = new SceneGraphArray_1.default(this.viewport, this);
        this.layers = new Map_1.default();
        this.uiLayers = new Map_1.default();
        this.parallaxLayers = new Map_1.default();
        this.physicsManager = new BasicPhysicsManager_1.default(this.sceneOptions.physics);
        this.navManager = new NavigationManager_1.default();
        this.aiManager = new AIManager_1.default();
        this.renderingManager = renderingManager;
        this.add = new FactoryManager_1.default(this, this.tilemaps);
        this.load = ResourceManager_1.default.getInstance();
        this.resourceManager = this.load;
        // Get the timer manager and clear any existing timers
        TimerManager_1.default.getInstance().clearTimers();
    }
    /** A lifecycle method that gets called immediately after a new scene is created, before anything else. */
    initScene(init) { }
    /** A lifecycle method that gets called when a new scene is created. Load all files you wish to access in the scene here. */
    loadScene() { }
    /** A lifecycle method called strictly after loadScene(). Create any game objects you wish to use in the scene here. */
    startScene() { }
    /**
     * A lifecycle method called every frame of the game. This is where you can dynamically do things like add in new enemies
     * @param delta The time this frame represents
     */
    updateScene(deltaT) { }
    /** A lifecycle method that gets called on scene destruction. Specify which files you no longer need for garbage collection. */
    unloadScene() { }
    update(deltaT) {
        this.updateScene(deltaT);
        // Do time updates
        TimerManager_1.default.getInstance().update(deltaT);
        // Do all AI updates
        this.aiManager.update(deltaT);
        // Update all physics objects
        this.physicsManager.update(deltaT);
        // Update all canvas objects
        this.sceneGraph.update(deltaT);
        // Update all tilemaps
        this.tilemaps.forEach(tilemap => {
            if (!tilemap.getLayer().isPaused()) {
                tilemap.update(deltaT);
            }
        });
        // Update all tweens
        TweenManager_1.default.getInstance().update(deltaT);
        // Update viewport
        this.viewport.update(deltaT);
    }
    /**
     * Collects renderable sets and coordinates with the RenderingManager to draw the Scene
     */
    render() {
        // Get the visible set of nodes
        let visibleSet = this.sceneGraph.getVisibleSet();
        // Add parallax layer items to the visible set (we're rendering them all for now)
        this.parallaxLayers.forEach(key => {
            let pLayer = this.parallaxLayers.get(key);
            for (let node of pLayer.getItems()) {
                if (node instanceof CanvasNode_1.default) {
                    visibleSet.push(node);
                }
            }
        });
        // Send the visible set, tilemaps, and uiLayers to the renderer
        this.renderingManager.render(visibleSet, this.tilemaps, this.uiLayers);
        let nodes = this.sceneGraph.getAllNodes();
        this.tilemaps.forEach(tilemap => tilemap.visible ? nodes.push(tilemap) : 0);
        Debug_1.default.setNodes(nodes);
    }
    /**
     * Sets the scene as running or not
     * @param running True if the Scene should be running, false if not
     */
    setRunning(running) {
        this.running = running;
    }
    /**
     * Returns whether or not the Scene is running
     * @returns True if the scene is running, false otherwise
     */
    isRunning() {
        return this.running;
    }
    /**
     * Removes a node from this Scene
     * @param node The node to remove
     */
    remove(node) {
        // Remove from the scene graph
        if (node instanceof CanvasNode_1.default) {
            this.sceneGraph.removeNode(node);
        }
    }
    /** Destroys this scene and all nodes in it */
    destroy() {
        for (let node of this.sceneGraph.getAllNodes()) {
            node.destroy();
        }
        for (let tilemap of this.tilemaps) {
            tilemap.destroy();
        }
        this.receiver.destroy();
        delete this.sceneGraph;
        delete this.physicsManager;
        delete this.navManager;
        delete this.aiManager;
        delete this.receiver;
    }
    /**
     * Adds a new layer to the scene and returns it
     * @param name The name of the new layer
     * @param depth The depth of the layer
     * @returns The newly created Layer
     */
    addLayer(name, depth) {
        if (this.layers.has(name) || this.parallaxLayers.has(name) || this.uiLayers.has(name)) {
            throw `Layer with name ${name} already exists`;
        }
        let layer = new Layer_1.default(this, name);
        this.layers.add(name, layer);
        if (depth) {
            layer.setDepth(depth);
        }
        return layer;
    }
    /**
     * Adds a new parallax layer to this scene and returns it
     * @param name The name of the parallax layer
     * @param parallax The parallax level
     * @param depth The depth of the layer
     * @returns The newly created ParallaxLayer
     */
    addParallaxLayer(name, parallax, depth) {
        if (this.layers.has(name) || this.parallaxLayers.has(name) || this.uiLayers.has(name)) {
            throw `Layer with name ${name} already exists`;
        }
        let layer = new ParallaxLayer_1.default(this, name, parallax);
        this.parallaxLayers.add(name, layer);
        if (depth) {
            layer.setDepth(depth);
        }
        return layer;
    }
    /**
     * Adds a new UILayer to the scene
     * @param name The name of the new UIlayer
     * @returns The newly created UILayer
     */
    addUILayer(name) {
        if (this.layers.has(name) || this.parallaxLayers.has(name) || this.uiLayers.has(name)) {
            throw `Layer with name ${name} already exists`;
        }
        let layer = new UILayer_1.default(this, name);
        this.uiLayers.add(name, layer);
        return layer;
    }
    /**
     * Gets a layer from the scene by name if it exists.
     * This can be a Layer or any of its subclasses
     * @param name The name of the layer
     * @returns The Layer found with that name
     */
    getLayer(name) {
        if (this.layers.has(name)) {
            return this.layers.get(name);
        }
        else if (this.parallaxLayers.has(name)) {
            return this.parallaxLayers.get(name);
        }
        else if (this.uiLayers.has(name)) {
            return this.uiLayers.get(name);
        }
        else {
            throw `Requested layer ${name} does not exist.`;
        }
    }
    /**
     * Returns true if this layer is a ParallaxLayer
     * @param name The name of the layer
     * @returns True if this layer is a ParallaxLayer
     */
    isParallaxLayer(name) {
        return this.parallaxLayers.has(name);
    }
    /**
     * Returns true if this layer is a UILayer
     * @param name The name of the layer
     * @returns True if this layer is ParallaxLayer
     */
    isUILayer(name) {
        return this.uiLayers.has(name);
    }
    /**
     * Returns the translation of this node with respect to camera space (due to the viewport moving).
     * This value is affected by the parallax level of the @reference[Layer] the node is on.
     * @param node The node to check the viewport with respect to
     * @returns A Vec2 containing the translation of viewport with respect to this node.
     */
    getViewTranslation(node) {
        let layer = node.getLayer();
        if (layer instanceof ParallaxLayer_1.default || layer instanceof UILayer_1.default) {
            return this.viewport.getOrigin().mult(layer.parallax);
        }
        else {
            return this.viewport.getOrigin();
        }
    }
    /**
     * Returns the scale level of the view
     * @returns The zoom level of the viewport
    */
    getViewScale() {
        return this.viewport.getZoomLevel();
    }
    /**
     * Returns the Viewport associated with this scene
     * @returns The current Viewport
     */
    getViewport() {
        return this.viewport;
    }
    /**
     * Gets the world size of this Scene
     * @returns The world size in a Vec2
     */
    getWorldSize() {
        return this.worldSize;
    }
    /**
     * Gets the SceneGraph associated with this Scene
     * @returns The SceneGraph
     */
    getSceneGraph() {
        return this.sceneGraph;
    }
    /**
     * Gets the PhysicsManager associated with this Scene
     * @returns The PhysicsManager
     */
    getPhysicsManager() {
        return this.physicsManager;
    }
    /**
     * Gets the NavigationManager associated with this Scene
     * @returns The NavigationManager
     */
    getNavigationManager() {
        return this.navManager;
    }
    /**
     * Gets the AIManager associated with this Scene
     * @returns The AIManager
     */
    getAIManager() {
        return this.aiManager;
    }
    /**
     * Generates an ID for a GameNode
     * @returns The new ID
     */
    generateId() {
        return this.sceneManager.generateId();
    }
    /**
     * Retrieves a Tilemap in this Scene
     * @param name The name of the Tilemap
     * @returns The Tilemap, if one this name exists, otherwise null
     */
    getTilemap(name) {
        for (let tilemap of this.tilemaps) {
            if (tilemap.name === name) {
                return tilemap;
            }
        }
        return null;
    }
}
exports.default = Scene;
},{"../AI/AIManager":91,"../DataTypes/Map":98,"../DataTypes/Vec2":111,"../Debug/Debug":112,"../Events/Emitter":114,"../Events/Receiver":118,"../Nodes/CanvasNode":126,"../Pathfinding/NavigationManager":143,"../Physics/BasicPhysicsManager":146,"../Rendering/Animations/TweenManager":155,"../ResourceManager/ResourceManager":168,"../SceneGraph/SceneGraphArray":170,"../Timing/TimerManager":183,"./Factories/FactoryManager":173,"./Layer":175,"./Layers/ParallaxLayer":176,"./Layers/UILayer":177,"./SceneOptions":180}],179:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ResourceManager_1 = require("../ResourceManager/ResourceManager");
/**
 * The SceneManager acts as an interface to create Scenes, and handles the lifecycle methods of Scenes.
 * It gives Scenes access to information they need from the @reference[Game] class while keeping a layer of separation.
 */
class SceneManager {
    /**
     * Creates a new SceneManager
     * @param viewport The Viewport of the game
     * @param game The Game instance
     * @param renderingManager The RenderingManager of the game
     */
    constructor(viewport, renderingManager) {
        this.resourceManager = ResourceManager_1.default.getInstance();
        this.viewport = viewport;
        this.renderingManager = renderingManager;
        this.idCounter = 0;
        this.pendingScene = null;
    }
    /**
     * Add a scene as the main scene.
     * Use this method if you've created a subclass of Scene, and you want to add it as the main Scene.
     * @param constr The constructor of the scene to add
     * @param init An object to pass to the init function of the new scene
     */
    changeToScene(constr, init, options) {
        console.log("Creating the new scene - change is pending until next update");
        this.pendingScene = new constr(this.viewport, this, this.renderingManager, options);
        this.pendingSceneInit = init;
    }
    doSceneChange() {
        console.log("Performing scene change");
        this.viewport.setCenter(this.viewport.getHalfSize().x, this.viewport.getHalfSize().y);
        if (this.currentScene) {
            console.log("Unloading old scene");
            this.currentScene.unloadScene();
            console.log("Destroying old scene");
            this.currentScene.destroy();
        }
        console.log("Unloading old resources...");
        this.resourceManager.unloadAllResources();
        // Make the pending scene the current one
        this.currentScene = this.pendingScene;
        // Make the pending scene null
        this.pendingScene = null;
        // Init the scene
        this.currentScene.initScene(this.pendingSceneInit);
        // Enqueue all scene asset loads
        this.currentScene.loadScene();
        // Load all assets
        console.log("Starting Scene Load");
        this.resourceManager.loadResourcesFromQueue(() => {
            console.log("Starting Scene");
            this.currentScene.startScene();
            this.currentScene.setRunning(true);
        });
        this.renderingManager.setScene(this.currentScene);
    }
    /**
     * Generates a unique ID
     * @returns A new ID
     */
    generateId() {
        return this.idCounter++;
    }
    /**
     * Renders the current Scene
     */
    render() {
        if (this.currentScene) {
            this.currentScene.render();
        }
    }
    /**
     * Updates the current Scene
     * @param deltaT The timestep of the Scene
     */
    update(deltaT) {
        if (this.pendingScene !== null) {
            this.doSceneChange();
        }
        if (this.currentScene && this.currentScene.isRunning()) {
            this.currentScene.update(deltaT);
        }
    }
}
exports.default = SceneManager;
},{"../ResourceManager/ResourceManager":168}],180:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ignorePage
/**
 * The options to give a @reference[Scene] for initialization
 */
class SceneOptions {
    static parse(options) {
        let sOpt = new SceneOptions();
        if (options.physics === undefined) {
            sOpt.physics = { groups: undefined, collisions: undefined };
        }
        else {
            sOpt.physics = options.physics;
        }
        return sOpt;
    }
}
exports.default = SceneOptions;
},{}],181:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_AUDIO_CHANNELS = exports.AudioChannelType = void 0;
const Map_1 = require("../DataTypes/Map");
const Receiver_1 = require("../Events/Receiver");
const ResourceManager_1 = require("../ResourceManager/ResourceManager");
const GameEventType_1 = require("../Events/GameEventType");
/**
 * Manages any sounds or music needed for the game.
 * Through the EventQueue, exposes interface to play sounds so GameNodes can activate sounds without
 * needing direct references to the audio system
 */
class AudioManager {
    constructor() {
        this.initAudio();
        this.receiver = new Receiver_1.default();
        this.receiver.subscribe([
            GameEventType_1.GameEventType.PLAY_SOUND,
            GameEventType_1.GameEventType.STOP_SOUND,
            GameEventType_1.GameEventType.PLAY_MUSIC,
            GameEventType_1.GameEventType.PLAY_SFX,
            GameEventType_1.GameEventType.MUTE_CHANNEL,
            GameEventType_1.GameEventType.UNMUTE_CHANNEL
        ]);
        this.currentSounds = new Map_1.default();
        this.gainNodes = new Array(exports.MAX_AUDIO_CHANNELS);
        this.initGainNodes();
    }
    /**
     * Get the instance of the AudioManager class or create a new one if none exists
     * @returns The AudioManager
     */
    static getInstance() {
        if (!this.instance) {
            this.instance = new AudioManager();
        }
        return this.instance;
    }
    /**
     * Initializes the webAudio context
     */
    initAudio() {
        try {
            window.AudioContext = window.AudioContext; // || window.webkitAudioContext; 
            this.audioCtx = new AudioContext();
            console.log('Web Audio API successfully loaded');
        }
        catch (e) {
            console.warn('Web Audio API is not supported in this browser');
        }
    }
    initGainNodes() {
        for (let i = 0; i < exports.MAX_AUDIO_CHANNELS; i++) {
            this.gainNodes[i] = this.audioCtx.createGain();
        }
    }
    /**
     * Returns the current audio context
     * @returns The AudioContext
     */
    getAudioContext() {
        return this.audioCtx;
    }
    /*
        According to the MDN, create a new sound for every call:

        An AudioBufferSourceNode can only be played once; after each call to start(), you have to create a new node
        if you want to play the same sound again. Fortunately, these nodes are very inexpensive to create, and the
        actual AudioBuffers can be reused for multiple plays of the sound. Indeed, you can use these nodes in a
        "fire and forget" manner: create the node, call start() to begin playing the sound, and don't even bother to
        hold a reference to it. It will automatically be garbage-collected at an appropriate time, which won't be
        until sometime after the sound has finished playing.
    */
    /**
     * Creates a new sound from the key of a loaded audio file
     * @param key The key of the loaded audio file to create a new sound for
     * @returns The newly created AudioBuffer
     */
    createSound(key, holdReference, channel, options) {
        // Get audio buffer
        let buffer = ResourceManager_1.default.getInstance().getAudio(key);
        // Create a sound source
        var source = this.audioCtx.createBufferSource();
        // Tell the source which sound to play
        source.buffer = buffer;
        // Add any additional nodes
        const nodes = [source];
        // Do any additional nodes here?
        // Of course, there aren't any supported yet...
        // Add the gain node for this channel
        nodes.push(this.gainNodes[channel]);
        // Connect any nodes along the path
        for (let i = 1; i < nodes.length; i++) {
            nodes[i - 1].connect(nodes[i]);
        }
        // Connect the source to the context's destination
        nodes[nodes.length - 1].connect(this.audioCtx.destination);
        return source;
    }
    /**
     * Play the sound specified by the key
     * @param key The key of the sound to play
     * @param loop A boolean for whether or not to loop the sound
     * @param holdReference A boolean for whether or not we want to hold on to a reference of the audio node. This is good for playing music on a loop that will eventually need to be stopped.
     */
    playSound(key, loop, holdReference, channel, options) {
        let sound = this.createSound(key, holdReference, channel, options);
        if (loop) {
            sound.loop = true;
        }
        // Add a reference of the new sound to a map. This will allow us to stop a looping or long sound at a later time
        if (holdReference) {
            this.currentSounds.add(key, sound);
        }
        sound.start();
    }
    /**
     * Stop the sound specified by the key
     */
    stopSound(key) {
        let sound = this.currentSounds.get(key);
        if (sound) {
            sound.stop();
            this.currentSounds.delete(key);
        }
    }
    muteChannel(channel) {
        this.gainNodes[channel].gain.setValueAtTime(0, this.audioCtx.currentTime);
    }
    unmuteChannel(channel) {
        this.gainNodes[channel].gain.setValueAtTime(1, this.audioCtx.currentTime);
    }
    /**
     * Sets the volume of a channel using the GainNode for that channel. For more
     * information on GainNodes, see https://developer.mozilla.org/en-US/docs/Web/API/GainNode
     * @param channel The audio channel to set the volume for
     * @param volume The volume of the channel. 0 is muted. Values below zero will be set to zero.
     */
    static setVolume(channel, volume) {
        if (volume < 0) {
            volume = 0;
        }
        const am = AudioManager.getInstance();
        am.gainNodes[channel].gain.setValueAtTime(volume, am.audioCtx.currentTime);
    }
    /**
     * Returns the GainNode for this channel.
     * Learn more about GainNodes here https://developer.mozilla.org/en-US/docs/Web/API/GainNode
     * DON'T USE THIS UNLESS YOU KNOW WHAT YOU'RE DOING
     * @param channel The channel
     * @returns The GainNode for the specified channel
     */
    getChannelGainNode(channel) {
        return this.gainNodes[channel];
    }
    update(deltaT) {
        // Play each audio clip requested
        // TODO - Add logic to merge sounds if there are multiple of the same key
        while (this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();
            if (event.type === GameEventType_1.GameEventType.PLAY_SOUND || event.type === GameEventType_1.GameEventType.PLAY_MUSIC || event.type === GameEventType_1.GameEventType.PLAY_SFX) {
                let soundKey = event.data.get("key");
                let loop = event.data.get("loop");
                let holdReference = event.data.get("holdReference");
                let channel = AudioChannelType.DEFAULT;
                if (event.type === GameEventType_1.GameEventType.PLAY_MUSIC) {
                    channel = AudioChannelType.MUSIC;
                }
                else if (GameEventType_1.GameEventType.PLAY_SFX) {
                    channel = AudioChannelType.SFX;
                }
                else if (event.data.has("channel")) {
                    channel = event.data.get("channel");
                }
                this.playSound(soundKey, loop, holdReference, channel, event.data);
            }
            if (event.type === GameEventType_1.GameEventType.STOP_SOUND) {
                let soundKey = event.data.get("key");
                this.stopSound(soundKey);
            }
            if (event.type === GameEventType_1.GameEventType.MUTE_CHANNEL) {
                this.muteChannel(event.data.get("channel"));
            }
            if (event.type === GameEventType_1.GameEventType.UNMUTE_CHANNEL) {
                this.unmuteChannel(event.data.get("channel"));
            }
        }
    }
}
exports.default = AudioManager;
var AudioChannelType;
(function (AudioChannelType) {
    AudioChannelType[AudioChannelType["DEFAULT"] = 0] = "DEFAULT";
    AudioChannelType[AudioChannelType["SFX"] = 1] = "SFX";
    AudioChannelType[AudioChannelType["MUSIC"] = 2] = "MUSIC";
    AudioChannelType[AudioChannelType["CUSTOM_1"] = 3] = "CUSTOM_1";
    AudioChannelType[AudioChannelType["CUSTOM_2"] = 4] = "CUSTOM_2";
    AudioChannelType[AudioChannelType["CUSTOM_3"] = 5] = "CUSTOM_3";
    AudioChannelType[AudioChannelType["CUSTOM_4"] = 6] = "CUSTOM_4";
    AudioChannelType[AudioChannelType["CUSTOM_5"] = 7] = "CUSTOM_5";
    AudioChannelType[AudioChannelType["CUSTOM_6"] = 8] = "CUSTOM_6";
    AudioChannelType[AudioChannelType["CUSTOM_7"] = 9] = "CUSTOM_7";
    AudioChannelType[AudioChannelType["CUSTOM_8"] = 10] = "CUSTOM_8";
    AudioChannelType[AudioChannelType["CUSTOM_9"] = 11] = "CUSTOM_9";
})(AudioChannelType = exports.AudioChannelType || (exports.AudioChannelType = {}));
exports.MAX_AUDIO_CHANNELS = 12;
},{"../DataTypes/Map":98,"../Events/GameEventType":117,"../Events/Receiver":118,"../ResourceManager/ResourceManager":168}],182:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimerState = void 0;
const MathUtils_1 = require("../Utils/MathUtils");
const TimerManager_1 = require("./TimerManager");
class Timer {
    constructor(time, onEnd, loop = false) {
        // Register this timer
        TimerManager_1.default.getInstance().addTimer(this);
        this.totalTime = time;
        this.timeLeft = 0;
        this.onEnd = onEnd;
        this.loop = loop;
        this.state = TimerState.STOPPED;
        this.numRuns = 0;
    }
    isStopped() {
        return this.state === TimerState.STOPPED;
    }
    isPaused() {
        return this.state === TimerState.PAUSED;
    }
    /**
     * Returns whether or not this timer has been run before
     * @returns true if it has been run at least once (after the latest reset), and false otherwise
     */
    hasRun() {
        return this.numRuns > 0;
    }
    start(time) {
        if (time !== undefined) {
            this.totalTime = time;
        }
        this.state = TimerState.ACTIVE;
        this.timeLeft = this.totalTime;
    }
    /** Resets this timer. Sets the progress back to zero, and sets the number of runs back to zero */
    reset() {
        this.timeLeft = this.totalTime;
        this.numRuns = 0;
    }
    pause() {
        this.state = TimerState.PAUSED;
    }
    update(deltaT) {
        if (this.state === TimerState.ACTIVE) {
            this.timeLeft -= deltaT * 1000;
            if (this.timeLeft <= 0) {
                this.timeLeft = MathUtils_1.default.clampLow0(this.timeLeft);
                this.end();
            }
        }
    }
    end() {
        // Update the state
        this.state = TimerState.STOPPED;
        this.numRuns += 1;
        // Call the end function if there is one
        if (this.onEnd) {
            this.onEnd();
        }
        // Loop if we want to
        if (this.loop) {
            this.state = TimerState.ACTIVE;
            this.timeLeft = this.totalTime;
        }
    }
    toString() {
        return "Timer: " + this.state + " - Time Left: " + this.timeLeft + "ms of " + this.totalTime + "ms";
    }
}
exports.default = Timer;
var TimerState;
(function (TimerState) {
    TimerState["ACTIVE"] = "ACTIVE";
    TimerState["PAUSED"] = "PAUSED";
    TimerState["STOPPED"] = "STOPPED";
})(TimerState = exports.TimerState || (exports.TimerState = {}));
},{"../Utils/MathUtils":187,"./TimerManager":183}],183:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TimerManager {
    constructor() {
        this.timers = new Array();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new TimerManager();
        }
        return this.instance;
    }
    addTimer(timer) {
        this.timers.push(timer);
    }
    clearTimers() {
        this.timers = new Array();
    }
    update(deltaT) {
        this.timers.forEach(timer => timer.update(deltaT));
    }
}
exports.default = TimerManager;
},{}],184:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MathUtils_1 = require("./MathUtils");
// TODO: This should be moved to the datatypes folder
/**
 * A Color util class that keeps track of colors like a vector, but can be converted into a string format
 */
class Color {
    /**
     * Creates a new color
     * @param r Red
     * @param g Green
     * @param b Blue
     * @param a Alpha
     */
    constructor(r = 0, g = 0, b = 0, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    /**
     * Transparent color
     * @returns rgba(0, 0, 0, 0)
     */
    static get TRANSPARENT() {
        return new Color(0, 0, 0, 0);
    }
    /**
     * Red color
     * @returns rgb(255, 0, 0)
     */
    static get RED() {
        return new Color(255, 0, 0, 1);
    }
    /**
     * Green color
     * @returns rgb(0, 255, 0)
     */
    static get GREEN() {
        return new Color(0, 255, 0, 1);
    }
    /**
     * Blue color
     * @returns rgb(0, 0, 255)
     */
    static get BLUE() {
        return new Color(0, 0, 255, 1);
    }
    /**
     * Yellow color
     * @returns rgb(255, 255, 0)
     */
    static get YELLOW() {
        return new Color(255, 255, 0, 1);
    }
    /**
     * Magenta color
     * @returns rgb(255, 0, 255)
     */
    static get MAGENTA() {
        return new Color(255, 0, 255, 1);
    }
    /**
     * Cyan color
     * @returns rgb(0, 255, 255)
     */
    static get CYAN() {
        return new Color(0, 255, 255, 1);
    }
    /**
     * White color
     * @returns rgb(255, 255, 255)
     */
    static get WHITE() {
        return new Color(255, 255, 255, 1);
    }
    /**
     * Black color
     * @returns rgb(0, 0, 0)
     */
    static get BLACK() {
        return new Color(0, 0, 0, 1);
    }
    /**
     * Orange color
     * @returns rgb(255, 100, 0)
     */
    static get ORANGE() {
        return new Color(255, 100, 0, 1);
    }
    /**
     * Sets the color to the values provided
     * @param r Red
     * @param g Green
     * @param b Blue
     * @param a Alpha
     */
    set(r, g, b, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    /**
     * Returns a new color slightly lighter than the current color
     * @returns A new lighter Color
     */
    lighten() {
        return new Color(MathUtils_1.default.clamp(this.r + 40, 0, 255), MathUtils_1.default.clamp(this.g + 40, 0, 255), MathUtils_1.default.clamp(this.b + 40, 0, 255), MathUtils_1.default.clamp(this.a + 10, 0, 255));
    }
    /**
     * Returns a new color slightly darker than the current color
     * @returns A new darker Color
     */
    darken() {
        return new Color(MathUtils_1.default.clamp(this.r - 40, 0, 255), MathUtils_1.default.clamp(this.g - 40, 0, 255), MathUtils_1.default.clamp(this.b - 40, 0, 255), MathUtils_1.default.clamp(this.a + 10, 0, 255));
    }
    /**
     * Returns this color as an array
     * @returns [r, g, b, a]
     */
    toArray() {
        return [this.r, this.g, this.b, this.a];
    }
    /**
     * Returns the color as a string of the form #RRGGBB
     * @returns #RRGGBB
     */
    toString() {
        return "#" + MathUtils_1.default.toHex(this.r, 2) + MathUtils_1.default.toHex(this.g, 2) + MathUtils_1.default.toHex(this.b, 2);
    }
    /**
     * Returns the color as a string of the form rgb(r, g, b)
     * @returns rgb(r, g, b)
     */
    toStringRGB() {
        return "rgb(" + this.r.toString() + ", " + this.g.toString() + ", " + this.b.toString() + ")";
    }
    /**
     * Returns the color as a string of the form rgba(r, g, b, a)
     * @returns rgba(r, g, b, a)
     */
    toStringRGBA() {
        if (this.a === 0) {
            return this.toStringRGB();
        }
        return "rgba(" + this.r.toString() + ", " + this.g.toString() + ", " + this.b.toString() + ", " + this.a.toString() + ")";
    }
    /**
     * Turns this color into a float32Array and changes color range to [0.0, 1.0]
     * @returns a Float32Array containing the color
     */
    toWebGL() {
        return new Float32Array([
            this.r / 255,
            this.g / 255,
            this.b / 255,
            this.a
        ]);
    }
    static fromStringHex(str) {
        let i = 0;
        if (str.charAt(0) == "#")
            i += 1;
        let r = MathUtils_1.default.fromHex(str.substring(i, i + 2));
        let g = MathUtils_1.default.fromHex(str.substring(i + 2, i + 4));
        let b = MathUtils_1.default.fromHex(str.substring(i + 4, i + 6));
        return new Color(r, g, b);
    }
}
exports.default = Color;
},{"./MathUtils":187}],185:[function(require,module,exports){
"use strict";
// @ignorePage
Object.defineProperty(exports, "__esModule", { value: true });
exports.EaseFunctionType = void 0;
class EaseFunctions {
    static easeInOutSine(x) {
        return -(Math.cos(Math.PI * x) - 1) / 2;
    }
    static easeOutInSine(x) {
        return x < 0.5 ? -Math.cos(Math.PI * (x + 0.5)) / 2 : -Math.cos(Math.PI * (x - 0.5)) / 2 + 1;
    }
    static easeOutSine(x) {
        return Math.sin((x * Math.PI) / 2);
    }
    static easeInSine(x) {
        return 1 - Math.cos((x * Math.PI) / 2);
    }
    static easeInOutQuint(x) {
        return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
    }
    static easeInOutQuad(x) {
        return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    }
    static easeOutInQuad(x) {
        return x < 0.5 ? this.easeOutIn_OutPow(x, 2) : this.easeOutIn_InPow(x, 2);
    }
    static easeOutIn_OutPow(x, pow) {
        return 0.5 - Math.pow(-2 * x + 1, pow) / 2;
    }
    static easeOutIn_InPow(x, pow) {
        return 0.5 + Math.pow(2 * x - 1, pow) / 2;
    }
}
exports.default = EaseFunctions;
var EaseFunctionType;
(function (EaseFunctionType) {
    // SINE
    EaseFunctionType["IN_OUT_SINE"] = "easeInOutSine";
    EaseFunctionType["OUT_IN_SINE"] = "easeOutInSine";
    EaseFunctionType["IN_SINE"] = "easeInSine";
    EaseFunctionType["OUT_SINE"] = "easeOutSine";
    // QUAD
    EaseFunctionType["IN_OUT_QUAD"] = "easeInOutQuad";
    EaseFunctionType["OUT_IN_QUAD"] = "easeOutInQuad";
    // QUINT
    EaseFunctionType["IN_OUT_QUINT"] = "easeInOutQuint";
})(EaseFunctionType = exports.EaseFunctionType || (exports.EaseFunctionType = {}));
},{}],186:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** A class to provides some utility functions for graphs */
class GraphUtils {
    /**
     * An implementation of Djikstra's shortest path algorithm based on the one described in The Algorithm Design Manual.
     * @param g The graph
     * @param start The number to start the shortest path from
     * @returns An array containing the parent of each node of the Graph in the shortest path.
     */
    static djikstra(g, start) {
        let i; // Counter
        let p; // Pointer to edgenode
        let inTree = new Array(g.numVertices);
        let distance = new Array(g.numVertices);
        let parent = new Array(g.numVertices);
        let v; // Current vertex to process
        let w; // Candidate for next vertex
        let weight; // Edge weight
        let dist; // Best current distance from start
        for (i = 0; i < g.numVertices; i++) {
            inTree[i] = false;
            distance[i] = Infinity;
            parent[i] = -1;
        }
        distance[start] = 0;
        v = start;
        while (!inTree[v]) {
            inTree[v] = true;
            p = g.edges[v];
            while (p !== null) {
                w = p.y;
                weight = p.weight;
                if (distance[w] > distance[v] + weight) {
                    distance[w] = distance[v] + weight;
                    parent[w] = v;
                }
                p = p.next;
            }
            v = 0;
            dist = Infinity;
            for (i = 0; i <= g.numVertices; i++) {
                if (!inTree[i] && dist > distance[i]) {
                    dist = distance;
                    v = i;
                }
            }
        }
        return parent;
    }
}
exports.default = GraphUtils;
},{}],187:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** A class containing some utility functions for math operations */
class MathUtils {
    /**
     * Returns the sign of the value provided
     * @param x The value to extract the sign from
     * @returns -1 if the number is less than 0, 1 otherwise
     */
    static sign(x) {
        return x < 0 ? -1 : 1;
    }
    /**
     * Returns whether or not x is between a and b
     * @param a The min bound
     * @param b The max bound
     * @param x The value to check
     * @param exclusive Whether or not a and b are exclusive bounds
     * @returns True if x is between a and b, false otherwise
     */
    static between(a, b, x, exclusive) {
        if (exclusive) {
            return (a < x) && (x < b);
        }
        else {
            return (a <= x) && (x <= b);
        }
    }
    /**
     * Clamps the value x to the range [min, max], rounding up or down if needed
     * @param x The value to be clamped
     * @param min The min of the range
     * @param max The max of the range
     * @returns x, if it is between min and max, or min/max if it exceeds their bounds
     */
    static clamp(x, min, max) {
        if (x < min)
            return min;
        if (x > max)
            return max;
        return x;
    }
    /**
     * Clamps the value x to the range between 0 and 1
     * @param x The value to be clamped
     * @returns x, if it is between 0 and 1, or 0/1 if it exceeds their bounds
     */
    static clamp01(x) {
        return MathUtils.clamp(x, 0, 1);
    }
    /**
     * Clamps the lower end of the value of x to the range to min
     * @param x The value to be clamped
     * @param min The minimum allowed value of x
     * @returns x, if it is greater than min, otherwise min
     */
    static clampLow(x, min) {
        return x < min ? min : x;
    }
    /**
     * Clamps the lower end of the value of x to zero
     * @param x The value to be clamped
     * @returns x, if it is greater than 0, otherwise 0
     */
    static clampLow0(x) {
        return MathUtils.clampLow(x, 0);
    }
    static clampMagnitude(v, m) {
        if (v.magSq() > m * m) {
            return v.scaleTo(m);
        }
        else {
            return v;
        }
    }
    static changeRange(x, min, max, newMin, newMax) {
        return this.lerp(newMin, newMax, this.invLerp(min, max, x));
    }
    /**
     * Linear Interpolation
     * @param a The first value for the interpolation bound
     * @param b The second value for the interpolation bound
     * @param t The time we are interpolating to
     * @returns The value between a and b at time t
     */
    static lerp(a, b, t) {
        return a + t * (b - a);
    }
    /**
     * Inverse Linear Interpolation. Finds the time at which a value between a and b would occur
     * @param a The first value for the interpolation bound
     * @param b The second value for the interpolation bound
     * @param value The current value
     * @returns The time at which the current value occurs between a and b
     */
    static invLerp(a, b, value) {
        return (value - a) / (b - a);
    }
    /**
     * Cuts off decimal points of a number after a specified place
     * @param num The number to floor
     * @param place The last decimal place of the new number
     * @returns The floored number
     */
    static floorToPlace(num, place) {
        if (place === 0) {
            return Math.floor(num);
        }
        let factor = 10;
        while (place > 1) {
            factor != 10;
            place--;
        }
        return Math.floor(num * factor) / factor;
    }
    /**
     * Returns a number from a hex string
     * @param str the string containing the hex number
     * @returns the number in decimal represented by the hex string
     */
    static fromHex(str) {
        return parseInt(str, 16);
    }
    /**
     * Returns the number as a hexadecimal
     * @param num The number to convert to hex
     * @param minLength The length of the returned hex string (adds zero padding if needed)
     * @returns The hex representation of the number as a string
     */
    static toHex(num, minLength = null) {
        let factor = 1;
        while (factor * 16 < num) {
            factor *= 16;
        }
        let hexStr = "";
        while (factor >= 1) {
            let digit = Math.floor(num / factor);
            hexStr += MathUtils.toHexDigit(digit);
            num -= digit * factor;
            factor /= 16;
        }
        if (minLength !== null) {
            while (hexStr.length < minLength) {
                hexStr = "0" + hexStr;
            }
        }
        return hexStr;
    }
    /**
     * Converts a digit to hexadecimal. In this case, a digit is between 0 and 15 inclusive
     * @param num The digit to convert to hexadecimal
     * @returns The hex representation of the digit as a string
     */
    static toHexDigit(num) {
        if (num < 10) {
            return "" + num;
        }
        else {
            return String.fromCharCode(65 + num - 10);
        }
    }
}
exports.default = MathUtils;
},{}],188:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MathUtils_1 = require("./MathUtils");
class RenderingUtils {
    static toWebGLCoords(point, origin, worldSize) {
        return new Float32Array([
            MathUtils_1.default.changeRange(point.x, origin.x, origin.x + worldSize.x, -1, 1),
            MathUtils_1.default.changeRange(point.y, origin.y, origin.y + worldSize.y, 1, -1)
        ]);
    }
    static toWebGLScale(size, worldSize) {
        return new Float32Array([
            2 * size.x / worldSize.x,
            2 * size.y / worldSize.y,
        ]);
    }
    static toWebGLColor(color) {
        return new Float32Array([
            MathUtils_1.default.changeRange(color.r, 0, 255, 0, 1),
            MathUtils_1.default.changeRange(color.g, 0, 255, 0, 1),
            MathUtils_1.default.changeRange(color.b, 0, 255, 0, 1),
            color.a
        ]);
    }
}
exports.default = RenderingUtils;
},{"./MathUtils":187}],189:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Some utility functions for dealing with strings */
class StringUtils {
    /**
     * Extracts the path from a filepath that includes the file
     * @param filePath the filepath to extract the path from
     * @returns The path portion of the filepath provided
     */
    static getPathFromFilePath(filePath) {
        let splitPath = filePath.split("/");
        splitPath.pop();
        splitPath.push("");
        return splitPath.join("/");
    }
}
exports.default = StringUtils;
},{}],190:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Game_1 = require("./Wolfie2D/Loop/Game");
const SplashScreen_1 = require("./Scenes/SplashScreen");
const RegistryManager_1 = require("./Wolfie2D/Registry/RegistryManager");
const WeaponRegistry_1 = require("./GameSystems/Registry/WeaponRegistry");
const WeaponTypeRegistry_1 = require("./GameSystems/Registry/WeaponTypeRegistry");
// The main function is your entrypoint into Wolfie2D. Specify your first scene and any options here.
(function main() {
    // Run any tests
    runTests();
    // Set up options for our game
    let options = {
        canvasSize: { x: 1280, y: 720 },
        clearColor: { r: 0, g: 0, b: 0 },
        inputs: [
            { name: "up", keys: ["w"] },
            { name: "down", keys: ["s"] },
            { name: "left", keys: ["a"] },
            { name: "right", keys: ["d"] },
            { name: "interact", keys: ["e"] },
            { name: "pause", keys: ["escape"] },
            { name: "invincible", keys: ["i"] },
            { name: "coins", keys: ["c"] },
            { name: "lust", keys: ["1"] },
            { name: "wrath", keys: ["2"] },
            { name: "gluttony", keys: ["3"] }
        ]
    };
    // setup custom weapon registry
    let weaponTemplateRegistry = new WeaponRegistry_1.default();
    RegistryManager_1.default.addCustomRegistry("weaponTemplates", weaponTemplateRegistry);
    let weaponTypeRegistry = new WeaponTypeRegistry_1.default();
    RegistryManager_1.default.addCustomRegistry("weaponTypes", weaponTypeRegistry);
    // Create a game with the options specified
    const game = new Game_1.default(options);
    let gameLoop = game.getGameLoop();
    gameLoop.setMaxFPS(80);
    // Start our game
    game.start(SplashScreen_1.default, {});
})();
function runTests() { }
;
},{"./GameSystems/Registry/WeaponRegistry":72,"./GameSystems/Registry/WeaponTypeRegistry":73,"./Scenes/SplashScreen":89,"./Wolfie2D/Loop/Game":123,"./Wolfie2D/Registry/RegistryManager":151}]},{},[190])