// ── ui/ — 프리미티브. shadcn CLI가 생성한다. 손으로 고치지 않는다. ─────────────
export { Button, buttonVariants } from './ui/button';
export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
export { Checkbox } from './ui/checkbox';
export {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from './ui/empty';
export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from './ui/field';
export { Input } from './ui/input';
export { Label } from './ui/label';
export { Separator } from './ui/separator';
export { Skeleton } from './ui/skeleton';

// ── layout/ — 앱을 아는 조합 컴포넌트. i18n·테마·라우터를 써도 된다. ──────────
export { SiteHeader } from './layout/site-header';
