#!/usr/bin/env bun
/**
 * SHARED — `shared/files/scripts/`에서 고치고 모노레포 루트에서 `bun run sync`.
 *
 * `degit` 직후 한 번 돌고 자기 자신을 지운다.
 *
 *   bun run init
 *   bun run init --yes --target=cloudflare --name=my-app [--no-example]
 *
 * 의존성 0개. `prompt()`는 Bun 글로벌이고 나머지는 Bun.file / Bun.write / Bun.$ / node:fs다.
 * 끝나고 지울 패키지가 없다.
 */
import { $ } from 'bun';
import { rm, rmdir } from 'node:fs/promises';
import { basename } from 'node:path';

type Target = 'cloudflare' | 'vercel' | 'none';
type Delta = {
  dev?: Record<string, string>;
  scripts?: Record<string, string>;
  /** 남길 타깃 전용 파일. TARGET_FILES 중 나머지는 삭제된다. */
  keep?: string[];
  /**
   * 이 타깃에서만 새로 쓰는 파일. `open-next.config.ts`처럼 그 타깃 전용 패키지를
   * import하는 파일은 커밋해두면 다른 타깃/`target=none` 기본 상태에서 타입체크가
   * 깨진다 — 그래서 파일 자체를 커밋하지 않고 `init`이 이 타깃을 고를 때만 만든다.
   */
  write?: Record<string, string>;
};

/**
 * 모든 템플릿을 담은 표 하나. 읽히는 건 이 템플릿의 행뿐이고 파일이 자기를 지우므로,
 * 쓰이지 않은 행이 사용자 프로젝트에 남는 일은 없다.
 */
const DELTA: Record<string, Record<Target, Delta>> = {
  csr: {
    cloudflare: {
      dev: { wrangler: '4.120.0' },
      scripts: { deploy: 'bun run build && wrangler deploy' },
      keep: ['wrangler.jsonc'],
    },
    vercel: {
      scripts: { deploy: 'vercel deploy --prod' },
      keep: ['vercel.json'],
    },
    none: {},
  },
  ssg: {
    // CSR과 마찬가지로 결과물이 정적 파일뿐이라 별도 어댑터 패키지가 없다 —
    // wrangler/vercel CLI가 `dist/`를 그대로 서빙한다.
    cloudflare: {
      dev: { wrangler: '4.120.0' },
      scripts: { deploy: 'bun run build && wrangler deploy' },
      keep: ['wrangler.jsonc'],
    },
    vercel: {
      scripts: { deploy: 'vercel deploy --prod' },
      keep: ['vercel.json'],
    },
    none: {},
  },
  'ssr-next': {
    // Vercel은 Next를 네이티브로 인식한다 — 어댑터도 `vercel.json`도 없다.
    cloudflare: {
      dev: { '@opennextjs/cloudflare': '1.20.2', wrangler: '4.120.0' },
      scripts: {
        preview: 'opennextjs-cloudflare build && opennextjs-cloudflare preview',
        deploy: 'opennextjs-cloudflare build && opennextjs-cloudflare deploy',
      },
      keep: ['wrangler.jsonc'],
      write: {
        'open-next.config.ts': `import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// R2 증분 캐시 등이 필요해지면 https://opennext.js.org/cloudflare/caching 참고해서 추가한다.
export default defineCloudflareConfig();
`,
      },
    },
    vercel: {
      scripts: { deploy: 'vercel deploy --prod' },
      keep: [],
    },
    none: {},
  },
  'ssr-start': {
    cloudflare: {
      dev: { '@cloudflare/vite-plugin': '1.52.1', wrangler: '4.123.0' },
      // `@cloudflare/vite-plugin`이 로컬 workerd로 가는 웹소켓 브리지를 붙이는데, Bun의
      // `ws` 구현이 그 브리지가 쓰는 'upgrade' 이벤트를 지원하지 않아서 `bun run dev`가
      // 포트를 절대 못 연다 — `node`로 직접 vite를 돌리면 정상 동작한다(직접 재현해서 확인함).
      scripts: {
        dev: 'node node_modules/vite/bin/vite.js dev --port 3000',
        preview: 'node node_modules/vite/bin/vite.js preview --port 3000',
        deploy: 'bun run build && wrangler deploy',
      },
      keep: ['wrangler.jsonc'],
    },
    // Nitro가 Vercel 배포를 맡는다 — 2026-08 기준 `nitro`가 여전히 베타(3.0.260610-beta)라
    // 다른 세 템플릿보다 프로덕션 신뢰도가 낮다. `templates/ssr-start/README.md` 참고.
    vercel: {
      dev: { nitro: '3.0.260610-beta' },
      scripts: { deploy: 'vercel deploy --prod' },
      keep: [],
    },
    none: {},
  },
};

/** 템플릿마다 다른 예제(todos) 삭제 절차. 파일 경로는 다르지만 스텁 내용은 공유한다. */
const I18N_STUB_NO_EXAMPLE = `import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonEn from '@/locales/en/common.json';
import commonKo from '@/locales/ko/common.json';

import { detectLanguage } from './languages';

/** feature 하나당 네임스페이스 하나, 거기에 \`common\`. feature를 추가하면 여기에 이름을 넣는다. */
export const I18N_NAMESPACES = ['common'] as const;

export type I18nNamespace = (typeof I18N_NAMESPACES)[number];

void i18next.use(initReactI18next).init({
  resources: {
    ko: { common: commonKo },
    en: { common: commonEn },
  },
  lng: detectLanguage(),
  fallbackLng: 'ko',
  defaultNS: 'common',
  ns: [...I18N_NAMESPACES],
  nsSeparator: ':',
  keySeparator: '.',
  interpolation: { escapeValue: false },
});

export const i18n = i18next;
`;

const MOCKS_STUB_NO_EXAMPLE = `import type { RequestHandler } from 'msw';

/**
 * 목 데이터의 단일 원천. dev, Storybook, vitest 브라우저 프로젝트, Playwright가
 * 모두 이 핸들러를 읽는다. 픽스처는 한 번만 쓰면 된다.
 */
export const handlers: RequestHandler[] = [];
`;

type ExampleCleanup = { remove: string[]; write: Record<string, string> };

const EXAMPLE_CLEANUP: Record<string, ExampleCleanup> = {
  csr: {
    remove: [
      'src/features/todos',
      'src/routes/todos.tsx',
      'src/locales/ko/todos.json',
      'src/locales/en/todos.json',
      'e2e/todos.spec.ts',
      'openapi/example.json',
    ],
    write: {
      'src/common/lib/i18n.ts': I18N_STUB_NO_EXAMPLE,
      'src/mocks/handlers.ts': MOCKS_STUB_NO_EXAMPLE,
      'src/routes/index.tsx': `import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <main className="flex min-h-dvh items-center justify-center">
      <h1 className="text-2xl font-semibold tracking-tight">Hello</h1>
    </main>
  );
}
`,
    },
  },
  ssg: {
    remove: [
      'src/features/todos',
      'src/pages/_islands/todos-island.tsx',
      'src/locales/ko/todos.json',
      'src/locales/en/todos.json',
      'e2e/todos.spec.ts',
      'openapi/example.json',
    ],
    write: {
      'src/common/lib/i18n.ts': I18N_STUB_NO_EXAMPLE,
      'src/mocks/handlers.ts': MOCKS_STUB_NO_EXAMPLE,
      'src/pages/index.astro': `---
import Layout from '@/layouts/base-layout.astro';
---

<Layout title="ssg">
  <main class="flex min-h-dvh items-center justify-center">
    <h1 class="text-2xl font-semibold tracking-tight">Hello</h1>
  </main>
</Layout>
`,
    },
  },
  'ssr-next': {
    remove: [
      'src/features/todos',
      'src/app/todos',
      'src/locales/ko/todos.json',
      'src/locales/en/todos.json',
      'e2e/todos.spec.ts',
      'openapi/example.json',
    ],
    write: {
      'src/common/lib/i18n.ts': I18N_STUB_NO_EXAMPLE,
      'src/mocks/handlers.ts': MOCKS_STUB_NO_EXAMPLE,
      'src/app/page.tsx': `export default function Home() {
  return (
    <main className="flex min-h-dvh items-center justify-center">
      <h1 className="text-2xl font-semibold tracking-tight">Hello</h1>
    </main>
  );
}
`,
    },
  },
  'ssr-start': {
    remove: [
      'src/features/todos',
      'src/routes/todos.tsx',
      'src/locales/ko/todos.json',
      'src/locales/en/todos.json',
      'e2e/todos.spec.ts',
      'openapi/example.json',
    ],
    write: {
      'src/common/lib/i18n.ts': I18N_STUB_NO_EXAMPLE,
      'src/mocks/handlers.ts': MOCKS_STUB_NO_EXAMPLE,
      'src/routes/index.tsx': `import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <main className="flex min-h-dvh items-center justify-center">
      <h1 className="text-2xl font-semibold tracking-tight">Hello</h1>
    </main>
  );
}
`,
    },
  },
};

const TARGET_FILES = ['wrangler.jsonc', 'vercel.json', 'open-next.config.ts', 'public/_headers'];
const CONFIG_FILES = ['vite.config.ts', 'next.config.ts', 'astro.config.ts'];

const flags = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value] = arg.replace(/^--/, '').split('=');
    return [key, value ?? 'true'] as const;
  }),
);

// 파이프나 CI에서 호출됐을 때 stdin을 기다리며 멈추면 안 된다.
const auto = flags.has('yes') || !process.stdin.isTTY;
const ask = (question: string, fallback: string) =>
  auto ? fallback : prompt(`${question} (${fallback}):`)?.trim() || fallback;

const pkg = await Bun.file('package.json').json();
const template: string = pkg.name;

const name = flags.get('name') ?? ask('Project name', basename(process.cwd()));
const target = (flags.get('target') ??
  ask('Deploy target [cloudflare|vercel|none]', 'cloudflare')) as Target;
const keepExample = flags.has('no-example')
  ? false
  : auto || ask('Keep the example feature? [Y/n]', 'y').toLowerCase().startsWith('y');

const delta = DELTA[template]?.[target];
if (!delta) {
  console.error(`unknown target "${target}" for template "${template}"`);
  console.error(`valid targets: ${Object.keys(DELTA[template] ?? {}).join(', ')}`);
  process.exit(1);
}

// 1 — package.json
pkg.name = name;
Object.assign((pkg.devDependencies ??= {}), delta.dev ?? {});
Object.assign(pkg.scripts, delta.scripts ?? {});
delete pkg.scripts.init;
pkg.devDependencies = Object.fromEntries(
  Object.entries(pkg.devDependencies as Record<string, string>).sort(([a], [b]) =>
    a.localeCompare(b),
  ),
);
await Bun.write('package.json', `${JSON.stringify(pkg, null, 2)}\n`);

// 2 — 각 설정 파일에서 타깃에 맞는 `// #if <target>` 블록의 주석을 벗기고 나머지는 지운다
for (const file of CONFIG_FILES) {
  const source = await Bun.file(file)
    .text()
    .catch(() => null);
  if (source === null) continue;
  await Bun.write(
    file,
    source.replace(
      /^[ \t]*\/\/ #if (\w+)\r?\n([\s\S]*?)^[ \t]*\/\/ #endif\r?\n/gm,
      (_match, blockTarget: string, body: string) =>
        blockTarget === target ? body.replace(/^([ \t]*)\/\/ ?/gm, '$1') : '',
    ),
  );
}

// 3 — 타깃 전용 파일과 선택되지 않은 배포 워크플로 정리
for (const file of TARGET_FILES) {
  if (!delta.keep?.includes(file)) await rm(file, { force: true });
}
for (const other of ['cloudflare', 'vercel']) {
  if (other !== target) await rm(`.github/workflows/deploy-${other}.yml`, { force: true });
}

if (delta.keep?.includes('wrangler.jsonc')) {
  const wrangler = await Bun.file('wrangler.jsonc').text();
  await Bun.write(
    'wrangler.jsonc',
    wrangler.replace(/"name":\s*"[^"]*"/, `"name": ${JSON.stringify(name)}`),
  );
}

for (const [path, content] of Object.entries(delta.write ?? {})) {
  await Bun.write(path, content);
}

// 4 — README: 템플릿 서문을 떼고 실제 문서만 남긴다
const readme = await Bun.file('README.md').text();
const body = (readme.split('<!-- template -->')[1] ?? '').trim();
// 제목 뒤에 빈 줄 정확히 하나. 아니면 첫 실행부터 `bun run format`이 실패하는데,
// 첫인상으로는 최악이다.
await Bun.write('README.md', `# ${name}\n\n${body}\n`);

// 5 — 예제 feature. 디렉토리만 지우면 안 된다. 이걸 가리키는 파일이 몇 개 있어서,
// 그대로 두면 한 줄도 쓰기 전에 `typecheck`가 깨진 프로젝트를 받게 된다.
// 원본에 정규식 수술을 하는 대신 알려진 상태의 스텁으로 다시 쓴다.
if (!keepExample) {
  const cleanup = EXAMPLE_CLEANUP[template];
  if (cleanup) {
    await Promise.all(cleanup.remove.map((path) => rm(path, { recursive: true, force: true })));
    for (const [path, content] of Object.entries(cleanup.write)) {
      await Bun.write(path, content);
    }
  }

  console.log('\n  예제(todos) 삭제됨. i18n·mocks·진입점은 자동으로 정리했다.');
  console.log('  남은 건 하나 — .env 의 OPENAPI_INPUT 을 실제 백엔드로.');
}

// 6 — 출처 기록. 값싸고, 몇 년 뒤 "이 프로젝트 어느 템플릿에서 나왔지"에 답해준다.
await Bun.write(
  '.template-fe.json',
  `${JSON.stringify(
    {
      template,
      target,
      name,
      createdAt: new Date().toISOString().slice(0, 10),
    },
    null,
    2,
  )}\n`,
);

// 7 — 자기 삭제, 설치, 첫 커밋
await rm('scripts/init.ts', { force: true });
await rmdir('scripts').catch(() => {}); // 비어 있을 때만 성공한다

await $`bun install`;

if (!(await Bun.file('.git/HEAD').exists())) {
  await $`git init -b main`;
  await $`git add -A`;
  await $`git commit -m ${`chore: init from template-fe/${template}`}`;
}

console.log(`\n  ${name} ready → bun dev\n`);
