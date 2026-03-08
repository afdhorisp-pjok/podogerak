import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, FlaskConical, Plus, Users, ClipboardList, Download, X, BarChart3, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import {
  createExperiment, getExperiments, addParticipant, getParticipants,
  logSession, getSessionLogs, exportCSV,
  Experiment, ExperimentParticipant, ExperimentSessionLog
} from '@/lib/ExperimentService';
import { ResearchAnalytics } from '@/components/ResearchAnalytics';
import { toast } from 'sonner';
import {
  createExperiment, getExperiments, addParticipant, getParticipants,
  logSession, getSessionLogs, exportCSV,
  Experiment, ExperimentParticipant, ExperimentSessionLog
} from '@/lib/ExperimentService';

interface ExperimentToolkitProps {
  onBack: () => void;
}

export const ExperimentToolkit = ({ onBack }: ExperimentToolkitProps) => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selected, setSelected] = useState<Experiment | null>(null);
  const [participants, setParticipants] = useState<ExperimentParticipant[]>([]);
  const [logs, setLogs] = useState<ExperimentSessionLog[]>([]);

  // Create form state
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newArms, setNewArms] = useState<string[]>(['control', 'intervention_a', 'intervention_b']);
  const [newArmInput, setNewArmInput] = useState('');
  const [newStrata, setNewStrata] = useState('');
  const [newSeed, setNewSeed] = useState(Math.floor(Math.random() * 2147483647));

  // Add participant form
  const [addStratum, setAddStratum] = useState('');

  // Log session form
  const [logParticipantId, setLogParticipantId] = useState('');
  const [logRating, setLogRating] = useState('');
  const [logDuration, setLogDuration] = useState('');
  const [logCompleted, setLogCompleted] = useState(false);

  useEffect(() => {
    loadExperiments();
  }, []);

  useEffect(() => {
    if (selected) {
      loadParticipants(selected.id);
      loadLogs(selected.id);
    }
  }, [selected]);

  const loadExperiments = async () => {
    const data = await getExperiments();
    setExperiments(data);
  };

  const loadParticipants = async (expId: string) => {
    const data = await getParticipants(expId);
    setParticipants(data);
  };

  const loadLogs = async (expId: string) => {
    const data = await getSessionLogs(expId);
    setLogs(data);
  };

  const handleCreate = async () => {
    if (!newName || newArms.length < 2) {
      toast.error('Nama dan minimal 2 arm diperlukan');
      return;
    }
    const strata = newStrata.trim() ? newStrata.split(',').map(s => s.trim()).filter(Boolean) : null;
    const exp = await createExperiment(newName, newDesc, newArms, strata, newSeed);
    if (exp) {
      toast.success('Eksperimen dibuat!');
      setNewName(''); setNewDesc(''); setNewArms(['control', 'intervention_a', 'intervention_b']);
      setNewStrata(''); setNewSeed(Math.floor(Math.random() * 2147483647));
      loadExperiments();
    }
  };

  const handleAddParticipant = async () => {
    if (!selected) return;
    const result = await addParticipant(selected.id, null, addStratum || null);
    if (result) {
      toast.success(`Partisipan ditambahkan → Arm: ${result.arm}, Kode: ${result.allocation_code}`);
      setAddStratum('');
      loadParticipants(selected.id);
    }
  };

  const handleLogSession = async () => {
    if (!selected || !logParticipantId) return;
    const p = participants.find(pp => pp.id === logParticipantId);
    if (!p) return;
    const ok = await logSession({
      experiment_id: selected.id,
      participant_id: p.id,
      arm: p.arm,
      start_timestamp: new Date().toISOString(),
      duration_seconds: logDuration ? parseInt(logDuration) : undefined,
      teacher_rating: logRating ? parseInt(logRating) : undefined,
      completion_flag: logCompleted,
    });
    if (ok) {
      toast.success('Sesi dicatat!');
      setLogParticipantId(''); setLogRating(''); setLogDuration(''); setLogCompleted(false);
      loadLogs(selected.id);
    }
  };

  // Summary stats
  const totalParticipants = participants.length;
  const completedSessions = logs.filter(l => l.completion_flag).length;
  const meanDuration = logs.length > 0
    ? (logs.reduce((s, l) => s + (l.duration_seconds || 0), 0) / logs.length).toFixed(0)
    : '—';

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-10 border-b">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-fredoka font-bold text-foreground flex items-center gap-2">
              <FlaskConical className="w-5 h-5" /> Experiment Toolkit
            </h1>
            <p className="text-sm text-muted-foreground">
              {selected ? selected.name : 'Kelola eksperimen penelitian'}
            </p>
          </div>
          {selected && (
            <Button variant="outline" size="sm" className="ml-auto" onClick={() => setSelected(null)}>
              Semua Eksperimen
            </Button>
          )}
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-6">
        {!selected ? (
          /* ── Experiment List + Create ── */
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">Buat Eksperimen Baru</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nama</Label>
                    <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nama eksperimen" />
                  </div>
                  <div>
                    <Label>Seed (deterministik)</Label>
                    <Input type="number" value={newSeed} onChange={e => setNewSeed(parseInt(e.target.value) || 0)} />
                  </div>
                </div>
                <div>
                  <Label>Deskripsi</Label>
                  <Input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Deskripsi opsional" />
                </div>
                <div>
                  <Label>Arms</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newArms.map((arm, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {arm}
                        <button onClick={() => setNewArms(newArms.filter((_, j) => j !== i))} className="hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input value={newArmInput} onChange={e => setNewArmInput(e.target.value)} placeholder="Tambah arm"
                      onKeyDown={e => { if (e.key === 'Enter' && newArmInput.trim()) { setNewArms([...newArms, newArmInput.trim()]); setNewArmInput(''); } }} />
                    <Button variant="outline" size="sm" onClick={() => { if (newArmInput.trim()) { setNewArms([...newArms, newArmInput.trim()]); setNewArmInput(''); } }}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Strata (pisahkan dengan koma)</Label>
                  <Input value={newStrata} onChange={e => setNewStrata(e.target.value)} placeholder="school_a/class_1, school_a/class_2" />
                </div>
                <Button onClick={handleCreate}>Buat Eksperimen</Button>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h2 className="text-lg font-fredoka font-bold text-foreground">Eksperimen</h2>
              {experiments.length === 0 && <p className="text-muted-foreground text-sm">Belum ada eksperimen.</p>}
              {experiments.map(exp => (
                <Card key={exp.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelected(exp)}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-foreground">{exp.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {(exp.arms as any as string[]).length} arms • Seed: {exp.seed} • {exp.status}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${exp.status === 'active' ? 'bg-success/20 text-success-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {exp.status}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* ── Selected Experiment Detail ── */
          <Tabs defaultValue="participants">
            <TabsList className="mb-4">
              <TabsTrigger value="participants"><Users className="w-4 h-4 mr-1" /> Partisipan</TabsTrigger>
              <TabsTrigger value="logs"><ClipboardList className="w-4 h-4 mr-1" /> Sesi</TabsTrigger>
              <TabsTrigger value="summary"><BarChart3 className="w-4 h-4 mr-1" /> Ringkasan</TabsTrigger>
              <TabsTrigger value="analytics"><TrendingUp className="w-4 h-4 mr-1" /> Analitik</TabsTrigger>
            </TabsList>

            {/* ── Participants Tab ── */}
            <TabsContent value="participants">
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label>Stratum</Label>
                      <Input value={addStratum} onChange={e => setAddStratum(e.target.value)} placeholder="Opsional: school/class" />
                    </div>
                    <Button onClick={handleAddParticipant}><Plus className="w-4 h-4 mr-1" /> Tambah Partisipan</Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kode</TableHead>
                        <TableHead>Arm</TableHead>
                        <TableHead>Stratum</TableHead>
                        <TableHead>Tanggal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {participants.map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="font-mono text-sm">{p.allocation_code}</TableCell>
                          <TableCell>{p.arm}</TableCell>
                          <TableCell>{p.stratum || '—'}</TableCell>
                          <TableCell className="text-xs">{new Date(p.created_at).toLocaleDateString('id-ID')}</TableCell>
                        </TableRow>
                      ))}
                      {participants.length === 0 && (
                        <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Belum ada partisipan</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Session Logs Tab ── */}
            <TabsContent value="logs">
              <Card className="mb-4">
                <CardHeader><CardTitle className="text-base">Catat Sesi</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label>Partisipan</Label>
                      <Select value={logParticipantId} onValueChange={setLogParticipantId}>
                        <SelectTrigger><SelectValue placeholder="Pilih partisipan" /></SelectTrigger>
                        <SelectContent>
                          {participants.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.allocation_code} ({p.arm})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Durasi (detik)</Label>
                      <Input type="number" value={logDuration} onChange={e => setLogDuration(e.target.value)} />
                    </div>
                    <div>
                      <Label>Rating Guru (0-5)</Label>
                      <Input type="number" min={0} max={5} value={logRating} onChange={e => setLogRating(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={logCompleted} onChange={e => setLogCompleted(e.target.checked)} className="rounded" />
                      Selesai
                    </label>
                    <Button onClick={handleLogSession} disabled={!logParticipantId}>Catat Sesi</Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Partisipan</TableHead>
                        <TableHead>Arm</TableHead>
                        <TableHead>Durasi</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Selesai</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map(l => {
                        const p = participants.find(pp => pp.id === l.participant_id);
                        return (
                          <TableRow key={l.id}>
                            <TableCell className="font-mono text-sm">{p?.allocation_code || '—'}</TableCell>
                            <TableCell>{l.arm}</TableCell>
                            <TableCell>{l.duration_seconds ? `${l.duration_seconds}s` : '—'}</TableCell>
                            <TableCell>{l.teacher_rating ?? '—'}</TableCell>
                            <TableCell>{l.completion_flag ? '✅' : '—'}</TableCell>
                          </TableRow>
                        );
                      })}
                      {logs.length === 0 && (
                        <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Belum ada log sesi</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Summary Tab ── */}
            <TabsContent value="summary">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <Card><CardContent className="p-4 text-center">
                  <div className="text-2xl font-fredoka font-bold text-primary">{totalParticipants}</div>
                  <div className="text-xs text-muted-foreground">N Partisipan</div>
                </CardContent></Card>
                <Card><CardContent className="p-4 text-center">
                  <div className="text-2xl font-fredoka font-bold text-secondary">{completedSessions}</div>
                  <div className="text-xs text-muted-foreground">Sesi Selesai</div>
                </CardContent></Card>
                <Card><CardContent className="p-4 text-center">
                  <div className="text-2xl font-fredoka font-bold text-foreground">{meanDuration}s</div>
                  <div className="text-xs text-muted-foreground">Rata-rata Durasi</div>
                </CardContent></Card>
              </div>
              <Button onClick={() => exportCSV(logs, participants)} disabled={logs.length === 0}>
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>
            </TabsContent>

            {/* ── Analytics Tab ── */}
            <TabsContent value="analytics">
              <ResearchAnalytics experiment={selected} onBack={() => {}} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};
