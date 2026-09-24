// ============================================================================
// The self-audit engine.
//
// A research framework that cannot be caught being wrong is not a framework,
// it is a mood. This module runs the Leviathan section 7 self-check as actual
// code against the actual data, every page load, and renders the result where
// the reader can see it - including the failures.
//
// Design rule: an audit that only ever passes is decoration. These checks are
// written to be capable of failing, and the UI shows the count of failures
// rather than hiding them behind a green tick.
// ============================================================================

import type { Observation, Scenario, TradeExpression } from '../types/framework';
import { decompositionCheck, spreads, type TenYearDecomposition } from './curve';

export type Severity = 'FAIL' | 'WARN' | 'PASS';

export interface AuditResult {
  id: string;
  check: string;
  severity: Severity;
  detail: string;
  /** Which framework clause this check enforces. */
  clause: string;
}

const ok = (id: string, check: string, detail: string, clause: string): AuditResult =>
  ({ id, check, severity: 'PASS', detail, clause });

// ------------------------------------------------------------ probability ---

export function auditProbabilities(scenarios: Scenario[]): AuditResult[] {
  const sum = scenarios.reduce((a, s) => a + s.probability, 0);
  const clause = 'Leviathan 3.5 - probabilities sum to 100%';
  if (sum !== 100) {
    return [{
      id: 'prob-sum',
      check: 'Scenario probabilities sum to 100',
      severity: 'FAIL',
      detail: `Sum is ${sum}%. Scenarios: ${scenarios.map((s) => `${s.key}=${s.probability}`).join(', ')}.`,
      clause,
    }];
  }
  const results: AuditResult[] = [ok('prob-sum', 'Scenario probabilities sum to 100', `Sum = ${sum}%.`, clause)];

  // A framework that never moves its probabilities is not updating on evidence.
  const anyMoved = scenarios.some((s) => s.probability !== s.priorProbability);
  results.push(anyMoved
    ? ok('prob-delta', 'Probabilities updated vs prior run',
        scenarios.map((s) => `${s.key}: ${s.priorProbability} -> ${s.probability}`).join('; '),
        'Bayesian hygiene - house rule')
    : {
        id: 'prob-delta',
        check: 'Probabilities updated vs prior run',
        severity: 'WARN',
        detail: 'No scenario probability moved since the prior run. Either nothing informative happened, or the framework is anchoring. Say which, in writing.',
        clause: 'Bayesian hygiene - house rule',
      });
  return results;
}

// -------------------------------------------------------- path arithmetic ---

/**
 * Every scenario path must start from TODAY'S verified levels, and every
 * derived spread must equal the yields it is derived from. v1 failed both:
 * its par-curve panel carried a pre-FOMC 10y of 4.96 while the anchor said
 * 5.14, and three of twelve path rows silently rendered a blank 5s30s.
 */
export function auditPaths(scenarios: Scenario[], anchor: { y2: number; y5: number; y10: number; y30: number }): AuditResult[] {
  const out: AuditResult[] = [];
  const tol = 0.005;

  for (const s of scenarios) {
    const t0 = s.path.find((r) => r.monthsAhead === 0);
    if (!t0) {
      out.push({
        id: `path-t0-${s.key}`, check: `Scenario ${s.key} path starts at today`,
        severity: 'FAIL', detail: 'No row with monthsAhead = 0.',
        clause: 'Leviathan 3.4 - paths start from verified levels',
      });
      continue;
    }
    const diffs = (['y2', 'y5', 'y10', 'y30'] as const)
      .filter((k) => Math.abs(t0[k] - anchor[k]) > tol)
      .map((k) => `${k}: path ${t0[k]} vs anchor ${anchor[k]}`);

    out.push(diffs.length
      ? {
          id: `path-t0-${s.key}`, check: `Scenario ${s.key} path starts at today's anchor`,
          severity: 'FAIL', detail: diffs.join('; '),
          clause: 'Leviathan 3.4 - paths start from verified levels',
        }
      : ok(`path-t0-${s.key}`, `Scenario ${s.key} path starts at today's anchor`,
          `2y/5y/10y/30y match the anchor to ${tol * 100}bp.`,
          'Leviathan 3.4 - paths start from verified levels'));

    // Monotone ordering of the horizon.
    const months = s.path.map((r) => r.monthsAhead);
    const sorted = [...months].sort((a, b) => a - b);
    if (months.join() !== sorted.join()) {
      out.push({
        id: `path-order-${s.key}`, check: `Scenario ${s.key} path rows in time order`,
        severity: 'FAIL', detail: `Rows are ordered ${months.join(', ')}.`,
        clause: 'Internal consistency',
      });
    }

    // Curve inversion sanity: flag any row where 30y prints through 2y by more
    // than 100bp, which would be a deeply inverted long end and needs saying
    // out loud rather than appearing quietly in a table.
    for (const r of s.path) {
      const sp = spreads(r);
      if (sp.s2s30 < -100) {
        out.push({
          id: `path-inv-${s.key}-${r.monthsAhead}`,
          check: `Scenario ${s.key} ${r.label} curve shape is explained`,
          severity: 'WARN',
          detail: `2s30s at ${sp.s2s30}bp is a deep inversion. The curveShape narrative must derive this from mechanics, not leave it in a table.`,
          clause: 'Leviathan 5 - curve shape derived, not assumed',
        });
      }
    }
  }
  return out;
}

// --------------------------------------------------------- decomposition ---

export function auditDecompositions(decomps: TenYearDecomposition[]): AuditResult[] {
  return decomps.map((d) => {
    const c = decompositionCheck(d);
    const bad = Math.abs(c.view1Residual) > 3 || Math.abs(c.view2Residual) > 3;
    return bad
      ? {
          id: `decomp-${d.window}`,
          check: `10y decomposition adds up (${d.window})`,
          severity: 'FAIL' as Severity,
          detail: `Total ${c.totalBp}bp. Path+TP leaves ${c.view1Residual}bp unexplained; real+breakeven leaves ${c.view2Residual}bp. Each view must sum to the total independently.`,
          clause: 'Leviathan 5 Part 1 - decompose the 10y move',
        }
      : ok(`decomp-${d.window}`, `10y decomposition adds up (${d.window})`,
          `Total ${c.totalBp}bp; both views reconcile within 3bp. Measured regime: ${c.regime.regime}.`,
          'Leviathan 5 Part 1 - decompose the 10y move');
  });
}

// ------------------------------------------------------------- provenance ---

export function auditProvenance(obs: Record<string, Observation>, asOfDate: string): AuditResult[] {
  const runDate = new Date(asOfDate + 'T00:00:00Z').getTime();
  const stale: string[] = [];
  const undated: string[] = [];

  for (const [k, o] of Object.entries(obs)) {
    if (!o.asOf || !o.source) { undated.push(k); continue; }
    const ageDays = (runDate - new Date(o.asOf + 'T00:00:00Z').getTime()) / 86_400_000;
    if (o.tag === 'D' && ageDays > o.staleAfterDays) {
      stale.push(`${k} (${Math.round(ageDays)}d old, limit ${o.staleAfterDays}d)`);
    }
  }

  const out: AuditResult[] = [];
  out.push(undated.length
    ? { id: 'prov-tagged', check: 'Every observation carries source and date', severity: 'FAIL',
        detail: `Missing provenance: ${undated.join(', ')}.`, clause: 'Leviathan 3.1-3.3' }
    : ok('prov-tagged', 'Every observation carries source and date',
        `${Object.keys(obs).length} observations, all sourced and dated.`, 'Leviathan 3.1-3.3'));

  out.push(stale.length
    ? { id: 'prov-stale', check: 'No [D] observation past its staleness limit', severity: 'WARN',
        detail: `Stale: ${stale.join('; ')}. Re-pull before quoting, or re-tag as [E].`, clause: 'Leviathan 3.3' }
    : ok('prov-stale', 'No [D] observation past its staleness limit',
        'All hard data inside its refresh window.', 'Leviathan 3.3'));
  return out;
}

// ----------------------------------------------------------------- trades ---

export function auditTrades(trades: TradeExpression[], totalScenarios: number): AuditResult[] {
  const out: AuditResult[] = [];

  const noStop = trades.filter((t) => !t.invalidation || t.stopBp <= 0);
  out.push(noStop.length
    ? { id: 'trade-inval', check: 'Every trade carries an invalidation level', severity: 'FAIL',
        detail: `Missing: ${noStop.map((t) => t.name).join(', ')}.`, clause: 'Leviathan 7 - trades carry invalidation' }
    : ok('trade-inval', 'Every trade carries an invalidation level',
        `${trades.length} expressions, all with a stop and a written invalidation.`,
        'Leviathan 7 - trades carry invalidation'));

  // Sehgal section 6: if every expression is linear and bounded, the book has
  // no convexity and is simply a levered directional view wearing a costume.
  const convex = trades.filter((t) => t.payoffShape !== 'linear-bounded').length;
  out.push(convex === 0
    ? { id: 'trade-convex', check: 'Book contains at least one non-linear payoff', severity: 'WARN',
        detail: 'Every expression is linear and bounded. If the thesis is right, the upside is capped; if a tail happens, nothing pays for it.',
        clause: 'Sehgal 6 - asymmetry test' }
    : ok('trade-convex', 'Book contains at least one non-linear payoff',
        `${convex} of ${trades.length} expressions are convex or multiplicative.`,
        'Sehgal 6 - asymmetry test'));

  // Reward:risk sanity. Anything below 1:1 needs a reason in writing.
  const poor = trades.filter((t) => t.targetBp / Math.max(1, t.stopBp) < 1);
  out.push(poor.length
    ? { id: 'trade-rr', check: 'Reward-to-risk at least 1:1 on every expression', severity: 'WARN',
        detail: `Below 1:1: ${poor.map((t) => `${t.name} (${(t.targetBp / t.stopBp).toFixed(2)}x)`).join(', ')}. Acceptable only if the hit rate justifies it - state the hit rate.`,
        clause: 'Common sense' }
    : ok('trade-rr', 'Reward-to-risk at least 1:1 on every expression',
        'All expressions clear 1:1 on stated target vs stop.', 'Common sense'));

  // A trade attached to every scenario is not a trade, it is a horoscope.
  const universal = trades.filter((t) => t.scenarios.length >= totalScenarios);
  out.push(universal.length
    ? { id: 'trade-spec', check: 'No expression claims to work in every scenario', severity: 'WARN',
        detail: `${universal.map((t) => t.name).join(', ')} is mapped to all ${totalScenarios} scenarios. If it wins everywhere, either the scenarios are not distinct or the payoff claim is soft.`,
        clause: 'Common sense' }
    : ok('trade-spec', 'No expression claims to work in every scenario',
        `Every expression discriminates between the ${totalScenarios} scenarios.`, 'Common sense'));

  // Scenario coverage: a scenario with no expression is a view you cannot act
  // on, which is the same as not having it.
  const covered = new Set(trades.flatMap((t) => t.scenarios));
  out.push(covered.size >= totalScenarios
    ? ok('trade-cover', 'Every scenario has at least one expression',
        `${covered.size} of ${totalScenarios} scenarios covered.`, 'Common sense')
    : { id: 'trade-cover', check: 'Every scenario has at least one expression', severity: 'WARN',
        detail: `Only ${covered.size} of ${totalScenarios} scenarios have a trade attached. A scenario you cannot express is a scenario you do not really hold.`,
        clause: 'Common sense' });

  return out;
}

// ------------------------------------------------------------- aggregate ---

export interface AuditSummary {
  results: AuditResult[];
  fails: number;
  warns: number;
  passes: number;
  verdict: string;
}

export function summarise(results: AuditResult[]): AuditSummary {
  const fails = results.filter((r) => r.severity === 'FAIL').length;
  const warns = results.filter((r) => r.severity === 'WARN').length;
  const passes = results.filter((r) => r.severity === 'PASS').length;
  const verdict =
    fails > 0 ? `${fails} hard failure${fails > 1 ? 's' : ''} - the numbers on this page contradict each other. Fix before reading further.`
    : warns > 0 ? `Clean arithmetic, ${warns} judgement flag${warns > 1 ? 's' : ''} open.`
    : 'All checks pass. Note that passing means internally consistent, not correct.';
  return { results, fails, warns, passes, verdict };
}
