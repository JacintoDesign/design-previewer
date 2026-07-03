// parse.js — split DESIGN.md into YAML frontmatter tokens + markdown body.
import yaml from 'https://esm.sh/js-yaml@4.1.0';

export class DesignParseError extends Error {}

/**
 * Split a raw DESIGN.md string into { frontmatter, body }.
 * Frontmatter is the text between a leading `---` fence and the next `---`.
 */
function splitFrontmatter(raw) {
  const text = raw.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const match = text.match(/^\s*---\n([\s\S]*?)\n---\s*(?:\n([\s\S]*))?$/);
  if (!match) {
    throw new DesignParseError(
      'No YAML frontmatter found. A DESIGN.md file must start with a `---` fenced token block.'
    );
  }
  return { frontmatter: match[1], body: (match[2] || '').trim() };
}

/**
 * Parse a DESIGN.md string into a normalized token object.
 * @returns {{ name, version, description, colors, typography, rounded, spacing, components, body, raw }}
 */
export function parseDesign(raw) {
  const { frontmatter, body } = splitFrontmatter(raw);

  let data;
  try {
    data = yaml.load(frontmatter);
  } catch (err) {
    throw new DesignParseError('Could not parse the YAML frontmatter: ' + err.message);
  }
  if (!data || typeof data !== 'object') {
    throw new DesignParseError('The frontmatter did not parse into a token object.');
  }

  const asMap = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

  const design = {
    name: typeof data.name === 'string' ? data.name : 'Untitled',
    version: data.version,
    description: data.description,
    colors: asMap(data.colors),
    typography: asMap(data.typography),
    rounded: asMap(data.rounded),
    spacing: asMap(data.spacing),
    shadows: asMap(data.shadows),
    motion: asMap(data.motion),
    components: asMap(data.components),
    body,
    raw,
  };

  const hasAnything =
    Object.keys(design.colors).length ||
    Object.keys(design.typography).length ||
    Object.keys(design.components).length;
  if (!hasAnything) {
    throw new DesignParseError(
      'The frontmatter parsed, but contains no colors, typography, or components.'
    );
  }
  return design;
}
