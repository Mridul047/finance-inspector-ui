import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UsersList from './pages/users/UsersList';
import UserForm from './pages/users/UserForm';
import UserDetails from './pages/users/UserDetails';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<UsersList />} />
          <Route path="/users/new" element={<UserForm />} />
          <Route path="/users/:id" element={<UserDetails />} />
          <Route path="/users/:id/edit" element={<UserForm />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
