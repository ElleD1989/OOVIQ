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
  const text = clean(input) || 'today';

  return `Small moment, big energy. ${text}.`;
}

function getUsername(input: string) {
  const text = clean(input) || 'Vibe';

  const word = text
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 10);

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

  if (text.includes('man') || text.includes('boyfriend') || text.includes('husband')) {
    return 'A personalised experience, a useful upgrade, or a small gift paired with a handwritten note.';
  }

  if (text.includes('woman') || text.includes('girlfriend') || text.includes('wife')) {
    return 'A personalised gift, a relaxing experience, or something connected to her favourite hobby.';
  }

  return 'Choose something personal, useful and connected to the person’s interests.';
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
    return "Would you rather choose between two options?";
  }

  if (kind === "Would You Rather") {
  return getWouldYouRather(input);
}

function getBudget(input: string) {
  const text = clean(input);

  if (!text) {
    return 'Enter an amount, for example: 500 for 4 people.';
  }

  const numbers = text.match(/\d+(?:[.,]\d+)?/g);

  if (!numbers || numbers.length === 0) {
    return 'Please enter a valid amount, for example: 500 for 2 people.';
  }

  const amount = Number(numbers[0].replace(',', '.'));

  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Please enter a valid positive amount.';
  }

  let people = 2;

  if (numbers.length >= 2) {
    const possiblePeople = Number(numbers[1]);

    if (
      Number.isInteger(possiblePeople) &&
      possiblePeople >= 1 &&
      possiblePeople <= 100
    ) {
      people = possiblePeople;
    }
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
        <button className="ghost">Sign in</button>
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

      <section className="grid">
        {tools.map((tool) => (
          <button
            key={tool[2]}
            className={`card ${active === tool[2] ? 'selected' : ''}`}
            onClick={() => selectTool(tool[2])}
          >
            <strong>{tool[0]}</strong>
            <small>{tool[1]}</small>
          </button>
        ))}
      </section>

      <section className="work">
        <h2>{current[0]}</h2>

        <p>{current[1]}</p>

        <div className="row">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                runTool();
              }
            }}
            placeholder={
              active === 'budget'
                ? 'Enter amount, e.g. 500 for 4 people'
                : 'Tell OOVIQ a little more...'
            }
          />

          <button onClick={runTool}>OOVIQ it</button>
        </div>

        {out && (
          <div className="result">
            <span>YOUR RESULT</span>

            <b>{out}</b>

            <button className="share" onClick={copyResult}>
              Copy result
            </button>
          </div>
        )}
      </section>

      <footer>
        <span>© 2026 OOVIQ</span>
        <span>18+ · Privacy · Terms</span>
      </footer>
    </main>
  );
}
