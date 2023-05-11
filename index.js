/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { FontAwesome } from 'react-native-vector-icons/FontAwesome';

// FontAwesome.loadFont(); // This line is important!

AppRegistry.registerComponent(appName, () => App);
