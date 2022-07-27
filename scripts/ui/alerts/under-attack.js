const Alerts = require("caster-ui/ui/alerts/alert");
const output = require("caster-ui/utils/output-wrapper");
const drawTasks = require("caster-ui/utils/draw/draw-tasks");
const coreList = require("caster-ui/ui/blocks/core-blocks");


var inConstruction = new Seq();

var queue = new Seq();

Events.on(EventType.BlockDestroyEvent, cons(e => {
	var tile = e.tile;

	if(tile.build instanceof CoreBlock.CoreBuild) {

       if (Core.settings.getBool("eui-ShowAlertsCircles", true)) {
		 if (tile.team() == Team.sharded) {drawTasks.divergingCircles(tile.build.x, tile.build.y, {color: Color.gold})}
	     if (tile.team() == Team.crux) {drawTasks.divergingCircles(tile.build.x, tile.build.y, {color: Color.scarlet})}
	     if (tile.team() == Team.purple) {drawTasks.divergingCircles(tile.build.x, tile.build.y, {color: Color.purple})}
	     if (tile.team() == Team.green) {drawTasks.divergingCircles(tile.build.x, tile.build.y, {color: Color.green})}
	     if (tile.team() == Team.blue) {drawTasks.divergingCircles(tile.build.x, tile.build.y, {color: Color.purple})}
       }
       if(Core.settings.getBool("eui-ShowAlerts", true) && Vars.ui.hudfrag.shown ){ //Only Que Toast if Ui is shown
	     if(tile.team() == Team.sharded) {output.ingameAlert(Core.bundle.get("alerts.yellow"));}
	     if(tile.team() == Team.crux) {output.ingameAlert(Core.bundle.get("alerts.red"));}
	     if(tile.team() == Team.purple ) {output.ingameAlert(Core.bundle.get("alerts.purple"));}
	     if(tile.team() == Team.green) {output.ingameAlert(Core.bundle.get("alerts.green"));}
	     if(tile.team() == Team.blue) {output.ingameAlert(Core.bundle.get("alerts.blue"));}
       }

       if(Core.settings.getBool("eui-SendChatCoreLost", true) ){
 	     if(tile.team() == Team.sharded) {Call.sendChatMessage("[gold]Sharded[] Core Destroyed!");}
 	     if(tile.team() == Team.crux) {Call.sendChatMessage("[scarlet]Crux[] Core Destroyed!");}
 	     if(tile.team() == Team.purple) {Call.sendChatMessage("[green]Green[] Core Destroyed!");}
 	     if(tile.team() == Team.green) {Call.sendChatMessage("[purple]Malis[] Core Destroyed!");}
 	     if(tile.team() == Team.blue) {Call.sendChatMessage("[blue]Blue[] Core Destroyed!");}
       }
    }
   }
  )
 );


