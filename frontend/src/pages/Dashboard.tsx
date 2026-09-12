import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import VoteButtons from '../components/VoteButtons';

type DashboardData = {
  prices: Record<string, { usd: number; usd_24h_change: number }>;
  news: { title: string; url: string; source: string }[];
  insight: string;
  meme: { title: string; url: string };
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<DashboardData | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboard() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<DashboardData>('/dashboard');
      setData(res.data);
    } catch {
      setError('Could not load your dashboard.');
    } finally {
      setLoading(false);
    }
  }

  async function loadVotes() {
    try {
      const res =
        await api.get<{ section: string; value: number }[]>('/votes/me');
      const map: Record<string, number> = {};
      res.data.forEach((v) => {
        map[v.section] = v.value;
      });
      setVotes(map);
    } catch {
      // voting is not critical to showing the dashboard
    }
  }

  useEffect(() => {
    loadDashboard();
    loadVotes();
  }, []);

  async function handleVote(section: string, value: number) {
    setVotes((prev) => ({ ...prev, [section]: value }));
    try {
      await api.post('/votes', { section, value });
    } catch {
      setError('Could not save your vote.');
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (loading) return <div className="centered"><div className="spinner" /></div>;
  if (error) return <div className="centered">{error}</div>;
  if (!data) return null;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="brand">
          <div className="brand-logo" />
          <div>
            <div className="brand-name">CryptoBoard</div>
            <div className="brand-sub">Signed in as {user?.name}</div>
          </div>
        </div>
        <div className="actions">
          <button className="btn btn-primary" onClick={loadDashboard}>
            Refresh
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      <div className="cards-grid">
        <div className="card">
          <div className="card-title">Coin Prices</div>
          <div className="card-body">
            {Object.entries(data.prices).map(([coin, info]) => (
              <div className="price-row" key={coin}>
                <span className="price-coin">{coin}</span>
                <span>
                  ${info.usd.toLocaleString()}{' '}
                  <span
                    className={
                      info.usd_24h_change >= 0 ? 'change-up' : 'change-down'
                    }
                  >
                    {info.usd_24h_change >= 0 ? '▲' : '▼'}{' '}
                    {Math.abs(info.usd_24h_change).toFixed(2)}%
                  </span>
                </span>
              </div>
            ))}
          </div>
          <VoteButtons section="prices" value={votes.prices} onVote={handleVote} />
        </div>

        <div className="card">
          <div className="card-title">Market News</div>
          <div className="card-body">
            <ul className="news-list">
              {data.news.map((item, index) => (
                <li className="news-item" key={index}>
                  <a href={item.url} target="_blank" rel="noreferrer">
                    {item.title}
                  </a>
                  <div className="news-source">{item.source}</div>
                </li>
              ))}
            </ul>
          </div>
          <VoteButtons section="news" value={votes.news} onVote={handleVote} />
        </div>

        <div className="card">
          <div className="card-title">AI Insight of the Day</div>
          <div className="card-body">
            <p className="insight-text">{data.insight}</p>
          </div>
          <VoteButtons
            section="insight"
            value={votes.insight}
            onVote={handleVote}
          />
        </div>

        <div className="card">
          <div className="card-title">Fun Crypto Meme</div>
          <div className="card-body">
            <p className="meme-title">{data.meme.title}</p>
            <img className="meme-img" src={data.meme.url} alt={data.meme.title} />
          </div>
          <VoteButtons section="meme" value={votes.meme} onVote={handleVote} />
        </div>
      </div>
    </div>
  );
}
