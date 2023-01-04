<template>
  <div class=".space-query-ander-warp">
    <div class="space-query-ad" v-for="(item, i) in deviceArr" :key="i">
      <div class="title-info">查找附近的
        <div>{{ item }}</div>
      </div>
      <div class='bjkys' :style="{backgroundImage:'url(' + bgImage + ')'}">
        <el-switch v-model="valueArr[i]" :active-color="colorArr[0]" :inactive-color="colorArr[1]"
                   @change="change($event, i)"></el-switch>
      </div>
    </div>
  </div>

</template>
<script>
import space from './../resources/spaces.png'
import {ThingJSLib} from "./../controler/ThingJSLib";

export default {
  name: 'SpaceQuery',
  data() {
    return {
      bgImage: '',
      deviceArr: ['摄像头'], // 需要查找的设备
      colorArr: ['#2762D7', 'rgba(255, 255, 255, 0.2)'], // el-switch配置项
      valueArr: [false], // el-switch配置项
      conditionArr: [], // 孪生体筛选条件
      effectArr: [], // 标记名称
      searchDevices: {}, // 存储查询到的各类设备，根据查询按钮index，将每个查询的设备存到一个数组中
      oldDevices: {}, // 旧的设备，在定时刷新中没有被查询到
      newDevices: {}, // 新的设备，在定时刷新中被新查询到的
      allRequestId: {}, // 所有请求的ID
      itemIndex: [], // 查询按钮的index
      userConfig: {
        radius: 20,
        inEffect: 'fadeIn',
        inSort: '',
        inInterpolation: '',
        outEffect: 'fadeOut',
        outSort: '',
        outInterpolation: '',
      },
    }
  },
  mounted() {
    this.bgImage = space;
  },
  methods: {
    /**
     * @description 改变状态
     * @param { boolean } e 状态值
     * @param { number } i 索引值
     */
    change(e, i) {
      const obj = ThingJSLib.selectObject(); // 选中的孪生体
      const {userConfig} = this;
      if (!obj || !userConfig) {
        return;
      }
      if (!this.itemIndex.includes(i)) {
        this.itemIndex.push(i);// 存储当前查询的序列号 fgfdgfdg
      }
      // 开启查找
      if (e) {
        this.requestDeviceInterval();
      } else {
        this.stopRequestData(i);
        this.itemIndex = this.itemIndex.filter(v => v !== i);
        // 关闭对应设备
        const nearbyDevices = obj.nearbyDevices[i];
        if (!nearbyDevices.length) {
          return;
        }
        // 移除顶图标
        this.removeIcon(nearbyDevices, this.deviceArr[i], i, obj);
      }
    },

    // 停止请求
    stopRequestData(index) {
      if (this.allRequestId[index]) {
        cancelAnimationFrame(this.allRequestId[index]);
        this.allRequestId[index] = null;
      }
    },

    // 刷新请求，应用于孪生体移动过程中查询周围设备
    requestDeviceInterval() {
      const obj = ThingJSLib.selectObject();
      const {userConfig} = this;
      this.itemIndex.forEach(order => {
        this.stopRequestData(order);
        if (!obj) {
          return;
        }
        this.queryDevicesByConditions(this.conditionArr[order], obj, userConfig.radius, this.deviceArr[order], order);
        this.allRequestId[order] = requestAnimationFrame(this.requestDeviceInterval);
      });
    },

    // 获取根层级
    getSceneRootLevel() {
      return ThingJSLib.queryObject('.Map').length > 0 ? ThingJSLib.queryObject('#earthRoot')[0] || ThingJSLib.getEarthRoot() : ThingJSLib.queryObject('[businessType=园区]')[0];
    },

    // 开启查询，查询周围设备，在移动过程中查询时，前后两次查询结果进行对比
    queryDevicesByConditions(condition, obj, radius, curSearchPurpose, index) {
      // obj.getWorldCenter() API 有bug 孪生体在移动过程中不会更新变化 考虑position位置轴心不定，故使用包围盒中心点为起点
      const queryResult = Array.from(ThingJSLib.queryBySphere(condition, obj.boundingBox.center, radius, this.getSceneRootLevel()));
      // 定时刷新后比对前后查询对象是否发生变化
      if (!this.compareTheOldResultWithNewResult(queryResult, index)) {
        if (!this.oldDevices[index].length && !this.newDevices[index].length) {
          // 说明在定时刷新时，没有查询到新增的设备，也没有之前查询到的设备被过滤，所以已查询到设备标记不变化
          return;
        }
        if (this.newDevices[index].length) {
          // 在查询范围内新增的设备，需要创建其标记并显示
          this.createDecoratorAndShow(this.newDevices[index], obj, index, curSearchPurpose);
        }
        if (this.oldDevices[index].length) {
          // 不在查询范围内的设备，将其标记隐藏并销毁
          if (obj.nearbyDevices[index].length) {
            const oldDevicesIds = this.oldDevices[index].map(item => {
              return item.id;
            });
            const tempDevice = obj.nearbyDevices[index].filter(v => oldDevicesIds.includes(v.id));
            this.removeIcon(tempDevice, curSearchPurpose, index, obj, oldDevicesIds);
          }
        }
      } else {
        // 创建并显示标记
        this.createDecoratorAndShow(queryResult, obj, index, curSearchPurpose);
      }
      // 如果没有查询到设备直接提示结束
      if (!queryResult || queryResult.length <= 0) {
        this.consoleMessageTips(curSearchPurpose);
        return;
      }
    },

    /**
     * @description 显示隐藏设备勾边颜色
     * @param { boolean } bool 是否在查询范围内
     * @param { Array } objects 显示或者隐藏勾边的对象
     */
    objectOutLineColor(objects, bool) {
      if (objects.length) {
        objects.forEach(object => {
          if (bool) {
            object.style.outlineColor = '#FE8000';
          } else {
            object.style.outlineColor = null;
          }
        });
      }
    },

    // 创建并带出场效果显示标记
    createDecoratorAndShow(queryResult, obj, index, curSearchPurpose) {
      this.objectOutLineColor(queryResult, true);
      const {userConfig} = this;
      const nearbyDevices = [];
      const curEffect = this.effectArr[index] || '_default_'; // 标记名称
      const totalCnt = queryResult.length;
      for (let i = 0; i < totalCnt; i++) {
        const nearbyDevice = ThingJSLib.queryObject(`#${queryResult[i].id}`)[0]; // 孪生体对象
        ThingJSLib.onEventOff(nearbyDevice, 'DecoratorsComplete', null, '标记创建完成');
        const effectArr = Object.keys(ThingJSLib.getObjectAllMarkConfig(nearbyDevice) || {});
        if (!effectArr.includes(curEffect)) {
          ThingJSLib.warnMessage('该标记未开启');
          return;
        }
        // 创建一个标记根据curEffect（标记名称）
        const marker = ThingJSLib.addMark(nearbyDevice, curEffect); //  返回一个数组
        if (marker && marker.length) {
          const _this = this;
          ThingJSLib.onEvent(nearbyDevice, 'DecoratorsComplete', () => {
            _this.showDecoratorByFadeEffect(marker[0], userConfig, curSearchPurpose);
          }, '标记创建完成');
        }
        nearbyDevices.push(nearbyDevice);
      }
      if (obj.nearbyDevices[index].length) {
        obj.nearbyDevices[index] = obj.nearbyDevices[index].concat(nearbyDevices);
      } else {
        obj.nearbyDevices[index] = nearbyDevices
      }
    },
    showDecoratorByFadeEffect(marker, userConfig, curSearchPurpose) {
      ThingJSLib.showMarkWithEffect(marker, {
        type: userConfig.effectData.inEffect,
        lerpType: userConfig.effectData.inInterpolation,
        sType: userConfig.effectData.inSort, // 空间排序类型;
      }, curSearchPurpose + '_nearBy');
    },

    // 对比前后两次查询结果，拿到新增的和需要舍弃的旧的设备,当第一次查询时，无需进行对比直接赋值查询的结果并返回true，否则返回false
    compareTheOldResultWithNewResult(result, index) {
      if (!this.searchDevices[index].length) {
        this.searchDevices[index] = Array.from(result);
        return true;
      } else {
        const resultId = result.map(item => item.id);
        this.oldDevices[index] = this.searchDevices[index].filter(v => !resultId.includes(v.id));
        const searchDevicesIndexId = this.searchDevices[index].map(item => item.id);
        this.newDevices[index] = result.filter(v => !searchDevicesIndexId.includes(v.id));
        this.searchDevices[index] = Array.from(result);
        return false;
      }
    },

    consoleMessageTips(purpose) {
      console.warn(`附近未查询到${purpose}`);
    },

    // 移除标记
    removeIcon(nearbyDevices, curSearchPurpose, index, obj, oldDevicesIds) {
      const {userConfig} = this;
      nearbyDevices.forEach(nearbyDevice => {
        const marker = ThingJSLib.getMark(nearbyDevice, obj.curEffect[index]);
        if (marker) {
          const promise = ThingJSLib.hiddenMarkWithEffect(marker, {
            type: userConfig.effectData.outEffect,
            lerpType: userConfig.effectData.outInterpolation,
            sType: userConfig.effectData.outSort, // 空间排序类型;
          }, curSearchPurpose + '_nearBy');
          promise.then(() => {
            ThingJSLib.removeMark(nearbyDevice, obj.curEffect[index]);
          });
        }
      });
      this.objectOutLineColor(nearbyDevices, false);
      if (oldDevicesIds) {
        obj.nearbyDevices[index] = obj.nearbyDevices[index].filter(v => !oldDevicesIds.includes(v.id));
      } else {
        obj.nearbyDevices[index] = [];
        this.clearRequestData(index);
      }
    },

    clearRequestData(index) {
      this.stopRequestData(index);
      this.searchDevices[index] = [];
      this.oldDevices[index] = [];
      this.newDevices[index] = [];
    },
  },
};
</script>
<style lang="css">
.space-query-ander-warp .space-query-ad {
  display: flex;
  justify-content: space-between;
  line-height: 28px;
  position: relative;
  margin-bottom: 10px;
  align-items: center;
  color: #00ffff;
  font-size: 14px;
  font-weight: 400;
}

.space-query-ander-warp .space-query-ad .title-info {
  display: flex;
}

.space-query-ander-warp .space-query-ad .title-info > div {
  font-size: 18px;
  margin-left: 5px;
}

.space-query-ander-warp .space-query-ad .bjkys {
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
}

.space-query-ander-warp .space-query-ad :last-child {
  margin-bottom: 0;
}

.space-query-ander-warp .space-query-ad .bjkys .el-switch {
  width: 52px;
  height: 26px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.space-query-ander-warp .space-query-ad .bjkys .el-switch.is-checked .el-switch__core {
  width: 100% !important;
  height: 100%;
  border-radius: 0;
  background-color: rgba(0, 255, 255, 0) !important;
  border: 1px solid rgba(0, 255, 255, 0) !important;
}

.space-query-ander-warp .space-query-ad .bjkys .el-switch .el-switch__core {
  width: 100% !important;
  height: 100%;
  border-radius: 0;
  background-color: rgba(0, 255, 255, 0) !important;
  border: 1px solid rgba(0, 255, 255, 0) !important;
}

.space-query-ander-warp .space-query-ad .bjkys > .el-switch .el-switch__core::after {
  background: rgba(0, 222, 255, 0.3);
  width: 13px;
  top: 6px;
  height: 13px;
  border-radius: 0;
  margin-left: 6px;
}

.space-query-ander-warp .space-query-ad .bjkys > .el-switch.is-checked .el-switch__core::after {
  width: 13px;
  top: 6px;
  height: 13px;
  border-radius: 0;
  margin-left: -22px;
  background: linear-gradient(-135deg, transparent 3px, #00ffff 0) top right;
}
</style>
