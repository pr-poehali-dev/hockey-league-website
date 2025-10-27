import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface Team {
  id: number;
  name: string;
  wins: number;
  losses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
}

interface Match {
  id: number;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
}

const STORAGE_KEY = 'mkhl_data';
const ADMIN_PASSWORD = 'phldyez';

const initialTeams: Team[] = [];
const initialMatches: Match[] = [];
const rulesText = '';

export default function Index() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [rules, setRules] = useState(rulesText);
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const { toast } = useToast();

  const [editTeam, setEditTeam] = useState<Team>({ id: 0, name: '', wins: 0, losses: 0, points: 0, goalsFor: 0, goalsAgainst: 0 });
  const [editMatch, setEditMatch] = useState<Match>({ id: 0, date: '', time: '', homeTeam: '', awayTeam: '' });
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showEditStatsDialog, setShowEditStatsDialog] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      setTeams(data.teams || initialTeams);
      setMatches(data.matches || initialMatches);
      setRules(data.rules || rulesText);
    } else {
      setTeams(initialTeams);
      setMatches(initialMatches);
      setRules(rulesText);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ teams, matches, rules }));
  }, [teams, matches, rules]);

  const handleAdminLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowAdminDialog(false);
      setPasswordInput('');
      toast({ title: 'Вход выполнен', description: 'Добро пожаловать в админ-панель' });
    } else {
      toast({ title: 'Ошибка', description: 'Неверный пароль', variant: 'destructive' });
    }
  };

  const addTeam = () => {
    const newTeam = { ...editTeam, id: Date.now() };
    setTeams([...teams, newTeam]);
    setEditTeam({ id: 0, name: '', wins: 0, losses: 0, points: 0, goalsFor: 0, goalsAgainst: 0 });
    toast({ title: 'Команда добавлена' });
  };

  const deleteTeam = (id: number) => {
    setTeams(teams.filter(t => t.id !== id));
    toast({ title: 'Команда удалена' });
  };

  const updateTeamStats = () => {
    if (selectedTeam) {
      setTeams(teams.map(t => t.id === selectedTeam.id ? selectedTeam : t));
      setShowEditStatsDialog(false);
      setSelectedTeam(null);
      toast({ title: 'Статистика обновлена' });
    }
  };

  const addMatch = () => {
    const newMatch = { ...editMatch, id: Date.now() };
    setMatches([...matches, newMatch]);
    setEditMatch({ id: 0, date: '', time: '', homeTeam: '', awayTeam: '' });
    toast({ title: 'Матч добавлен' });
  };

  const deleteMatch = (id: number) => {
    setMatches(matches.filter(m => m.id !== id));
    toast({ title: 'Матч удален' });
  };

  const clearAll = () => {
    setTeams([]);
    setMatches([]);
    setRules('');
    localStorage.removeItem(STORAGE_KEY);
    toast({ title: 'Все данные очищены' });
  };

  const sortedTeams = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const diffA = a.goalsFor - a.goalsAgainst;
    const diffB = b.goalsFor - b.goalsAgainst;
    return diffB - diffA;
  });

  return (
    <div className="min-h-screen gradient-shift">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-12 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-accent blur-xl opacity-50 animate-pulse"></div>
              <Icon name="Trophy" className="relative text-accent" size={48} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">PHL</h1>
              <p className="text-white/70">Первая Хоккейная Лига</p>
            </div>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="default" className="gap-2">
                    <Icon name="Edit" size={20} />
                    Управление
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-card border-primary/20 overflow-y-auto w-[600px] max-w-full">
                  <SheetHeader>
                    <SheetTitle>Управление контентом</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Команды</h3>
                      <div className="space-y-3">
                        <Input placeholder="Название команды" value={editTeam.name} onChange={(e) => setEditTeam({...editTeam, name: e.target.value})} />
                        <div className="grid grid-cols-2 gap-2">
                          <Input type="number" placeholder="Победы" value={editTeam.wins || ''} onChange={(e) => setEditTeam({...editTeam, wins: +e.target.value})} />
                          <Input type="number" placeholder="Поражения" value={editTeam.losses || ''} onChange={(e) => setEditTeam({...editTeam, losses: +e.target.value})} />
                          <Input type="number" placeholder="Очки" value={editTeam.points || ''} onChange={(e) => setEditTeam({...editTeam, points: +e.target.value})} />
                          <Input type="number" placeholder="Забито" value={editTeam.goalsFor || ''} onChange={(e) => setEditTeam({...editTeam, goalsFor: +e.target.value})} />
                          <Input type="number" placeholder="Пропущено" value={editTeam.goalsAgainst || ''} onChange={(e) => setEditTeam({...editTeam, goalsAgainst: +e.target.value})} />
                        </div>
                        <Button onClick={addTeam} className="w-full">Добавить команду</Button>
                      </div>
                      <div className="mt-4 space-y-2">
                        {teams.map(team => (
                          <div key={team.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                            <span>{team.name}</span>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => { setSelectedTeam(team); setShowEditStatsDialog(true); }}>
                                <Icon name="Edit" size={16} />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => deleteTeam(team.id)}>
                                <Icon name="Trash2" size={16} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Матчи</h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <Input type="date" value={editMatch.date} onChange={(e) => setEditMatch({...editMatch, date: e.target.value})} />
                          <Input type="time" value={editMatch.time} onChange={(e) => setEditMatch({...editMatch, time: e.target.value})} />
                        </div>
                        <Input placeholder="Хозяева" value={editMatch.homeTeam} onChange={(e) => setEditMatch({...editMatch, homeTeam: e.target.value})} />
                        <Input placeholder="Гости" value={editMatch.awayTeam} onChange={(e) => setEditMatch({...editMatch, awayTeam: e.target.value})} />
                        <div className="grid grid-cols-2 gap-2">
                          <Input type="number" placeholder="Счет хозяев" value={editMatch.homeScore || ''} onChange={(e) => setEditMatch({...editMatch, homeScore: e.target.value ? +e.target.value : undefined})} />
                          <Input type="number" placeholder="Счет гостей" value={editMatch.awayScore || ''} onChange={(e) => setEditMatch({...editMatch, awayScore: e.target.value ? +e.target.value : undefined})} />
                        </div>
                        <Button onClick={addMatch} className="w-full">Добавить матч</Button>
                      </div>
                      <div className="mt-4 space-y-2">
                        {matches.map(match => (
                          <div key={match.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                            <span>{match.homeTeam} vs {match.awayTeam}</span>
                            <Button variant="destructive" size="sm" onClick={() => deleteMatch(match.id)}>
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Button variant="destructive" onClick={clearAll} className="w-full">
                        <Icon name="Trash2" size={18} className="mr-2" />
                        Очистить все данные
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
            <Button
              variant={isAdmin ? 'destructive' : 'secondary'}
              onClick={() => isAdmin ? setIsAdmin(false) : setShowAdminDialog(true)}
              className="gap-2"
            >
              <Icon name={isAdmin ? 'LogOut' : 'Settings'} size={20} />
              {isAdmin ? 'Выход' : 'Админ'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="table" className="animate-fade-in">
          <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="table" className="gap-2">
              <Icon name="BarChart3" size={18} />
              Таблица
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <Icon name="Calendar" size={18} />
              Расписание
            </TabsTrigger>
            <TabsTrigger value="teams" className="gap-2">
              <Icon name="Users" size={18} />
              Команды
            </TabsTrigger>
            <TabsTrigger value="rules" className="gap-2">
              <Icon name="BookOpen" size={18} />
              Правила
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="mt-6">
            <Card className="bg-card/90 backdrop-blur-sm border-primary/20 overflow-hidden">
              {sortedTeams.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Icon name="Table" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Таблица пуста. {isAdmin ? 'Добавьте команды через панель управления.' : ''}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-primary/10 border-b border-primary/20">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold">#</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Команда</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">И</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">В</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">П</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">О</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTeams.map((team, index) => (
                        <tr key={team.id} className="border-b border-primary/10 hover:bg-primary/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              index < 3 ? 'bg-accent text-white' : 'bg-muted/30'
                            }`}>
                              {index + 1}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold">{team.name}</td>
                          <td className="px-6 py-4 text-center text-muted-foreground">{team.wins + team.losses}</td>
                          <td className="px-6 py-4 text-center text-green-400">{team.wins}</td>
                          <td className="px-6 py-4 text-center text-red-400">{team.losses}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-3 py-1 bg-primary/20 rounded-full font-bold text-primary">{team.points}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="mt-6 space-y-4">
            {matches.length === 0 ? (
              <Card className="p-12 text-center bg-card/90 backdrop-blur-sm border-primary/20">
                <Icon name="Calendar" size={48} className="mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground">Расписание пусто. {isAdmin ? 'Добавьте матчи через панель управления.' : ''}</p>
              </Card>
            ) : (
              matches.map((match) => (
                <Card key={match.id} className="p-6 bg-card/90 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all hover-scale">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <Icon name="Calendar" size={20} />
                      <span>{new Date(match.date).toLocaleDateString('ru-RU')}</span>
                      <span>{match.time}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex-1 text-right">
                      <p className="text-xl font-bold">{match.homeTeam}</p>
                    </div>
                    <div className="px-8 py-2 mx-4 bg-muted/20 rounded-lg min-w-[120px] text-center">
                      {match.homeScore !== undefined && match.awayScore !== undefined ? (
                        <span className="text-2xl font-bold">{match.homeScore} : {match.awayScore}</span>
                      ) : (
                        <span className="text-muted-foreground">VS</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xl font-bold">{match.awayTeam}</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="teams" className="mt-6">
            {sortedTeams.length === 0 ? (
              <Card className="p-12 text-center bg-card/90 backdrop-blur-sm border-primary/20">
                <Icon name="Users" size={48} className="mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground">Команды отсутствуют. {isAdmin ? 'Добавьте команды через панель управления.' : ''}</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedTeams.map((team) => (
                  <Card key={team.id} className="p-6 bg-card/90 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all hover-scale">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Icon name="Shield" className="text-white" size={32} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{team.name}</h3>
                        <p className="text-sm text-muted-foreground">Хоккейный клуб</p>
                      </div>
                    </div>
                    <div className="space-y-2 pt-4 border-t border-primary/20">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Очки:</span>
                        <span className="font-bold text-primary">{team.points}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Победы:</span>
                        <span className="font-semibold text-green-400">{team.wins}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Поражения:</span>
                        <span className="font-semibold text-red-400">{team.losses}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rules" className="mt-6">
            <Card className="p-8 bg-card/90 backdrop-blur-sm border-primary/20">
              {isAdmin ? (
                <div className="space-y-4">
                  <Label>Редактировать правила</Label>
                  <Textarea value={rules} onChange={(e) => setRules(e.target.value)} className="min-h-[400px] font-mono" placeholder="Введите правила лиги..." />
                  <Button onClick={() => toast({ title: 'Сохранено' })}>
                    <Icon name="Save" size={18} className="mr-2" />
                    Сохранить
                  </Button>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  {rules ? (
                    rules.split('\n').map((line, i) => {
                      if (line.startsWith('# ')) {
                        return <h1 key={i} className="text-3xl font-bold mb-4 text-primary">{line.slice(2)}</h1>;
                      }
                      if (line.startsWith('## ')) {
                        return <h2 key={i} className="text-2xl font-bold mt-6 mb-3 text-white">{line.slice(3)}</h2>;
                      }
                      if (line.startsWith('- ')) {
                        return <li key={i} className="ml-4 text-muted-foreground">{line.slice(2)}</li>;
                      }
                      return line ? <p key={i} className="text-muted-foreground mb-2">{line}</p> : null;
                    })
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Icon name="BookOpen" size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Правила не заполнены. {isAdmin ? 'Добавьте правила через эту вкладку.' : ''}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <DialogContent className="bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Lock" size={24} />
              Вход в админ-панель
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                placeholder="Введите пароль"
              />
            </div>
            <Button onClick={handleAdminLogin} className="w-full">
              Войти
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditStatsDialog} onOpenChange={setShowEditStatsDialog}>
        <DialogContent className="bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Edit" size={24} />
              Редактировать статистику: {selectedTeam?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedTeam && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Победы</Label>
                  <Input
                    type="number"
                    value={selectedTeam.wins}
                    onChange={(e) => setSelectedTeam({...selectedTeam, wins: +e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Поражения</Label>
                  <Input
                    type="number"
                    value={selectedTeam.losses}
                    onChange={(e) => setSelectedTeam({...selectedTeam, losses: +e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Очки</Label>
                  <Input
                    type="number"
                    value={selectedTeam.points}
                    onChange={(e) => setSelectedTeam({...selectedTeam, points: +e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Забито голов</Label>
                  <Input
                    type="number"
                    value={selectedTeam.goalsFor}
                    onChange={(e) => setSelectedTeam({...selectedTeam, goalsFor: +e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Пропущено голов</Label>
                  <Input
                    type="number"
                    value={selectedTeam.goalsAgainst}
                    onChange={(e) => setSelectedTeam({...selectedTeam, goalsAgainst: +e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={updateTeamStats} className="w-full">
                <Icon name="Save" size={18} className="mr-2" />
                Сохранить изменения
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}