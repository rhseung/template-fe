import { useForm } from '@tanstack/react-form';

import { PlusIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

import { Button, Field, FieldError, FieldGroup, Input } from '@/common/components';

import type { useTodos } from '../../../viewmodels';

/**
 * `@tanstack/react-form` + ViewModel이 노출한 zod 스키마.
 *
 * 스키마가 import가 아니라 prop으로 들어오므로 View는 여전히 Model 계층에 손대지 않는다.
 * zod v4는 Standard Schema라서 `validators`에 그대로 넣으면 되고, 중간에 resolver 패키지가 없다.
 */
export function TodoForm({
  defaultValues,
  schema,
  maxLength,
  isPending,
  onSubmit,
}: TodoForm.Props) {
  const { t } = useTranslation('todos');

  const form = useForm({
    defaultValues,
    validators: { onSubmit: schema },
    onSubmit: async ({ value, formApi }) => {
      await onSubmit(value);
      formApi.reset();
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field name="title">
          {(field) => {
            const invalid = field.state.meta.errors.length > 0;

            return (
              <Field orientation="horizontal" data-invalid={invalid || undefined}>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  placeholder={t('form.placeholder')}
                  maxLength={maxLength}
                  aria-label={t('form.label')}
                  aria-invalid={invalid || undefined}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <Button type="submit" disabled={isPending}>
                  <PlusIcon data-icon="inline-start" />
                  {t('form.submit')}
                </Button>
                <FieldError errors={field.state.meta.errors} />
              </Field>
            );
          }}
        </form.Field>
      </FieldGroup>
    </form>
  );
}

export declare namespace TodoForm {
  type TodosViewModel = ReturnType<typeof useTodos>;

  export type Props = {
    defaultValues: TodosViewModel['createDefaultValues'];
    /** `useTodos().createFormSchema` — Model을 import하지 않고 타입을 얻는다. */
    schema: TodosViewModel['createFormSchema'];
    maxLength?: TodosViewModel['titleMaxLength'];
    isPending?: boolean;
    onSubmit: (value: TodosViewModel['createDefaultValues']) => Promise<unknown>;
  };
}
