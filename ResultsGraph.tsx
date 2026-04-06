import { store } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = [
  'hsl(230, 70%, 55%)',
  'hsl(160, 60%, 45%)',
  'hsl(340, 65%, 55%)',
  'hsl(45, 90%, 55%)',
  'hsl(280, 55%, 55%)',
];

const ResultsGraph = ({ studentId }: { studentId: string }) => {
  const marks = store.getStudentMarks(studentId);

  const barData = marks.map(m => {
    const exam = store.getExam(m.examId);
    return {
      name: exam?.title?.substring(0, 15) || 'Exam',
      scored: m.marks,
      total: m.totalMarks,
      percentage: Math.round((m.marks / m.totalMarks) * 100),
    };
  });

  const avgPct = barData.length ? Math.round(barData.reduce((s, d) => s + d.percentage, 0) / barData.length) : 0;

  const pieData = [
    { name: 'Scored', value: avgPct },
    { name: 'Remaining', value: 100 - avgPct },
  ];

  if (marks.length === 0) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="p-8 text-center text-muted-foreground">
          No results to display yet. Take an exam first!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-display font-bold text-primary">{marks.length}</p>
            <p className="text-sm text-muted-foreground">Exams Taken</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className={`text-3xl font-display font-bold ${avgPct >= 70 ? 'text-accent' : avgPct >= 40 ? 'text-primary' : 'text-destructive'}`}>{avgPct}%</p>
            <p className="text-sm text-muted-foreground">Average Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-display font-bold text-accent">
              {barData.reduce((best, d) => Math.max(best, d.percentage), 0)}%
            </p>
            <p className="text-sm text-muted-foreground">Best Score</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Marks per Exam</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '0.5rem', border: '1px solid hsl(220, 15%, 88%)' }}
                  formatter={(value: number, name: string) => [value, name === 'scored' ? 'Scored' : 'Total']}
                />
                <Bar dataKey="scored" fill={COLORS[0]} radius={[4, 4, 0, 0]} name="Scored" />
                <Bar dataKey="total" fill={COLORS[1]} radius={[4, 4, 0, 0]} name="Total" opacity={0.4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Overall Performance</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? COLORS[0] : 'hsl(220, 15%, 92%)'} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsGraph;
