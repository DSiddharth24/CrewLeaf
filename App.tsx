import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import './i18n';

// Onboarding Screens
import SplashScreen from './screens/SplashScreen';
import LanguageSelectionScreen from './screens/LanguageSelectionScreen';
import RoleSelectionScreen from './screens/RoleSelectionScreen';
import AuthScreen from './screens/AuthScreen';

import ManagerDashboard from './screens/manager/ManagerDashboard';
import FieldManagementScreen from './screens/manager/FieldManagementScreen';
import WorkerManagementScreen from './screens/manager/WorkerManagementScreen';
import AttendanceViewScreen from './screens/manager/AttendanceViewScreen';
import TaskManagementScreen from './screens/manager/TaskManagementScreen';
import CreateTaskScreen from './screens/manager/CreateTaskScreen';
import WageManagementScreen from './screens/manager/WageManagementScreen';
import AnalyticsScreen from './screens/manager/AnalyticsScreen';
import AlertsScreen from './screens/manager/AlertsScreen';
import SettingsScreen from './screens/SettingsScreen';

// Supervisor Screens
import SupervisorDashboard from './screens/supervisor/SupervisorDashboard';
import SupervisorTaskScreen from './screens/supervisor/SupervisorTaskScreen';
import AttendanceVerificationScreen from './screens/supervisor/AttendanceVerificationScreen';
import CreateUserScreen from './screens/supervisor/CreateUserScreen';
import CreateFieldScreen from './screens/supervisor/CreateFieldScreen';
import DeviceAssignmentScreen from './screens/supervisor/DeviceAssignmentScreen';

// Worker Screens
import WorkerHome from './screens/worker/WorkerHome';
import ReportIssueScreen from './screens/worker/ReportIssueScreen';
import TaskOutputScreen from './screens/worker/TaskOutputScreen';
import LeaveRequestScreen from './screens/worker/LeaveRequestScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* Onboarding Flow */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />

        {/* Manager Module */}
        <Stack.Screen name="ManagerDashboard" component={ManagerDashboard} />
        <Stack.Screen name="FieldManagement" component={FieldManagementScreen} />
        <Stack.Screen name="WorkerManagement" component={WorkerManagementScreen} />
        <Stack.Screen name="AttendanceView" component={AttendanceViewScreen} />
        <Stack.Screen name="TaskManagement" component={TaskManagementScreen} />
        <Stack.Screen name="CreateTask" component={CreateTaskScreen} />
        <Stack.Screen name="WageManagement" component={WageManagementScreen} />
        <Stack.Screen name="Analytics" component={AnalyticsScreen} />
        <Stack.Screen name="IssuesAlerts" component={AlertsScreen} />

        {/* Supervisor Module */}
        <Stack.Screen name="SupervisorDashboard" component={SupervisorDashboard} />
        <Stack.Screen name="SupervisorTaskVerification" component={SupervisorTaskScreen} />
        <Stack.Screen name="AttendanceVerification" component={AttendanceVerificationScreen} />
        <Stack.Screen name="CreateUser" component={CreateUserScreen} />
        <Stack.Screen name="CreateField" component={CreateFieldScreen} />
        <Stack.Screen name="DeviceAssignment" component={DeviceAssignmentScreen} />

        {/* Worker Module */}
        <Stack.Screen name="WorkerHome" component={WorkerHome} />
        <Stack.Screen name="ReportIssue" component={ReportIssueScreen} />
        <Stack.Screen name="TaskOutput" component={TaskOutputScreen} />
        <Stack.Screen name="LeaveRequest" component={LeaveRequestScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
