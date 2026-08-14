(() => {
  const ranges = {
    mission: {
      profit: '+2 840 CR', completion: '78%', failures: '3', utilization: '64%',
      insight: 'The main bottleneck was <strong>heavy-load capacity</strong>, not battery availability. Adding one heavy rover raises projected mission survival from <strong>61% to 87%</strong>; faster charging raises it only to 69%.',
    },
    day: {
      profit: '+420 CR', completion: '64%', failures: '2', utilization: '81%',
      insight: 'Day 4 performance was dominated by the <strong>medical demand surge</strong>. ATLAS-1 operated near capacity while four heavy orders competed for one viable rover.',
    },
    shift: {
      profit: '+356 CR', completion: '86%', failures: '0', utilization: '72%',
      insight: 'The current shift is healthy. The only near-term risk is <strong>MULE-3 charging time</strong>, which reduces heavy-load redundancy for the next 18 minutes.',
    },
  };

  const questionResponses = [
    {
      match: ['profit', 'day 3', 'day three', 'прибыл'],
      text: 'Profit fell after Day 3 because the <strong>Day 4 medical surge</strong> increased heavy-order volume by 74%. Nine assignments were rejected by capacity, while energy availability remained adequate.',
      toast: 'Profit decline explained from event history and failure breakdown.',
    },
    {
      match: ['rover', 'bottleneck', 'узкое', 'ровер'],
      text: '<strong>ATLAS-1 is the operational bottleneck.</strong> It handled 82% active utilization and was the only immediately available rover for most orders above 45 kg.',
      toast: 'Fleet bottleneck identified from utilization and compatibility data.',
    },
    {
      match: ['battery', 'energy', 'заряд', 'батар'],
      text: 'Battery availability was a secondary constraint. Only three assignments failed energy checks, compared with nine capacity failures. Charging improvements help, but they do not remove the dominant heavy-load bottleneck.',
      toast: 'Energy impact compared against capacity and risk constraints.',
    },
    {
      match: ['risk', 'опас', 'failure', 'провал'],
      text: 'Risk events caused four losses, concentrated in sectors D2–E3. The safest countermeasure is a six-minute detour, which improves success probability by approximately nine points without changing fleet composition.',
      toast: 'Risk pattern summarized from route events and counterfactual runs.',
    },
  ];

  function updateRange(rangeKey) {
    const data = ranges[rangeKey] || ranges.mission;
    document.getElementById('kpiProfit').textContent = data.profit;
    document.getElementById('kpiCompletion').textContent = data.completion;
    document.getElementById('kpiFailures').textContent = data.failures;
    document.getElementById('kpiUtilization').textContent = data.utilization;
    document.getElementById('insightText').innerHTML = data.insight;
    window.MoonCourier?.showToast('Analytics range updated', rangeKey === 'mission' ? 'Showing the complete seven-day mission.' : rangeKey === 'day' ? 'Showing Day 4 medical-surge performance.' : 'Showing the current operational shift.', 'cyan');
  }

  function runSimulation() {
    const button = document.getElementById('runSimulationButton');
    button.disabled = true;
    const original = button.innerHTML;
    button.innerHTML = `${window.MoonCourier.icon('i-activity')}Running 500 seeds…`;
    window.setTimeout(() => {
      document.getElementById('heavySurvival').textContent = '89%';
      document.getElementById('heavyNet').textContent = '+3 910';
      document.getElementById('insightText').innerHTML = 'The rerun confirms <strong>heavy-load capacity</strong> as the dominant intervention. With one additional heavy rover, projected mission survival rises to <strong>89%</strong> and median net profit to <strong>+3 910 CR</strong>.';
      button.disabled = false;
      button.innerHTML = original;
      window.MoonCourier?.showToast('Simulation complete', '500 deterministic seeded runs were compared against the baseline.', 'violet');
    }, 1500);
  }

  function toggleEvidence() {
    const list = document.getElementById('evidenceList');
    const button = document.getElementById('toggleEvidenceButton');
    const hidden = list.classList.toggle('hidden');
    button.textContent = hidden ? 'Show evidence' : 'Hide evidence';
  }

  function askAnalytics(query) {
    const normalized = query.trim().toLowerCase();
    const response = questionResponses.find((item) => item.match.some((term) => normalized.includes(term)));
    const text = response?.text || 'The strongest current signal is <strong>capacity pressure on heavy orders</strong>. Ask about profit, rover utilization, battery, route risk or the Day 4 demand spike for a more specific evidence-linked explanation.';
    document.getElementById('insightText').innerHTML = text;
    window.MoonCourier?.showToast('Mission Control answered', response?.toast || 'The answer was grounded in the current analytics tools.', 'cyan');
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-range]').forEach((button) => {
      button.addEventListener('click', () => {
        document.querySelectorAll('[data-range]').forEach((other) => other.classList.toggle('is-active', other === button));
        updateRange(button.dataset.range);
      });
    });

    document.getElementById('runSimulationButton')?.addEventListener('click', runSimulation);
    document.getElementById('toggleEvidenceButton')?.addEventListener('click', toggleEvidence);
    document.getElementById('analyticsQueryForm')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = document.getElementById('analyticsQueryInput');
      if (!input.value.trim()) return;
      askAnalytics(input.value);
      input.value = '';
    });
  });
})();
