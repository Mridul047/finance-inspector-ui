import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { CategoryProvider } from './contexts/CategoryContext';
import Dashboard from './pages/Dashboard';
import UsersList from './pages/users/UsersList';
import UserForm from './pages/users/UserForm';
import UserDetails from './pages/users/UserDetails';
import IncomeList from './pages/income/IncomeList';
import IncomeForm from './pages/income/IncomeForm';
import IncomeDetails from './pages/income/IncomeDetails';
import ExpenseList from './pages/expenses/ExpenseList';
import ExpenseForm from './pages/expenses/ExpenseForm';
import ExpenseDetails from './pages/expenses/ExpenseDetails';
import CategoryList from './pages/categories/CategoryList';
import CategoryForm from './pages/categories/CategoryForm';
import CategoryDetails from './pages/categories/CategoryDetails';

function App() {
  return (
    <Router>
      <CategoryProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<UsersList />} />
            <Route path="/users/new" element={<UserForm />} />
            <Route path="/users/:id" element={<UserDetails />} />
            <Route path="/users/:id/edit" element={<UserForm />} />
            <Route path="/income" element={<IncomeList />} />
            <Route path="/income/new" element={<IncomeForm />} />
            <Route path="/income/:id" element={<IncomeDetails />} />
            <Route path="/income/:id/edit" element={<IncomeForm />} />
            <Route path="/expenses" element={<ExpenseList />} />
            <Route path="/expenses/new" element={<ExpenseForm />} />
            <Route path="/expenses/:id" element={<ExpenseDetails />} />
            <Route path="/expenses/:id/edit" element={<ExpenseForm />} />
            <Route path="/categories" element={<CategoryList />} />
            <Route path="/categories/new" element={<CategoryForm />} />
            <Route path="/categories/:id" element={<CategoryDetails />} />
            <Route path="/categories/:id/edit" element={<CategoryForm />} />
          </Routes>
        </Layout>
      </CategoryProvider>
    </Router>
  );
}

export default App;
