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

const API_URL = 'https://functions.poehali.dev/7c44af1d-941f-4cb8-922a-9b9a4f016a80';
const UPLOAD_URL = 'https://functions.poehali.dev/8f2aa7eb-f52a-4303-bc7d-28dd1173e4cd';
const ADMIN_PASSWORD = 'phldyez';

interface Team {
  id: number;
  name: string;
  wins: number;
  losses: number;
  points: number;
  goals_for: number;
  goals_against: number;
  logo?: string;
}

interface Match {
  id: number;
  date: string;
  time: string;
  home_team: string;
  away_team: string;
  home_score?: number;
  away_score?: number;
  home_team_logo?: string;
  away_team_logo?: string;
}

interface SocialLink {
  id: number;
  platform: string;
  url: string;
}

interface Champion {
  id: number;
  year: string;
  team_name: string;
  logo?: string;
}

export default function Index() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [champions, setChampions] = useState<Champion[]>([]);
  const [rules, setRules] = useState('');
  const [leagueInfo, setLeagueInfo] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const { toast } = useToast();

  const [editTeam, setEditTeam] = useState<Partial<Team>>({ name: '', wins: 0, losses: 0, points: 0, goals_for: 0, goals_against: 0, logo: '' });
  const [editMatch, setEditMatch] = useState<Partial<Match>>({ date: '', time: '', home_team: '', away_team: '', home_team_logo: '', away_team_logo: '' });
  const [editChampion, setEditChampion] = useState<Partial<Champion>>({ year: '', team_name: '', logo: '' });
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showEditStatsDialog, setShowEditStatsDialog] = useState(false);

  const fetchData = async () => {
    try {
      const [teamsRes, matchesRes, socialsRes, championsRes, rulesRes, leagueInfoRes] = await Promise.all([
        fetch(`${API_URL}?path=teams`),
        fetch(`${API_URL}?path=matches`),
        fetch(`${API_URL}?path=socials`),
        fetch(`${API_URL}?path=champions`),
        fetch(`${API_URL}?path=rules`),
        fetch(`${API_URL}?path=league_info`)
      ]);
      
      setTeams(await teamsRes.json());
      setMatches(await matchesRes.json());
      setSocials(await socialsRes.json());
      setChampions(await championsRes.json());
      const rulesData = await rulesRes.json();
      setRules(rulesData.rules || '');
      const leagueInfoData = await leagueInfoRes.json();
      setLeagueInfo(leagueInfoData.league_info || '');
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const uploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const response = await fetch(UPLOAD_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: reader.result })
          });
          const data = await response.json();
          if (data.url) {
            resolve(data.url);
          } else {
            reject(new Error('Upload failed'));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        toast({ title: 'Загружаю изображение...' });
        const url = await uploadImage(file);
        callback(url);
        toast({ title: 'Изображение загружено' });
      } catch (error) {
        toast({ title: 'Ошибка загрузки', variant: 'destructive' });
      }
    }
  };

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

  const addTeam = async () => {
    try {
      const response = await fetch(`${API_URL}?path=teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editTeam.name,
          wins: editTeam.wins || 0,
          losses: editTeam.losses || 0,
          points: editTeam.points || 0,
          goalsFor: editTeam.goals_for || 0,
          goalsAgainst: editTeam.goals_against || 0,
          logo: editTeam.logo || ''
        })
      });
      if (response.ok) {
        await fetchData();
        setEditTeam({ name: '', wins: 0, losses: 0, points: 0, goals_for: 0, goals_against: 0, logo: '' });
        toast({ title: 'Команда добавлена' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось добавить команду', variant: 'destructive' });
    }
  };

  const deleteTeam = async (id: number) => {
    try {
      await fetch(`${API_URL}?path=teams&id=${id}`, { method: 'DELETE' });
      await fetchData();
      toast({ title: 'Команда удалена' });
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const updateTeamStats = async () => {
    if (selectedTeam) {
      try {
        await fetch(`${API_URL}?path=teams`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedTeam.id,
            name: selectedTeam.name,
            wins: selectedTeam.wins,
            losses: selectedTeam.losses,
            points: selectedTeam.points,
            goalsFor: selectedTeam.goals_for,
            goalsAgainst: selectedTeam.goals_against,
            logo: selectedTeam.logo || ''
          })
        });
        await fetchData();
        setShowEditStatsDialog(false);
        setSelectedTeam(null);
        toast({ title: 'Статистика обновлена' });
      } catch (error) {
        toast({ title: 'Ошибка', variant: 'destructive' });
      }
    }
  };

  const addMatch = async () => {
    try {
      await fetch(`${API_URL}?path=matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: editMatch.date,
          time: editMatch.time,
          homeTeam: editMatch.home_team,
          awayTeam: editMatch.away_team,
          homeScore: editMatch.home_score,
          awayScore: editMatch.away_score,
          homeTeamLogo: editMatch.home_team_logo || '',
          awayTeamLogo: editMatch.away_team_logo || ''
        })
      });
      await fetchData();
      setEditMatch({ date: '', time: '', home_team: '', away_team: '', home_team_logo: '', away_team_logo: '' });
      toast({ title: 'Матч добавлен' });
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const deleteMatch = async (id: number) => {
    try {
      await fetch(`${API_URL}?path=matches&id=${id}`, { method: 'DELETE' });
      await fetchData();
      toast({ title: 'Матч удален' });
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const addChampion = async () => {
    try {
      await fetch(`${API_URL}?path=champions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: editChampion.year,
          teamName: editChampion.team_name,
          logo: editChampion.logo || ''
        })
      });
      await fetchData();
      setEditChampion({ year: '', team_name: '', logo: '' });
      toast({ title: 'Чемпион добавлен' });
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const deleteChampion = async (id: number) => {
    try {
      await fetch(`${API_URL}?path=champions&id=${id}`, { method: 'DELETE' });
      await fetchData();
      toast({ title: 'Чемпион удален' });
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const updateSocialLink = async (platform: string, url: string) => {
    try {
      await fetch(`${API_URL}?path=socials`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, url })
      });
      await fetchData();
      toast({ title: 'Ссылка обновлена' });
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const updateRules = async () => {
    try {
      await fetch(`${API_URL}?path=rules`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules })
      });
      toast({ title: 'Регламент обновлен' });
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const updateLeagueInfo = async () => {
    try {
      await fetch(`${API_URL}?path=league_info`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ league_info: leagueInfo })
      });
      toast({ title: 'Информация о лиге обновлена' });
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const sortedTeams = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const diffA = a.goals_for - a.goals_against;
    const diffB = b.goals_for - b.goals_against;
    return diffB - diffA;
  });

  const getSocialIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
      telegram: 'Send',
      discord: 'MessageCircle',
      twitch: 'Video',
      tiktok: 'Music'
    };
    return icons[platform] || 'Link';
  };

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
                        <div>
                          <Label>Логотип команды</Label>
                          <Input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, (url) => setEditTeam({...editTeam, logo: url}))}
                          />
                          {editTeam.logo && <img src={editTeam.logo} alt="Preview" className="mt-2 w-16 h-16 object-contain" />}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input type="number" placeholder="Победы" value={editTeam.wins || ''} onChange={(e) => setEditTeam({...editTeam, wins: +e.target.value})} />
                          <Input type="number" placeholder="Поражения" value={editTeam.losses || ''} onChange={(e) => setEditTeam({...editTeam, losses: +e.target.value})} />
                          <Input type="number" placeholder="Очки" value={editTeam.points || ''} onChange={(e) => setEditTeam({...editTeam, points: +e.target.value})} />
                          <Input type="number" placeholder="Забито" value={editTeam.goals_for || ''} onChange={(e) => setEditTeam({...editTeam, goals_for: +e.target.value})} />
                          <Input type="number" placeholder="Пропущено" value={editTeam.goals_against || ''} onChange={(e) => setEditTeam({...editTeam, goals_against: +e.target.value})} />
                        </div>
                        <Button onClick={addTeam} className="w-full">Добавить команду</Button>
                      </div>
                      <div className="mt-4 space-y-2">
                        {teams.map(team => (
                          <div key={team.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                            <div className="flex items-center gap-2">
                              {team.logo && <img src={team.logo} alt="" className="w-6 h-6 object-contain" />}
                              <span>{team.name}</span>
                            </div>
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
                        <Input placeholder="Хозяева" value={editMatch.home_team} onChange={(e) => setEditMatch({...editMatch, home_team: e.target.value})} />
                        <div>
                          <Label>Логотип хозяев</Label>
                          <Input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, (url) => setEditMatch({...editMatch, home_team_logo: url}))}
                          />
                          {editMatch.home_team_logo && <img src={editMatch.home_team_logo} alt="Preview" className="mt-2 w-12 h-12 object-contain" />}
                        </div>
                        <Input placeholder="Гости" value={editMatch.away_team} onChange={(e) => setEditMatch({...editMatch, away_team: e.target.value})} />
                        <div>
                          <Label>Логотип гостей</Label>
                          <Input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, (url) => setEditMatch({...editMatch, away_team_logo: url}))}
                          />
                          {editMatch.away_team_logo && <img src={editMatch.away_team_logo} alt="Preview" className="mt-2 w-12 h-12 object-contain" />}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input type="number" placeholder="Счёт хозяев" value={editMatch.home_score || ''} onChange={(e) => setEditMatch({...editMatch, home_score: +e.target.value})} />
                          <Input type="number" placeholder="Счёт гостей" value={editMatch.away_score || ''} onChange={(e) => setEditMatch({...editMatch, away_score: +e.target.value})} />
                        </div>
                        <Button onClick={addMatch} className="w-full">Добавить матч</Button>
                      </div>
                      <div className="mt-4 space-y-2">
                        {matches.map(match => (
                          <div key={match.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                            <div className="text-sm">
                              <div>{match.date} {match.time}</div>
                              <div className="flex items-center gap-2">
                                {match.home_team_logo && <img src={match.home_team_logo} alt="" className="w-4 h-4 object-contain" />}
                                {match.home_team} - {match.away_team}
                                {match.away_team_logo && <img src={match.away_team_logo} alt="" className="w-4 h-4 object-contain" />}
                              </div>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => deleteMatch(match.id)}>
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Чемпионы лиги</h3>
                      <div className="space-y-3">
                        <Input placeholder="Год (например, 2023-2024)" value={editChampion.year} onChange={(e) => setEditChampion({...editChampion, year: e.target.value})} />
                        <Input placeholder="Название команды" value={editChampion.team_name} onChange={(e) => setEditChampion({...editChampion, team_name: e.target.value})} />
                        <div>
                          <Label>Логотип чемпиона</Label>
                          <Input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, (url) => setEditChampion({...editChampion, logo: url}))}
                          />
                          {editChampion.logo && <img src={editChampion.logo} alt="Preview" className="mt-2 w-16 h-16 object-contain" />}
                        </div>
                        <Button onClick={addChampion} className="w-full">Добавить чемпиона</Button>
                      </div>
                      <div className="mt-4 space-y-2">
                        {champions.map(champion => (
                          <div key={champion.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                            <div className="flex items-center gap-2">
                              {champion.logo && <img src={champion.logo} alt="" className="w-6 h-6 object-contain" />}
                              <span>{champion.year} - {champion.team_name}</span>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => deleteChampion(champion.id)}>
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Информация о лиге</h3>
                      <Textarea 
                        placeholder="Введите информацию о лиге" 
                        value={leagueInfo} 
                        onChange={(e) => setLeagueInfo(e.target.value)}
                        onBlur={updateLeagueInfo}
                        rows={6}
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Соц-сети</h3>
                      <div className="space-y-3">
                        {socials.map(social => (
                          <div key={social.id}>
                            <Label className="capitalize">{social.platform}</Label>
                            <Input 
                              placeholder={`Ссылка на ${social.platform}`}
                              value={social.url}
                              onChange={(e) => {
                                const newSocials = socials.map(s => 
                                  s.platform === social.platform ? {...s, url: e.target.value} : s
                                );
                                setSocials(newSocials);
                              }}
                              onBlur={() => updateSocialLink(social.platform, social.url)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Регламент</h3>
                      <Textarea 
                        placeholder="Введите текст регламента" 
                        value={rules} 
                        onChange={(e) => setRules(e.target.value)}
                        onBlur={updateRules}
                        rows={10}
                      />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
            <Button onClick={() => setShowAdminDialog(true)} variant="outline" className="gap-2">
              <Icon name="Lock" size={20} />
              Админ
            </Button>
          </div>
        </div>

        <Tabs defaultValue="table" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="table">Таблица</TabsTrigger>
            <TabsTrigger value="schedule">Расписание</TabsTrigger>
            <TabsTrigger value="champions">Чемпионы</TabsTrigger>
            <TabsTrigger value="info">Информация</TabsTrigger>
            <TabsTrigger value="rules">Регламент</TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="mt-6">
            <Card className="overflow-hidden bg-card/80 backdrop-blur-sm border-primary/20 animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary/20">
                      <th className="p-4 text-left font-semibold">Место</th>
                      <th className="p-4 text-left font-semibold">Команда</th>
                      <th className="p-4 text-center font-semibold">И</th>
                      <th className="p-4 text-center font-semibold">В</th>
                      <th className="p-4 text-center font-semibold">П</th>
                      <th className="p-4 text-center font-semibold">Забито</th>
                      <th className="p-4 text-center font-semibold">Пропущено</th>
                      <th className="p-4 text-center font-semibold">Очки</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTeams.map((team, index) => (
                      <tr key={team.id} className="border-b border-primary/10 hover:bg-primary/5 transition-colors">
                        <td className="p-4">
                          <span className="font-semibold text-accent">{index + 1}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {team.logo && <img src={team.logo} alt="" className="w-6 h-6 object-contain" />}
                            <span className="font-medium">{team.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">{team.wins + team.losses}</td>
                        <td className="p-4 text-center">{team.wins}</td>
                        <td className="p-4 text-center">{team.losses}</td>
                        <td className="p-4 text-center">{team.goals_for}</td>
                        <td className="p-4 text-center">{team.goals_against}</td>
                        <td className="p-4 text-center">
                          <span className="font-bold text-accent">{team.points}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="mt-6">
            <div className="grid gap-4 animate-fade-in">
              {matches.map(match => (
                <Card key={match.id} className="p-6 bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground mb-2">{match.date} в {match.time}</div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 flex-1">
                          {match.home_team_logo && <img src={match.home_team_logo} alt="" className="w-8 h-8 object-contain" />}
                          <span className="font-semibold text-lg">{match.home_team}</span>
                        </div>
                        <div className="text-2xl font-bold text-accent px-4">
                          {match.home_score !== undefined && match.away_score !== undefined 
                            ? `${match.home_score} : ${match.away_score}`
                            : 'VS'
                          }
                        </div>
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <span className="font-semibold text-lg">{match.away_team}</span>
                          {match.away_team_logo && <img src={match.away_team_logo} alt="" className="w-8 h-8 object-contain" />}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="champions" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 animate-fade-in">
              {champions.map(champion => (
                <Card key={champion.id} className="p-6 bg-card/80 backdrop-blur-sm border-primary/20 hover:border-accent/40 transition-all">
                  <div className="flex items-center gap-4">
                    {champion.logo && (
                      <div className="relative">
                        <div className="absolute inset-0 bg-accent/20 blur-lg"></div>
                        <img src={champion.logo} alt="" className="relative w-16 h-16 object-contain" />
                      </div>
                    )}
                    <div>
                      <div className="text-2xl font-bold text-accent">{champion.year}</div>
                      <div className="text-lg font-semibold">{champion.team_name}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="info" className="mt-6">
            <div className="space-y-6 animate-fade-in">
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20">
                <h2 className="text-2xl font-bold text-accent mb-4">О лиге</h2>
                <div className="prose prose-invert max-w-none">
                  {leagueInfo ? (
                    <div className="whitespace-pre-wrap">{leagueInfo}</div>
                  ) : (
                    <p className="text-muted-foreground">Информация о лиге пока не добавлена</p>
                  )}
                </div>
              </Card>

              <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20">
                <h2 className="text-2xl font-bold text-accent mb-4">Наши соц-сети</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {socials.filter(s => s.url).map(social => (
                    <a 
                      key={social.id} 
                      href={social.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <Icon name={getSocialIcon(social.platform)} size={24} className="text-accent" />
                      <span className="font-semibold capitalize">{social.platform}</span>
                    </a>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rules" className="mt-6">
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20 animate-fade-in">
              <div className="prose prose-invert max-w-none">
                {rules ? (
                  <div className="whitespace-pre-wrap">{rules}</div>
                ) : (
                  <p className="text-muted-foreground">Регламент пока не добавлен</p>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <DialogContent className="bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle>Вход в админ-панель</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input 
              type="password" 
              placeholder="Введите пароль" 
              value={passwordInput} 
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
            />
            <Button onClick={handleAdminLogin} className="w-full">Войти</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditStatsDialog} onOpenChange={setShowEditStatsDialog}>
        <DialogContent className="bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle>Редактировать статистику</DialogTitle>
          </DialogHeader>
          {selectedTeam && (
            <div className="space-y-4">
              <div>
                <Label>Название команды</Label>
                <Input value={selectedTeam.name} onChange={(e) => setSelectedTeam({...selectedTeam, name: e.target.value})} />
              </div>
              <div>
                <Label>Логотип команды</Label>
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, (url) => setSelectedTeam({...selectedTeam, logo: url}))}
                />
                {selectedTeam.logo && <img src={selectedTeam.logo} alt="Preview" className="mt-2 w-16 h-16 object-contain" />}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Победы</Label>
                  <Input type="number" value={selectedTeam.wins} onChange={(e) => setSelectedTeam({...selectedTeam, wins: +e.target.value})} />
                </div>
                <div>
                  <Label>Поражения</Label>
                  <Input type="number" value={selectedTeam.losses} onChange={(e) => setSelectedTeam({...selectedTeam, losses: +e.target.value})} />
                </div>
              </div>
              <div>
                <Label>Очки</Label>
                <Input type="number" value={selectedTeam.points} onChange={(e) => setSelectedTeam({...selectedTeam, points: +e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Забито</Label>
                  <Input type="number" value={selectedTeam.goals_for} onChange={(e) => setSelectedTeam({...selectedTeam, goals_for: +e.target.value})} />
                </div>
                <div>
                  <Label>Пропущено</Label>
                  <Input type="number" value={selectedTeam.goals_against} onChange={(e) => setSelectedTeam({...selectedTeam, goals_against: +e.target.value})} />
                </div>
              </div>
              <Button onClick={updateTeamStats} className="w-full">Сохранить</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
