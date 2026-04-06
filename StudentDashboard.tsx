import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { store } from '@/lib/store';
import DashboardHeader from './DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ExamTaking from '@/components/exam/ExamTaking';
import ResultsGraph from '@/components/dashboard/ResultsGraph';
import { BookOpen, BarChart3, Trophy } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'exams' | 'marks' | 'results'>('exams');
  const [takingExam, setTakingExam] = useState<string | null>(null);
  const [, forceUpdate] = useState(0);

  const exams = store.getExams();
  const marks = store.getStudentMarks(user!.id);

  const hasAttempted = (examId: string) => marks.some(m => m.examId === examId);

  if (takingExam) {
    return <ExamTaking examId={takingExam} onComplete={() => { setTakingExam(null); forceUpdate(x => x + 1); setActiveTab('marks'); }} />;
  }

  const tabs = [
    { id: 'exams' as const, label: 'Available Exams', icon: BookOpen },
    { id: 'marks' as const, label: 'My Marks', icon: Trophy },
    { id: 'results' as const, label: 'Results Graph', icon: BarChart3 },
  ];

  return (
    <div>
      <DashboardHeader title="Student Dashboard" />
      <div className="p-6 space-y-6">
        <div className="flex gap-2 flex-wrap">
          {tabs.map(t => (
            <Button key={t.id} variant={activeTab === t.id ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab(t.id)}>
              <t.icon className="w-4 h-4 mr-2" />{t.label}
            </Button>
          ))}
        </div>

        {activeTab === 'exams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map(e => (
              <Card key={e.id} className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-base">{e.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{e.subject} · {e.questions.length} questions · {e.duration} min</p>
                  {hasAttempted(e.id) ? (
                    <span className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent font-medium">✓ Attempted</span>
                  ) : (
                    <Button size="sm" onClick={() => setTakingExam(e.id)}>Start Exam</Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'marks' && (
          <Card className="animate-fade-in">
            <CardHeader><CardTitle>My Marks</CardTitle></CardHeader>
            <CardContent>
              {marks.length === 0 ? (
                <p className="text-muted-foreground">No exams attempted yet.</p>
              ) : (
                <div className="space-y-3">
                  {marks.map(m => {
                    const exam = store.getExam(m.examId);
                    const pct = Math.round((m.marks / m.totalMarks) * 100);
                    return (
                      <div key={m.id} className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{exam?.title || 'Unknown Exam'}</p>
                          <p className="text-sm text-muted-foreground">{exam?.subject}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-display font-bold">{m.marks}/{m.totalMarks}</p>
                          <p className={`text-sm font-medium ${pct >= 70 ? 'text-accent' : pct >= 40 ? 'text-primary' : 'text-destructive'}`}>{pct}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'results' && <ResultsGraph studentId={user!.id} />}
      </div>
    </div>
  );
};

export default StudentDashboard;
