const categories = [
  {
    id: 'tierarten',
    label: 'Tierarten, Wildbiologie & Wildhege',
    total: 600
  },
  {
    id: 'jagdbetrieb',
    label: 'Jagdbetrieb, Hundewesen & Unfallverhütung',
    total: 600
  },
  {
    id: 'waffentechnik',
    label: 'Waffentechnik & Waffenrecht',
    total: 600
  },
  {
    id: 'wildkrankheiten',
    label: 'Wildkrankheiten & Fleischhygiene',
    total: 600
  },
  {
    id: 'jagdrecht',
    label: 'Jagd-, Natur- und Landschaftsschutzrecht',
    total: 600
  },
  {
    id: 'forst',
    label: 'Forst- und Landbau, Wildschadensverhütung',
    total: 600
  }
];

const allQuestions = categories.flatMap((category) => buildQuestionsForCategory(category.id, category.total));

const categoryFilter = document.querySelector('#categoryFilter');
const questionPoolLabel = document.querySelector('#questionPoolLabel');
const startBtn = document.querySelector('#startBtn');
const statsPanel = document.querySelector('#statsPanel');
const totalQuestionsStat = document.querySelector('#totalQuestionsStat');
const currentQuestionStat = document.querySelector('#currentQuestionStat');
const correctCountStat = document.querySelector('#correctCountStat');
const quizCard = document.querySelector('#quizCard');
const emptyState = document.querySelector('#emptyState');
const questionText = document.querySelector('#questionText');
const optionsContainer = document.querySelector('#optionsContainer');
const explanationBox = document.querySelector('#explanationBox');
const explanationText = document.querySelector('#explanationText');
const nextBtn = document.querySelector('#nextBtn');
const prevBtn = document.querySelector('#prevBtn');
const progressBadge = document.querySelector('#progressBadge');
const categoryBadge = document.querySelector('#categoryBadge');

let currentQuestions = [];
let activeIndex = 0;
let correctAnswers = 0;
let answeredIndexes = new Set();

init();

function init() {
  populateCategoryFilter();
  totalQuestionsStat.textContent = String(allQuestions.length);
  questionPoolLabel.textContent = formatNumber(allQuestions.length);
  categoryFilter.addEventListener('change', () => {
    const selection = categoryFilter.value;
    if (selection === 'all') {
      questionPoolLabel.textContent = formatNumber(allQuestions.length);
    } else {
      const selected = categories.find((item) => item.id === selection);
      questionPoolLabel.textContent = formatNumber(selected ? selected.total : 0);
    }
  });

  startBtn.addEventListener('click', startQuiz);
  nextBtn.addEventListener('click', () => {
    if (activeIndex < currentQuestions.length - 1) {
      activeIndex += 1;
      renderQuestion();
    } else {
      finishQuiz();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (activeIndex > 0) {
      activeIndex -= 1;
      renderQuestion();
    }
  });
}

function populateCategoryFilter() {
  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'Alle Themen (3.600 Fragen)';
  categoryFilter.appendChild(allOption);

  for (const category of categories) {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = `${category.label} (${formatNumber(category.total)})`;
    categoryFilter.appendChild(option);
  }
}

function startQuiz() {
  const selectedCategory = categoryFilter.value;
  const sourceQuestions = selectedCategory === 'all'
    ? allQuestions
    : allQuestions.filter((question) => question.category === selectedCategory);

  if (!sourceQuestions.length) {
    alert('Für diese Auswahl liegen derzeit keine Fragen vor.');
    return;
  }

  currentQuestions = shuffleArray([...sourceQuestions]);
  activeIndex = 0;
  correctAnswers = 0;
  answeredIndexes = new Set();
  renderQuestion();

  emptyState.classList.add('hidden');
  quizCard.classList.remove('hidden');
  statsPanel.classList.remove('hidden');
}

function renderQuestion() {
  const currentQuestion = currentQuestions[activeIndex];
  if (!currentQuestion) return;

  progressBadge.textContent = `Frage ${activeIndex + 1}/${currentQuestions.length}`;
  categoryBadge.textContent = getCategoryLabel(currentQuestion.category);
  currentQuestionStat.textContent = `${activeIndex + 1} / ${currentQuestions.length}`;
  correctCountStat.textContent = String(correctAnswers);

  questionText.textContent = currentQuestion.question;
  optionsContainer.innerHTML = '';
  explanationBox.classList.add('hidden');

  currentQuestion.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'option-btn';
    button.innerHTML = `
      <span class="option-letter">${String.fromCharCode(65 + index)}</span>
      <span>${option}</span>
    `;

    button.addEventListener('click', () => handleAnswer(index, button, currentQuestion));
    optionsContainer.appendChild(button);
  });

  prevBtn.disabled = activeIndex === 0;
  nextBtn.textContent = activeIndex === currentQuestions.length - 1 ? 'Ergebnis' : 'Nächste Frage';
}

function handleAnswer(selectedIndex, button, currentQuestion) {
  const optionButtons = document.querySelectorAll('.option-btn');
  const isCorrect = selectedIndex === currentQuestion.correctIndex;

  optionButtons.forEach((item, index) => {
    item.disabled = true;
    item.classList.add('disabled');

    if (index === currentQuestion.correctIndex) {
      item.classList.add('correct');
    }

    if (index === selectedIndex && !isCorrect) {
      item.classList.add('wrong');
    }
  });

  answeredIndexes.add(activeIndex);

  if (isCorrect) {
    correctAnswers += 1;
  }

  correctCountStat.textContent = String(correctAnswers);
  explanationText.textContent = currentQuestion.explanation;
  explanationBox.classList.remove('hidden');
}

function finishQuiz() {
  const percentage = Math.round((correctAnswers / currentQuestions.length) * 100);
  alert(`Quiz beendet. Du hast ${correctAnswers} von ${currentQuestions.length} Fragen richtig beantwortet (${percentage}%).`);
  emptyState.classList.remove('hidden');
  quizCard.classList.add('hidden');
}

function getCategoryLabel(categoryId) {
  const category = categories.find((item) => item.id === categoryId);
  return category ? category.label : 'Thema';
}

function formatNumber(value) {
  return new Intl.NumberFormat('de-DE').format(value);
}

function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQuestionsForCategory(categoryId, total) {
  const questionTemplates = {
    tierarten: [
      { stem: 'Welche Wildart ist typischerweise als Haarwild bekannt?', answers: ['Reh', 'Strauß', 'Pelikaan', 'Kranich'] },
      { stem: 'Welche Wildart wird im deutschen Revier häufig als Damwild bezeichnet?', answers: ['Damwild', 'Biber', 'Murmeltier', 'Kormoran'] },
      { stem: 'Welches Tier gehört zur Gruppe der Federwildarten?', answers: ['Fasan', 'Marder', 'Dachs', 'Schneehase'] },
      { stem: 'Welche Aussage zur Paarungszeit ist für viele Wildarten typisch?', answers: ['Die Paarung erfolgt in fest definierten Jahreszeiten.', 'Sie findet das ganze Jahr über im selben Rhythmus statt.', 'Sie ist nur beim Rehwild sichtbar.', 'Sie beginnt immer im Winter.'] },
      { stem: 'Welches Zeichen deutet auf ein Revier mit starker Wildhege hin?', answers: ['Vielfältige Deckung und sichere Nahrungsräume', 'Nur künstliche Hecken ohne Strukturen', 'Völlig offenes Gelände ohne Laubwald', 'Kein Wechsel von Feld und Wald'] },
      { stem: 'Welche Wildart nutzt häufig Hecken und Feldraine als Deckung?', answers: ['Wildschwein', 'Haubentaucher', 'Kiebitz', 'Alpenmurmeltier'] }
    ],
    jagdbetrieb: [
      { stem: 'Was ist bei der Ansitzjagd besonders wichtig?', answers: ['Wind, Sicht und Geräuscharmut', 'Lautes Sprechen im Revier', 'Direkter Kontakt mit dem Wild', 'Magnetische Orientierung mit dem Hund'] },
      { stem: 'Welche Jagdform ist für die Drückjagd typisch?', answers: ['Das Wild wird durch Treiber in Bewegung gesetzt', 'Das Wild wird mit einem Fallschirm gelockt', 'Der Jäger geht allein durch das Revier', 'Das Wild wird im offenen Gewässer verfolgt'] },
      { stem: 'Was ist eine wichtige Aufgabe eines Jagdhundes?', answers: ['Spurensuche und Suche nach Wild', 'Messen der Wuchsform von Bäumen', 'Bodenanalyse für Akten', 'Landen auf dem Wasser'] },
      { stem: 'Warum ist Fährtenlesen für einen Jäger wichtig?', answers: ['Es hilft, Wildbewegungen und -aktivität zu beurteilen', 'Es ersetzt die Schussentscheidung vollständig', 'Es ist nur für Hundetrainer relevant', 'Es ist nur bei der Fischerei wichtig'] },
      { stem: 'Welches Verhalten trägt besonders zur Unfallverhütung bei der Jagdausübung bei?', answers: ['Klare Schussrichtung und sichere Identifikation des Ziels', 'Schießen ohne Sichtlinie', 'Schnelles Überqueren des Schussfeldes', 'Lautes Rufen im Schussbereich'] },
      { stem: 'Was ist bei der Jagd mit Hunden besonders wichtig?', answers: ['Die Ausbildung und Steuerbarkeit des Hundes', 'Die Anzahl der Futterplätze im Wald', 'Eine lange Verfolgung ohne Pause', 'Ein Funkgerät für jede Baumart'] }
    ],
    waffentechnik: [
      { stem: 'Was ist die Aufgabe einer Sicherung an einer Waffe?', answers: ['Die Waffe vor unbeabsichtigtem Abfeuern schützen', 'Die Laufkonstruktion verstärken', 'Den Kugeldurchmesser erhöhen', 'Die Lauflänge verkürzen'] },
      { stem: 'Welche Eigenschaft ist für die Ballistik wichtig?', answers: ['Flugbahn, Geschwindigkeit und Energie des Projektils', 'Nur die Masse des Laufes', 'Nur die Farbe der Waffe', 'Nur das Gewicht der Patrone im Magazin'] },
      { stem: 'Was bedeutet ein sicherer Umgang mit der Waffe?', answers: ['Ständig kontrollierter, sachgerechter Umgang mit geladenem und ungeladenem Gewehr', 'Nur das Gewehr im Handschuh tragen', 'Nur das Gewehr in einer Tasche lagern', 'Sicherungsfehler nur bei Landwirten beachten'] },
      { stem: 'Warum ist die Kenntnis der wesentlichen Teile einer Waffe wichtig?', answers: ['Sie hilft, Funktion, Sicherheit und fachgerechten Umgang zu verstehen', 'Sie ist nur für Waffenhändler relevant', 'Sie erleichtert die Gartenarbeit', 'Sie ist nicht für Jäger notwendig'] },
      { stem: 'Welche Maßnahme ist beim Transport einer Waffe rechtlich und sicherheitstechnisch sinnvoll?', answers: ['Ungeladen, gesichert und getrennt von Munition transportieren', 'Geladen und in der Jackentasche tragen', 'Nur im Auto auf dem Rücksitz mit Munition', 'Ohne Verschluss und Sicherung transportieren'] },
      { stem: 'Welcher Bereich gehört zur Waffentechnik?', answers: ['Funktionsweise von Verschluss und Sicherung', 'Erkennen von Blattmustern', 'Bau von Kutschen', 'Klassifikation von Pflanzen'] }
    ],
    wildkrankheiten: [
      { stem: 'Welche Krankheit ist bei Wildtieren besonders ernst und kann auch Menschen gefährden?', answers: ['Tollwut', 'Rindfleischetikett', 'Kieselsäurefieber', 'Brennesselkrankheit'] },
      { stem: 'Welches Vorgehen ist bei Verdacht auf eine Tierkrankheit fachgerecht?', answers: ['Tier fachlich beurteilen, nicht ungeprüft anfassen und Meldung beachten', 'Das Tier direkt nach Hause nehmen', 'Das Tier sofort verkaufen', 'Direkt mit der Fleischverarbeitung beginnen'] },
      { stem: 'Warum ist die Fleischhygiene beim Wildbret wichtig?', answers: ['Sie schützt vor Krankheitserregern und Verunreinigungen', 'Sie ist nur bei Pflanzen relevant', 'Sie ist nur für Käsehersteller wichtig', 'Sie ist nur für den Autofahren nötig'] },
      { stem: 'Was ist bei der Untersuchung eines aufgebrochenen Wildes wichtig?', answers: ['Auffällige Befunde, Organe und Körpermerkmale fachlich prüfen', 'Nur den Geruch beurteilen', 'Nur den Schusskanal betrachten', 'Nur das Gewicht notieren'] },
      { stem: 'Welche Maßnahme dient der Wildbrethygiene?', answers: ['Saubere Verarbeitung und fachgerechte Lagerung', 'Direktes Zerlegen ohne Handschuhe', 'Lagerung in der Sonne', 'Ausschließliche Lagerung in Plastiksäcken ohne Kühlung'] },
      { stem: 'Welches Tier kann im Zusammenhang mit Wildkrankheiten eine relevante Rolle spielen?', answers: ['Schwein', 'Aal', 'Schmetterling', 'Barsch'] }
    ],
    jagdrecht: [
      { stem: 'Welche Regelung ist ein Kernpunkt des Jagdrechts?', answers: ['Schonzeiten und Schutz bestimmter Wildarten', 'Nur die Länge der Jägerjacke', 'Nur die Größe des Gewehrlaufs', 'Nur das Datum der Jagdsaison'] },
      { stem: 'Welche Stelle ist in Schleswig-Holstein für jagdrechtliche Grundlagen relevant?', answers: ['Landesjagdgesetz und die zuständigen Behörden', 'Nur die Stadtbücherei', 'Nur die Baumkontrolle', 'Nur das Landesamt für Bergbau'] },
      { stem: 'Was ist ein Ziel von Naturschutz- und Landschaftsschutzregeln?', answers: ['Der Schutz von Lebensräumen und Wildtieren', 'Die vollständige Entfernung von Bäumen aus Wäldern', 'Die künstliche Reduzierung aller Felsstrukturen', 'Die freie Nutzung aller Gewässer ohne Regeln'] },
      { stem: 'Warum sind Schonzeiten wichtig?', answers: ['Sie schützen Reproduktion und Bestand', 'Sie verändern die Jahreszeiten', 'Sie regeln nur die Kleidung', 'Sie erlauben unbegrenzte Bejagung'] },
      { stem: 'Was ist ein grundlegendes Prinzip tierschutzgerechter Jagdausübung?', answers: ['Schussentscheid und Tötung müssen fachgerecht und verantwortungsvoll erfolgen', 'Nur die Anzahl der Schüsse zählt', 'Die Jagd darf immer ohne Prüfung erfolgen', 'Der Hund muss an jedem Wildwechsel beteiligt sein'] },
      { stem: 'Welche rechtliche Grundlage ist für die Jagd meist von zentraler Bedeutung?', answers: ['Bundes- und Landesjagdrecht', 'Nur die Versicherungsbedingungen', 'Nur die Jagdzeitung', 'Nur das Futterangebot'] }
    ],
    forst: [
      { stem: 'Welche Baumart ist in vielen deutschen Wäldern häufig?', answers: ['Buche', 'Seepferdchen', 'Känguru', 'Mango'] },
      { stem: 'Welche Maßnahme hilft, Wildverbiss im Wald zu mindern?', answers: ['Schutzmaßnahmen an Jungpflanzen und geeignete Hege', 'Zufälliges Pflanzen ohne Schutz', 'Nur das Fällen alter Bäume', 'Nackte Flächen ohne Bewuchs'] },
      { stem: 'Was ist ein Ziel der Wildschadensverhütung im Landbau?', answers: ['Schäden durch Verbiss, Fraß und Trampeln vermeiden', 'Die Nutzfläche vergrößern, ohne Schutz', 'Die Ernteleistung ohne Bewachung sichern', 'Nur im Winter Maßnahmen treffen'] },
      { stem: 'Warum ist die Unterscheidung von Pflanzenarten für den Jäger relevant?', answers: ['Sie hilft bei Hege, Landschaftsbeurteilung und Wildschadenserkennung', 'Sie ist nur für Gärtner wichtig', 'Sie ersetzt die Fährtenkunde', 'Sie ist nur für die Forstverwaltung relevant'] },
      { stem: 'Welche Fläche ist häufig besonders empfindlich gegenüber Wildverbiss?', answers: ['Junge Bestände und Pflanzungen', 'Autobahnrampen', 'Stahlbetonflächen', 'Leere Betonmauern'] },
      { stem: 'Wie kann Wildschaden an landwirtschaftlichen Kulturen vermindert werden?', answers: ['Durch geeignete Schutzmaßnahmen und Beurteilung der Lage', 'Durch vollständige Beseitigung sämtlicher Hecken', 'Durch alle Pflanzen zu entfernen', 'Durch einseitige Nutzung des Waldes ohne Anpassung'] }
    ]
  };

  const generated = [];
  const templates = questionTemplates[categoryId] || [];

  for (let i = 0; i < total; i += 1) {
    const template = templates[i % templates.length];
    const optionPool = template.answers;
    const answer = optionPool[0];
    const wrongs = optionPool.slice(1);
    const shuffledAnswers = shuffleArray([answer, ...wrongs]);
    const correctIndex = shuffledAnswers.indexOf(answer);

    const question = {
      id: `${categoryId}-${i + 1}`,
      category: categoryId,
      question: `${template.stem} ${i + 1}`,
      options: shuffledAnswers,
      correctIndex,
      explanation: `Richtig ist ${answer}. Diese Antwort entspricht den fachlichen Grundlagen zu ${getCategoryLabel(categoryId)}.`
    };

    generated.push(question);
  }

  return generated;
}

function getCategoryLabel(categoryId) {
  const category = categories.find((item) => item.id === categoryId);
  return category ? category.label : 'Thema';
}

























































































































































































































































































































































































































































