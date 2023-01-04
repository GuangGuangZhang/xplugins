export const manager = {
    initEffectData: (effectArr) => {
        const obj = {};
        if (effectArr.length) {
            effectArr.forEach(item => {
                if (item.type === 'effect1') {
                    obj.inEffect = item.value;
                } else if (item.type === 'effect2') {
                    obj.inSort = item.value;
                } else if (item.type === 'effect3') {
                    obj.inInterpolation = item.value;
                } else if (item.type === 'effect4') {
                    obj.outEffect = item.value;
                } else if (item.type === 'effect5') {
                    obj.outSort = item.value;
                } else {
                    obj.outInterpolation = item.value;
                }
            })
            return obj;
        }
    }
}
