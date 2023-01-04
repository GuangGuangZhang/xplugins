import BundleInstance from "./src/panel/bundle";
import BundleParser from "@thingjs-x/xplugin-bundle/dist/bundle/BundleParser"
//DefinePlugin name & Setting 
const { id, name } = require('./package.json').defineXPlugin;

//support class or custom
const ParserInstance = new BundleParser();
ParserInstance.setBundleInstance(BundleInstance);
const BundleJSON = ParserInstance.parser(id, name);

export default BundleJSON;
