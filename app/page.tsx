'use client';

import { useState } from 'react';

const tools = [
  ['Help Me Decide', 'Make a quick decision without overthinking.', 'decision'],
  ['Caption Maker', 'Get a ready-to-post caption in seconds.', 'caption'],
  ['Username Maker', 'Generate memorable usernames.', 'username'],
  ['Date Night Generator', 'Turn “what should we do?” into a plan.', 'date'],
  ['Gift Finder', 'Get gift ideas for a person and budget.', 'gift'],
  ['Conversation Starters', 'Never run out of things to say.', 'conversation'],
  ['Would You Rather', 'Instant fun questions for friends.', 'wyr'],
  ['Budget Splitter', 'Split a bill quickly and fairly.', 'budget'],
];

const numberWords: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

function clean(value: string) {
  return value.trim();
}

function getDecision(input: string) {
  const text = clean(input);

  if (!text) return 'Give yourself 10 minutes, then choose the option you can act on today.';

  const parts = text
    .split(/\s+(?:or|vs\.?|versus)\s+/i)
    .map(clean)
    .filter(Boolean);

  if (parts.length >= 2) {
    return `Go with ${parts[0]}. Make the decision and move forward.`;
  }

  return `Choose the option that is simplest to act on: ${text}.`;
}

function getCaption(input: string) {
  const text = clean(input).replace(/[.!?]+$/, '') || 'today';
  return `Small moment, big energy. ${text}.`;
}

function getUsername(input: string) {
  const text = clean(input);
  const word = text.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
  return `${word || 'Vibe'}Vibe`;
}

function getDate(input: string) {
  const text = clean(input).toLowerCase();

  if (text.includes('romantic') || text.includes('date')) {
    return 'Sunset walk + favourite food + one surprise.';
  }

  if (text.includes('cheap') || text.includes('budget')) {
    return 'Cook together + a movie + dessert at home.';
  }

  if (text.includes('fun') || text.includes('friends')) {
    return 'Try somewhere new + a fun activity + your favourite food.';
  }

  return 'Pick a new place + good food + one activity you both enjoy.';
}

function getGift(input: string) {
  const text = clean(input).toLowerCase();
  const amountMatch = text.match(/r\s*([\d\s,.]+)/i);
  const amount = amountMatch ? Number(amountMatch[1].replace(/\s/g, '').replace(/,/g, '')) : null;
  const budgetNote = amount && Number.isFinite(amount) ? ` Keep it within about R${amount.toFixed(0)}.` : '';

  if (text.includes('mom') || text.includes('mother')) {
    return `A personalised self-care gift, framed photo, or something connected to her favourite hobby.${budgetNote}`;
  }

  if (text.includes('man') || text.includes('boyfriend') || text.includes('husband')) {
    return `A personalised experience, useful upgrade, or small gift paired with a handwritten note.${budgetNote}`;
  }

  if (text.includes('woman') || text.includes('girlfriend') || text.includes('wife')) {
    return `A personalised gift, relaxing experience, or something connected to her favourite hobby.${budgetNote}`;
  }

  return `Choose something personal, useful and connected to the person’s interests.${budgetNote}`;
}

function getConversation(input: string) {
  const text = clean(input).toLowerCase();

  if (text.includes('politic')) {
    return 'What issue do you think people misunderstand the most?';
  }

  if (text.includes('relationship')) {
    return 'What makes you feel most appreciated in a relationship?';
  }

  if (text.includes('fun')) {
    return 'What is the funniest thing that has happened to you recently?';
  }

  return 'What is something you want to learn or experience this year?';
}

function getWouldYouRather(input: string) {
  const text = clean(input);

  if (!text) {
    return 'Would you rather choose between two options?';
  }

  const options = text
    .replace(/^would you rather\s+/i, '')
    .replace(/\?+$/, '')
    .trim();

  return `Would you rather choose ${options}?`;
}

function parseAmount(value: string) {
  let cleaned = value
    .replace(/R\s*/i, '')
    .trim()
    .replace(/(\d)\s+(?=\d)/g, '$1');

  const match = cleaned.match(/\d[\d,.]*/);
  if (!match) return null;

  let token = match[0];

  if (token.includes('.') && token.includes(',')) {
    if (token.lastIndexOf(',') > token.lastIndexOf('.')) {
      token = token.replace(/\./g, '').replace(',', '.');
    } else {
      token = token.replace(/,/g, '');
    }
  } else if (token.includes(',')) {
    const tail = token.split(',').pop() || '';
    token = tail.length === 2 ? token.replace(',', '.') : token.replace(/,/g, '');
  }

  const amount = Number(token);
  return Number.isFinite(amount) ? amount : null;
}

function getBudget(input: string) {
  const text = clean(input);

  if (!text) {
    return 'Enter an amount, for example: R500 for 4 people.';
  }

  const normalized = text.replace(/(\d)\s+(?=\d)/g, '$1');
  const numbers = normalized.match(/\d[\d,.]*/g) || [];
  const amount = parseAmount(normalized);

  if (amount === null || amount <= 0) {
    return 'Please enter a valid amount, for example: R500 for 2 people.';
  }

  let people = 2;

  if (numbers.length >= 2) {
    const possiblePeople = Number(numbers[1].replace(/,/g, ''));
    if (Number.isInteger(possiblePeople) && possiblePeople >= 1 && possiblePeople <= 100) {
      people = possiblePeople;
    }
  } else {
    const words = normalized.toLowerCase().match(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\b/);
    if (words) people = numberWords[words[1]];
  }

  const each = amount / people;
  return `Split result: R${each.toFixed(2)} each for ${people} ${people === 1 ? 'person' : 'people'}.`;
}

function getResult(kind: string, input: string) {
  switch (kind) {
    case 'decision':
      return getDecision(input);
    case 'caption':
      return getCaption(input);
    case 'username':
      return getUsername(input);
    case 'date':
      return getDate(input);
    case 'gift':
      return getGift(input);
    case 'conversation':
      return getConversation(input);
    case 'wyr':
      return getWouldYouRather(input);
    case 'budget':
      return getBudget(input);
    default:
      return 'Tell OOVIQ what you need and we’ll sort it.';
  }
}

export default function Home() {
  const [active, setActive] = useState('decision');
  const [input, setInput] = useState('');
  const [out, setOut] = useState('');

  const current = tools.find((tool) => tool[2] === active) || tools[0];

  function runTool() {
    setOut(getResult(active, input));
  }

  function selectTool(kind: string) {
    setActive(kind);
    setInput('');
    setOut('');
  }

  async function copyResult() {
    if (!out) return;

    try {
      await navigator.clipboard.writeText(out);
    } catch {
      // Clipboard may be unavailable in some browsers.
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
        <h1>
          Tell OOVIQ what you need.
          <br />
          <em>We&apos;ll sort it.</em>
        </h1>
        <p className="sub">
          Fast little tools for decisions, ideas, plans and everyday moments.
        </p>
      </section>

      <section className="grid" aria-label="OOVIQ tools">
        {tools.map((tool) => (
          <button
            key={tool[2]}
            type="button"
            className={`card ${active === tool[2] ? 'selected' : ''}`}
            aria-pressed={active === tool[2]}
            onClick={() => selectTool(tool[2])}
          >
            <strong>{tool[0]}</strong>
            <small>{tool[1]}</small>
          </button>
        ))}
      </section>

      <section className="work" aria-label={`${current[0]} tool`}>
        <h2>{current[0]}</h2>
        <p>{current[1]}</p>

        <div className="row">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') runTool();
            }}
            aria-label={`Input for ${current[0]}`}
            placeholder={
              active === 'budget'
                ? 'Enter amount, e.g. R500 for 4 people'
                : 'Tell OOVIQ a little more...'
            }
          />
          <button type="button" onClick={runTool}>OOVIQ it</button>
        </div>

        {out && (
          <div className="result" aria-live="polite">
            <span>YOUR RESULT</span>
            <b>{out}</b>
            <button type="button" className="share" onClick={copyResult}>
              Copy result
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
