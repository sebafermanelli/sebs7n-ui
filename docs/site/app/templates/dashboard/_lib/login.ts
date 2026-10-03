/** Los datos de la demo: el template no tiene servidor, así que el «backend» es una constante. */
export const DEMO_PASSWORD = "acme-demo"
export const DEMO_CODE = "123456"

export type LoginStep = "credentials" | "code" | "done"

export interface LoginState {
  step: LoginStep
  /** El error de la pantalla (no el de un campo): lo muestra `AuthError`. */
  error: string | null
  email: string
}

export type LoginAction =
  | { type: "credentials"; email: string; password: string }
  | { type: "code"; code: string }
  | { type: "back" }

export const INITIAL_LOGIN: LoginState = { step: "credentials", error: null, email: "" }

/** Correo y contraseña llevan al segundo paso (2FA); el código correcto, adentro. Todo error deja el paso donde estaba. */
export function loginReducer(state: LoginState, action: LoginAction): LoginState {
  switch (action.type) {
    case "credentials": {
      const email = action.email.trim()
      if (!email || action.password !== DEMO_PASSWORD) return { ...state, error: "El correo o la contraseña no son correctos." }
      return { step: "code", error: null, email }
    }
    case "code":
      if (state.step !== "code") return state
      return action.code === DEMO_CODE ? { ...state, step: "done", error: null } : { ...state, error: "Ese código no es el correcto. Probá de nuevo." }
    case "back":
      return INITIAL_LOGIN
  }
}
