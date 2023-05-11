import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, View, Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import Download from '../screens/Download';
const Tab = createBottomTabNavigator();

export default function BottomNavigator() {
    const HomeIcon = require('../images/home.png');
    const DownloadIcon = require('../images/download.png');
  return (
    <Tab.Navigator
    screenOptions={{ 
        // tabBarStyle:{
        //   backgroundColor:'lightgray'
        // },
        tabBarLabelStyle:{
          fontWeight: 'bold',
          fontSize: 11,
        },
     }}
    
    >
      <Tab.Screen
        name="Home" 
        component={HomeScreen} 
        options={{ 
          headerShown: false,
          tabBarIcon: ({focused}) =>{
            return (
              <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <Image 
                  source={HomeIcon} 
                  style={{
                    height: 25, 
                    width: 25, 
                    tintColor: focused ? 'black' : '#BDBDBD'
                  }}
                />
              </View>
            );
          },
        }}
      />
      <Tab.Screen
        name="Download" 
        component={Download} 
        options={{ 
            headerShown: false,
            tabBarIcon: ({focused}) =>{
              return (
                <View style={{alignItems: 'center', justifyContent: 'center'}}>
                  <Image 
                    source={DownloadIcon} 
                    style={{
                      height: 25, 
                      width: 25, 
                      tintColor: focused ? 'black' : '#BDBDBD'
                    }}
                  />
                </View>
              );
            },
        }} 
      />
    </Tab.Navigator>
  );
}