import { supabase } from "./supabase"
import type { Database } from "./supabase"

type UserRole = Database["public"]["Tables"]["users"]["Row"]["role"]

export async function signUp(
  email: string,
  password: string,
  userData: {
    firstName: string
    lastName: string
    phone: string
    role: UserRole
  },
) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) throw authError

  if (authData.user) {
    // Create user profile
    const { error: profileError } = await supabase.from("users").insert({
      id: authData.user.id,
      email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone: userData.phone,
      role: userData.role,
    })

    if (profileError) throw profileError

    // Create role-specific profile
    if (userData.role === "client") {
      const { error: clientError } = await supabase.from("client_profiles").insert({
        user_id: authData.user.id,
      })
      if (clientError) throw clientError
    } else if (userData.role === "caregiver") {
      const { error: caregiverError } = await supabase.from("caregiver_profiles").insert({
        user_id: authData.user.id,
      })
      if (caregiverError) throw caregiverError
    }
  }

  return authData
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error

  if (user) {
    const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (profileError) throw profileError
    return { ...user, profile }
  }

  return null
}
