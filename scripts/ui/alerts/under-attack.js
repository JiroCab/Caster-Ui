const Alerts = require("caster-ui/ui/alerts/alert");
const output = require("caster-ui/utils/output-wrapper");
const drawTasks = require("caster-ui/utils/draw/draw-tasks");
const coreList = require("caster-ui/ui/blocks/core-blocks");

var inConstruction = new Seq();

var queue = new Seq();

Events.on(EventType.BlockDestroyEvent, cons(e => {
	var tile = e.tile;
	if(tile.build instanceof CoreBlock.CoreBuild) {

		 if(tile.team() == Team.sharded) {
	       output.ingameAlert(Core.bundle.get("alerts.yellow"),
	       drawTasks.divergingCircles(tile.build.x, tile.build.y, {color: Color.yellow}));
	    }
	     if(tile.team() == Team.crux) {
	       output.ingameAlert(Core.bundle.get("alerts.red"),
	       drawTasks.divergingCircles(tile.build.x, tile.build.y, {color: Color.red}));
	     }
	     if(tile.team() == Team.purple ) {
	       output.ingameAlert(Core.bundle.get("alerts.purple"),
	       drawTasks.divergingCircles(tile.build.x, tile.build.y, {color: Color.purple}));
	     }
	     if(tile.team() == Team.green) {
	       output.ingameAlert(Core.bundle.get("alerts.green"),
	       drawTasks.divergingCircles(tile.build.x, tile.build.y, {color: Color.green}));
	     }
	     if(tile.team() == Team.blue) {
	       output.ingameAlert(Core.bundle.get("alerts.blue"),
	       drawTasks.divergingCircles(tile.build.x, tile.build.y, {color: Color.blue}));
	     }




    }
   }
  )
 );


