import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen.js';
import PlayersScreen from './src/screens/PlayersScreen.js';
import StageSelectionScreen from './src/screens/StageSelectionScreen.js';
import GameScreen from './src/screens/GameScreen.js';
import PodiumScreen from './src/screens/PodiumScreen.js'; // <--- IMPORT
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Players" component={PlayersScreen} />
        <Stack.Screen name="StageSelection" component={StageSelectionScreen} />
        <Stack.Screen name="Race" component={GameScreen} />
        <Stack.Screen name="Podium" component={PodiumScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}