<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const { isAuthenticated, fetchUser } = useAuth()

onMounted(async () => {
  await fetchUser()
})

// ── Terminal Demo State ──────────────────────────────
const terminalLines = ref<{ text: string, type: string }[]>([])
const terminalReady = ref(false)

const demoScript = [
  { text: '$ kfault connect --server wss://relay.kfault.io', type: 'command' },
  { text: '[conn] handshake initiated...', type: 'log' },
  { text: '[conn] TLS 1.3 negotiated ✓', type: 'success' },
  { text: '[conn] session: f7a2c9e1 established', type: 'success' },
  { text: '', type: 'spacer' },
  { text: '$ kfault send --room #general "deploy looks clean 🚀"', type: 'command' },
  { text: '[msg] queued → #general (1 pending)', type: 'log' },
  { text: '[msg] delivered ✓ (12ms)', type: 'success' },
  { text: '', type: 'spacer' },
  { text: '[warn] connection lost — retrying in 2s...', type: 'warning' },
  { text: '[conn] reconnecting (attempt 1/5)...', type: 'log' },
  { text: '[conn] restored ✓ — 0 messages lost', type: 'success' },
  { text: '[sync] local queue flushed (3 msgs synced)', type: 'success' }
]

let terminalInterval: ReturnType<typeof setTimeout> | null = null

const startTerminalDemo = () => {
  terminalLines.value = []
  let i = 0
  const addLine = () => {
    if (i < demoScript.length) {
      terminalLines.value.push(demoScript[i]!)
      i++
      terminalInterval = setTimeout(addLine, demoScript[i - 1]?.type === 'command' ? 800 : 400)
    } else {
      // Restart after pause
      terminalInterval = setTimeout(() => {
        startTerminalDemo()
      }, 4000)
    }
  }
  terminalInterval = setTimeout(addLine, 600)
}

// ── Fault Simulator State ─────────────────────────────
type FaultPhase = 'idle' | 'simulating' | 'recovering' | 'synced'

const faultPhase = ref<FaultPhase>('idle')
const queuedMessages = ref(0)
const statusText = ref('All systems operational')
const statusColor = ref('text-term-green')
let faultTimeout: ReturnType<typeof setTimeout> | null = null

const simulateFault = (type: string) => {
  if (faultPhase.value !== 'idle') return

  faultPhase.value = 'simulating'
  queuedMessages.value = 0
  statusText.value = type === 'outage'
    ? 'Server unreachable — messages queuing locally...'
    : 'Packet loss detected — buffering...'
  statusColor.value = 'text-term-pink'

  // Simulate messages queuing
  let count = 0
  const queueInterval = setInterval(() => {
    count++
    queuedMessages.value = count
    if (count >= 5) {
      clearInterval(queueInterval)
      // Start recovery
      faultPhase.value = 'recovering'
      statusText.value = 'Connection restored — syncing queue...'
      statusColor.value = 'text-term-amber'

      faultTimeout = setTimeout(() => {
        faultPhase.value = 'synced'
        statusText.value = `${count} messages synced — 0 lost ✓`
        statusColor.value = 'text-term-green'

        faultTimeout = setTimeout(() => {
          faultPhase.value = 'idle'
          queuedMessages.value = 0
          statusText.value = 'All systems operational'
          statusColor.value = 'text-term-green'
        }, 3000)
      }, 1500)
    }
  }, 600)
}

// ── Scroll-based Reveal ─────────────────────────────
const revealedSections = ref<Set<string>>(new Set())
let observer: IntersectionObserver | null = null

const setupIntersectionObserver = () => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          revealedSections.value.add(entry.target.id)
        }
      })
    },
    { threshold: 0.15 }
  )

  document.querySelectorAll('[data-reveal]').forEach((el) => {
    observer?.observe(el)
  })
}

// ── Mobile Nav Toggle ────────────────────────────────
const mobileNavOpen = ref(false)

// ── Lifecycle ────────────────────────────────────────
onMounted(() => {
  terminalReady.value = true
  startTerminalDemo()
  setupIntersectionObserver()
})

onUnmounted(() => {
  if (terminalInterval) clearTimeout(terminalInterval)
  if (faultTimeout) clearTimeout(faultTimeout)
  if (observer) observer.disconnect()
})

// ── Feature Cards Data ───────────────────────────────
const features = [
  {
    icon: '⚡',
    title: 'Fault-Tolerant Sync',
    desc: 'Messages queue locally during outages and auto-sync when connectivity is restored. Zero data loss, guaranteed.',
    snippet: 'queue.flush({ retry: 3, backoff: "exp" })'
  },
  {
    icon: '⌨️',
    title: 'Developer-First UX',
    desc: 'Keyboard-driven navigation, command palettes, and a terminal-native interface built for engineers.',
    snippet: 'bind("ctrl+k", openCommandPalette)'
  },
  {
    icon: '🔐',
    title: 'End-to-End Encrypted',
    desc: 'Fully auditable, open-source cryptographic layer. Your conversations stay yours — always.',
    snippet: 'crypto.seal(msg, peerPublicKey)'
  },
  {
    icon: '🔗',
    title: 'Webhook & API Native',
    desc: 'Post messages from CI/CD pipelines, monitoring alerts, and deployment scripts with a single curl.',
    snippet: 'curl -X POST /api/v1/rooms/general/msg'
  }
]
</script>

<template>
  <div class="relative bg-term-bg min-h-screen overflow-x-hidden overflow-y-auto font-mono text-term-text landing-scroll">
    <!-- Animated Grid Background -->
    <div class="fixed inset-0 grid-bg pointer-events-none" />
    <div class="fixed inset-0 pointer-events-none hero-radial" />

    <!-- ═══ HEADER / NAV ═══ -->
    <header class="top-0 z-50 sticky bg-term-bg/80 backdrop-blur-xl border-term-border/50 border-b">
      <nav class="flex justify-between items-center mx-auto px-6 py-4 max-w-6xl">
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="group flex items-center gap-3"
          aria-label="KFault Home"
        >
          <div class="flex justify-center items-center bg-term-panel border border-term-border group-hover:border-term-green w-8 h-8 font-bold text-term-green text-sm transition-colors">
            K
          </div>
          <span class="font-bold text-white text-lg tracking-wider">
            KFault
          </span>
        </NuxtLink>

        <!-- Desktop Links -->
        <div class="hidden md:flex items-center gap-8 text-xs">
          <a
            href="#features"
            class="text-term-text/70 hover:text-white transition-colors"
          >Features</a>
          <a
            href="#demo"
            class="text-term-text/70 hover:text-white transition-colors"
          >Demo</a>
          <a
            href="#pricing"
            class="text-term-text/70 hover:text-white transition-colors"
          >Pricing</a>
          <NuxtLink
            :to="isAuthenticated ? '/chat' : '/login'"
            class="flex items-center gap-2 bg-term-green/10 hover:bg-term-green/20 px-4 py-2 border border-term-green/50 hover:border-term-green text-term-green transition-all"
          >
            <span class="inline-block bg-term-green w-1.5 h-1.5 animate-pulse" />
            {{ isAuthenticated ? '[ open_chat ]' : '[ login ]' }}
          </NuxtLink>
        </div>

        <!-- Mobile Menu Toggle -->
        <button
          class="md:hidden p-2 text-term-text hover:text-white transition-colors"
          aria-label="Toggle mobile navigation"
          @click="mobileNavOpen = !mobileNavOpen"
        >
          <svg
            v-if="!mobileNavOpen"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          ><line
            x1="3"
            y1="6"
            x2="21"
            y2="6"
          /><line
            x1="3"
            y1="12"
            x2="21"
            y2="12"
          /><line
            x1="3"
            y1="18"
            x2="21"
            y2="18"
          /></svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          ><line
            x1="18"
            y1="6"
            x2="6"
            y2="18"
          /><line
            x1="6"
            y1="6"
            x2="18"
            y2="18"
          /></svg>
        </button>
      </nav>

      <!-- Mobile Dropdown -->
      <div
        v-if="mobileNavOpen"
        class="md:hidden flex flex-col gap-4 bg-term-bg/95 backdrop-blur-xl px-6 py-4 border-term-border/50 border-t text-xs"
      >
        <a
          href="#features"
          class="text-term-text/70 hover:text-white transition-colors"
          @click="mobileNavOpen = false"
        >Features</a>
        <a
          href="#demo"
          class="text-term-text/70 hover:text-white transition-colors"
          @click="mobileNavOpen = false"
        >Demo</a>
        <a
          href="#pricing"
          class="text-term-text/70 hover:text-white transition-colors"
          @click="mobileNavOpen = false"
        >Pricing</a>
        <NuxtLink
          :to="isAuthenticated ? '/chat' : '/login'"
          class="flex items-center gap-2 bg-term-green/10 px-4 py-2 border border-term-green/50 w-fit text-term-green"
          @click="mobileNavOpen = false"
        >
          <span class="inline-block bg-term-green w-1.5 h-1.5 animate-pulse" />
          {{ isAuthenticated ? '[ open_chat ]' : '[ login ]' }}
        </NuxtLink>
      </div>
    </header>

    <!-- ═══ HERO SECTION ═══ -->
    <section class="relative mx-auto px-6 pt-24 md:pt-36 pb-20 md:pb-32 max-w-6xl">
      <div class="flex flex-col items-center text-center">
        <!-- Version Badge -->
        <div class="inline-flex items-center gap-2 bg-term-panel/50 mb-8 px-4 py-1.5 border border-term-border text-[10px] text-term-text/60 uppercase tracking-widest fade-in-up">
          <span class="inline-block bg-term-green w-1.5 h-1.5 animate-pulse" />
          v0.1.0 — Early Access
        </div>

        <!-- Slogan -->
        <h1
          class="max-w-3xl font-bold text-glow text-white text-3xl md:text-5xl lg:text-6xl leading-tight tracking-tight delay-100 fade-in-up"
          style="font-family: 'Inter', sans-serif;"
        >
          Keeping you faultlessly connected.
        </h1>

        <!-- Subtitle -->
        <p
          class="mt-6 max-w-xl text-term-text/70 text-sm md:text-base leading-relaxed delay-200 fade-in-up"
          style="font-family: 'Inter', sans-serif;"
        >
          A fault-tolerant, terminal-first messenger built for developers who ship fast and can't afford dropped connections.
        </p>

        <!-- CTAs -->
        <div class="flex sm:flex-row flex-col items-center gap-4 mt-10 delay-300 fade-in-up">
          <NuxtLink
            id="cta-start-chatting"
            :to="isAuthenticated ? '/chat' : '/login'"
            class="group inline-flex relative items-center gap-2 bg-term-green/15 hover:bg-term-green/25 hover:shadow-[0_0_24px_rgba(74,222,128,0.2)] px-8 py-3 border border-term-green/50 hover:border-term-green font-semibold text-term-green text-sm transition-all duration-300"
          >
            <span class="inline-block bg-term-green w-2 h-2 animate-pulse" />
            {{ isAuthenticated ? 'Open Chat' : 'Start Chatting' }}
          </NuxtLink>
          <a
            id="cta-read-docs"
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-8 py-3 border border-term-border hover:border-term-text text-term-text/70 hover:text-white text-sm transition-all duration-300"
          >
            { read_docs }
          </a>
        </div>
      </div>

      <!-- ── Interactive Terminal Mockup ── -->
      <div class="mx-auto mt-16 max-w-2xl delay-500 fade-in-up">
        <div class="relative terminal-chrome scanlines">
          <!-- Titlebar -->
          <div class="terminal-titlebar">
            <div class="bg-red-500/80 terminal-dot" />
            <div class="bg-yellow-500/80 terminal-dot" />
            <div class="bg-green-500/80 terminal-dot" />
            <span class="ml-3 text-[10px] text-term-text/40 select-none">kfault — relay session</span>
          </div>
          <!-- Terminal Body -->
          <div class="px-5 py-4 h-72 overflow-hidden text-xs leading-relaxed">
            <div
              v-for="(line, idx) in terminalLines"
              :key="idx"
              class="mb-0.5"
            >
              <span v-if="line.type === 'spacer'">&nbsp;</span>
              <span
                v-else-if="line.type === 'command'"
                class="text-white"
              >{{ line.text }}</span>
              <span
                v-else-if="line.type === 'success'"
                class="text-term-green"
              >{{ line.text }}</span>
              <span
                v-else-if="line.type === 'warning'"
                class="text-term-amber"
              >{{ line.text }}</span>
              <span
                v-else
                class="text-term-text/60"
              >{{ line.text }}</span>
            </div>
            <span
              v-if="terminalReady"
              class="text-white text-xs cursor-blink"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ FEATURES SECTION ═══ -->
    <section
      id="features"
      data-reveal
      class="relative mx-auto px-6 py-20 md:py-28 max-w-6xl"
    >
      <div class="mb-16 text-center">
        <p class="mb-3 text-[10px] text-term-text/40 uppercase tracking-[0.3em]">
          // features
        </p>
        <h2
          class="font-bold text-white text-2xl md:text-3xl tracking-tight"
          style="font-family: 'Inter', sans-serif;"
        >
          Built for developers, by developers
        </h2>
      </div>

      <div class="gap-5 grid grid-cols-1 md:grid-cols-2">
        <div
          v-for="(feat, i) in features"
          :key="feat.title"
          class="p-6 md:p-8 glass-card"
          :class="{
            'fade-in-up': revealedSections.has('features'),
            [`delay-${(i + 1) * 100}`]: revealedSections.has('features')
          }"
        >
          <div class="mb-4 text-2xl">
            {{ feat.icon }}
          </div>
          <h3
            class="mb-2 font-semibold text-white text-base"
            style="font-family: 'Inter', sans-serif;"
          >
            {{ feat.title }}
          </h3>
          <p
            class="mb-4 text-term-text/60 text-xs leading-relaxed"
            style="font-family: 'Inter', sans-serif;"
          >
            {{ feat.desc }}
          </p>
          <div class="bg-term-bg/50 px-3 py-2 border border-term-border/50 text-[11px] text-term-green/80">
            <span class="text-term-text/30">›</span> {{ feat.snippet }}
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ FAULT SIMULATOR ═══ -->
    <section
      id="demo"
      data-reveal
      class="relative mx-auto px-6 py-20 md:py-28 max-w-6xl"
    >
      <div class="mb-16 text-center">
        <p class="mb-3 text-[10px] text-term-text/40 uppercase tracking-[0.3em]">
          // interactive demo
        </p>
        <h2
          class="font-bold text-white text-2xl md:text-3xl tracking-tight"
          style="font-family: 'Inter', sans-serif;"
        >
          See fault-tolerance in action
        </h2>
        <p
          class="mx-auto mt-4 max-w-lg text-term-text/50 text-sm"
          style="font-family: 'Inter', sans-serif;"
        >
          Simulate a network failure and watch KFault gracefully buffer, recover, and sync — with zero message loss.
        </p>
      </div>

      <div class="mx-auto max-w-xl">
        <div class="terminal-chrome">
          <!-- Titlebar -->
          <div class="terminal-titlebar">
            <div class="bg-red-500/80 terminal-dot" />
            <div class="bg-yellow-500/80 terminal-dot" />
            <div class="bg-green-500/80 terminal-dot" />
            <span class="ml-3 text-[10px] text-term-text/40 select-none">kfault — fault simulator</span>
          </div>
          <!-- Simulator Body -->
          <div class="space-y-5 px-5 py-6">
            <!-- Status Display -->
            <div class="flex justify-between items-center pb-4 border-term-border/30 border-b">
              <div class="flex items-center gap-2 text-xs">
                <span
                  class="inline-block rounded-full w-2 h-2"
                  :class="{
                    'bg-term-green animate-pulse': faultPhase === 'idle' || faultPhase === 'synced',
                    'bg-term-pink animate-pulse': faultPhase === 'simulating',
                    'bg-term-amber animate-pulse': faultPhase === 'recovering'
                  }"
                ></span>
                <span
                  :class="statusColor"
                  class="transition-colors duration-300"
                >{{ statusText }}</span>
              </div>
              <div
                v-if="queuedMessages > 0"
                class="text-[10px] text-term-amber"
              >
                queue: {{ queuedMessages }} msgs
              </div>
            </div>

            <!-- Queue Visualization -->
            <div class="flex items-center gap-1.5 min-h-8">
              <div
                v-for="n in queuedMessages"
                :key="n"
                class="flex justify-center items-center border w-7 h-7 text-[9px] transition-all duration-300"
                :class="{
                  'border-term-pink bg-term-pink/10 text-term-pink': faultPhase === 'simulating',
                  'border-term-amber bg-term-amber/10 text-term-amber': faultPhase === 'recovering',
                  'border-term-green bg-term-green/10 text-term-green': faultPhase === 'synced'
                }"
              >
                ✉
              </div>
              <span
                v-if="queuedMessages === 0 && faultPhase === 'idle'"
                class="text-[10px] text-term-text/30"
              >
                no messages in queue
              </span>
            </div>

            <!-- Action Buttons -->
            <div class="flex sm:flex-row flex-col gap-3 pt-2">
              <button
                id="sim-outage-btn"
                class="flex-1 bg-term-pink/5 hover:bg-term-pink/15 disabled:opacity-30 px-4 py-2.5 border border-term-pink/40 hover:border-term-pink text-term-pink text-xs transition-all cursor-pointer disabled:cursor-not-allowed"
                :disabled="faultPhase !== 'idle'"
                @click="simulateFault('outage')"
              >
                ⚠ Simulate Server Outage
              </button>
              <button
                id="sim-packet-btn"
                class="flex-1 bg-term-amber/5 hover:bg-term-amber/15 disabled:opacity-30 px-4 py-2.5 border border-term-amber/40 hover:border-term-amber text-term-amber text-xs transition-all cursor-pointer disabled:cursor-not-allowed"
                :disabled="faultPhase !== 'idle'"
                @click="simulateFault('packet-loss')"
              >
                ⚡ Simulate Packet Loss
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ PRICING / OPEN SOURCE ═══ -->
    <section
      id="pricing"
      data-reveal
      class="relative mx-auto px-6 py-20 md:py-28 max-w-6xl"
    >
      <div class="mb-16 text-center">
        <p class="mb-3 text-[10px] text-term-text/40 uppercase tracking-[0.3em]">
          // pricing
        </p>
        <h2
          class="font-bold text-white text-2xl md:text-3xl tracking-tight"
          style="font-family: 'Inter', sans-serif;"
        >
          Open source at its core
        </h2>
      </div>

      <div class="gap-6 grid grid-cols-1 md:grid-cols-2 mx-auto max-w-3xl">
        <!-- Self-Hosted -->
        <div
          class="flex flex-col p-8 glass-card"
          :class="{
            'fade-in-up': revealedSections.has('pricing')
          }"
        >
          <p class="mb-4 text-[10px] text-term-text/40 uppercase tracking-widest">
            Self-Hosted
          </p>
          <div
            class="mb-1 font-bold text-white text-3xl"
            style="font-family: 'Inter', sans-serif;"
          >
            $0
          </div>
          <p class="mb-6 text-term-text/40 text-xs">
            forever free, forever yours
          </p>
          <ul
            class="flex-1 space-y-3 mb-8 text-term-text/70 text-xs"
            style="font-family: 'Inter', sans-serif;"
          >
            <li class="flex items-start gap-2">
              <span class="mt-0.5 text-term-green">✓</span>
              Unlimited users & rooms
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-0.5 text-term-green">✓</span>
              Full source code access
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-0.5 text-term-green">✓</span>
              E2E encryption included
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-0.5 text-term-green">✓</span>
              Deploy on your infrastructure
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-0.5 text-term-green">✓</span>
              Community support
            </li>
          </ul>
          <a
            id="pricing-self-hosted"
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            class="block bg-term-green/10 hover:bg-term-green/20 py-3 border border-term-green/50 hover:border-term-green font-semibold text-term-green text-sm text-center transition-all"
          >
            git clone →
          </a>
        </div>

        <!-- Managed Cloud -->
        <div
          class="flex flex-col p-8 border-term-glow/30 glass-card"
          :class="{
            'fade-in-up delay-200': revealedSections.has('pricing')
          }"
        >
          <div class="flex items-center gap-3 mb-4">
            <p class="text-[10px] text-term-text/40 uppercase tracking-widest">
              Managed Cloud
            </p>
            <span class="bg-term-glow/15 px-2 py-0.5 border border-term-glow/30 text-[9px] text-term-glow uppercase tracking-wider">Soon</span>
          </div>
          <div
            class="mb-1 font-bold text-white text-3xl"
            style="font-family: 'Inter', sans-serif;"
          >
            $9
          </div>
          <p class="mb-6 text-term-text/40 text-xs">
            per user / month
          </p>
          <ul
            class="flex-1 space-y-3 mb-8 text-term-text/70 text-xs"
            style="font-family: 'Inter', sans-serif;"
          >
            <li class="flex items-start gap-2">
              <span class="mt-0.5 text-term-green">✓</span>
              Everything in Self-Hosted
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-0.5 text-term-cyan">+</span>
              Managed relay infrastructure
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-0.5 text-term-cyan">+</span>
              99.99% uptime SLA
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-0.5 text-term-cyan">+</span>
              Priority support & onboarding
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-0.5 text-term-cyan">+</span>
              Advanced analytics dashboard
            </li>
          </ul>
          <button
            id="pricing-managed"
            class="block py-3 border border-term-border w-full text-term-text/50 text-sm text-center cursor-not-allowed"
            disabled
          >
            Coming Soon
          </button>
        </div>
      </div>
    </section>

    <!-- ═══ FOOTER ═══ -->
    <footer class="mt-12 border-term-border/30 border-t">
      <div class="flex md:flex-row flex-col justify-between items-center gap-6 mx-auto px-6 py-12 max-w-6xl">
        <!-- Left -->
        <div class="flex items-center gap-3 text-term-text/40 text-xs">
          <div class="flex justify-center items-center bg-term-panel border border-term-border w-6 h-6 font-bold text-[10px] text-term-green">
            K
          </div>
          <span>&copy; 2026 KFault — MIT License</span>
        </div>

        <!-- Right -->
        <div class="flex items-center gap-6 text-term-text/40 text-xs">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-white transition-colors"
          >GitHub</a>
          <a
            href="#"
            class="hover:text-white transition-colors"
          >Docs</a>
          <div class="flex items-center gap-1.5">
            <span class="inline-block bg-term-green w-1.5 h-1.5 animate-pulse" />
            <span class="text-term-green/60">status: operational</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
