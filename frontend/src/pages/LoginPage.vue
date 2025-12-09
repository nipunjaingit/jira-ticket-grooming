<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-vue-next'
import Spinner from '../components/ui/Spinner.vue'
import api from '../services/api'

const email = ref('')
const apiToken = ref('')
const router = useRouter()
const loading = ref(false)
const error = ref(null)

const handleLogin = async () => {
  if (!email.value || !apiToken.value) {
    error.value = 'Please enter both email and API token'
    return
  }

  loading.value = true
  error.value = null

  try {
    const auth = btoa(`${email.value}:${apiToken.value}`)
    
    // Verify credentials by fetching myself profile
    await api.validateAuth(auth)
    
    localStorage.setItem('jiraAuth', auth)
    router.push('/projects')
  } catch (e) {
    console.error(e)
    if (e.response?.status === 401) {
      error.value = 'Invalid credentials. Please check your email and token.'
    } else {
      error.value = 'Connection failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
    <div class="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
      <div class="p-8">
        <div class="text-center mb-8">
          <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock class="w-8 h-8 text-blue-600" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p class="text-gray-500 mt-2">Enter your Jira credentials to continue</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div v-if="error" class="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle class="w-4 h-4" />
            {{ error }}
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                v-model="email" 
                type="email" 
                required
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="you@company.com"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">API Token</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                v-model="apiToken" 
                type="password" 
                required
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="••••••••••••••••••••••••"
              />
            </div>
            <p class="mt-1 text-xs text-gray-500">
              Create one at <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" class="text-blue-600 hover:underline">Atlassian Security Settings</a>
            </p>
          </div>

          <button 
            type="submit" 
            :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Spinner v-if="loading" size="sm" color="text-white" />
            <span v-else>Connect to Jira</span>
            <ArrowRight v-if="!loading" class="w-4 h-4" />
          </button>
        </form>
      </div>
      <div class="bg-gray-50 px-8 py-4 text-center text-xs text-gray-500 border-t">
        Securely connects directly to your Jira instance
      </div>
    </div>
  </div>
</template>
