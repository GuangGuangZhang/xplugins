import PanelPlugin from "@thingjs-x/xplugin-core/dist/plugin/panel/PanelPlugin";
import IndexVue from './index.vue'
import {ThingJSLib} from "./controler/ThingJSLib";
import {manager} from "./controler/Manager";

export default class extends PanelPlugin {

    constructor() {
        super(IndexVue); //UI 载入入口
    }

    onActivate(xHostObject, widget) {
        if (this.config) {
            const config = JSON.parse(JSON.stringify(this.config));
            config.effectData = manager.initEffectData(config.effect);
            widget.$children[0].userConfig = config;
            if (config.map.length) {
                const deviceNameArr = config.map.map(item => item.key);
                widget.$children[0].deviceArr = deviceNameArr; // 需要查找的设备
                widget.$children[0].conditionArr = config.map.map(item => ThingJSLib.getConditionExpression(item.condition)); // 筛选条件;
                widget.$children[0].effectArr = config.map.map(item => item.value); // 标记名称;
                widget.$children[0].valueArr = new Array(deviceNameArr.length).fill(false); // 面板打开所有查询按钮都是默认的关闭状态
                xHostObject.nearbyDevices = {};
                xHostObject.curEffect = [];
                config.map.forEach((item, index) => {
                    widget.$children[0].searchDevices[index] = [];
                    widget.$children[0].oldDevices[index] = [];
                    widget.$children[0].newDevices[index] = [];
                    widget.$children[0].allRequestId[index] = null;
                    xHostObject.curEffect.push(item.value);
                    xHostObject.nearbyDevices[index] = [];
                });
            } else {
                ThingJSLib.setDebuggerLevel('warn');
                console.warn(`${widget.$attrs.instanceName}没有配置条件`);
            }
        }
    }

    onDeactivate(xHostObject, widget) {
        // 获取用户配置数据
        const userConfig = widget.$children[0].userConfig;
        userConfig.map.forEach((_item, index) => {
            if (widget.$children[0].allRequestId[index]) {
                cancelAnimationFrame(widget.$children[0].allRequestId[index]);
                widget.$children[0].allRequestId[index] = null;
            }
        });
        const deviceNameArr = userConfig.map.map(item => item.key);
        const valueArr = new Array(deviceNameArr.length).fill(false);
        valueArr.forEach((_item, index) => {
            const nearbyDevices = xHostObject.nearbyDevices[index];
            if (nearbyDevices.length) {
                widget.$children[0].objectOutLineColor(nearbyDevices, false);
                nearbyDevices.forEach(nearbyDevice => {
                    const marker = ThingJSLib.getMark(nearbyDevice, xHostObject.curEffect[index]);
                    if (marker) {
                        const promise = ThingJSLib.hiddenMarkWithEffect(marker, {
                            type: userConfig.effectData.outEffect,
                            lerpType: userConfig.effectData.outInterpolation,
                            sType: userConfig.effectData.outSort, // 空间排序类型;
                        }, deviceNameArr[index] + '_nearBy');
                        promise.then(() => {
                            ThingJSLib.removeMark(nearbyDevice, xHostObject.curEffect[index]);
                        });
                    }
                });
            }
        });
    }
}
