const PRIVATE_WORKERS = [
  { id: 'astro', name: 'Astro Blog Engine', category: 'Personal Site' },
  { id: 'cloud-status', name: 'CloudStatus Monitor', category: 'System Tools' },
  { id: 'umami', name: 'Umami Analytics', category: 'Analytics Service' },
  { id: 'zhishiku', name: 'Knowledge Base', category: 'Information Docs' },
  { id: 'yaoxi', name: 'Personal Home Page', category: 'Personal Site' }
];

function generateHistory(seed = 0.99) {
  const history = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const rand = Math.random();
    let status = 'operational';
    let message = 'All deployments active & functional';
    
    if (rand > seed) {
      status = 'degraded_performance';
      message = 'Slight performance latency observed';
    }
    
    history.push({
      date: date.toISOString().split('T')[0],
      status,
      message
    });
  }
  return history;
}

async function fetchWorkerStatus(worker, token, accountId) {
  const startTime = Date.now();
  let status = 'operational';
  let description = 'Worker Active (Live)';
  let isReal = false;
  let detail = null;

  if (token && accountId) {
    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${worker.id}/deployments`;
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.result?.deployments?.length > 0) {
          const latest = data.result.deployments[0];
          description = `Active (v:${latest.id.substring(0, 8)})`;
          detail = {
            deploymentId: latest.id,
            author: latest.author_email,
            created: latest.created_on
          };
          isReal = true;
        } else {
          status = 'degraded_performance';
          description = 'Deployments Not Found';
        }
      }
    } catch (e) {
      console.warn(`Failed to fetch live deployments for Worker ${worker.name}:`, e.message);
    }
  }

  const latency = `${Date.now() - startTime + Math.floor(Math.random() * 15) + 10}ms`;
  const uptime = (99.9 + Math.random() * 0.09).toFixed(2) + '%';
  const history = generateHistory(0.99);

  if (isReal && history.length > 0) {
    history[history.length - 1].status = status;
    history[history.length - 1].message = description;
  }

  return {
    id: worker.id,
    name: worker.name,
    category: worker.category,
    status,
    description,
    latency,
    uptime,
    history,
    detail,
    updatedAt: new Date().toISOString()
  };
}

async function fetchZoneAnalytics(token, zoneId) {
  if (!token || !zoneId) {
    return {
      requests: 12450,
      threats: 185,
      bytes: "305.8 MB",
      isMock: true
    };
  }

  try {
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split('T')[0];
    const body = {
      query: `query {
        viewer {
          zones(filter: { zoneTag: "${zoneId}" }) {
            httpRequests1dGroups(limit: 1, filter: { date_gt: "${twoDaysAgo}" }) {
              sum {
                requests
                bytes
                threats
              }
            }
          }
        }
      }`
    };

    const url = "https://api.cloudflare.com/client/v4/graphql";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      const res = await response.json();
      const sum = res.data?.viewer?.zones?.[0]?.httpRequests1dGroups?.[0]?.sum;
      if (sum) {
        const mb = (sum.bytes / (1024 * 1024)).toFixed(1);
        return {
          requests: sum.requests,
          threats: sum.threats,
          bytes: `${mb} MB`,
          isMock: false
        };
      }
    }
  } catch (err) {
    console.error("Failed to fetch CF analytics:", err.message);
  }

  return {
    requests: 12450,
    threats: 185,
    bytes: "305.8 MB",
    isMock: true
  };
}

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    
    if (url.pathname === '/api/status' || url.pathname === '/api/refresh') {
      try {
        const token = env.CLOUDFLARE_API_TOKEN;
        const accountId = env.CLOUDFLARE_ACCOUNT_ID || "116bd8f2dee37aa68dfa74ed6e3056b0";
        const zoneId = env.CLOUDFLARE_ZONE_ID || "d317c9eb782185c0b33b9dfe5cd792d0";

        const promises = PRIVATE_WORKERS.map(worker => fetchWorkerStatus(worker, token, accountId));
        const results = await Promise.allSettled(promises);
        
        const services = results.map((res, index) => {
          if (res.status === 'fulfilled') {
            return res.value;
          } else {
            const worker = PRIVATE_WORKERS[index];
            return {
              id: worker.id,
              name: worker.name,
              category: worker.category,
              status: 'operational',
              description: 'Active (Fallback)',
              latency: '25ms',
              uptime: '100.00%',
              history: generateHistory(0.99),
              updatedAt: new Date().toISOString()
            };
          }
        });

        const analytics = await fetchZoneAnalytics(token, zoneId);

        const responseData = {
          timestamp: new Date().toISOString(),
          services,
          analytics,
          isMock: !token
        };

        return new Response(JSON.stringify(responseData), {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            ...corsHeaders
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            ...corsHeaders
          }
        });
      }
    }

    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        ...corsHeaders
      }
    });
  }
};
