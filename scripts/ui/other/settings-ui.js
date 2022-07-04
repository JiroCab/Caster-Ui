Events.on(EventType.ClientLoadEvent, () => {
    const settings = Vars.ui.settings.graphics;
    settings.row();
    settings.button(Core.bundle.get("eui.name"), Styles.defaultt, () => extendedUIDialogSettings.show()).width(240).height(50);
    
    const extendedUIDialogSettings = new BaseDialog(Core.bundle.get("eui.settings"));
    extendedUIDialogSettings.addCloseButton();
    extendedUIDialogSettings.buttons.defaults().size(240, 60);

    extendedUIDialogSettings.cont.pane((() => {

        let contentTable;
        if (Version.number < 7) {
            contentTable = new Packages.arc.scene.ui.SettingsDialog.SettingsTable();
        } else {
            contentTable = new SettingsMenuDialog.SettingsTable();
        }

        contentTable.checkPref("eui-showPowerBar", true);
        contentTable.checkPref("eui-showFactoryProgress", true);
        contentTable.checkPref("eui-ShowUnitTable", true);
        contentTable.checkPref("eui-ShowBlockInfo", true);
        contentTable.checkPref("eui-ShowResourceRate", false);
        contentTable.checkPref("eui-TrackPlayerCursor", false);
        contentTable.checkPref("eui-TrackLogicControl", false);
        contentTable.sliderPref("eui-maxZoom", 10, 1, 10, 1, i => i);

        return contentTable;
    })());
});
