import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { store, Question } from '@/lib/store';
import DashboardHeader from './DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, CheckCircle, FileText } from 'lucide-react';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'exams' | 'grade' | 'create'>('exams');
  const [selectedExam, setSelectedExam] = useState<string | null>(null);

  // Create exam state
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamSubject, setNewExamSubject] = useState('');
  const [newExamDuration, setNewExamDuration] = useState(60);
  const [newQuestions, setNewQuestions] = useState<Omit<Question, 'id' | 'examId'>[]>([]);
  const [qType, setQType] = useState<'mcq' | 'short_answer'>('mcq');
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState('');
  const [qMarks, setQMarks] = useState(5);

  const exams = store.getExams();
  const submissions = selectedExam ? store.getExamSubmissions(selectedExam) : [];
  const selectedExamData = selectedExam ? store.getExam(selectedExam) : null;

  const addQuestion = () => {
    if (!qText) return;
    const q: Omit<Question, 'id' | 'examId'> = {
      type: qType,
      text: qText,
      marks: qMarks,
      correctAnswer: qType === 'mcq' ? qCorrect : '',
      ...(qType === 'mcq' ? { options: qOptions.filter(Boolean) } : {}),
    };
    setNewQuestions([...newQuestions, q]);
    setQText('');
    setQOptions(['', '', '', '']);
    setQCorrect('');
    toast({ title: 'Question added' });
  };

  const createExam = () => {
    if (!newExamTitle || !newExamSubject || newQuestions.length === 0) {
      toast({ title: 'Error', description: 'Fill all fields and add at least 1 question', variant: 'destructive' });
      return;
    }
    const exam = store.addExam({ title: newExamTitle, subject: newExamSubject, duration: newExamDuration, createdBy: user!.id, questions: [] as Question[] });
    newQuestions.forEach(q => store.addQuestion(exam.id, q));
    setNewExamTitle('');
    setNewExamSubject('');
    setNewQuestions([]);
    setActiveTab('exams');
    toast({ title: 'Exam created successfully!' });
  };

  const [gradingMark, setGradingMark] = useState<Record<string, Record<string, number>>>({});

  const handleGrade = (markId: string, questionId: string, score: number, maxMarks: number) => {
    const clamped = Math.min(Math.max(0, score), maxMarks);
    store.updateShortAnswerMark(markId, questionId, clamped, user!.id);
    setGradingMark(prev => ({ ...prev, [markId]: { ...(prev[markId] || {}), [questionId]: clamped } }));
    toast({ title: 'Mark updated' });
  };

  const tabs = [
    { id: 'exams' as const, label: 'My Exams', icon: FileText },
    { id: 'grade' as const, label: 'Grade Answers', icon: CheckCircle },
    { id: 'create' as const, label: 'Create Exam', icon: Plus },
  ];

  return (
    <div>
      <DashboardHeader title="Faculty Dashboard" />
      <div className="p-6 space-y-6">
        <div className="flex gap-2 flex-wrap">
          {tabs.map(t => (
            <Button key={t.id} variant={activeTab === t.id ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab(t.id)}>
              <t.icon className="w-4 h-4 mr-2" />{t.label}
            </Button>
          ))}
        </div>

        {activeTab === 'exams' && (
          <div className="space-y-3">
            {exams.map(e => (
              <Card key={e.id} className="animate-fade-in">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{e.title}</p>
                    <p className="text-sm text-muted-foreground">{e.subject} · {e.questions.length} questions ({e.questions.filter(q => q.type === 'short_answer').length} short answer)</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => { setSelectedExam(e.id); setActiveTab('grade'); }}>
                    Grade
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'grade' && (
          <div className="space-y-4">
            {!selectedExam && (
              <div className="space-y-2">
                <p className="text-muted-foreground">Select an exam to grade:</p>
                {exams.map(e => (
                  <Button key={e.id} variant="outline" className="w-full justify-start" onClick={() => setSelectedExam(e.id)}>
                    {e.title}
                  </Button>
                ))}
              </div>
            )}
            {selectedExam && selectedExamData && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-lg">{selectedExamData.title} - Submissions</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedExam(null)}>← Back</Button>
                </div>
                {submissions.length === 0 && <p className="text-muted-foreground">No submissions yet.</p>}
                {submissions.map(sub => (
                  <Card key={sub.id} className="animate-fade-in">
                    <CardHeader>
                      <CardTitle className="text-base">{sub.studentName} — {sub.marks}/{sub.totalMarks}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedExamData.questions.filter(q => q.type === 'short_answer').map(q => (
                        <div key={q.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                          <p className="text-sm font-medium">{q.text} <span className="text-muted-foreground">({q.marks} marks)</span></p>
                          <p className="text-sm italic text-muted-foreground">Answer: {sub.answers[q.id] || 'No answer'}</p>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min={0}
                              max={q.marks}
                              placeholder={`0-${q.marks}`}
                              className="w-24"
                              value={gradingMark[sub.id]?.[q.id] ?? sub.shortAnswerMarks?.[q.id] ?? ''}
                              onChange={e => handleGrade(sub.id, q.id, Number(e.target.value), q.marks)}
                            />
                            <span className="text-xs text-muted-foreground">/ {q.marks}</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <Card className="animate-fade-in">
            <CardHeader><CardTitle>Create New Exam</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">Title</label>
                  <Input value={newExamTitle} onChange={e => setNewExamTitle(e.target.value)} placeholder="Exam title" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">Subject</label>
                  <Input value={newExamSubject} onChange={e => setNewExamSubject(e.target.value)} placeholder="Subject" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">Duration (min)</label>
                  <Input type="number" value={newExamDuration} onChange={e => setNewExamDuration(Number(e.target.value))} />
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-medium">Add Question</h4>
                <div className="flex gap-2">
                  <Button size="sm" variant={qType === 'mcq' ? 'default' : 'outline'} onClick={() => setQType('mcq')}>MCQ</Button>
                  <Button size="sm" variant={qType === 'short_answer' ? 'default' : 'outline'} onClick={() => setQType('short_answer')}>Short Answer</Button>
                </div>
                <Textarea value={qText} onChange={e => setQText(e.target.value)} placeholder="Question text..." />
                {qType === 'mcq' && (
                  <div className="space-y-2">
                    {qOptions.map((opt, i) => (
                      <Input key={i} value={opt} onChange={e => { const o = [...qOptions]; o[i] = e.target.value; setQOptions(o); }} placeholder={`Option ${i + 1}`} />
                    ))}
                    <Input value={qCorrect} onChange={e => setQCorrect(e.target.value)} placeholder="Correct answer (must match an option)" />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Marks:</label>
                  <Input type="number" className="w-20" value={qMarks} onChange={e => setQMarks(Number(e.target.value))} />
                  <Button size="sm" onClick={addQuestion}>Add Question</Button>
                </div>
              </div>

              {newQuestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{newQuestions.length} question(s) added:</p>
                  {newQuestions.map((q, i) => (
                    <div key={i} className="p-2 rounded bg-muted/50 text-sm flex justify-between">
                      <span>{q.text.substring(0, 60)}...</span>
                      <span className="text-xs text-muted-foreground uppercase">{q.type} · {q.marks}m</span>
                    </div>
                  ))}
                </div>
              )}

              <Button onClick={createExam} className="w-full">Create Exam</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;
