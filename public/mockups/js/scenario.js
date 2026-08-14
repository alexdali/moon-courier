(() => {
  const presetPrompts = {
    medical: 'Create a seven-day mission with a medical demand spike on day four, limited heavy transport, volatile route risk and one intentionally impossible order. The campaign should be difficult but survivable with disciplined planning.',
    energy: 'Create a seven-day mission where charging infrastructure is unreliable, energy prices rise after day three and players must preserve a 20% reserve. Include one delivery that is impossible because no current rover has enough battery.',
    risk: 'Create a six-day mission around a solar storm. Route risk should migrate across sectors, communications should degrade temporarily and safe detours must trade time for reliability. Keep at least one impossible delivery.',
    economy: 'Create a ten-day low-margin logistics campaign with many small orders, expensive energy and strict late-delivery penalties. The optimal strategy should reject some unprofitable orders while keeping the mission survivable.',
  };

  const ranges = [
    ['difficultyRange', 'difficultyValue'],
    ['scarcityRange', 'scarcityValue'],
    ['volatilityRange', 'volatilityValue'],
    ['riskRange', 'riskValue'],
  ];

  function updateRange(rangeId, valueId) {
    const input = document.getElementById(rangeId);
    const output = document.getElementById(valueId);
    if (!input || !output) return;
    output.textContent = `${input.value}%`;
  }

  function hashSeed(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return Math.abs(hash >>> 0);
  }

  function seededValue(seed, offset, min, max) {
    const x = Math.sin(seed + offset * 9973) * 10000;
    const fraction = x - Math.floor(x);
    return Math.round(min + fraction * (max - min));
  }

  function setGenerationStep(activeIndex) {
    document.querySelectorAll('[data-generation-step]').forEach((step) => {
      const index = Number(step.dataset.generationStep);
      step.classList.toggle('is-done', index < activeIndex);
      step.classList.toggle('is-active', index === activeIndex);
      const use = step.querySelector('use');
      if (use && index < activeIndex) use.setAttribute('href', '#i-check');
    });
  }

  function resetGenerationSteps() {
    const icons = ['i-sparkles', 'i-map', 'i-shield', 'i-analytics'];
    document.querySelectorAll('[data-generation-step]').forEach((step, index) => {
      step.classList.remove('is-done', 'is-active');
      if (index === 0) step.classList.add('is-active');
      step.querySelector('use')?.setAttribute('href', `#${icons[index]}`);
    });
  }

  function generateScenario() {
    const overlay = document.getElementById('generateOverlay');
    const button = document.getElementById('generateScenarioButton');
    const prompt = document.getElementById('scenarioPrompt').value.trim();
    const seedInput = document.getElementById('seedInput');
    const seedText = seedInput.value.trim() || String(Date.now()).slice(-6);
    seedInput.value = seedText;
    const seed = hashSeed(`${seedText}:${prompt}`);

    resetGenerationSteps();
    overlay.classList.add('is-visible');
    button.disabled = true;

    window.setTimeout(() => setGenerationStep(2), 650);
    window.setTimeout(() => setGenerationStep(3), 1250);
    window.setTimeout(() => setGenerationStep(4), 1900);
    window.setTimeout(() => {
      const difficulty = Number(document.getElementById('difficultyRange').value);
      const scarcity = Number(document.getElementById('scarcityRange').value);
      const volatility = Number(document.getElementById('volatilityRange').value);
      const risk = Number(document.getElementById('riskRange').value);
      const orders = seededValue(seed, 1, 10, 16);
      const colonies = seededValue(seed, 2, 4, 6);
      const rovers = scarcity > 72 ? 2 : seededValue(seed, 3, 3, 4);
      const rawSurvival = 103 - difficulty * .42 - scarcity * .22 - volatility * .1 - risk * .13;
      const survival = Math.max(28, Math.min(88, Math.round(rawSurvival + seededValue(seed, 4, -4, 5))));
      const level = difficulty >= 78 ? 'Severe' : difficulty >= 58 ? 'Hard' : difficulty >= 38 ? 'Medium' : 'Light';

      document.getElementById('previewOrders').textContent = orders;
      document.getElementById('previewColonies').textContent = colonies;
      document.getElementById('previewRovers').textContent = rovers;
      document.getElementById('previewPassRate').textContent = `${survival}%`;
      document.getElementById('previewSeed').textContent = seedText;
      document.getElementById('previewDifficulty').textContent = level;
      document.getElementById('validationSurvival').textContent = `${survival}%`;

      setGenerationStep(5);
      window.setTimeout(() => {
        overlay.classList.remove('is-visible');
        button.disabled = false;
        window.MoonCourier?.showToast('Scenario generated and validated', `${orders} orders, ${colonies} colonies and one intentional blocker are ready.`, 'mint');
      }, 500);
    }, 2550);
  }

  document.addEventListener('DOMContentLoaded', () => {
    ranges.forEach(([rangeId, valueId]) => {
      const input = document.getElementById(rangeId);
      input?.addEventListener('input', () => updateRange(rangeId, valueId));
      updateRange(rangeId, valueId);
    });

    document.querySelectorAll('[data-preset]').forEach((button) => {
      button.addEventListener('click', () => {
        document.querySelectorAll('[data-preset]').forEach((other) => other.classList.toggle('is-active', other === button));
        document.getElementById('scenarioPrompt').value = presetPrompts[button.dataset.preset];
        window.MoonCourier?.showToast('Preset loaded', `${button.textContent} constraints were added to the mission brief.`, 'violet');
      });
    });

    document.getElementById('generateScenarioButton')?.addEventListener('click', generateScenario);
  });
})();
