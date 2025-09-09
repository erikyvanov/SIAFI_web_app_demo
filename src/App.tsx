import { AppRouter } from './routes/AppRouter';
import { RecruitmentFormProvider } from './context/FormContext';
import { NotificationProvider } from './components/notifications/NotificationContext';

function App() {

  return (
    <NotificationProvider>
      <RecruitmentFormProvider>
        <AppRouter />
      </RecruitmentFormProvider>
    </NotificationProvider>
  );
}

export default App;
