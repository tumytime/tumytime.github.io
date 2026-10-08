// Only this repository and file receive authenticated requests.
const API = 'https://api.github.com/repos/tumytime/tumytime.github.io/contents/kaoyan/logs/auto-checkins.json';
export function validateState(data, allowed) {
  if (!data || ![1, 2].includes(data.version) || typeof data.savedAt !== 'string' || !Number.isFinite(Date.parse(data.savedAt)) || !Array.isArray(data.checked) || data.checked.length > allowed.size || new Set(data.checked).size !== data.checked.length || data.checked.some(key => !allowed.has(key))) throw new Error('仓库日志格式不正确，已停止同步以保留原文件。');
  return {version: data.version, savedAt: data.savedAt, checked: [...data.checked].sort()};
}
export class RepositorySync {
  constructor({allowed, storage, fetcher = fetch, onState = () => {}, onChecks = () => {}, initial = []}) {
    this.allowed = allowed; this.storage = storage; this.fetcher = fetcher; this.onState = onState; this.onChecks = onChecks;
    this.token = ''; this.running = false; this.timer = null; this.generation = 0; this.revision = 0; this.retryDelay = 5000;
    this.pending = {}; this.lastSaved = null; this.error = ''; this.halted = false;
    try {
      const saved = JSON.parse(storage.getItem('exam-days-auto-queue-v1') || 'null');
      if (saved && typeof saved === 'object') for (const [key, value] of Object.entries(saved)) if (allowed.has(key) && typeof value === 'boolean') this.pending[key] = value;
      if (!storage.getItem('exam-days-auto-initialized-v1')) {
        for (const key of initial) if (allowed.has(key) && !(key in this.pending)) this.pending[key] = true;
        storage.setItem('exam-days-auto-initialized-v1', '1');
      }
      this.lastSaved = storage.getItem('exam-days-auto-saved-v1');
      this.token = storage.getItem('exam-days-auto-token-v1') || '';
      this.persist();
    } catch {}
  }
  persist() { try { this.storage.setItem('exam-days-auto-queue-v1', JSON.stringify(this.pending)); } catch {} }
  status() { this.onState({connected: !!this.token, running: this.running, pending: Object.keys(this.pending).length, savedAt: this.lastSaved, error: this.error, halted: this.halted}); }
  edit(key, done) {
    if (!this.allowed.has(key)) return;
    this.pending[key] = !!done; this.revision++; this.persist(); this.status(); this.schedule();
  }
  replace(keys) { const set = new Set(keys); for (const key of this.allowed) this.pending[key] = set.has(key); this.revision++; this.persist(); this.status(); this.schedule(); }
  schedule(delay = 1400) {
    clearTimeout(this.timer);
    if (this.token && !this.halted) this.timer = setTimeout(() => this.sync(), delay);
  }
  disconnect() {
    this.generation++; this.token = ''; this.halted = false; this.error = ''; clearTimeout(this.timer);
    try { this.storage.removeItem('exam-days-auto-token-v1'); } catch {}
    this.status();
  }
  async connect(token, remember) {
    if (this.running) throw new Error('正在同步，请稍后再连接。');
    const value = token.trim();
    if (!/^github_pat_[A-Za-z0-9_]+$/.test(value)) throw new Error('请使用 GitHub Fine-grained personal access token。');
    this.generation++; this.token = value; this.halted = false; this.error = '';
    const ok = await this.sync(true);
    if (ok) {
      try { if (remember) this.storage.setItem('exam-days-auto-token-v1', value); else this.storage.removeItem('exam-days-auto-token-v1'); } catch { this.error = '已连接，但浏览器无法记住连接；关闭网页后需要重新连接。'; this.status(); }
    } else { this.token = ''; try { this.storage.removeItem('exam-days-auto-token-v1'); } catch {} this.status(); throw new Error(this.error || '连接失败，请重试。'); }
    return ok;
  }
  async request(method, body) {
    let response;
    try {
      response = await this.fetcher(API + (method === 'GET' ? '?ref=main' : ''), {
        method, cache: 'no-store', signal: AbortSignal.timeout(20000),
        headers: {Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + this.token, 'X-GitHub-Api-Version': '2022-11-28', ...(body ? {'Content-Type': 'application/json'} : {})},
        ...(body ? {body: JSON.stringify(body)} : {})
      });
    } catch { throw new Error('网络暂时不可用；打卡已留在本机，联网后会重试。'); }
    if (response.status === 404 && method === 'GET') return null;
    if (!response.ok) {
      const error = new Error(response.status === 401 ? '授权已失效，请重新连接 GitHub。' : response.status === 403 ? 'GitHub 拒绝写入或请求受限，请检查仓库的 Contents 读写权限，稍后重试。' : response.status === 404 ? '找不到仓库或没有写入权限，请检查令牌选定的仓库。' : response.status === 409 || response.status === 422 ? '另一台设备刚更新了记录，正在重新合并。' : 'GitHub 暂时无法保存，打卡仍在本机。');
      error.code = response.status; throw error;
    }
    return response.json();
  }
  async sync(force = false) {
    if (!this.token || this.running || (this.halted && !force)) return false;
    clearTimeout(this.timer); this.running = true; this.halted = false; this.error = ''; this.status();
    const generation = this.generation;
    let success = false;
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        const file = await this.request('GET');
        if (generation !== this.generation) return false;
        const remote = file ? validateState(JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(file.content.replace(/\s/g, '')), c => c.charCodeAt(0)))), this.allowed) : null;
        // Only unsaved local edits override the remote state. Explicit false values preserve cancellations.
        const edits = {...this.pending}, revision = this.revision, merged = new Set(remote?.checked || []);
        for (const [key, done] of Object.entries(edits)) done ? merged.add(key) : merged.delete(key);
        const checked = [...merged].sort();
        const changed = !remote || JSON.stringify(checked) !== JSON.stringify(remote.checked);
        const snapshot = changed ? {version: 2, savedAt: new Date().toISOString(), checked} : remote;
        if (changed) {
          const bytes = new TextEncoder().encode(JSON.stringify(snapshot, null, 2) + '\n');
          const body = {message: 'Auto-save kaoyan check-ins ' + snapshot.savedAt, branch: 'main', content: btoa(String.fromCharCode(...bytes)), ...(file?.sha ? {sha: file.sha} : {})};
          try { await this.request('PUT', body); } catch (error) { if ([409, 422].includes(error.code) && attempt < 2) continue; throw error; }
        }
        if (generation !== this.generation) return false;
        // A checkbox may change while a request is in flight; retain those edits for the next save.
        for (const [key, done] of Object.entries(edits)) if (this.pending[key] === done) delete this.pending[key];
        if (revision !== this.revision) for (const [key, done] of Object.entries(this.pending)) done ? merged.add(key) : merged.delete(key);
        this.persist(); this.lastSaved = snapshot.savedAt; this.retryDelay = 5000;
        try { this.storage.setItem('exam-days-auto-saved-v1', this.lastSaved); } catch {}
        this.onChecks([...merged].sort()); success = true; break;
      }
    } catch (error) {
      this.error = error.message; this.halted = [401, 403, 404].includes(error.code) || !error.code && !/网络|暂时/.test(error.message);
      if (!this.halted) { this.schedule(this.retryDelay); this.retryDelay = Math.min(this.retryDelay * 2, 60000); }
    } finally {
      this.running = false; this.status();
      if (success && Object.keys(this.pending).length) this.schedule();
    }
    return success;
  }
}
