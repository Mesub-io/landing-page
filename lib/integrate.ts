/**
 * The integration section.
 *
 * The snippet is tokenised by hand rather than run through a highlighter: it
 * is typed out character by character, so the colours have to survive being
 * sliced mid-token.
 */

import { PLACEHOLDER } from './nav'

export type TokenKind = 'com' | 'fn' | 'kw' | 'num' | 'prop' | 'punc' | 'str'

export interface Token {
  kind?: TokenKind
  text: string
}

export const integrate = {
  title: 'Gate your product in one call.',
  body: 'Install the SDK, read the subscription state, decide. Accounts, delegations and pull execution stay on our side of the line — your route handler only ever sees an answer.',
  bullets: [
    { icon: 'braces', label: 'Typed SDK, no account juggling' },
    { icon: 'layers', label: 'Drop it in middleware or a route' },
    { icon: 'lock', label: 'HTTP 402 responses you control' },
    { icon: 'sync', label: 'The same states as the dashboard' },
  ],
  link: { label: 'Browse the API reference', href: PLACEHOLDER },
  /** Claude, speaking from a bubble pinned to the editor. */
  mcp: {
    speaker: 'Claude',
    line: 'Want me to write it? Point me at the MCP server, hand me the Mesub skills, and I’ll wire the subscribe flow and the guard for you.',
    action: 'Connect Claude',
    href: PLACEHOLDER,
  },
  file: 'app/api/reports/route.ts',
}

const kw = (text: string): Token => ({ kind: 'kw', text })
const str = (text: string): Token => ({ kind: 'str', text })
const fn = (text: string): Token => ({ kind: 'fn', text })
const prop = (text: string): Token => ({ kind: 'prop', text })
const num = (text: string): Token => ({ kind: 'num', text })
const com = (text: string): Token => ({ kind: 'com', text })
const p = (text: string): Token => ({ text })

export const codeLines: Token[][] = [
  [kw('import'), p(' { '), fn('mesub'), p(' } '), kw('from'), p(' '), str("'@mesub/sdk'")],
  [],
  [kw('export async function'), p(' '), fn('GET'), p('(req: Request) {')],
  [p('  '), kw('const'), p(' { '), prop('state'), p(' } = '), kw('await'), p(' mesub.'), fn('access'), p('({')],
  [p('    '), prop('user'), p(': req.headers.'), fn('get'), p('('), str("'x-user-id'"), p('),')],
  [p('    '), prop('plan'), p(': '), str("'pro-monthly'"), p(',')],
  [p('  })')],
  [],
  [p('  '), com('// Anything but `active` never reaches the data.')],
  [p('  '), kw('if'), p(' (state !== '), str("'active'"), p(') {')],
  [p('    '), kw('return'), p(' Response.'), fn('json'), p('({ state }, { '), prop('status'), p(': '), num('402'), p(' })')],
  [p('  }')],
  [],
  [p('  '), kw('return'), p(' Response.'), fn('json'), p('('), kw('await'), p(' '), fn('buildReport'), p('())')],
  [p('}')],
]
