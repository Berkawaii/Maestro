import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Projects from './pages/Projects';
import ProjectLayout from './pages/ProjectLayout';
import Backlog from './pages/Backlog';
import Board from './pages/Board';
import Reports from './pages/Reports';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Departments from './pages/Departments';

<Route path="project/:projectId" element={<ProjectLayout />}>
  <Route path="backlog" element={<Backlog />} />
  <Route path="board" element={<Board />} />
  <Route path="reports" element={<Reports />} />
</Route>

// Protected Route Component
function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/login" replace />;
  return children;
}


function HomeRedirect() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.roles?.includes('Requester')) {
    return <Navigate to="/tickets" replace />;
  }
  return <Dashboard />;
}
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<HomeRedirect />} />
        <Route path="projects" element={<Projects />} />

        <Route path="project/:projectId" element={<ProjectLayout />}>
          <Route path="backlog" element={<Backlog />} />
          <Route path="board" element={<Board />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        <Route path="tickets" element={<Tickets />} />
        <Route path="users" element={<Users />} />
        <Route path="roles" element={<Roles />} />
        <Route path="departments" element={<Departments />} />
      </Route>
    </Routes>
  );
}

export default App;
