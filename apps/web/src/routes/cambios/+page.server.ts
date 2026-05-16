import { marked } from 'marked';

type Entry = {
	version: string;
	fecha: string;
	titulo: string;
	summary: string;
	details: string;
};

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
	if (!match) return { meta: {}, body: raw };
	const meta: Record<string, string> = {};
	for (const line of match[1].split('\n')) {
		const [key, ...rest] = line.split(':');
		if (key && rest.length) meta[key.trim()] = rest.join(':').trim();
	}
	return { meta, body: match[2] };
}

function splitHtml(html: string): { summary: string; details: string } {
	const match = html.match(/^(<p>[\s\S]*?<\/p>)([\s\S]*)$/);
	if (!match) return { summary: html, details: '' };
	return { summary: match[1], details: match[2].trim() };
}

export async function load() {
	const modules = import.meta.glob('/src/lib/content/changelog/*.md', { query: '?raw', import: 'default' });

	const entries: Entry[] = [];
	for (const [path, loader] of Object.entries(modules)) {
		const raw = (await loader()) as string;
		const { meta, body } = parseFrontmatter(raw);
		const html = await marked(body);
		const { summary, details } = splitHtml(html);
		entries.push({
			version: meta.version ?? '',
			fecha: meta.fecha ?? path.match(/(\d{4}-\d{2}-\d{2})/)?.[1] ?? '',
			titulo: meta.titulo ?? '',
			summary,
			details
		});
	}

	entries.sort((a, b) => {
		const byDate = b.fecha.localeCompare(a.fecha);
		return byDate !== 0 ? byDate : b.version.localeCompare(a.version);
	});
	return { entries };
}
