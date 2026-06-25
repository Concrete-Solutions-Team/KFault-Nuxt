<script setup lang="ts">
import { fi } from '@nuxt/ui/runtime/locale/index.js'
import { PhCross, PhNotEquals, PhPlus, PhX } from '@phosphor-icons/vue'
import { ref, onMounted } from 'vue'
const config = useRuntimeConfig()
const api = config.public.apiUrl

const fileInput = ref<HTMLInputElement | null>(null)

interface Image {
  key: string
  url: string
}

const images = ref<Image[]>([])

const triggetFileInput = () => {
  fileInput.value?.click()
}

const handleFilesLoad = async () => {
  try {
    const data = await $fetch<Image[]>(`${api}/images/list`)

    images.value = data
  } catch (err) {
    console.error(err)
  }
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    // get upload url
    const { uploadUrl } = await $fetch<{ uploadUrl: string }>(`${api}/images/upload/get-url`, {
      method: 'POST',
      body: {
        key: file.name
      }
    })
    console.log("url:", uploadUrl)
    
    // upload file
    const uploadResp = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file
    })

    if (!uploadResp.ok) {
      throw new Error(`Upload failed: ${uploadResp.status}`)
    }
    
    await handleFilesLoad()
  } catch (err) {
    console.error('Error during file upload:', err)
  }
}

const handleFileDelete = async (key: string) => {
  const resp = await $fetch(`${api}/images/delete`, {
    method: 'DELETE',
    body: {
      key: key
    }
  })
  await handleFilesLoad();
  console.log(resp)
}

onMounted(async () => {
  await handleFilesLoad()
})
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <div class="flex flex-wrap gap-3 mb-4 overflow-scroll">
      <div class="group relative flex justify-center items-center border border-term-border w-37.5" v-for="img in images" >
        <img class="h-auto":key="img.key" :src="img.url" :alt="img.key" />
        <div @click="() => handleFileDelete(img.key)" class="hidden top-0 right-0 absolute group-hover:flex justify-center items-center bg-term-bg border border-term-border w-6 h-6 text-term-text"><PhX /></div>
      </div>
    </div>
    <div @click="triggetFileInput" class="bg-term-panel p-3 border border-term-border hover:border-term-text w-fit transition-colors cursor-pointer">
      <PhPlus size="20px"/>
      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileUpload">
    </div>
  </div>
</template>
