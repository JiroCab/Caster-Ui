const unitsCounter = require("caster-ui/units/units-counter");
const barBuilder = require("caster-ui/utils/draw/bar-builder");

const granulatiry = 6;
const maxToDisplay = 8;

let prevUnitsUiVisible = true;
let unitsUiVisible = true;
let hideCoreUnits = false;
let showUnitsList = true;
let showPlayerList = true;
let compactPlayerList = false;
let isBuilded = false;
let holdedEntity = null;
let hoveredEntity = null;
let trackedPlayer = null;
let amountToDisplay = 0;
let updateTimer = Date.now();
let optionChecker = 0;
let prevOptionChecker = 0;
let prevUserPos

let overlayMarker;
let contentTable;
let unitTable;
let playerTable;

Events.run(Trigger.update, () => {
    if (!Core.settings.getBool("eui-ShowUnitTable", true) && !Core.settings.getBool("eui-ShowPlayerList", true)) {
        if (isBuilded) {
            clearTable();
        }
        hoveredEntity = null;
        return;
    }

    if (hoveredEntity && !contentTable.hasMouse()) hoveredEntity = null;
    if (!overlayMarker) {
        setMarker();
    }

    if (Core.settings.getBool("eui-ShowPlayerList", false) && trackedPlayer) {
        let input = Vars.control.input;
        if(!Vars.mobile){input.panning = true;}

        let cameraFloat = 0.085
        if (!Core.settings.getBool("smoothcamera")){ cameraFloat = 1}

        if (trackedPlayer.unit()){
            //workaround for when in multiplayer, sometimes respawning puts you in 0,0 during the animation before moving your unit
            if (trackedPlayer.x != 0 && trackedPlayer.y != 0) {Core.camera.position.lerpDelta(trackedPlayer, cameraFloat)
            } else {Core.camera.position.lerpDelta(trackedPlayer.bestCore(), cameraFloat)}
        } else {Core.camera.position.set(trackedPlayer.x, trackedPlayer.y)}
    }

    // updated so rarely because fast makes click on label impossible
    const timer = Date.now();
    if (timer - 500 < updateTimer) return;
    updateTimer = timer;

    const unitsValueTop = unitsCounter.getUnitsValueTop (maxToDisplay, granulatiry, hideCoreUnits);
    amountToDisplay = unitsValueTop.length;

    if (isRebuildNeeded()) {
        rebuildTable();
    }

    optionChecker = prevOptionChecker;
    optionChecker = 0;
    if (Core.settings.getBool("eui-ShowPlayerList", true)) optionChecker++;
    if (Core.settings.getBool("eui-ShowUnitTable", true)) optionChecker++;

    unitTable.clearChildren()
    if(Core.settings.getBool("eui-ShowUnitTable", true)){
        for (let [, teamInfo] of unitsValueTop) {
            const team = teamInfo.team;
            const teamUnits = teamInfo.units;

            for (let [, unitInfo] of Object.entries(teamUnits)) {
                const entity = unitInfo.entity;
                const amount = unitInfo.amount;
                unitTable.label(() => {
                    return getTeamColor(team) + amount + '[white]';
                }).left();
                const image = unitTable.image(entity.type.icon(Cicon.small)).left().padRight(5).padBottom(2).maxSize(24).get();
                image.hovered(() => {
                    hoveredEntity = entity;
                });
                image.clicked(() => {
                    if (!holdedEntity || !isSameEntity(holdedEntity, entity)) {
                        holdedEntity = entity;
                    } else {
                        holdedEntity = null;
                    }
                });

                if (holdedEntity && holdedEntity.dead && isSameEntity(holdedEntity, entity)) {
                    holdedEntity = entity;
                }
            };
            unitTable.row();
        }
    }

    playerTable.clearChildren()
    let playerCount = 0
    if (!Core.settings.getBool("eui-ShowPlayerList", true)) return;
    Groups.player.each((player) => {
        if (player == Vars.player) return;
        const image = playerTable.image(player.icon()).left().padRight(6).padBottom(3).maxSize(27).get();
        let text
        if(!compactPlayerList){
            text = playerTable.label(() => {return getTeamColor(player) + player.name + '[white]' } ).left().with(l => {
                l.clicked(() => {setTrackedPlayer(player)})
            });
            playerTable.row();
        }else{
            let playerCount
            if (playerCount = maxToDisplay){
                playerCount++;
            }else{
                playerCount = 0;
                playerTable.row();
            }
        }

        image.clicked(() => {
            setTrackedPlayer(player)
        });

    });

});

Events.run(Trigger.draw, () => {
    if (!Core.settings.getBool("eui-ShowUnitTable", false)) return;

    let entity;
    if (hoveredEntity && !hoveredEntity.dead) {
        entity = hoveredEntity;
    } else if (holdedEntity && !holdedEntity.dead) {
        entity = holdedEntity;
    } else {
        return
    }

    Draw.draw(Layer.overlayUI+0.01, () => {
        let x;
        let y;

        if (Vars.player.unit() instanceof NullUnit) {
            const position = Core.camera.position;
            x = position.x;
            y = position.y;
        } else {
            const unit = Vars.player.unit();
            x = unit.x;
            y = unit.y;
        }
        const distance = Mathf.dst(x, y, entity.x, entity.y);
        const text = Math.round(distance / 8).toString();

        Draw.color(entity.team.color);
        Lines.line(x, y, entity.x, entity.y);
        if (distance > 80) barBuilder.drawLabel(text, x, y + 20, Color.white, true);
    });
})

Events.on(EventType.WorldLoadEvent, () => {
    holdedEntity = null;
    trackedPlayer = null;
});

function rebuildTable() {
    clearTable();
    buildTable();
}

function clearTable() {
    if (!isBuilded) return;

    contentTable.clearChildren();
    isBuilded = false;
}

function buildTable() {
    const buttonSize = 35;

    let cuiTableButtons = contentTable.table().top().left().margin(3).get();
    cuiTableButtons.clearChildren();
    //Global buttons
    cuiTableButtons.button(Icon.play, Styles.defaulti, () => {
        unitsUiVisible = !unitsUiVisible;
    }).width(buttonSize).height(buttonSize).pad(0).name("show").tooltip(Core.bundle.get("units-table.button.hide.tooltip"));
    let imageButton

    if (Core.settings.getBool("eui-ShowUnitTable", true)) {//Units list buttons
        imageButton = cuiTableButtons.button(new TextureRegionDrawable(Icon.unitsSmall), Styles.defaulti, () => {
            showUnitsList = !showUnitsList;
        }).update(b => b.setChecked(showUnitsList)).width(buttonSize).height(buttonSize).pad(1).name("hide-units").tooltip(Core.bundle.get("units-table.button.hide-units.tooltip")).get();
        imageButton.visibility = () => unitsUiVisible;
        imageButton.resizeImage(buttonSize*0.6);

        imageButton = cuiTableButtons.button(new TextureRegionDrawable(Icon.adminSmall), Styles.defaulti, () => {
            hideCoreUnits = !hideCoreUnits;
        }).update(b => b.setChecked(hideCoreUnits)).width(buttonSize).height(buttonSize).pad(1).name("core-units").tooltip(Core.bundle.get("units-table.button.core-units.tooltip")).get();
        imageButton.visibility = () => unitsUiVisible;
        imageButton.resizeImage(buttonSize*0.6);
    }

    if (Core.settings.getBool("eui-ShowPlayerList", true)) {//Player list buttons
        imageButton = cuiTableButtons.button(new TextureRegionDrawable(Icon.players), Styles.defaulti, () => {
            showPlayerList = !showPlayerList;
        }).update(b => b.setChecked(showPlayerList)).width(buttonSize).height(buttonSize).pad(1).name("hide-player-list").tooltip(Core.bundle.get("units-table.button.hide-player-list.tooltip")).get();
        imageButton.visibility = () => unitsUiVisible;
        imageButton.resizeImage(buttonSize*0.6);

        imageButton = cuiTableButtons.button(new TextureRegionDrawable(Icon.host), Styles.defaulti, () => {
            compactPlayerList = !compactPlayerList;
        }).update(b => b.setChecked(showPlayerList)).width(buttonSize).height(buttonSize).pad(1).name("hide-player-list").tooltip(Core.bundle.get("units-table.button.compact-player-list.tooltip")).get();
        imageButton.visibility = () => unitsUiVisible;
        imageButton.resizeImage(buttonSize*0.6);

    }
    contentTable.row();

    if(showUnitsList){
        unitTable = contentTable.table().margin(3).get();
        unitTable.visibility = () => unitsUiVisible;
        contentTable.row();
    }

    if(showPlayerList){
        playerTable = contentTable.table().margin(3).get();
        playerTable.visibility = () => unitsUiVisible;
    }

    isBuilded = true;
}

function isRebuildNeeded() {
    if (!isBuilded) return true;
    if (optionChecker != prevOptionChecker) return true;
    return false;
}

function setMarker() {
    const contentTableStyle = Version.number > 6 ? Tex.buttonEdge4 : Styles.black3

    overlayMarker = Vars.ui.hudGroup.find("waves");
    overlayMarker.row();
    contentTable = overlayMarker.table(contentTableStyle).update((t) => {
        if (prevUnitsUiVisible != unitsUiVisible) {
            t.setBackground(unitsUiVisible ? contentTableStyle : Styles.none);
            prevUnitsUiVisible = unitsUiVisible;
        }
    }).name("unit-table").top().left().marginBottom(2).marginTop(2);
    contentTable = contentTable.get();
    contentTable.visibility = () => isBuilded && (Core.settings.getBool("eui-ShowPlayerList", true) || Core.settings.getBool("eui-ShowUnitTable", true));
}

function isSameEntity(entity1, entity2) {
    if (entity1 == null || entity2 == null) return false;
    return entity1.team == entity2.team && entity1.type == entity2.type;
}

function getTeamColor(team) {
    return "[#"+team.color.toString()+"]";
}
function setTrackedPlayer(player) {
    if(trackedPlayer == null || trackedPlayer != player){trackedPlayer = player}
    else {trackedPlayer = null};
}
