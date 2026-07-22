export interface GameStats {
  villagesCreated: number;
  gamesPlayed: number;
  completedGames: number;
  abandonedGames: number;
  totalPlayersAtStart: number;
  traitorWins: number;
  citizenWins: number;
  feedbackReceived: number;
  lastUpdatedAt: string | null;
}

interface Feedback {
  id: number;
  name: string;
  contact: string;
  message: string;
  created_at: string;
}

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY must be set before starting the server.');
}

const request = async <T>(route: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${supabaseUrl}/rest/v1/${route}`, {
    ...init,
    headers: {
      apikey: supabaseSecretKey,
      Authorization: `Bearer ${supabaseSecretKey}`,
      'Content-Type': 'application/json',
      ...init.headers
    }
  });
  if (!response.ok) throw new Error(`Supabase request failed (${response.status})`);
  if (response.status === 204) return undefined as T;
  const body = await response.text();
  return body ? JSON.parse(body) as T : undefined as T;
};

const recordActivity = (activity: Record<string, number>) => {
  void request('rpc/record_app_activity', { method: 'POST', body: JSON.stringify(activity) }).catch((error) => {
    console.error('Could not record analytics:', error instanceof Error ? error.message : error);
  });
};

export const recordVillageCreated = () => recordActivity({ p_villages_created: 1 });
export const recordGameStarted = (playerCount: number) => recordActivity({ p_games_played: 1, p_total_players_at_start: playerCount });
export const recordGameCompleted = (winner: 'traitor' | 'innocents') => recordActivity({ p_completed_games: 1, ...(winner === 'traitor' ? { p_traitor_wins: 1 } : { p_citizen_wins: 1 }) });
export const recordGameAbandoned = () => recordActivity({ p_abandoned_games: 1 });

export const recordFeedback = async (feedback: { name: string; contact: string; message: string }) => {
  await request('feedback', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(feedback)
  });
  recordActivity({ p_feedback_received: 1 });
};

const emptyStats = (): GameStats => ({ villagesCreated: 0, gamesPlayed: 0, completedGames: 0, abandonedGames: 0, totalPlayersAtStart: 0, traitorWins: 0, citizenWins: 0, feedbackReceived: 0, lastUpdatedAt: null });

export const getAnalytics = async () => {
  const [statsRows, feedback] = await Promise.all([
    request<Array<{ villages_created: number; games_played: number; completed_games: number; abandoned_games: number; total_players_at_start: number; traitor_wins: number; citizen_wins: number; feedback_received: number; last_updated_at: string }>>('app_analytics?id=eq.1&select=*'),
    request<Feedback[]>('feedback?select=id,name,contact,message,created_at&order=created_at.desc&limit=25')
  ]);
  const row = statsRows[0];
  const stats = row ? {
    villagesCreated: row.villages_created,
    gamesPlayed: row.games_played,
    completedGames: row.completed_games,
    abandonedGames: row.abandoned_games,
    totalPlayersAtStart: row.total_players_at_start,
    traitorWins: row.traitor_wins,
    citizenWins: row.citizen_wins,
    feedbackReceived: row.feedback_received,
    lastUpdatedAt: row.last_updated_at
  } : emptyStats();
  return {
    ...stats,
    averageGroupSize: stats.gamesPlayed ? stats.totalPlayersAtStart / stats.gamesPlayed : 0,
    completionRate: stats.gamesPlayed ? stats.completedGames / stats.gamesPlayed : 0,
    feedback: feedback.map(({ created_at, ...item }) => ({ ...item, createdAt: created_at }))
  };
};
