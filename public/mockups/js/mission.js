(() => {
  const orders = {
    med: { id: 'MED-017', title: 'Medical oxygen', destination: 'Shackleton Hub', weight: 72, distance: 14.2, reward: 480, risk: 18, route: 'route-med', marker: 'med', critical: true },
    com: { id: 'COM-008', title: 'Communication module', destination: 'Artemis Relay', weight: 34, distance: 9.8, reward: 260, risk: 8, route: 'route-com', marker: 'com' },
    hab: { id: 'HAB-021', title: 'Habitat frame', destination: 'Copernicus Yard', weight: 148, distance: 18.7, reward: 720, risk: 24, route: 'route-hab', marker: 'hab', blocked: true },
    bio: { id: 'BIO-014', title: 'Research samples', destination: 'Tycho Lab', weight: 18, distance: 11.5, reward: 310, risk: 14, route: 'route-bio', marker: 'bio', critical: true },
    eng: { id: 'ENG-033', title: 'Pump controller', destination: 'Echo Ridge', weight: 41, distance: 7.1, reward: 190, risk: 6, route: 'route-eng', marker: 'eng' },
    sup: { id: 'SUP-026', title: 'Food crates', destination: 'Selene Camp', weight: 56, distance: 12.6, reward: 240, risk: 12, route: 'route-sup', marker: 'sup' },
  };

  const rovers = {
    atlas: { id: 'ATLAS-1', capacity: 120, battery: 84, speed: 28, factor: .92, status: 'available' },
    scout: { id: 'SCOUT-2', capacity: 45, battery: 63, speed: 42, factor: .72, status: 'available' },
    mule: { id: 'MULE-3', capacity: 90, battery: 21, speed: 23, factor: 1.02, status: 'charging' },
  };

  const destinationPositions = {
    med: { left: 79.4, top: 28 },
    com: { left: 82.3, top: 75.7 },
    hab: { left: 75, top: 15.7 },
    bio: { left: 91.1, top: 47.7 },
    eng: { left: 57.4, top: 43.7 },
    sup: { left: 88.5, top: 86.5 },
  };

  const state = {
    orderId: 'med',
    roverId: 'atlas',
    filter: 'all',
    recommendedRoverId: 'atlas',
    running: false,
    balance: 2840,
    eventCount: 128,
  };

  const els = {};

  function calculate(order, rover) {
    const requiredEnergy = Math.round((order.distance * 2.2 + order.weight * .34 + order.risk * .45) * rover.factor);
    const batteryAfter = rover.battery - requiredEnergy;
    const eta = Math.round((order.distance / rover.speed) * 60 * (1 + order.risk / 180));
    const expectedProfit = Math.round(order.reward - requiredEnergy * 1.2 - order.risk * 2.8);
    const success = Math.max(36, Math.round(100 - order.risk - (batteryAfter < 20 ? 7 : 0)));
    const blockers = [];

    if (order.weight > rover.capacity) {
      blockers.push(`Payload exceeds capacity by ${order.weight - rover.capacity} kg`);
    }
    if (requiredEnergy > rover.battery) {
      blockers.push(`Required energy exceeds available charge by ${requiredEnergy - rover.battery}%`);
    }
    if (rover.status !== 'available') {
      blockers.push(`${rover.id} is charging and unavailable for immediate dispatch`);
    }

    return {
      requiredEnergy,
      batteryAfter,
      eta,
      expectedProfit,
      success,
      blockers,
      feasible: blockers.length === 0,
      warning: blockers.length === 0 && batteryAfter < 20,
    };
  }

  function getBestRover(orderId) {
    const order = orders[orderId];
    const candidates = Object.entries(rovers)
      .map(([id, rover]) => ({ id, rover, calc: calculate(order, rover) }))
      .filter((item) => item.calc.feasible)
      .sort((a, b) => {
        const scoreA = a.calc.expectedProfit + a.calc.success * 2 - a.calc.eta;
        const scoreB = b.calc.expectedProfit + b.calc.success * 2 - b.calc.eta;
        return scoreB - scoreA;
      });
    return candidates[0] || null;
  }

  function icon(id, className = 'icon icon-sm') {
    return window.MoonCourier?.icon ? window.MoonCourier.icon(id, className) : '';
  }

  function selectOrder(orderId, options = {}) {
    if (!orders[orderId] || state.running) return;
    state.orderId = orderId;
    const best = getBestRover(orderId);
    state.recommendedRoverId = best?.id || null;

    if (options.selectRecommended !== false) {
      state.roverId = best?.id || state.roverId;
    }

    renderSelection();
  }

  function selectRover(roverId) {
    if (!rovers[roverId] || state.running) return;
    state.roverId = roverId;
    renderSelection();
  }

  function renderSelection() {
    const order = orders[state.orderId];
    const rover = rovers[state.roverId];
    const calc = calculate(order, rover);
    const best = getBestRover(state.orderId);
    state.recommendedRoverId = best?.id || null;

    document.querySelectorAll('.order-card').forEach((card) => {
      card.classList.toggle('is-selected', card.dataset.orderId === state.orderId);
    });

    document.querySelectorAll('[data-map-order]').forEach((marker) => {
      marker.classList.toggle('is-selected', marker.dataset.mapOrder === state.orderId);
    });

    document.querySelectorAll('.map-route').forEach((route) => {
      route.classList.remove('is-active', 'is-running', 'is-risk');
    });
    const activeRoute = document.getElementById(order.route);
    if (activeRoute) {
      activeRoute.classList.add('is-active');
      if (order.risk >= 15) activeRoute.classList.add('is-risk');
    }

    document.querySelectorAll('.rover-card').forEach((card) => {
      const id = card.dataset.roverId;
      const pair = calculate(order, rovers[id]);
      card.classList.toggle('is-selected', id === state.roverId);
      card.classList.toggle('is-incompatible', !pair.feasible);
      card.classList.toggle('is-recommended', id === state.recommendedRoverId);
    });

    els.dispatchOrderName.textContent = order.id;
    els.dispatchRoverName.textContent = rover.id;
    els.metricDistance.textContent = order.distance.toFixed(1);
    els.metricEta.textContent = calc.eta;
    els.metricBattery.textContent = `${calc.batteryAfter}%`;
    els.metricBattery.className = calc.batteryAfter >= 30 ? 'text-mint' : calc.batteryAfter >= 15 ? 'text-amber' : 'text-red';
    els.metricProfit.textContent = `${calc.expectedProfit >= 0 ? '+' : ''}${calc.expectedProfit}`;
    els.metricProfit.className = calc.expectedProfit >= 0 ? 'text-mint' : 'text-red';

    els.dispatchStatusBox.classList.remove('warning', 'blocked');
    els.blockerList.innerHTML = '';
    els.blockerList.classList.add('hidden');

    if (!calc.feasible) {
      els.dispatchStatusPill.textContent = 'Blocked';
      els.dispatchStatusPill.className = 'status-pill red';
      els.dispatchStatusBox.classList.add('blocked');
      els.dispatchStatusTitle.innerHTML = `${icon('i-lock')}<span>Dispatch impossible</span>`;
      els.dispatchStatusCopy.textContent = 'The deterministic rules reject this order–rover assignment.';
      els.blockerList.classList.remove('hidden');
      calc.blockers.forEach((blocker) => {
        const item = document.createElement('div');
        item.className = 'blocker-item';
        item.innerHTML = `${icon('i-x')}<span>${blocker}</span>`;
        els.blockerList.appendChild(item);
      });
      els.launchButton.disabled = true;
      els.launchButton.querySelector('span').textContent = 'Launch unavailable';
    } else if (calc.warning) {
      els.dispatchStatusPill.textContent = 'Warning';
      els.dispatchStatusPill.className = 'status-pill amber';
      els.dispatchStatusBox.classList.add('warning');
      els.dispatchStatusTitle.innerHTML = `${icon('i-alert')}<span>High-risk dispatch</span>`;
      els.dispatchStatusCopy.textContent = `The assignment is technically feasible, but the projected ${calc.batteryAfter}% battery reserve violates the recommended 20% operating policy.`;
      els.launchButton.disabled = false;
      els.launchButton.querySelector('span').textContent = 'Launch with warning';
    } else {
      els.dispatchStatusPill.textContent = 'Ready';
      els.dispatchStatusPill.className = 'status-pill mint';
      els.dispatchStatusTitle.innerHTML = `${icon('i-check')}<span>Ready to dispatch</span>`;
      els.dispatchStatusCopy.textContent = `All hard constraints are satisfied. Estimated success probability is ${calc.success}% and projected battery reserve is ${calc.batteryAfter}%.`;
      els.launchButton.disabled = false;
      els.launchButton.querySelector('span').textContent = 'Launch delivery';
    }

    renderAiRecommendation('recommend', false);
  }

  function renderAiRecommendation(type = 'recommend', announce = true) {
    const order = orders[state.orderId];
    const rover = rovers[state.roverId];
    const calc = calculate(order, rover);
    const best = getBestRover(state.orderId);

    let title = 'Recommendation';
    let confidence = 'confidence 0.93';
    let copy = '';
    let cells = '';
    let actions = true;

    if (type === 'blockers') {
      title = 'Constraint explanation';
      confidence = 'verified by rules';
      if (calc.feasible) {
        copy = `<strong>${order.id} → ${rover.id}</strong> is feasible. Capacity, energy and availability constraints pass. The remaining risk is probabilistic rather than a hard blocker.`;
        cells = `
          <div class="ai-data-cell"><span>Capacity</span><span class="text-mint">Pass</span></div>
          <div class="ai-data-cell"><span>Energy</span><span class="text-mint">Pass</span></div>
          <div class="ai-data-cell"><span>Availability</span><span class="text-mint">Pass</span></div>`;
      } else {
        copy = `<strong>${order.id} → ${rover.id}</strong> cannot be launched. ${calc.blockers.join('. ')}.`;
        cells = calc.blockers.slice(0, 3).map((blocker, index) => `
          <div class="ai-data-cell"><span>Blocker ${index + 1}</span><span class="text-red">${blocker.split(' by ')[0]}</span></div>`).join('');
        actions = Boolean(best);
      }
    } else if (type === 'simulate') {
      title = 'Counterfactual simulation';
      confidence = '500 seeded runs';
      if (state.orderId === 'hab') {
        copy = `Adding a <strong>160 kg heavy rover</strong> makes HAB-021 feasible. Across 500 seeded runs, the order completes in 71% of cases and produces a median net result of <strong>+498 CR</strong>.`;
        cells = `
          <div class="ai-data-cell"><span>Success</span><span class="text-mint">71%</span></div>
          <div class="ai-data-cell"><span>Required cap.</span><span>148 kg</span></div>
          <div class="ai-data-cell"><span>Median net</span><span class="text-mint">+498 CR</span></div>`;
      } else {
        const alternativeRisk = Math.max(3, order.risk - 9);
        copy = `A longer low-risk route adds <strong>6 minutes</strong>, but lowers route risk from ${order.risk}% to ${alternativeRisk}% and improves estimated success probability by <strong>9 points</strong>.`;
        cells = `
          <div class="ai-data-cell"><span>Extra time</span><span>+6 min</span></div>
          <div class="ai-data-cell"><span>Risk</span><span class="text-mint">${alternativeRisk}%</span></div>
          <div class="ai-data-cell"><span>Success</span><span class="text-mint">+9 pt</span></div>`;
      }
      actions = false;
    } else if (!best) {
      title = 'No feasible assignment';
      confidence = 'verified by rules';
      copy = `<strong>${order.id}</strong> is intentionally impossible with the current fleet. The cargo weighs ${order.weight} kg, while the largest rover capacity is 120 kg. Defer the order, split the cargo, or add a heavy rover.`;
      cells = `
        <div class="ai-data-cell"><span>Cargo</span><span class="text-red">${order.weight} kg</span></div>
        <div class="ai-data-cell"><span>Fleet max</span><span>120 kg</span></div>
        <div class="ai-data-cell"><span>Deficit</span><span class="text-red">28 kg</span></div>`;
      actions = false;
    } else {
      const bestCalc = best.calc;
      const bestRover = best.rover;
      copy = `Assign <strong>${bestRover.id}</strong> to <strong>${order.id}</strong>. It is the best currently available option under capacity, battery-reserve, ETA and expected-profit constraints.`;
      cells = `
        <div class="ai-data-cell"><span>Success</span><span class="text-mint">${bestCalc.success}%</span></div>
        <div class="ai-data-cell"><span>Battery</span><span>${bestCalc.batteryAfter}%</span></div>
        <div class="ai-data-cell"><span>Net</span><span class="text-mint">+${bestCalc.expectedProfit} CR</span></div>`;
      actions = true;
    }

    els.aiCardTitle.textContent = title;
    els.aiConfidence.textContent = confidence;
    els.aiCopy.innerHTML = copy;
    els.aiDataGrid.innerHTML = cells;
    els.applyAiButton.style.display = actions ? '' : 'none';
    els.applyAiButton.textContent = best ? `Apply ${best.rover.id}` : 'Apply recommendation';

    if (announce && window.MoonCourier?.showToast) {
      window.MoonCourier.showToast(title, type === 'simulate' ? 'The counterfactual was calculated from seeded simulation runs.' : 'The AI used deterministic tools and current mission state.', type === 'simulate' ? 'violet' : 'cyan');
    }
  }

  function applyRecommendation() {
    const best = getBestRover(state.orderId);
    if (!best) {
      window.MoonCourier?.showToast('No valid assignment', 'The current fleet cannot execute this order.', 'red');
      return;
    }
    state.roverId = best.id;
    renderSelection();
    window.MoonCourier?.showToast('Recommendation applied', `${best.rover.id} is selected for ${orders[state.orderId].id}.`, 'mint');
  }

  function addEvent({ time, tone = 'cyan', iconId = 'i-info', copy, meta = '' }, prepend = true) {
    const row = document.createElement('div');
    row.className = 'event-row';
    row.innerHTML = `
      <span class="event-time">${time}</span>
      <span class="event-icon ${tone === 'cyan' ? '' : tone}">${icon(iconId)}</span>
      <span class="event-copy">${copy}</span>
      <span class="event-meta ${tone === 'mint' ? 'text-mint' : tone === 'red' ? 'text-red' : ''}">${meta}</span>`;
    if (prepend) els.eventStream.prepend(row); else els.eventStream.appendChild(row);
    state.eventCount += 1;
    els.eventCount.textContent = state.eventCount;
  }

  function launchDelivery() {
    if (state.running) return;
    const order = orders[state.orderId];
    const rover = rovers[state.roverId];
    const calc = calculate(order, rover);
    if (!calc.feasible) return;

    state.running = true;
    els.launchButton.disabled = true;
    els.launchButton.querySelector('span').textContent = 'Delivery in progress';
    const route = document.getElementById(order.route);
    route?.classList.add('is-running');
    els.roverMapAtlas.classList.add('is-running');

    const sequence = [
      { delay: 0, time: '14:32:08', tone: 'cyan', iconId: 'i-play', copy: `${order.id} assigned to ${rover.id}`, meta: 'STARTED', pos: { left: 32, top: 61 } },
      { delay: 850, time: '14:34:11', tone: 'cyan', iconId: 'i-route', copy: `${rover.id} entered sector C3`, meta: `${Math.max(0, rover.battery - 16)}%`, pos: { left: 44, top: 52 } },
      { delay: 1700, time: '14:37:42', tone: order.risk >= 15 ? 'amber' : 'cyan', iconId: order.risk >= 15 ? 'i-alert' : 'i-route', copy: order.risk >= 15 ? 'Elevated-risk corridor entered' : 'Nominal route segment cleared', meta: `${order.risk}%`, pos: { left: 58, top: 41 } },
      { delay: 2550, time: '14:41:18', tone: 'mint', iconId: 'i-shield', copy: 'Risk check passed · no cargo damage', meta: 'PASSED', pos: { left: 69, top: 33 } },
      { delay: 3450, time: '14:46:53', tone: 'mint', iconId: 'i-package-check', copy: `${order.id} delivered to ${order.destination}`, meta: `+${order.reward} CR`, pos: destinationPositions[state.orderId] },
    ];

    sequence.forEach((event) => {
      window.setTimeout(() => {
        addEvent(event);
        if (event.pos) {
          els.roverMapAtlas.style.left = `${event.pos.left}%`;
          els.roverMapAtlas.style.top = `${event.pos.top}%`;
        }
      }, event.delay);
    });

    window.setTimeout(() => {
      state.balance += Math.max(0, Math.round((calc.expectedProfit + 44) / 10) * 10);
      els.balanceValue.textContent = `${state.balance.toLocaleString('en-US').replace(',', ' ')} CR`;
      els.successTitle.textContent = `${order.id} reached ${order.destination}`;
      document.querySelector('#successModal .modal-subtitle').textContent = `${rover.id} completed the route with no cargo damage.`;
      els.successModal.classList.add('is-open');
      state.running = false;
      route?.classList.remove('is-running');
      els.roverMapAtlas.classList.remove('is-running');
      els.launchButton.disabled = false;
      els.launchButton.querySelector('span').textContent = 'Launch delivery';
    }, 4200);
  }

  function filterOrders() {
    const query = els.orderSearch.value.trim().toLowerCase();
    let visible = 0;
    document.querySelectorAll('.order-card').forEach((card) => {
      const matchesSearch = !query || card.dataset.search.toLowerCase().includes(query);
      const tags = card.dataset.filterTags || '';
      const matchesFilter = state.filter === 'all' || tags.includes(state.filter);
      const show = matchesSearch && matchesFilter;
      card.classList.toggle('hidden', !show);
      if (show) visible += 1;
    });
    els.activeOrderCount.textContent = visible;
  }

  function bind() {
    document.querySelectorAll('.order-card').forEach((card) => {
      card.addEventListener('click', () => selectOrder(card.dataset.orderId));
    });

    document.querySelectorAll('[data-map-order]').forEach((marker) => {
      marker.addEventListener('click', () => selectOrder(marker.dataset.mapOrder));
    });

    document.querySelectorAll('.rover-card').forEach((card) => {
      card.addEventListener('click', () => selectRover(card.dataset.roverId));
    });

    document.querySelectorAll('.filter-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        state.filter = chip.dataset.filter;
        document.querySelectorAll('.filter-chip').forEach((other) => other.classList.toggle('is-active', other === chip));
        filterOrders();
      });
    });

    els.orderSearch.addEventListener('input', filterOrders);
    els.launchButton.addEventListener('click', launchDelivery);
    els.findAlternativeButton.addEventListener('click', () => renderAiRecommendation('recommend'));
    els.applyAiButton.addEventListener('click', applyRecommendation);

    document.querySelectorAll('[data-ai-action]').forEach((button) => {
      button.addEventListener('click', () => renderAiRecommendation(button.dataset.aiAction));
    });

    els.aiForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = els.aiInput.value.trim().toLowerCase();
      if (!query) return;
      if (query.includes('why') || query.includes('block') || query.includes('impossible') || query.includes('нельзя')) {
        renderAiRecommendation('blockers');
      } else if (query.includes('simulate') || query.includes('what if') || query.includes('alternative') || query.includes('если')) {
        renderAiRecommendation('simulate');
      } else {
        renderAiRecommendation('recommend');
      }
      els.aiInput.value = '';
    });

    document.querySelectorAll('.segmented button').forEach((button) => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.segmented button').forEach((other) => other.classList.toggle('is-active', other === button));
        window.MoonCourier?.showToast('Simulation speed updated', `Operational playback is now ${button.textContent}.`, 'cyan');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    Object.assign(els, {
      dispatchOrderName: document.getElementById('dispatchOrderName'),
      dispatchRoverName: document.getElementById('dispatchRoverName'),
      metricDistance: document.getElementById('metricDistance'),
      metricEta: document.getElementById('metricEta'),
      metricBattery: document.getElementById('metricBattery'),
      metricProfit: document.getElementById('metricProfit'),
      dispatchStatusPill: document.getElementById('dispatchStatusPill'),
      dispatchStatusBox: document.getElementById('dispatchStatusBox'),
      dispatchStatusTitle: document.getElementById('dispatchStatusTitle'),
      dispatchStatusCopy: document.getElementById('dispatchStatusCopy'),
      blockerList: document.getElementById('blockerList'),
      launchButton: document.getElementById('launchButton'),
      findAlternativeButton: document.getElementById('findAlternativeButton'),
      aiCardTitle: document.getElementById('aiCardTitle'),
      aiConfidence: document.getElementById('aiConfidence'),
      aiCopy: document.getElementById('aiCopy'),
      aiDataGrid: document.getElementById('aiDataGrid'),
      applyAiButton: document.getElementById('applyAiButton'),
      aiForm: document.getElementById('aiForm'),
      aiInput: document.getElementById('aiInput'),
      eventStream: document.getElementById('eventStream'),
      eventCount: document.getElementById('eventCount'),
      orderSearch: document.getElementById('orderSearch'),
      activeOrderCount: document.getElementById('activeOrderCount'),
      roverMapAtlas: document.getElementById('roverMapAtlas'),
      successModal: document.getElementById('successModal'),
      successTitle: document.getElementById('successTitle'),
      balanceValue: document.getElementById('balanceValue'),
    });

    bind();
    renderSelection();
  });
})();
