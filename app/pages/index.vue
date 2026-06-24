<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'

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
    if (activeRoomId.value === room?.id) {
      const randomReply = lyokhaReplies[Math.floor(Math.random() * lyokhaReplies.length)]
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
  <div class="h-screen w-screen flex flex-col bg-term-bg text-term-text overflow-hidden font-mono select-none">
    
    <!-- Titlebar / Header -->
    <header class="h-11 flex items-center justify-between px-4 border-b border-term-border bg-term-bg relative shrink-0">
      <!-- Left side: App Logo -->
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-term-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5-2 4-2 4 2 4 2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      </div>

      <!-- Center: App Name -->
      <div class="absolute left-1/2 -translate-x-1/2 text-sm font-semibold tracking-widest text-term-text uppercase">
        KFault
      </div>

      <!-- Right side: Window controls -->
      <div class="flex items-center gap-3 text-term-text/80 text-xs">
        <span class="hover:text-white cursor-pointer transition-colors">_</span>
        <span class="hover:text-white cursor-pointer transition-colors">⛶</span>
        <span class="hover:text-white cursor-pointer transition-colors">×</span>
      </div>
    </header>

    <!-- Main Workspace -->
    <div class="flex-1 flex overflow-hidden">
      
      <!-- Left Strip (Icon Bar) -->
      <aside class="w-16 border-r border-term-border bg-term-bg flex flex-col justify-between items-center py-4 shrink-0">
        <!-- Top Icons -->
        <div class="flex flex-col items-center gap-3">
          <button class="w-10 h-10 border border-term-border bg-term-panel flex items-center justify-center text-term-text font-bold text-sm rounded hover:border-term-text hover:text-white transition-all shadow-sm cursor-pointer select-none">
            &gt;_
          </button>
          
          <button class="w-10 h-10 border border-term-border bg-term-panel flex items-center justify-center text-term-text font-medium text-lg rounded hover:border-term-text hover:text-white transition-all shadow-sm cursor-pointer select-none">
            +
          </button>
        </div>

        <!-- Bottom User Profile Card -->
        <div class="flex flex-col items-center gap-1 group">
          <div class="w-10 h-10 border border-term-border bg-term-panel flex items-center justify-center rounded shadow-sm relative cursor-pointer hover:border-term-text transition-all">
            <span class="font-bold text-sm text-term-text">U</span>
            <div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-term-green border border-term-bg rounded-full"></div>
          </div>
          <span class="text-[9px] text-term-text/60 mt-1 select-none">you</span>
        </div>
      </aside>

      <!-- Sidebar Room List -->
      <nav class="w-56 border-r border-term-border bg-term-bg flex flex-col py-4 px-2 shrink-0">
        <div class="px-3 mb-4 text-[10px] font-bold tracking-widest text-term-text/40 select-none uppercase">
          Rooms
        </div>
        
        <!-- Channels / Rooms list -->
        <div class="flex-1 space-y-1">
          <button 
            v-for="room in rooms" 
            :key="room.id"
            @click="activeRoomId = room.id"
            class="w-full flex items-center px-3 py-2 rounded text-xs text-left cursor-pointer transition-all duration-150"
            :class="activeRoomId === room.id 
              ? 'bg-term-border/40 border border-term-border text-white font-semibold' 
              : 'text-term-text/70 border border-transparent hover:bg-term-panel/50 hover:text-term-text'"
          >
            # {{ room.name }}
          </button>
        </div>
      </nav>

      <!-- Main Chat Area -->
      <main class="flex-1 flex flex-col bg-term-bg overflow-hidden">
        
        <!-- Chat Area Header -->
        <div class="px-6 py-3 border-b border-term-border flex items-center justify-between bg-term-bg shrink-0">
          <div class="text-sm font-semibold tracking-wider text-white">
            #{{ activeRoom.name }}
          </div>
          <div class="flex items-center gap-2 text-xs text-term-green">
            <span class="w-1.5 h-1.5 rounded-full bg-term-green inline-block animate-pulse"></span>
            status: online
          </div>
        </div>

        <!-- Scrollable Messages feed -->
        <div 
          ref="messagesContainer"
          class="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-term-bg/30 scrollbar-thin scrollbar-thumb-term-border"
        >
          <div 
            v-for="msg in activeRoom.messages" 
            :key="msg.id" 
            class="flex flex-col"
            :class="msg.sender === 'you' ? 'items-end' : 'items-start'"
          >
            <!-- Sender tag -->
            <span class="text-[10px] text-term-text/50 mb-1 px-1 font-semibold select-none">
              {{ msg.sender }}
            </span>
            <!-- Message container -->
            <div 
              class="max-w-md md:max-w-lg px-4 py-2 border rounded text-xs leading-relaxed break-words whitespace-pre-wrap select-text"
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
          @submit.prevent="sendMessage"
          class="p-4 border-t border-term-border bg-term-bg flex items-center gap-3 shrink-0"
        >
          <!-- Prefix indicator -->
          <span class="text-term-text font-bold text-sm select-none pl-2">&gt;</span>

          <!-- TextInput -->
          <input 
            ref="inputField"
            v-model="messageInput"
            type="text" 
            placeholder="message_"
            class="flex-1 bg-transparent border-none outline-none text-xs text-term-text placeholder-term-text/20 caret-term-text"
            autofocus
          />

          <!-- Send Action Link/Button -->
          <button 
            type="submit" 
            class="text-xs text-term-text hover:text-white font-bold select-none cursor-pointer transition-colors duration-150 px-2"
          >
            [ send ]
          </button>
        </form>
      </main>

    </div>
  </div>
</template>

<style scoped>
/* Scrollbar styling for a retro terminal feel */
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
