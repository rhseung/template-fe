import { useForm } from '@tanstack/react-form';

import { PlusIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

import { Button, Field, FieldError, FieldGroup, Input } from '@/common/components';

import type { useTodos } from '../../../viewmodels';

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
                  placeholder={t(($) => $.form.placeholder)}
                  maxLength={maxLength}
                  aria-label={t(($) => $.form.label)}
                  aria-invalid={invalid || undefined}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <Button type="submit" disabled={isPending}>
                  <PlusIcon data-icon="inline-start" />
                  {t(($) => $.form.submit)}
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
    schema: TodosViewModel['createFormSchema'];
    maxLength?: TodosViewModel['titleMaxLength'];
    isPending?: boolean;
    onSubmit: (value: TodosViewModel['createDefaultValues']) => Promise<unknown>;
  };
}
