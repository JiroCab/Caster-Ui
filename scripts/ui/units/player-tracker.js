exports.drawCursor = function(player) {
    if (player == Vars.player) return;

    const cursorX = player.mouseX;
    const cursorY = player.mouseY;

    Draw.draw(Layer.overlayUI+0.01, () => {
        Drawf.square(cursorX, cursorY, 1.5, player.team().color);
        Draw.alpha(0.7);
        Draw.color();
        Draw.reset();
    });
}
