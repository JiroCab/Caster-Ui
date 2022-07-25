const Alerts = require("caster-ui/ui/alerts/alert");
const output = require("caster-ui/utils/output-wrapper");
const coreBlocks = require("caster-ui/blocks/core-blocks");

const maxTime = 60*300 // 5 min;

let sended;
let timer;

Events.on(EventType.WorldLoadEvent, () => {
    sended = false;
    timer = Time.time;
});

let event = (event) => {
    const unit = event.block;
    if (sended || !coreBlocks)) return;
    if (Time.time - timer < maxTime) {
        output.ingameAlert(Core.bundle.get("alerts.core-lost"));
        sended = true;
    }
}

new Alerts.BaseAlert(
    () => {
        Events.on(UnitDestroyEvent, event);
    },
    () => {
        Events.remove(UnitDestroyEvent, event);
    }
)