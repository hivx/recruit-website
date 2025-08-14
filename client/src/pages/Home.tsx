import { useEffect, useState } from 'react';
import { getJobs } from '@/services';
import type { Job } from '@/types';

export function Home() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    getJobs(1, 10)
      .then((res) => setJobs(res.data))
      .catch((e) => setError(e?.message ?? 'Fetch jobs failed'))
      .finally(() => setLoading(false));
      
  }, [])
    console.log(jobs);
  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div className="p-6 space-y-3">
      <h1 className="text-2xl font-bold">Jobs</h1>
      <ul className="space-y-2">
        {jobs.map((j) => (
          <li key={j._id} className="border rounded p-3">
            <div className="font-semibold">{j.title}</div>
            <div className="text-sm text-gray-600">{j.company} — {j.location ?? 'N/A'}</div>
            {j.tags?.length ? (
              <div className="text-xs opacity-70">Tags: {j.tags.join(', ')}</div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
