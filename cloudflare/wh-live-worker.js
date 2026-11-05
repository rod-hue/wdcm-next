/* WDCM White House cam resolver.
   earthTV restarts its White House live stream now and then, which changes the
   YouTube video id. This Worker resolves the channel's CURRENT live video id so
   the /live/ page self-heals instead of showing a dead embed.
   Returns JSON {id, live, resolved} with open CORS. Falls back to the last
   known-good id if YouTube can't be read. Cached ~5 min. */
const CHANNEL = "UCRuyAVeVd7oUwh0LWmxxBBQ"; // earthTV
const DEFAULT_ID = "5p_KGD4fJZs";           // last known-good White House live id

export default {
  async fetch() {
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300",
    };
    try {
      const res = await fetch(
        "https://www.youtube.com/channel/" + CHANNEL + "/live?hl=en&gl=US",
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
            Cookie: "CONSENT=YES+1; PREF=hl=en",
          },
          cf: { cacheTtl: 300, cacheEverything: true },
        }
      );
      const html = await res.text();
      let id = null;
      let m = html.match(
        /<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})">/
      );
      if (m) id = m[1];
      if (!id) {
        m = html.match(/"videoId":"([\w-]{11})"/);
        if (m) id = m[1];
      }
      const isLive = /"isLiveNow":\s*true|"isLive":\s*true|BADGE_STYLE_TYPE_LIVE_NOW|\{"text":"LIVE"\}/.test(
        html
      );
      const body = { id: id || DEFAULT_ID, live: !!(id && isLive), resolved: !!id };
      return new Response(JSON.stringify(body), { headers });
    } catch (e) {
      return new Response(
        JSON.stringify({ id: DEFAULT_ID, live: false, resolved: false, error: String(e) }),
        { headers }
      );
    }
  },
};
