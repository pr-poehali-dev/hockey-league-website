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
const ADMIN_PASSWORD = 'MKHL12345';

const initialTeams: Team[] = [
  { id: 1, name: 'Динамо', wins: 8, losses: 2, points: 24, goalsFor: 45, goalsAgainst: 20 },
  { id: 2, name: 'ЦСКА', wins: 7, losses: 3, points: 21, goalsFor: 38, goalsAgainst: 25 },
  { id: 3, name: 'СКА', wins: 7, losses: 3, points: 21, goalsFor: 42, goalsAgainst: 28 },
  { id: 4, name: 'Спартак', wins: 6, losses: 4, points: 18, goalsFor: 35, goalsAgainst: 30 },
  { id: 5, name: 'Локомотив', wins: 5, losses: 5, points: 15, goalsFor: 32, goalsAgainst: 32 },
  { id: 6, name: 'Торпедо', wins: 5, losses: 5, points: 15, goalsFor: 30, goalsAgainst: 33 },
  { id: 7, name: 'Витязь', wins: 4, losses: 6, points: 12, goalsFor: 28, goalsAgainst: 35 },
  { id: 8, name: 'Салават Юлаев', wins: 4, losses: 6, points: 12, goalsFor: 26, goalsAgainst: 36 },
  { id: 9, name: 'Авангард', wins: 3, losses: 7, points: 9, goalsFor: 22, goalsAgainst: 38 },
  { id: 10, name: 'Металлург', wins: 3, losses: 7, points: 9, goalsFor: 20, goalsAgainst: 40 },
  { id: 11, name: 'Ак Барс', wins: 2, losses: 8, points: 6, goalsFor: 18, goalsAgainst: 42 },
  { id: 12, name: 'Трактор', wins: 1, losses: 9, points: 3, goalsFor: 15, goalsAgainst: 48 },
];

const initialMatches: Match[] = [
  { id: 1, date: '2025-10-15', time: '19:00', homeTeam: 'Динамо', awayTeam: 'ЦСКА', homeScore: 3, awayScore: 2 },
  { id: 2, date: '2025-10-15', time: '19:30', homeTeam: 'СКА', awayTeam: 'Спартак', homeScore: 4, awayScore: 1 },
  { id: 3, date: '2025-10-16', time: '18:00', homeTeam: 'Локомотив', awayTeam: 'Торпедо' },
  { id: 4, date: '2025-10-16', time: '19:00', homeTeam: 'Витязь', awayTeam: 'Салават Юлаев' },
  { id: 5, date: '2025-10-17', time: '18:30', homeTeam: 'Авангард', awayTeam: 'Металлург' },
  { id: 6, date: '2025-10-17', time: '19:00', homeTeam: 'Ак Барс', awayTeam: 'Трактор' },
];

const rulesText = `# Правила МКХЛ

## Регламент игр
- Продолжительность матча: 3 периода по 20 минут
- Состав команды: 20 игроков (18 полевых + 2 вратаря)
- За победу в основное время: 3 очка
- За победу в овертайме/буллитах: 2 очка
- За поражение в овертайме/буллитах: 1 очко
- За поражение в основное время: 0 очков

## Дисциплина
- Малый штраф: 2 минуты
- Большой штраф: 5 минут + удаление до конца игры
- Матч-штраф: удаление + дисквалификация

## Плей-офф
- В плей-офф выходят 8 лучших команд
- Формат: 1/4, 1/2, финал
- Серии до 4 побед
`;

export default function Index() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [rules, setRules] = useState(rulesText);
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const { toast } = useToast();

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
    if (teams.length > 0 || matches.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ teams, matches, rules }));
    }
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
              <h1 className="text-4xl font-bold text-white">МКХЛ</h1>
              <p className="text-white/70">Молодежная Хоккейная Лига</p>
            </div>
          </div>
          <Button
            variant={isAdmin ? 'destructive' : 'secondary'}
            onClick={() => isAdmin ? setIsAdmin(false) : setShowAdminDialog(true)}
            className="gap-2"
          >
            <Icon name={isAdmin ? 'LogOut' : 'Settings'} size={20} />
            {isAdmin ? 'Выход' : 'Админ'}
          </Button>
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary/10 border-b border-primary/20">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">#</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Команда</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">И</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">В</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">П</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">Ш</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">Пр</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">О</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTeams.map((team, index) => (
                      <tr
                        key={team.id}
                        className="border-b border-primary/10 hover:bg-primary/5 transition-colors"
                      >
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
                        <td className="px-6 py-4 text-center text-muted-foreground">
                          {team.goalsFor}:{team.goalsAgainst}
                        </td>
                        <td className="px-6 py-4 text-center text-muted-foreground">
                          {team.goalsFor - team.goalsAgainst > 0 ? '+' : ''}
                          {team.goalsFor - team.goalsAgainst}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-3 py-1 bg-primary/20 rounded-full font-bold text-primary">
                            {team.points}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="mt-6 space-y-4">
            {matches.map((match) => (
              <Card
                key={match.id}
                className="p-6 bg-card/90 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all hover-scale"
              >
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
                      <span className="text-2xl font-bold">
                        {match.homeScore} : {match.awayScore}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">VS</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xl font-bold">{match.awayTeam}</p>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="teams" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedTeams.map((team) => (
                <Card
                  key={team.id}
                  className="p-6 bg-card/90 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all hover-scale"
                >
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
          </TabsContent>

          <TabsContent value="rules" className="mt-6">
            <Card className="p-8 bg-card/90 backdrop-blur-sm border-primary/20">
              {isAdmin ? (
                <div className="space-y-4">
                  <Label>Редактировать правила</Label>
                  <Textarea
                    value={rules}
                    onChange={(e) => setRules(e.target.value)}
                    className="min-h-[400px] font-mono"
                  />
                  <Button onClick={() => toast({ title: 'Сохранено' })}>
                    <Icon name="Save" size={18} className="mr-2" />
                    Сохранить
                  </Button>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  {rules.split('\n').map((line, i) => {
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
                  })}
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
    </div>
  );
}
