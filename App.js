import { createNativeStackNavigator } from '@react-navigation/native-stack'
import BottomNavigator from './src/BottomNavigator/BottomNavigator'
import { NavigationContainer } from '@react-navigation/native'
import StatusScreen from './src/screens/StatusScreen'
import MyContext from './src/Context/ContextAPI'
import { useState } from 'react'

const Stack = createNativeStackNavigator()

function App() {
  const [donwloadedContext, setDownloadedContext] = useState('')
  return (
    <MyContext.Provider value={{ donwloadedContext, setDownloadedContext }}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="BottomNavigatorr" component={BottomNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="StatusScreen" component={StatusScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </MyContext.Provider>
  )
}

export default App