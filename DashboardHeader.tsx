import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardHeader = ({ title }: { title: string }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="font-display text-xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">
          Welcome, {user?.name} <span className="capitalize text-primary">({user?.role})</span>
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={handleLogout}>
        <LogOut className="w-4 h-4 mr-2" />Logout
      </Button>
    </header>
  );
};

export default DashboardHeader;
