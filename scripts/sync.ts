#!/usr/bin/env bun
/**
 * `shared/`를 모든 `templates/*`로 복사하고, 파일 간 일관성을 검증한다.
 *
 *   bun run sync      쓰기
 *   bun run check     drift 보고 후 exit 1
 *
 * 의존성 0개 — Bun 글로벌과 node:fs만 쓴다.
 *
 * 원천은 디렉토리 구조 그 자체다. `shared/files/a/b.ts`는 `templates/<t>/a/b.ts`로 간다.
 * 매니페스트가 없는 이유는, 모든 항목이 `x -> x`인 매니페스트란 값이 변하지 않는 설정 파일이기 때문이다.
 *
 * ponytail: 추가·덮어쓰기만 한다. package.base.json에서 devDep을 지워도 템플릿에서는
 * 사라지지 않으니 손으로 지운다. 그 일이 잦아지면 그때 remove 목록을 만든다.
 */
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const ROOT = join(import.meta.dir, '..');
const SHARED_FILES = join(ROOT, 'shared/files');
const SHARED_PKG = join(ROOT, 'shared/package.base.json');
const TEMPLATES = join(ROOT, 'templates');

/** 공유 CI 워크플로가 호출하는 스크립트. 이게 없는 템플릿은 깨진 것이다. */
const REQUIRED_SCRIPTS = ['dev', 'build', 'lint', 'typecheck', 'test', 'init'];

const check = process.argv.includes('--check');
const drift: string[] = [];
const errors: string[] = [];

async function put(abs: string, content: string) {
  if (
    (await Bun.file(abs)
      .text()
      .catch(() => null)) === content
  )
    return;
  if (check) {
    drift.push(abs.slice(ROOT.length + 1));
    return;
  }
  await mkdir(dirname(abs), { recursive: true });
  await Bun.write(abs, content);
}

const sortKeys = (o: Record<string, string>) =>
  Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));

/** 파서를 끌어오지 않고 JSONC에서 `"name": "foo"`만 뽑아낸다. */
const jsoncName = (src: string) => /"name"\s*:\s*"([^"]*)"/.exec(src)?.[1];

const templates = [...new Bun.Glob('*/package.json').scanSync(TEMPLATES)].map(dirname).sort();
if (templates.length === 0) throw new Error(`no templates found under ${TEMPLATES}`);

// 1 — 트리 그대로 복사: shared/files/x/y -> templates/<t>/x/y
for (const rel of new Bun.Glob('**/*').scanSync({
  cwd: SHARED_FILES,
  dot: true,
  onlyFiles: true,
})) {
  const content = await Bun.file(join(SHARED_FILES, rel)).text();
  for (const t of templates) await put(join(TEMPLATES, t, rel), content);
}

// 2 — package.json: 말단에서 shared 키가 이기고, 템플릿 고유 키는 살아남는다
const base = await Bun.file(SHARED_PKG).json();

for (const t of templates) {
  const path = join(TEMPLATES, t, 'package.json');
  const pkg = await Bun.file(path).json();

  for (const [key, value] of Object.entries(base)) {
    pkg[key] =
      value && typeof value === 'object' && !Array.isArray(value)
        ? sortKeys({ ...(pkg[key] ?? {}), ...(value as Record<string, string>) })
        : value;
  }

  // 3 — 파일 간 일관성. 실제 복붙 사고를 잡는 값싼 검사.
  if (pkg.name !== t) {
    errors.push(`templates/${t}/package.json: name is "${pkg.name}", expected "${t}"`);
  }
  const wranglerPath = join(TEMPLATES, t, 'wrangler.jsonc');
  const wrangler = await Bun.file(wranglerPath)
    .text()
    .catch(() => null);
  if (wrangler !== null && jsoncName(wrangler) !== pkg.name) {
    errors.push(`templates/${t}/wrangler.jsonc: name does not match package.json ("${pkg.name}")`);
  }
  for (const script of REQUIRED_SCRIPTS) {
    if (!pkg.scripts?.[script])
      errors.push(`templates/${t}/package.json: missing script "${script}"`);
  }

  await put(path, `${JSON.stringify(pkg, null, 2)}\n`);
}

if (errors.length > 0) {
  console.error(errors.map((e) => `  ${e}`).join('\n'));
  process.exit(1);
}
if (check && drift.length > 0) {
  console.error(`shared config drift in ${drift.length} file(s):`);
  console.error(drift.map((f) => `  ${f}`).join('\n'));
  console.error('\nfix: bun run sync');
  process.exit(1);
}
console.log(check ? 'in sync' : `synced ${templates.length} template(s): ${templates.join(', ')}`);
