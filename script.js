const dataInput = document.getElementById('dataInput');
const focusInputButton = document.getElementById('focusInputButton');
const parseButton = document.getElementById('parseButton');
const clearButton = document.getElementById('clearButton');
const resultsSection = document.getElementById('results');
const organizedResults = document.getElementById('organizedResults');
const errorPanel = document.getElementById('error');

const collegeRegex = /([A-ZÁÂÄÉÈÊÍÎÏÓÔÖÚÛÜ][A-Za-zÁÂÄÉÈÊÍÎÏÓÔÖÚÛÜ&'’.,\- ]*(?:College|University|Institute|Academy|School|Campus|Faculty|Department|Engineering|Technology|Management|Science|Arts|Commerce))/i;
const branchKeywords = [
  'Computer Science', 'Information Technology', 'Electronics and Communication', 'Electrical', 'Mechanical', 'Civil', 'Chemical', 'Aerospace', 'Biomedical', 'Mechatronics', 'Architecture', 'Business Administration', 'Management', 'Science', 'Arts', 'Commerce', 'IT', 'CSE', 'ECE', 'EEE', 'MBA', 'BBA', 'BTech', 'MTech'
];
const percentageRegex = /([0-9]{1,3}(?:\.[0-9]+)?)\s*(?:%|percent)/i;

function normalizeText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function findCollege(line) {
  const match = line.match(collegeRegex);
  if (match) return normalizeText(match[0]);

  const fallback = line.split(/[-–—|]+/)[0].trim();
  return normalizeText(fallback);
}

function findBranch(line, college) {
  const remaining = line.replace(college, '').replace(percentageRegex, '').trim();
  for (const keyword of branchKeywords) {
    const regex = new RegExp(`\\b${keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    if (regex.test(remaining)) {
      return keyword;
    }
  }

  const branchMatch = remaining.match(/(?:Branch|Dept(?:artment)?|Course|Program|Stream|for|in)\s*[:\-]?\s*([A-Z][A-Za-z &/0-9+-]+)/i);
  if (branchMatch) {
    return normalizeText(branchMatch[1]);
  }

  const fallback = remaining.split(/[-–—|,@]+/)[0].trim();
  return fallback ? normalizeText(fallback) : 'Unknown Branch';
}

function parseLines(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  return lines.map(line => {
    const percentageMatch = line.match(percentageRegex);
    const percentage = percentageMatch ? `${percentageMatch[1]}%` : 'Unknown Percentage';
    const college = findCollege(line);
    const branch = findBranch(line, college);
    return { raw: line, college, branch, percentage };
  });
}

function organizeEntries(entries) {
  const groups = {};
  entries.forEach(entry => {
    const college = entry.college || 'Unknown College';
    if (!groups[college]) groups[college] = [];
    groups[college].push(entry);
  });

  const sortedCollegeNames = Object.keys(groups).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  return sortedCollegeNames.map(college => ({
    college,
    entries: groups[college].sort((a, b) => a.branch.localeCompare(b.branch, undefined, { sensitivity: 'base' }))
  }));
}

function renderResults(groups) {
  organizedResults.innerHTML = '';
  if (!groups.length) {
    organizedResults.innerHTML = '<p>No data found. Paste your lines and click Organize Data.</p>';
    return;
  }

  groups.forEach(group => {
    const groupCard = document.createElement('div');
    groupCard.className = 'group-card';
    const heading = document.createElement('h3');
    heading.textContent = group.college;
    groupCard.appendChild(heading);

    const list = document.createElement('div');
    list.className = 'entry-list';

    group.entries.forEach(entry => {
      const item = document.createElement('div');
      item.className = 'entry-item';
      item.innerHTML = `<div class="entry-branch">${entry.branch}</div><div class="entry-meta">${entry.percentage}</div><div class="entry-raw">${entry.raw}</div>`;
      list.appendChild(item);
    });

    groupCard.appendChild(list);
    organizedResults.appendChild(groupCard);
  });
}

function showError(message) {
  errorPanel.classList.remove('hidden');
  errorPanel.textContent = message;
}

focusInputButton.addEventListener('click', () => {
  dataInput.focus();
});

parseButton.addEventListener('click', () => {
  const rawText = dataInput.value.trim();
  errorPanel.classList.add('hidden');
  resultsSection.classList.add('hidden');
  organizedResults.innerHTML = '';

  if (!rawText) {
    showError('Please paste the raw PDF data before organizing.');
    return;
  }

  const entries = parseLines(rawText);
  if (!entries.length) {
    showError('No valid lines were found. Make sure each row is on its own line.');
    return;
  }

  const groups = organizeEntries(entries);
  renderResults(groups);
  resultsSection.classList.remove('hidden');
});

clearButton.addEventListener('click', () => {
  dataInput.value = '';
  errorPanel.classList.add('hidden');
  resultsSection.classList.add('hidden');
  organizedResults.innerHTML = '';
});
