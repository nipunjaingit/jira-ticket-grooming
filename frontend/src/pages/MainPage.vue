<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Filter, LogOut, ChevronRight, Calendar, User, ChevronLeft } from 'lucide-vue-next'
import api from '../services/api'
import Spinner from '../components/ui/Spinner.vue'

const router = useRouter()
const projects = ref([])
const issues = ref([])
const selectedProject = ref(null)
const loading = ref(false)
const searchQuery = ref('')

// Pagination
const startAt = ref(0)
const maxResults = ref(20)
const total = ref(0)
const nextPageToken = ref(null)
const isLast = ref(false)
const loadMoreTrigger = ref(null)

const fetchProjects = async () => {
  const auth = localStorage.getItem('jiraAuth')
  if (!auth) return router.push('/')
  try {
    projects.value = await api.getProjects(auth)
    if (projects.value.length > 0) {
      selectedProject.value = projects.value[0].id
    }
  } catch (e) {
    console.error(e)
    if (e.response?.status === 401) {
      localStorage.removeItem('jiraAuth')
      router.push('/')
    }
  }
}

const fetchIssues = async (isLoadMore = false) => {
  if (!selectedProject.value) return
  loading.value = true
  const auth = localStorage.getItem('jiraAuth')
  try {
    let jql = ''
    if (searchQuery.value) {
      jql = `summary ~ "${searchQuery.value}" OR description ~ "${searchQuery.value}"`
    }
    
    const startAtParam = (isLoadMore && nextPageToken.value !== null) ? nextPageToken.value : 0
    console.log('Fetching issues:', { isLoadMore, startAtParam, nextPageToken: nextPageToken.value })
    
    const data = await api.getIssues(auth, selectedProject.value, startAtParam, maxResults.value, jql)
    
    if (isLoadMore) {
      const newIssues = data.issues || []
      const existingIds = new Set(issues.value.map(i => i.id))
      const uniqueNewIssues = newIssues.filter(i => !existingIds.has(i.id))
      issues.value = [...issues.value, ...uniqueNewIssues]
    } else {
      issues.value = data.issues || []
    }
    
    total.value = data.total || 0
    isLast.value = data.isLast
    nextPageToken.value = data.nextPageToken
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// Debounce search
let timeout
const handleSearch = () => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    startAt.value = 0 // Reset to first page on search
    fetchIssues()
  }, 500)
}

const loadMore = () => {
  if (!loading.value && !isLast.value && nextPageToken.value) {
    fetchIssues(true)
  }
}

// Intersection Observer for Infinite Scroll
let observer
watch(loadMoreTrigger, (el) => {
  if (observer) observer.disconnect()
  if (el) {
    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore()
      }
    }, { rootMargin: '100px' })
    observer.observe(el)
  }
})

const logout = () => {
  localStorage.removeItem('jiraAuth')
  router.push('/')
}

watch(selectedProject, () => {
  startAt.value = 0
  issues.value = []
  fetchIssues()
})

onMounted(fetchProjects)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h1 class="text-xl font-bold text-gray-900">Ticket Grooming</h1>
          <div class="h-6 w-px bg-gray-200"></div>
          <select 
            v-model="selectedProject" 
            class="block w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option :value="null">Select Project...</option>
            <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }} ({{ p.key }})</option>
          </select>
        </div>
        
        <button @click="logout" class="text-gray-500 hover:text-gray-700 flex items-center gap-2 text-sm font-medium">
          <LogOut class="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Search Bar -->
      <div class="mb-6 flex gap-4" v-if="selectedProject">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            v-model="searchQuery"
            @input="handleSearch"
            type="text" 
            placeholder="Search issues..." 
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <!-- <button class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          <Filter class="w-4 h-4" />
          Filters
        </button> -->
      </div>

      <!-- Empty State -->
      <div v-if="!selectedProject" class="text-center py-20">
        <div class="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Filter class="w-8 h-8 text-blue-600" />
        </div>
        <h3 class="text-lg font-medium text-gray-900">Please select a Project first</h3>
        <p class="text-gray-500 mt-1">Select a Jira project from the dropdown to view tickets.</p>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading && issues.length === 0" class="flex justify-center py-20">
        <Spinner size="lg" />
      </div>

      <!-- Issue List -->
      <div v-else-if="issues.length" class="flex flex-col h-[calc(100vh-220px)]">
        <div class="flex-1 overflow-y-auto space-y-4 pr-2 min-h-0">
          <div 
            v-for="issue in issues" 
            :key="issue.id"
            @click="router.push(`/ticket/${issue.key}`)"
            class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer group"
          >
          <div class="flex justify-between items-start">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-1">
                <span class="text-blue-600 font-medium text-sm group-hover:underline">{{ issue.key }}</span>
                <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {{ issue.fields?.status?.name }}
                </span>
                <span 
                  class="px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="{
                    'bg-red-100 text-red-800': issue.fields?.priority?.name === 'High' || issue.fields?.priority?.name === 'Highest',
                    'bg-yellow-100 text-yellow-800': issue.fields?.priority?.name === 'Medium',
                    'bg-green-100 text-green-800': issue.fields?.priority?.name === 'Low' || issue.fields?.priority?.name === 'Lowest'
                  }"
                >
                  {{ issue.fields?.priority?.name }}
                </span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 truncate pr-4">{{ issue.fields?.summary }}</h3>
            </div>
            <ChevronRight class="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          </div>
          
          <div class="mt-4 flex items-center gap-6 text-sm text-gray-500">
            <div class="flex items-center gap-2">
              <User class="w-4 h-4" />
              <span>{{ issue.fields?.assignee ? issue.fields.assignee.displayName : 'Unassigned' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Calendar class="w-4 h-4" />
              <span>{{ issue.fields?.created ? new Date(issue.fields.created).toLocaleDateString() : '' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="capitalize">{{ issue.fields?.issuetype?.name }}</span>
            </div>
          </div>
        </div>

        <!-- Loading More Indicator -->
        <div v-if="loading && issues.length > 0" class="py-4 flex justify-center">
          <Spinner size="sm" />
        </div>
        
        <!-- Infinite Scroll Trigger -->
        <div ref="loadMoreTrigger" class="h-4"></div>
        </div>
      </div>      <!-- No Results -->
      <div v-else class="text-center py-20">
        <p class="text-gray-500">No issues found matching your criteria.</p>
      </div>
    </main>
  </div>
</template>
