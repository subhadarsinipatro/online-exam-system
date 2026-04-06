import { store } from '@/lib/store';
import DashboardHeader from './DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, GraduationCap } from 'lucide-react';

const AdminDashboard = () => {
  const exams = store.getExams();
  const students = store.getStudents();
  const faculty = store.getFaculty();

  const stats = [
    { label: 'Total Exams', value: exams.length, icon: BookOpen, color: 'text-primary' },
    { label: 'Students', value: students.length, icon: GraduationCap, color: 'text-accent' },
    { label: 'Faculty', value: faculty.length, icon: Users, color: 'text-destructive' },
  ];

  return (
    <div>
      <DashboardHeader title="Admin Dashboard" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map(s => (
            <Card key={s.label} className="animate-fade-in">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-muted ${s.color}`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle>All Exams</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exams.map(e => (
                <div key={e.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{e.title}</p>
                    <p className="text-sm text-muted-foreground">{e.subject} · {e.questions.length} questions · {e.duration} min</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>All Users</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...students, ...faculty].map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-medium">{u.name}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">{u.role}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
