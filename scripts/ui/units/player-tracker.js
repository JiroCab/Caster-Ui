exports.drawCursor = function(player) {
    if (player == Vars.player) return;

    const cursorX = player.mouseX;
    const cursorY = player.mouseY;

    Draw.draw(Layer.overlayUI+0.01, () => {
        Drawf.square(build.x, build.y, build.block.size * tilesize / 2f + 1f, Pal.place);
        Draw.alpha(0.7);
        Draw.reset();
    });
}
