export const outgoingHosts = ["api.rawweb.org"];
export const type = "Indie";

const BASE = "https://api.rawweb.org/api/search";

function stripHtml(str) {
  return str
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"');
}

function timeFilterToRange(timeFilter, context) {
  const now = Math.floor(Date.now() / 1000);
  const DAY = 86400;
  if (timeFilter === "day")   return { date_start: now - DAY,       date_end: now };
  if (timeFilter === "week")  return { date_start: now - 7 * DAY,   date_end: now };
  if (timeFilter === "month") return { date_start: now - 30 * DAY,  date_end: now };
  if (timeFilter === "year")  return { date_start: now - 365 * DAY, date_end: now };
  if (context?.dateFrom && context?.dateTo) return {
    date_start: Math.floor(context.dateFrom.getTime() / 1000),
    date_end:   Math.floor(context.dateTo.getTime()   / 1000),
  };
  return null;
}

export default class RawWebEngine {
  name = "rawweb";
  bangShortcut = "ind";

  async executeSearch(query, page = 1, timeFilter, context) {
    const lang = context?.lang ?? "*";
    const params = new URLSearchParams({ keyword: query, page: String(page), lang });

    const range = timeFilterToRange(timeFilter, context);
    if (range) {
      params.set("date_start", String(range.date_start));
      params.set("date_end",   String(range.date_end));
    }

    const doFetch = context?.fetch ?? fetch;
    const res  = await doFetch(`${BASE}?${params}`);
    const json = await res.json();

    return (json.data ?? []).map(item => ({
      title:   stripHtml(item.title),
      url:     item.link,
      snippet: stripHtml(item.content),
      source:  this.name,
    }));
  }
}
