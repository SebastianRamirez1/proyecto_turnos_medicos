import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Medicos from './pages/Medicos';
import Pacientes from './pages/Pacientes';
import Turnos from './pages/Turnos';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'pacientes', element: <Pacientes /> },
      { path: 'medicos', element: <Medicos /> },
      { path: 'turnos', element: <Turnos /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
