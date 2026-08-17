'use client';

import { useState } from 'react';

type ToolKind = 'decision' | 'caption' | 'username' | 'date' | 'gift' | 'conversation' | 'wyr' | 'budget';

type Tool = {
  title: string;
  description: string;
  kind: ToolKind;
  placeholder: string;
  allowBlank?: boolean;
};

const tools: Tool[] = [
  { title: 'Help Me Decide', description: 'Make a quick decision without overthinking.', kind: 'decision', placeholder: 'Try: stay home or go out' },
  { title: 'Caption Maker', description: 'Get a ready-to-post caption in seconds.', kind: 'caption', placeholder: 'Try: sunset at the beach' },
  { title: 'Username Maker', description: 'Generate memorable usernames.', kind: 'username', placeholder: 'Try: fashion, gaming, beauty', allowBlank: true },
  { title: 'Date Night Generator', description: 'Turn “what should we do?” into a plan.', kind: 'date', placeholder: 'Try: romantic, cheap, fun', allowBlank: true },
  { title: 'Gift Finder', description: 'Get gift ideas for a person and budget.', kind: 'gift', placeholder: 'Try: gift for mom, R500' },
  { title: 'Conversation Starters', description: 'Never run out of things to say.', kind: 'conversation', placeholder: 'Try: fun, relationship, work', allowBlank: true },
  { title: 'Would You Rather', description: 'Instant fun questions for friends.', kind: 'wyr', placeholder: 'Try: funny, food, travel', allowBlank: true },
  { title: 'Budget Splitter', description: 'Split a bill quickly and fairly.', kind: 'budget', placeholder: 'Try: R500 for 4 people' },
];

const numberWords: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

const usernameAdjectives = ['Bright', 'Bold', 'Chill', 'Clever', 'Cosmic', 'Golden', 'Happy', 'Lucky', 'Mighty', 'Neon'];
const usernameNouns = ['Vibe', 'Spark', 'Muse', 'Wave', 'Pixel', 'Nova', 'Bloom', 'Quest', 'Glow', 'Orbit'];
const wyrPairs = [
  ['always have perfect hair', 'always have perfect shoes'],
  ['travel the world for free', 'eat your favourite food for free'],
  ['never use social media again', 'never watch TV again'],
  ['have unlimited money for travel', 'have unlimited money for food'],
  ['be able to read minds', 'be able to see the future'],
  ['have a beach day', 'have a movie night'],
];

function clean(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function getDecision(input: string) {
  const text = clean(input);
  if (!text) return 'Give yourself 10 minutes, then choose the option you can act on today.';

  const parts = text.split(/\s+(?:or|vs\.?|versus)\s+/i).map(clean).filter(Boolean);
  if (parts.length >= 2) {
    const winner = pick(parts);
    return `Go with ${winner}. Make the decision and move forward.`;
  }

  return `Choose the option that is simplest to act on today: ${text}.`;
}

function getCaption(input: string) {
  const text = clean(input).replace(/[.!?]+$/, '') || 'today';
  return pick([
    `Small moment, big energy. ${text}.`,
    `Main character moment: ${text}. ✨`,
    `Just enjoying ${text} and the little things.`,
    `${text}. No explanation needed.`,
  ]);
}

function getUsername(input: string) {
  const seed = clean(input).replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
  const base = seed ? seed.charAt(0).toUpperCase() + seed.slice(1) : pick(usernameAdjectives);
  return `${base}${pick(usernameNouns)}${Math.floor(10 + Math.random() * 90)}`;
}

function getDate(input: string) {
  const text = clean(input).toLowerCase();
  if (text.includes('cheap') || text.includes('budget')) return pick([
    'Cook together + a movie + dessert at home.',
    'Coffee walk + thrift-store challenge + sunset spot.',
    'Homemade pizza + favourite playlist + board game night.',
  ]);
  if (text.includes('romantic') || text.includes('date')) return pick([
    'Sunset walk + favourite food + one surprise.',
    'Dress up + dinner somewhere new + a late-night dessert.',
    'Picnic + favourite playlist + swap handwritten notes.',
  ]);
  if (text.includes('fun') || text.includes('friends')) return pick([
    'Try somewhere new + a fun activity + your favourite food.',
    'Mini road trip + photo challenge + ice cream stop.',
    'Bowling or arcade + shared snacks + funniest-story contest.',
  ]);
  return pick([
    'Pick a new place + good food + one activity you both enjoy.',
    'Coffee + a walk + choose a spontaneous activity together.',
    'Favourite meal + playlist swap + a game you have never played.',
  ]);
}

function parseAmount(value: string) {
  const raw = value.replace(/R\s*/i, '').trim().replace(/(\d)\s+(?=\d)/g, '$1');
  const match = raw.match(/\d[\d\s,.]*/);
  if (!match) return null;

  let token = match[0].replace(/\s/g, '');
  if (token.includes('.') && token.includes(',')) {
    token = token.lastIndexOf(',') > token.lastIndexOf('.')
      ? token.replace(/\./g, '').replace(',', '.')
      : token.replace(/,/g, '');
  } else if (token.includes(',')) {
    const tail = token.split(',').pop() || '';
    token = tail.length === 2 ? token.replace(',', '.') : token.replace(/,/g, '');
  }

  const amount = Number(token);
  return Number.isFinite(amount) ? amount : null;
}

function getGift(input: string) {
  const text = clean(input).toLowerCase();
  const amountMatch = text.match(/r\s*([\d\s,.]+)/i);
  const amount = amountMatch ? parseAmount(amountMatch[1]) : null;
  const budgetNote = amount && amount > 0 ? ` Keep it within about R${amount.toFixed(0)}.` : '';

  if (text.includes('mom') || text.includes('mother')) return `A personalised self-care gift, framed photo, or something connected to her favourite hobby.${budgetNote}`;
  if (text.includes('woman') || text.includes('girlfriend') || text.includes('wife')) return `A personalised gift, relaxing experience, or something connected to her favourite hobby.${budgetNote}`;
  if (/\bman\b/.test(text) || text.includes('boyfriend') || text.includes('husband')) return `A personalised experience, useful upgrade, or small gift paired with a handwritten note.${budgetNote}`;
  return `Choose something personal, useful and connected to the person’s interests.${budgetNote}`;
}

function getConversation(input: string) {
  const text = clean(input).toLowerCase();
  if (text.includes('politic')) return 'What issue do you think people misunderstand the most?';
  if (text.includes('relationship')) return 'What makes you feel most appreciated in a relationship?';
  if (text.includes('fun')) return 'What is the funniest thing that has happened to you recently?';
  return pick([
    'What is something you want to learn or experience this year?',
    'What is a small thing that always improves your day?',
    'If you could wake up anywhere tomorrow, where would it be?',
    'What is one goal you are quietly working toward?',
  ]);
}

function getWouldYouRather(input: string) {
  const text = clean(input).toLowerCase();
  const custom = clean(input).replace(/^would you rather\s+/i, '').replace(/\?+$/, '').trim();
  const theme = ['funny', 'food', 'travel', 'friends'].includes(text) || text === '';

  if (custom && !theme) return `Would you rather choose ${custom}?`;

  const pair = pick(wyrPairs);
  return `Would you rather ${pair[0]}, or ${pair[1]}?`;
}

function getBudget(input: string) {
  const text = clean(input);
  if (!text) return 'Enter an amount, for example: R500 for 4 people.';

  const normalized = text.replace(/(\d)\s+(?=\d)/g, '$1');
  const amount = parseAmount(normalized);
  if (amount === null || amount <= 0) return 'Please enter a valid amount, for example: R500 for 2 people.';

  const peopleMatch = normalized.match(/(?:for|\/|÷|among|between)\s*(\d{1,3})\s*(?:people|persons|pax)?/i);
  let people = peopleMatch ? Number(peopleMatch[1]) : 2;

  if (!peopleMatch) {
    const words = normalized.toLowerCase().match(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\b/);
    if (words) people = numberWords[words[1]];
  }

  if (!Number.isInteger(people) || people < 1 || people > 100) return 'Please enter between 1 and 100 people.';

  const each = amount / people;
  return `Split result: R${each.toFixed(2)} each for ${people} ${people === 1 ? 'person' : 'people'}.`;
}

function getResult(kind: ToolKind, input: string) {
  switch (kind) {
    case 'decision': return getDecision(input);
    case 'caption': return getCaption(input);
    case 'username': return getUsername(input);
    case 'date': return getDate(input);
    case 'gift': return getGift(input);
    case 'conversation': return getConversation(input);
    case 'wyr': return getWouldYouRather(input);
    case 'budget': return getBudget(input);
  }
}

export default function Home() {
  const [active, setActive] = useState<ToolKind>('decision');
  const [input, setInput] = useState('');
  const [out, setOut] = useState('');
  const [copied, setCopied] = useState(false);

  const current = tools.find((tool) => tool.kind === active) || tools[0];

  function runTool() {
    if (!current.allowBlank && !clean(input)) {
      setOut('Add a little context first, then tap OOVIQ it.');
      return;
    }
    setOut(getResult(active, input));
    setCopied(false);
  }

  function selectTool(kind: ToolKind) {
    setActive(kind);
    setInput('');
    setOut('');
    setCopied(false);
  }

  async function copyResult() {
    if (!out) return;
    try {
      await navigator.clipboard.writeText(out);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main>
      <nav>
        <div className="logo">OOVIQ</div>
        <span>Small problems. Sorted.</span>
      </nav>

      <section className="hero">
        <p className="eyebrow">YOUR DIGITAL LIFE, SIMPLIFIED</p>
        <h1>Tell OOVIQ what you need.<br /><em>We&apos;ll sort it.</em></h1>
        <p className="sub">Fast little tools for decisions, ideas, plans and everyday moments.</p>
      </section>

      <section className="grid" aria-label="OOVIQ tools">
        {tools.map((tool) => (
          <button
            key={tool.kind}
            type="button"
            className={`card ${active === tool.kind ? 'selected' : ''}`}
            aria-pressed={active === tool.kind}
            onClick={() => selectTool(tool.kind)}
          >
            <strong>{tool.title}</strong>
            <small>{tool.description}</small>
          </button>
        ))}
      </section>

      <section className="work" aria-label={`${current.title} tool`}>
        <h2>{current.title}</h2>
        <p>{current.description}</p>

        <div className="row">
          <input
            value={input}
            maxLength={240}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') runTool(); }}
            aria-label={`Input for ${current.title}`}
            placeholder={current.placeholder}
          />
          <button type="button" onClick={runTool}>OOVIQ it</button>
        </div>

        {out && (
          <div className="result" aria-live="polite">
            <span>YOUR RESULT</span>
            <b>{out}</b>
            <button type="button" className="share" onClick={copyResult} disabled={copied}>
              {copied ? 'Copied ✓' : 'Copy result'}
            </button>
          </div>
        )}
      </section>

      <footer>
        <span>© 2026 OOVIQ</span>
        <span>Privacy · Terms</span>
      </footer>
    </main>
  );
}
