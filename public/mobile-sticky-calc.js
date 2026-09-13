/**
 * Mobile Sticky Calculator Summary Badge
 * Phase 4: Mobile-First UX Enhancement for Weight Loss Percentage Site
 *
 * Displays live calculation results in a fixed-position badge on mobile devices.
 * Updates dynamically as users interact with calculator inputs.
 * Target: 66% mobile traffic segment
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    checkInterval: 500, // ms - how often to check for calculator updates
    fadeInDelay: 300,   // ms - delay before showing badge after first calculation
    updateDebounce: 150, // ms - debounce rapid updates
  };

  // State
  let stickyBadge = null;
  let lastUpdate = {
    percentage: null,
    remaining: null,
    status: null,
    timestamp: 0
  };
  let updateTimer = null;
  let isVisible = false;

  /**
   * Create the sticky badge element
   */
  function createStickyBadge() {
    const badge = document.createElement('div');
    badge.id = 'mobile-sticky-calc';
    badge.setAttribute('role', 'status');
    badge.setAttribute('aria-live', 'polite');
    badge.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;max-width:1200px;margin:0 auto;">
        <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;flex:1;">
          <span style="font-size:1rem;">📊</span>
          <div style="display:flex;gap:0.5rem;align-items:baseline;flex-wrap:wrap;">
            <span style="font-size:0.7rem;opacity:0.9;">Progress:</span>
            <strong id="sticky-pct" style="font-size:1rem;color:#a78bfa;">--</strong>
          </div>
          <div style="height:16px;width:1px;background:rgba(255,255,255,0.3);"></div>
          <div style="display:flex;gap:0.5rem;align-items:baseline;">
            <span style="font-size:0.7rem;opacity:0.9;">Left:</span>
            <strong id="sticky-lbs-remaining" style="font-size:0.9rem;color:#fbcfe8;">--</strong>
          </div>
          <div style="height:16px;width:1px;background:rgba(255,255,255,0.3);"></div>
          <div style="display:flex;gap:0.5rem;align-items:baseline;">
            <span id="sticky-status-icon" style="font-size:0.9rem;">🏥</span>
            <strong id="sticky-status" style="font-size:0.9rem;color:#fef3c7;">--</strong>
          </div>
        </div>
        <button
          id="sticky-dismiss"
          aria-label="Dismiss sticky calculator"
          style="background:transparent;border:none;color:rgba(255,255,255,0.7);font-size:1.2rem;cursor:pointer;padding:0.25rem;line-height:1;transition:color 0.2s;"
          onmouseover="this.style.color='rgba(255,255,255,1)'"
          onmouseout="this.style.color='rgba(255,255,255,0.7)'"
        >×</button>
      </div>
    `;

    // Apply styles
    Object.assign(badge.style, {
      display: 'none',
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      color: '#fff',
      padding: '0.75rem 1rem',
      paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
      zIndex: '9999',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '0.8rem',
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px',
      boxShadow: '0 -4px 20px rgba(79, 70, 229, 0.3)',
      transition: 'transform 0.3s ease, opacity 0.3s ease',
      transform: 'translateY(100%)',
      opacity: '0'
    });

    return badge;
  }

  /**
   * Show the sticky badge with animation
   */
  function showBadge() {
    if (!stickyBadge || isVisible) return;

    stickyBadge.style.display = 'block';
    // Trigger reflow for animation
    stickyBadge.offsetHeight;
    stickyBadge.style.transform = 'translateY(0)';
    stickyBadge.style.opacity = '1';
    isVisible = true;
  }

  /**
   * Hide the sticky badge with animation
   */
  function hideBadge() {
    if (!stickyBadge || !isVisible) return;

    stickyBadge.style.transform = 'translateY(100%)';
    stickyBadge.style.opacity = '0';
    setTimeout(() => {
      if (stickyBadge) {
        stickyBadge.style.display = 'none';
      }
    }, 300);
    isVisible = false;
  }

  /**
   * Extract calculator values from the DOM
   * Supports multiple calculator types on the site
   */
  function extractCalculatorData() {
    const data = {
      startingWeight: null,
      currentWeight: null,
      goalWeight: null,
      unit: 'lbs'
    };

    // Try to find input fields - various selectors for different calculator types
    const startingInputs = document.querySelectorAll('input[name*="starting"], input[name*="initial"], input[placeholder*="Starting"], input[id*="starting"]');
    const currentInputs = document.querySelectorAll('input[name*="current"], input[placeholder*="Current"], input[id*="current"]');
    const goalInputs = document.querySelectorAll('input[name*="goal"], input[name*="target"], input[placeholder*="Goal"], input[id*="goal"]');

    // Extract values
    if (startingInputs.length > 0) {
      const value = parseFloat(startingInputs[0].value);
      if (!isNaN(value) && value > 0) data.startingWeight = value;
    }

    if (currentInputs.length > 0) {
      const value = parseFloat(currentInputs[0].value);
      if (!isNaN(value) && value > 0) data.currentWeight = value;
    }

    if (goalInputs.length > 0) {
      const value = parseFloat(goalInputs[0].value);
      if (!isNaN(value) && value > 0) data.goalWeight = value;
    }

    // Try to detect unit (kg vs lbs)
    const unitSelectors = document.querySelectorAll('select[name*="unit"], input[type="radio"][value*="kg"], button[aria-pressed="true"]');
    for (let selector of unitSelectors) {
      const text = (selector.value || selector.textContent || '').toLowerCase();
      if (text.includes('kg') || text.includes('kilo')) {
        data.unit = 'kg';
        break;
      }
    }

    return data;
  }

  /**
   * Calculate weight loss metrics
   */
  function calculateMetrics(data) {
    if (!data.startingWeight || !data.currentWeight) {
      return null;
    }

    const weightLost = data.startingWeight - data.currentWeight;
    const percentage = (weightLost / data.startingWeight) * 100;

    let remaining = 0;
    if (data.goalWeight && data.goalWeight < data.currentWeight) {
      remaining = data.currentWeight - data.goalWeight;
    }

    // Determine health status
    let status = 'Healthy';
    let statusIcon = '✅';

    if (percentage < 0) {
      status = 'Gained';
      statusIcon = '⚠️';
    } else if (percentage >= 20) {
      status = 'Excellent';
      statusIcon = '🌟';
    } else if (percentage >= 10) {
      status = 'Great';
      statusIcon = '💪';
    } else if (percentage >= 5) {
      status = 'Milestone';
      statusIcon = '🎯';
    } else if (percentage > 0) {
      status = 'Progress';
      statusIcon = '📈';
    }

    return {
      percentage: percentage.toFixed(1),
      remaining: remaining.toFixed(1),
      unit: data.unit,
      status,
      statusIcon
    };
  }

  /**
   * Update the sticky badge display
   */
  function updateBadgeDisplay(metrics) {
    if (!metrics || !stickyBadge) return;

    const pctEl = document.getElementById('sticky-pct');
    const remainingEl = document.getElementById('sticky-lbs-remaining');
    const statusEl = document.getElementById('sticky-status');
    const statusIconEl = document.getElementById('sticky-status-icon');

    if (pctEl) {
      pctEl.textContent = `${metrics.percentage}%`;
      // Color based on progress
      if (parseFloat(metrics.percentage) >= 10) {
        pctEl.style.color = '#86efac'; // green
      } else if (parseFloat(metrics.percentage) >= 5) {
        pctEl.style.color = '#a78bfa'; // purple
      } else {
        pctEl.style.color = '#fbcfe8'; // pink
      }
    }

    if (remainingEl) {
      if (parseFloat(metrics.remaining) > 0) {
        remainingEl.textContent = `${metrics.remaining} ${metrics.unit}`;
      } else {
        remainingEl.textContent = 'Goal!';
        remainingEl.style.color = '#86efac';
      }
    }

    if (statusEl) {
      statusEl.textContent = metrics.status;
    }

    if (statusIconEl) {
      statusIconEl.textContent = metrics.statusIcon;
    }

    // Check if this is a new calculation (different from last update)
    const hasChanged =
      lastUpdate.percentage !== metrics.percentage ||
      lastUpdate.remaining !== metrics.remaining ||
      lastUpdate.status !== metrics.status;

    if (hasChanged) {
      lastUpdate = {
        percentage: metrics.percentage,
        remaining: metrics.remaining,
        status: metrics.status,
        timestamp: Date.now()
      };

      // Show badge after first calculation
      if (!isVisible) {
        setTimeout(showBadge, CONFIG.fadeInDelay);
      }
    }
  }

  /**
   * Main update loop - checks for calculator changes
   */
  function checkForUpdates() {
    // Only run on mobile (screen width check)
    if (window.innerWidth >= 768) {
      if (isVisible) hideBadge();
      return;
    }

    const data = extractCalculatorData();
    const metrics = calculateMetrics(data);

    if (metrics) {
      // Debounce updates
      clearTimeout(updateTimer);
      updateTimer = setTimeout(() => {
        updateBadgeDisplay(metrics);
      }, CONFIG.updateDebounce);
    }
  }

  /**
   * Initialize the sticky badge
   */
  function init() {
    // Only initialize on pages with calculators
    const hasCalculatorInputs = document.querySelector('input[type="number"], input[name*="weight"], input[name*="current"]');
    if (!hasCalculatorInputs) {
      return; // Not a calculator page
    }

    // Create and append badge
    stickyBadge = createStickyBadge();
    document.body.appendChild(stickyBadge);

    // Add dismiss handler
    const dismissBtn = document.getElementById('sticky-dismiss');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        hideBadge();
        // Store dismissal preference for this session
        sessionStorage.setItem('stickyCalcDismissed', 'true');
      });
    }

    // Check if previously dismissed this session
    if (sessionStorage.getItem('stickyCalcDismissed') === 'true') {
      return; // Don't show if user dismissed it
    }

    // Start update loop
    const intervalId = setInterval(checkForUpdates, CONFIG.checkInterval);

    // Handle window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) {
        hideBadge();
      }
    });

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      clearInterval(intervalId);
      clearTimeout(updateTimer);
    });

    // Initial check
    checkForUpdates();
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-init on SPA navigation (for React Router)
  let lastPath = location.pathname;
  setInterval(() => {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      // Reset state on navigation
      if (stickyBadge && stickyBadge.parentNode) {
        stickyBadge.parentNode.removeChild(stickyBadge);
      }
      stickyBadge = null;
      isVisible = false;
      sessionStorage.removeItem('stickyCalcDismissed');
      setTimeout(init, 500); // Allow React to render
    }
  }, 1000);

})();
