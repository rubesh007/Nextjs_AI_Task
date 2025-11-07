// AI helper functions for client-side usage

export async function generateSummary(content: string): Promise<string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('bearer_token') : '';

  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      content,
      action: 'summary',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate summary');
  }

  const data = await response.json();
  return data.result ?? '';
}

export async function improveContent(content: string): Promise<string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('bearer_token') : '';

  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      content,
      action: 'improve',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to improve content');
  }

  const data = await response.json();
  return data.result ?? '';
}

export async function generateTags(content: string): Promise<string[]> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('bearer_token') : '';

  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      content,
      action: 'tags',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate tags');
  }

  const data = await response.json();
  return Array.isArray(data.tags) ? data.tags : [];
}
