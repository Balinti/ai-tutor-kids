// Google OAuth Authentication with Supabase
// Supabase Configuration (HARDCODED - NOT ENV VARS)
const SUPABASE_URL = "https://api.srv936332.hstgr.cloud";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE";
const APP_SLUG = "ai-tutor-kids";

let supabaseClient = null;

// Initialize Supabase client
function initSupabase() {
  if (window.supabase && !supabaseClient) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    setupAuthListener();
    checkCurrentSession();
  }
}

// Check current session on page load
async function checkCurrentSession() {
  if (!supabaseClient) return;

  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    updateAuthUI(session?.user || null);
  } catch (error) {
    console.error("Error checking session:", error);
    updateAuthUI(null);
  }
}

// Setup auth state listener
function setupAuthListener() {
  if (!supabaseClient) return;

  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    updateAuthUI(session?.user || null);

    if (event === "SIGNED_IN" && session?.user) {
      await trackUserLogin(session.user);
    }
  });
}

// Track user login in user_tracking table
async function trackUserLogin(user) {
  if (!supabaseClient || !user) return;

  try {
    const { data: existing, error: selectError } = await supabaseClient
      .from("user_tracking")
      .select("*")
      .eq("user_id", user.id)
      .eq("app", APP_SLUG)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Error checking user_tracking:", selectError);
      return;
    }

    if (existing) {
      const { error: updateError } = await supabaseClient
        .from("user_tracking")
        .update({
          login_cnt: existing.login_cnt + 1,
          last_login_ts: new Date().toISOString()
        })
        .eq("user_id", user.id)
        .eq("app", APP_SLUG);

      if (updateError) {
        console.error("Error updating user_tracking:", updateError);
      }
    } else {
      const { error: insertError } = await supabaseClient
        .from("user_tracking")
        .insert({
          user_id: user.id,
          email: user.email,
          app: APP_SLUG,
          login_cnt: 1,
          last_login_ts: new Date().toISOString()
        });

      if (insertError) {
        console.error("Error inserting user_tracking:", insertError);
      }
    }
  } catch (error) {
    console.error("Error in trackUserLogin:", error);
  }
}

// Update UI based on auth state
function updateAuthUI(user) {
  const loadingEl = document.getElementById("auth-loading");
  const signedOutEl = document.getElementById("auth-signed-out");
  const signedInEl = document.getElementById("auth-signed-in");
  const userEmailEl = document.getElementById("user-email");

  if (loadingEl) loadingEl.classList.add("hidden");

  if (user) {
    if (signedOutEl) signedOutEl.classList.add("hidden");
    if (signedInEl) signedInEl.classList.remove("hidden");
    if (userEmailEl) userEmailEl.textContent = user.email;
  } else {
    if (signedOutEl) signedOutEl.classList.remove("hidden");
    if (signedInEl) signedInEl.classList.add("hidden");
    if (userEmailEl) userEmailEl.textContent = "";
  }
}

// Sign in with Google
async function signInWithGoogle() {
  if (!supabaseClient) {
    console.error("Supabase client not initialized");
    return;
  }

  try {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + window.location.pathname
      }
    });

    if (error) {
      console.error("Error signing in:", error);
    }
  } catch (error) {
    console.error("Error signing in:", error);
  }
}

// Sign out
async function signOutUser() {
  if (!supabaseClient) {
    console.error("Supabase client not initialized");
    return;
  }

  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
  } catch (error) {
    console.error("Error signing out:", error);
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Wait for Supabase to load
  if (window.supabase) {
    initSupabase();
  } else {
    // Retry after a short delay if not loaded yet
    setTimeout(initSupabase, 100);
  }
});

// Expose functions globally
window.signInWithGoogle = signInWithGoogle;
window.signOutUser = signOutUser;
