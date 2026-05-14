import AppNavigator from './src/Nav/AppNavigator';
import { UserProvider } from './src/context/UserContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { NotificationProvider } from './src/context/NotificationContext';

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <NotificationProvider>
          <AppNavigator />
        </NotificationProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
