<script setup lang="ts">
definePageMeta({
  middleware: 'guest'
})

const username = ref('')
const password = ref('')
const error = ref('')

const { login, isLoading } = useAuth()

const handleSubmit = async () => {
  error.value = ''

  if (!username.value.trim() || !password.value) {
    error.value = 'Username and password are required'
    return
  }

  const result = await login(username.value.trim(), password.value)
  if (result.success) {
    navigateTo('/chat')
  } else {
    error.value = result.error || 'Login failed'
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-term-bg font-mono text-term-text px-4">
    <!-- Animated Grid Background -->
    <div class="fixed inset-0 grid-bg pointer-events-none" />
    <div class="fixed inset-0 hero-radial pointer-events-none" />

    <div class="relative z-10 w-full max-w-md">
      <!-- Logo -->
      <div class="mb-10 flex flex-col items-center gap-3">
        <NuxtLink
          to="/"
          class="flex items-center gap-3 group"
          aria-label="KFault Home"
        >
          <div class="flex h-10 w-10 items-center justify-center border border-term-border bg-term-panel text-term-green font-bold text-base group-hover:border-term-green transition-colors">
            K
          </div>
          <span class="font-bold text-white text-xl tracking-wider">KFault</span>
        </NuxtLink>
      </div>

      <!-- Terminal Card -->
      <div class="terminal-chrome">
        <!-- Titlebar -->
        <div class="terminal-titlebar">
          <div class="terminal-dot bg-red-500/80" />
          <div class="terminal-dot bg-yellow-500/80" />
          <div class="terminal-dot bg-green-500/80" />
          <span class="ml-3 text-[10px] text-term-text/40 select-none">kfault — auth/login</span>
        </div>

        <!-- Form Body -->
        <div class="px-6 py-8">
          <h1
            class="text-xl font-bold text-white mb-1 tracking-tight"
            style="font-family: 'Inter', sans-serif;"
          >
            Welcome back
          </h1>
          <p
            class="text-xs text-term-text/50 mb-8"
            style="font-family: 'Inter', sans-serif;"
          >
            Authenticate to resume your session.
          </p>

          <!-- Error -->
          <div
            v-if="error"
            class="mb-6 flex items-center gap-2 border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-400"
          >
            <span>⚠</span>
            <span>{{ error }}</span>
          </div>

          <form
            class="space-y-5"
            @submit.prevent="handleSubmit"
          >
            <!-- Username -->
            <div>
              <label
                for="login-username"
                class="block text-[10px] text-term-text/40 uppercase tracking-widest mb-2"
              >
                Username
              </label>
              <div class="flex items-center border border-term-border bg-term-bg/50 focus-within:border-term-text transition-colors">
                <span class="pl-3 text-term-text/30 text-sm select-none">&gt;</span>
                <input
                  id="login-username"
                  v-model="username"
                  type="text"
                  autocomplete="username"
                  placeholder="your_username"
                  class="w-full bg-transparent px-3 py-3 text-sm text-white outline-none placeholder-term-text/30 caret-term-green"
                >
              </div>
            </div>

            <!-- Password -->
            <div>
              <label
                for="login-password"
                class="block text-[10px] text-term-text/40 uppercase tracking-widest mb-2"
              >
                Password
              </label>
              <div class="flex items-center border border-term-border bg-term-bg/50 focus-within:border-term-text transition-colors">
                <span class="pl-3 text-term-text/30 text-sm select-none">&gt;</span>
                <input
                  id="login-password"
                  v-model="password"
                  type="password"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  class="w-full bg-transparent px-3 py-3 text-sm text-white outline-none placeholder-term-text/30 caret-term-green"
                >
              </div>
            </div>

            <!-- Submit -->
            <button
              id="login-submit"
              type="submit"
              :disabled="isLoading"
              class="w-full border border-term-green/50 bg-term-green/10 py-3 text-sm text-term-green font-semibold hover:bg-term-green/20 hover:border-term-green transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span
                v-if="isLoading"
                class="animate-pulse"
              >authenticating...</span>
              <span v-else>[ login ]</span>
            </button>
          </form>

          <!-- Register Link -->
          <p
            class="mt-6 text-center text-xs text-term-text/40"
            style="font-family: 'Inter', sans-serif;"
          >
            No account?
            <NuxtLink
              to="/register"
              class="text-term-text hover:text-white transition-colors ml-1"
            >
              [ register ]
            </NuxtLink>
          </p>
        </div>
      </div>

      <!-- Back to landing -->
      <div class="mt-6 text-center">
        <NuxtLink
          to="/"
          class="text-[10px] text-term-text/30 hover:text-term-text/60 transition-colors"
        >
          ← back to home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
