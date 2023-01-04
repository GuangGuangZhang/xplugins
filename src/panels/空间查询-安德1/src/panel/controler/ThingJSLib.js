export const ThingJSLib = {
    getConditionExpression: (condition) => {
        return THINGX.Layer.regConditonToThingJSQueryExpression(condition);
    },
    addMark: (object, markName) => {
        return THINGX.Marker.add(object, markName);
    },
    getMark: (object, markName) => {
        return THINGX.Marker.get(object, markName);
    },
    removeMark: (object, markName) => {
        return THINGX.Marker.remove(object, markName);
    },
    hiddenMarkWithEffect: (mark, effect, purpose) => {
        return THINGX.DigitalTwin.hideWithSmoothAnimation(mark, effect, purpose);
    },
    showMarkWithEffect: (mark, effect, purpose) => {
        return THINGX.DigitalTwin.showWithSmoothAnimation(mark, effect, purpose);
    },
    getEarthRoot: () => {
        return THINGX.Earth.getRoot();
    },
    queryBySphere: (condition, center, radius, sceneLevel) => {
        return THINGX.Utils.Space.queryBySphere(condition, center, radius, sceneLevel);
    },
    queryObject: (query) => {
        return THING.App.current.query(query);
    },
    selectObject: () => {
        return THING.App.current.selection.objects[0];
    },
    getObjectAllMarkConfig: (object) => {
        return THINGX.Marker.getConfig(object);
    },
    onEventOff: (object, eventType, callback, purpose) => {
        object.off(eventType, callback, purpose);
    },
    onEvent: (object, eventType, callback, purpose) => {
        object.on(eventType, callback, purpose);
    },
    warnMessage: (message) => {
        return THINGX.System.Message.warning(message);
    },
    setDebuggerLevel: (level) => {
        THINGX.Debugger.setLevel(level);
    }
}
