<script setup lang="ts">
import { Dialog } from '@headlessui/vue'
import { PhPlus, PhTerminal } from '@phosphor-icons/vue'
import { ref, computed, onMounted, nextTick } from 'vue'

definePageMeta({
  middleware: 'auth'
})

const { user, logout } = useAuth()

const isNewRoomModalOpen = ref(false)
const isUserModalOpen = ref(false)

interface Message {
  id: number
  sender: 'lyokha' | 'you'
  text: string
}

interface Room {
  id: string
  name: string
  messages: Message[]
}

const activeRoomId = ref('general')
const messageInput = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const inputField = ref<HTMLInputElement | null>(null)

const rooms = ref<Room[]>([
  {
    id: 'general',
    name: 'general',
    messages: [
      { id: 1, sender: 'lyokha', text: 'пушнул в main, всё ок' },
      { id: 2, sender: 'you', text: 'ну ты и смелый' },
      { id: 3, sender: 'lyokha', text: 'ci зелёный, не ной' },
      { id: 4, sender: 'you', text: 'ладно, верю' }
    ]
  },
  {
    id: 'random',
    name: 'random',
    messages: [
      { id: 1, sender: 'lyokha', text: 'кто-то пойдет обедать?' },
      { id: 2, sender: 'you', text: 'я через 10 минут подтянусь' },
      { id: 3, sender: 'lyokha', text: 'окей, жду у входа в столовую' }
    ]
  },
  {
    id: 'dev',
    name: 'dev',
    messages: [
      { id: 1, sender: 'lyokha', text: 'опять кто-то сломал прод' },
      { id: 2, sender: 'you', text: 'кто последний коммитил?' },
      { id: 3, sender: 'lyokha', text: 'похоже, стажёр тестировал релиз на горячую' }
    ]
  }
])

const activeRoom = computed(() => {
  return rooms.value.find(r => r.id === activeRoomId.value) || rooms.value[0]
})

const lyokhaReplies = [
  'чел, у меня всё локально работает',
  'кто опять удалил lock-файл?',
  'давай деплоить на прод в пятницу в 17:59',
  'это фича, а не баг',
  'винда обновилась и всё сломала',
  'где логи, Лебовски?',
  'попробуй очистить кэш и пересобрать проект',
  'форсанул пуш с --force, держитесь',
  'а у меня на машине всё ок',
  'не трогай то, что работает'
]

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const sendMessage = () => {
  const text = messageInput.value.trim()
  if (!text) return

  // Find the active room and push message
  const room = rooms.value.find(r => r.id === activeRoomId.value)
  if (room) {
    room.messages.push({
      id: Date.now(),
      sender: 'you',
      text
    })
  }

  messageInput.value = ''
  scrollToBottom()

  // Auto response from lyokha
  setTimeout(() => {
    if (room && activeRoomId.value === room.id) {
      const randomReply = lyokhaReplies[Math.floor(Math.random() * lyokhaReplies.length)] ?? '...'
      room.messages.push({
        id: Date.now() + 1,
        sender: 'lyokha',
        text: randomReply
      })
      scrollToBottom()
    }
  }, 1200)
}

onMounted(() => {
  scrollToBottom()
  inputField.value?.focus()
})
</script>

<template>
  <div class="flex flex-col bg-term-bg w-screen h-screen overflow-hidden font-mono text-term-text select-none">
    <!-- Titlebar / Header -->

    <!-- Main Workspace -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Left Strip (Icon Bar) -->
      <aside class="flex flex-col justify-between items-center bg-term-bg py-4 border-term-border border-r w-16 shrink-0">
        <!-- Top Icons -->
        <div class="flex flex-col items-center gap-3">
          <button class="flex justify-center items-center bg-term-panel shadow-sm border border-term-border hover:border-term-text w-10 h-10 font-bold text-term-text hover:text-white text-sm transition-all cursor-pointer select-none">
            <PhTerminal :size="20" data-allow-mismatch />
          </button>

          <button
            class="flex justify-center items-center bg-term-panel shadow-sm border border-term-border hover:border-term-text w-10 h-10 font-medium text-term-text hover:text-white text-lg transition-all cursor-pointer select-none"
            @click="isNewRoomModalOpen = true"
          >
            <PhPlus :size="20" data-allow-mismatch />
          </button>
          <ClientOnly>
            <Dialog
              :open="isNewRoomModalOpen"
              class="z-50 relative font-mono text-term-text"
              @close="isNewRoomModalOpen = false"
            >
              <div>
                <div class="top-1/2 left-1/2 fixed inset-0 bg-black/50 backdrop-blur-sm p-4 border border-term-border w-1/2 h-1/2 -translate-x-1/2 -translate-y-1/2">
                  <p>New Room</p>
                </div>
              </div>
            </Dialog>
          </ClientOnly>
        </div>

        <!-- Bottom User Profile Card -->

        <div
          class="group flex flex-col items-center gap-1"
          @click="isUserModalOpen = true"
        >
          <div class="relative flex justify-center items-center bg-term-panel shadow-sm border border-term-border hover:border-term-text w-10 h-10 transition-all cursor-pointer">
            <span class="font-bold text-term-text text-sm">{{ user?.username?.charAt(0)?.toUpperCase() || 'U' }}</span>
            <div class="right-0 bottom-0 absolute bg-term-green border border-term-bg w-2.5 h-2.5" />
          </div>
          <span class="mt-1 text-[9px] text-term-text/60 select-none">{{ user?.username || 'you' }}</span>
        </div>
        <ClientOnly>
          <Dialog
            :open="isUserModalOpen"
            class="z-50 relative font-mono text-term-text"
            @close="isUserModalOpen = false"
          >
            <div>
              <div
                class="top-1/2 left-1/2 fixed inset-0 bg-black/50 backdrop-blur-sm p-4 border border-term-border focus:outline-none w-1/2 h-1/2 -translate-x-1/2 -translate-y-1/2"
                tabindex="-1"
              >
                <div class="flex justify-between items-center mb-4">
                  <div class="flex items-center gap-2">
                    <div class="flex justify-center items-center bg-term-panel border border-term-border w-8 h-8 font-bold text-term-green text-sm">
                      {{ user?.username?.charAt(0)?.toUpperCase() || 'U' }}
                    </div>
                    <span class="font-semibold text-white text-sm">{{ user?.username }}</span>
                  </div>
                  <button
                    class="px-3 py-1.5 border border-term-border hover:border-red-400/50 text-[10px] text-term-text/60 hover:text-red-400 transition-colors cursor-pointer"
                    @click="logout()"
                  >
                    [ logout ]
                  </button>
                </div>
                <UserInfo />
                <!-- FIXME -->
                <button
                  class="sr-only"
                  autofocus
                >
                  Initial Focus
                </button>
              </div>
            </div>
          </Dialog>
        </ClientOnly>
      </aside>

      <!-- Sidebar Room List -->
      <nav class="flex flex-col bg-term-bg px-2 py-4 border-term-border border-r w-56 shrink-0">
        <div class="mb-4 px-3 font-bold text-[10px] text-term-text/40 uppercase tracking-widest select-none">
          Rooms
        </div>

        <!-- Channels / Rooms list -->
        <div class="flex-1 space-y-1">
          <button
            v-for="room in rooms"
            :key="room.id"
            class="flex items-center px-3 py-2 w-full text-xs text-left transition-all duration-150 cursor-pointer"
            :class="activeRoomId === room.id
              ? 'bg-term-border/40 border border-term-border text-white font-semibold'
              : 'text-term-text/70 border border-transparent hover:bg-term-panel/50 hover:text-term-text'"
            @click="activeRoomId = room.id"
          >
            # {{ room.name }}
          </button>
        </div>
      </nav>

      <!-- Main Chat Area -->
      <main class="flex flex-col flex-1 bg-term-bg overflow-hidden">
        <!-- Chat Area Header -->
        <div class="flex justify-between items-center bg-term-bg px-6 py-3 border-term-border border-b shrink-0">
          <div class="font-semibold text-white text-sm tracking-wider">
            #{{ activeRoom?.name }}
          </div>
          <div class="flex flex-row items-center gap-2 text-term-green text-xs">
            <span class="inline-block bg-term-green w-1.5 h-1.5 animate-pulse" />
            <p>status: online</p>
          </div>
        </div>

        <!-- Scrollable Messages feed -->
        <div
          ref="messagesContainer"
          class="flex-1 space-y-5 bg-term-bg/30 px-6 py-6 scrollbar-thumb-term-border overflow-y-auto scrollbar-thin"
        >
          <div
            v-for="msg in activeRoom?.messages"
            :key="msg.id"
            class="flex flex-col"
            :class="msg.sender === 'you' ? 'items-end' : 'items-start'"
          >
            <!-- Sender tag -->
            <span class="px-1 font-semibold text-[10px] text-term-text/50 select-none">
              {{ msg.sender }}
            </span>
            <!-- Message container -->
            <div
              class="px-4 py-2 border max-w-md md:max-w-lg text-xs wrap-break-word leading-relaxed whitespace-pre-wrap select-text"
              :class="msg.sender === 'you'
                ? 'border-term-border bg-term-panel/40 text-neutral-200'
                : 'border-term-border bg-term-panel text-neutral-200'"
            >
              {{ msg.text }}
            </div>
          </div>
        </div>

        <!-- Chat Input Form -->
        <form
          class="flex items-center gap-3 bg-term-bg p-4 border-term-border border-t shrink-0"
          @submit.prevent="sendMessage"
        >
          <!-- Prefix indicator -->
          <span class="pl-2 font-bold text-term-text text-sm select-none">&gt;</span>

          <!-- TextInput -->
          <input
            ref="inputField"
            v-model="messageInput"
            type="text"
            placeholder="message_"
            class="flex-1 bg-transparent border-none outline-none text-term-text text-xs caret-term-text placeholder-term-text/60"
            autofocus
          >

          <!-- Send Action Link/Button -->
          <button
            type="submit"
            class="px-2 font-bold text-term-text hover:text-white text-xs transition-colors duration-150 cursor-pointer select-none"
          >
            [ send ]
          </button>
        </form>
      </main>
    </div>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: var(--color-term-bg);
}
::-webkit-scrollbar-thumb {
  background: var(--color-term-border);
  border-radius: 2px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--color-term-text);
}
</style>
