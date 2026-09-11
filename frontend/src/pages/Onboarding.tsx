import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const ASSET_OPTIONS = ['BTC', 'ETH', 'SOL', 'ADA', 'XRP', 'DOGE'];
const INVESTOR_OPTIONS = ['HODLer', 'Day Trader', 'NFT Collector'];
const CONTENT_OPTIONS = ['Market News', 'Charts', 'Social', 'Fun'];

export default function Onboarding() {
  const navigate = useNavigate();

  const [assets, setAssets] = useState<string[]>([]);
  const [investorType, setInvestorType] = useState('');
  const [contentTypes, setContentTypes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function toggle(
    list: string[],
    setList: (value: string[]) => void,
    value: string,
  ) {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value));
    } else {
      setList([...list, value]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (assets.length === 0 || !investorType || contentTypes.length === 0) {
      setError('Please answer all three questions.');
      return;
    }
    setSubmitting(true);
    try {
      await api.patch('/users/me/preferences', {
        assets,
        investorType,
        contentTypes,
      });
      navigate('/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <h1>Welcome! Let's get to know you</h1>
        <p className="onboarding-intro">
          Answer a few quick questions so we can tailor your dashboard.
        </p>
        <form onSubmit={handleSubmit}>
          <h3 className="question">
            Which crypto assets are you interested in?
          </h3>
          <div className="chips">
            {ASSET_OPTIONS.map((option) => (
              <button
                type="button"
                key={option}
                className={`chip ${assets.includes(option) ? 'chip--active' : ''}`}
                onClick={() => toggle(assets, setAssets, option)}
              >
                {option}
              </button>
            ))}
          </div>

          <h3 className="question">What type of investor are you?</h3>
          <div className="chips">
            {INVESTOR_OPTIONS.map((option) => (
              <button
                type="button"
                key={option}
                className={`chip ${investorType === option ? 'chip--active' : ''}`}
                onClick={() => setInvestorType(option)}
              >
                {option}
              </button>
            ))}
          </div>

          <h3 className="question">What content would you like to see?</h3>
          <div className="chips">
            {CONTENT_OPTIONS.map((option) => (
              <button
                type="button"
                key={option}
                className={`chip ${contentTypes.includes(option) ? 'chip--active' : ''}`}
                onClick={() => toggle(contentTypes, setContentTypes, option)}
              >
                {option}
              </button>
            ))}
          </div>

          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Finish'}
          </button>
        </form>
      </div>
    </div>
  );
}
