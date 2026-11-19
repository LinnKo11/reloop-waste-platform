"use client"

import { Loader2, TriangleAlert } from "lucide-react"
import Link from "next/link"
import { startTransition, useActionState, useState } from "react"

import { Field } from "@/components/forms/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { initialActionState } from "@/lib/action-state"
import { loginAction, registerAction } from "@/lib/actions"
import { CITIES } from "@/lib/constants"
import { useI18n } from "@/lib/i18n/client"
import { USER_ACCOUNT_TYPES } from "@/lib/types"

function submitWith(action: (formData: FormData) => void) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(() => action(formData))
  }
}

export function LoginForm({ demoEmails }: { demoEmails: { email: string; name: string }[] }) {
  const { t } = useI18n()
  const [state, formAction, pending] = useActionState(loginAction, initialActionState)
  const [email, setEmail] = useState("")
  const errors = state.fieldErrors

  return (
    <form noValidate className="flex flex-col gap-4" onSubmit={submitWith(formAction)}>
      {state.message && !state.ok && (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      <Field label={t.auth.email} htmlFor="email" required error={errors?.email?.[0]}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!errors?.email}
        />
      </Field>
      <Field label={t.auth.password} htmlFor="password" required error={errors?.password?.[0]}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors?.password}
        />
      </Field>
      <Button type="submit" size="lg" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />}
        {t.auth.loginButton}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {t.auth.noAccount}{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          {t.auth.registerLink}
        </Link>
      </p>
      <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3">
        <p className="text-xs font-medium">{t.auth.demoAccounts}</p>
        <div className="flex flex-wrap gap-1.5">
          {demoEmails.map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={() => setEmail(d.email)}
              className="rounded-full border bg-background px-2.5 py-1 text-xs hover:border-primary"
            >
              {d.name}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{t.auth.demoNote}</p>
      </div>
    </form>
  )
}

export function RegisterForm() {
  const { t, f } = useI18n()
  const [state, formAction, pending] = useActionState(registerAction, initialActionState)
  const [accountType, setAccountType] = useState("INDIVIDUAL")
  const [city, setCity] = useState("Yangon")
  const errors = state.fieldErrors

  return (
    <form noValidate className="flex flex-col gap-4" onSubmit={submitWith(formAction)}>
      {state.message && !state.ok && (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      <Field label={t.auth.fullName} htmlFor="full_name" required error={errors?.full_name?.[0]}>
        <Input id="full_name" name="full_name" autoComplete="name" maxLength={150} aria-invalid={!!errors?.full_name} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.auth.email} htmlFor="email" required error={errors?.email?.[0]}>
          <Input id="email" name="email" type="email" autoComplete="email" aria-invalid={!!errors?.email} />
        </Field>
        <Field label={t.auth.password} htmlFor="password" required error={errors?.password?.[0]}>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors?.password}
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.auth.accountType} htmlFor="account_type" required>
          <Select name="account_type" value={accountType} onValueChange={setAccountType}>
            <SelectTrigger id="account_type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {USER_ACCOUNT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {t.enums.accountType[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={t.locationFields.city} htmlFor="city">
          <Select name="city" value={city} onValueChange={setCity}>
            <SelectTrigger id="city" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {f.city(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <fieldset className="flex flex-col gap-3 rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">{t.auth.contactTitle}</legend>
        <p className="-mt-1 text-xs text-muted-foreground">{t.auth.contactHint}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.auth.telegram} htmlFor="telegram" error={errors?.telegram?.[0]}>
            <Input id="telegram" name="telegram" placeholder="@username" aria-invalid={!!errors?.telegram} />
          </Field>
          <Field label={t.auth.phone} htmlFor="phone" error={errors?.phone?.[0]}>
            <Input id="phone" name="phone" type="tel" placeholder="+95 9 …" />
          </Field>
        </div>
      </fieldset>
      <Button type="submit" size="lg" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />}
        {t.auth.registerButton}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {t.auth.haveAccount}{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t.auth.loginLink}
        </Link>
      </p>
      <p className="text-center text-xs text-muted-foreground">{t.auth.demoNote}</p>
    </form>
  )
}
