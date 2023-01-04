import IndexJS from "./src/panel/index.js";
import IndexJSON from "./src/panel/index.json";
import Debugger from "./src/panel/debugger.json";

//DefinePlugin name & Setting 
const { name } = require('./package.json').defineXPlugin;
const code = new IndexJS();
code.setName(name);


export default {
    code,
    itemConfig: IndexJSON,
    debugger: Debugger,
    deployment: {
        type: "panel",
        operation: "run"//reload.run、run
    }
};

