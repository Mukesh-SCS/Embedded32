#!/usr/bin/env node
import fs from 'node:fs';

fs.rmSync('dist', { recursive: true, force: true });
