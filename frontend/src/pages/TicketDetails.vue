<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'
import BasicDialog from '../components/BasicDialog.vue'
import Spinner from '../components/ui/Spinner.vue'
import JiraDescription from '../components/jira/JiraDescription.vue'
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft, Sparkles, Calendar, User, Tag, MessageCircle, Download } from 'lucide-vue-next'
import { generateAnalysisPDF } from '../utils/pdfGenerator'

const route = useRoute()
const router = useRouter()
const ticket = ref(null)
const loading = ref(true)
const error = ref(null)
const showAnalysis = ref(false)
const analyzing = ref(false)
const analysisResult = ref(null)
const analysisError = ref(null)
const downloadingPDF = ref(false)
const pdfDownloadError = ref(null)

const fetchTicket = async () => {
  try {
    const auth = localStorage.getItem('jiraAuth')
    if (!auth) return router.push('/')
    ticket.value = await api.getIssueDetails(auth, route.params.id)
  } catch (e) {
    error.value = e.message
    if (e.response?.status === 401) router.push('/')
  } finally {
    loading.value = false
  }
}

const runAnalysis = async () => {
  analyzing.value = true
  analysisError.value = null
  analysisResult.value = null
  showAnalysis.value = true
  
  try {
    const result = await api.analyzeTicket(ticket.value, '') 
    analysisResult.value = result
  } catch (e) {
    analysisError.value = e.response?.data?.error || e.message
  } finally {
    analyzing.value = false
  }
}

const downloadPDF = async () => {
  downloadingPDF.value = true
  pdfDownloadError.value = null
  
  try {
    if (!ticket.value || !analysisResult.value) {
      throw new Error('Missing ticket or analysis data')
    }
    await generateAnalysisPDF(ticket.value, analysisResult.value)
    // Show success notification
    if (window.$notify) {
      window.$notify.success({
        group: 'BEV',
        title: '',
        text: 'PDF downloaded successfully!'
      })
    }
  } catch (e) {
    console.error('PDF download failed:', e)
    pdfDownloadError.value = e.message
    if (window.$notify) {
      window.$notify.error({
        group: 'BEV',
        title: '',
        text: `PDF download failed: ${e.message}`
      })
    }
  } finally {
    downloadingPDF.value = false
  }
}

onMounted(fetchTicket)
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Back Button -->
      <button 
        @click="router.back()" 
        class="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft class="w-4 h-4 mr-2" />
        Back to Issues
      </button>

      <div v-if="loading" class="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
      
      <div v-else-if="error" class="p-4 text-red-600 bg-red-50 rounded-lg border border-red-100 flex items-center gap-3">
        <AlertCircle class="w-5 h-5" />
        {{ error }}
      </div>

      <div v-else-if="ticket" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <!-- Header -->
        <div class="border-b border-gray-100 p-6 sm:p-8">
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div class="flex items-center gap-3 mb-3">
                <span class="text-sm font-mono text-gray-500">{{ ticket.key }}</span>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  {{ ticket.fields.status.name }}
                </span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{{ ticket.fields.summary }}</h1>
            </div>
            <button 
              @click="runAnalysis"
              class="shrink-0 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-medium"
            >
              <Sparkles class="w-4 h-4" />
              AI Analysis
            </button>
          </div>

          <!-- Meta Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8 pt-6 border-t border-gray-50">
            <div>
              <span class="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Assignee</span>
              <div class="flex items-center gap-2 text-gray-900 font-medium">
                <User class="w-4 h-4 text-gray-400" />
                {{ ticket.fields.assignee ? ticket.fields.assignee.displayName : 'Unassigned' }}
              </div>
            </div>
            <div>
              <span class="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Priority</span>
              <div class="flex items-center gap-2 text-gray-900 font-medium">
                <Tag class="w-4 h-4 text-gray-400" />
                {{ ticket.fields.priority.name }}
              </div>
            </div>
            <div>
              <span class="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Type</span>
              <div class="flex items-center gap-2 text-gray-900 font-medium">
                <div class="w-4 h-4 rounded bg-gray-200"></div> <!-- Placeholder icon -->
                {{ ticket.fields.issuetype.name }}
              </div>
            </div>
            <div>
              <span class="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Created</span>
              <div class="flex items-center gap-2 text-gray-900 font-medium">
                <Calendar class="w-4 h-4 text-gray-400" />
                {{ new Date(ticket.fields.created).toLocaleDateString() }}
              </div>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 sm:p-8 bg-gray-50/50 min-h-[300px]">
          <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Description</h3>
          <div class="prose prose-blue max-w-none bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <JiraDescription :description="ticket.fields.description" />
          </div>
        </div>
      </div>

      <BasicDialog :open="showAnalysis" @close="showAnalysis = false">
        <div class="p-6 sm:p-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles class="w-6 h-6 text-purple-600" />
              AI Grooming Report
            </h2>
            <button
              v-if="analysisResult && !analyzing"
              @click="downloadPDF"
              :disabled="downloadingPDF"
              class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              :title="downloadingPDF ? 'Generating PDF...' : 'Download as PDF'"
            >
              <Download class="w-4 h-4" />
              <span class="hidden sm:inline">{{ downloadingPDF ? 'Generating...' : 'Download PDF' }}</span>
              <span class="sm:hidden">PDF</span>
            </button>
          </div>
          
          <div v-if="analyzing" class="flex flex-col items-center justify-center py-16">
            <Spinner size="xl" color="text-purple-600" class="mb-6" />
            <p class="text-gray-600 font-medium animate-pulse">Analyzing ticket requirements...</p>
            <p class="text-sm text-gray-400 mt-2">This may take a few seconds</p>
          </div>

          <div v-else-if="analysisError" class="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-start gap-3">
            <AlertCircle class="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p class="font-bold">Analysis Failed</p>
              <p class="text-sm mt-1">{{ analysisError }}</p>
            </div>
          </div>

          <div v-else-if="analysisResult" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <!-- Score & Summary -->
            <div class="grid md:grid-cols-3 gap-4">
              <div class="md:col-span-2 bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h3 class="font-bold text-purple-900 mb-2 text-sm uppercase tracking-wider">Executive Summary</h3>
                <p class="text-purple-800 leading-relaxed">{{ analysisResult.summary }}</p>
              </div>
              <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col items-center justify-center text-center">
                <h3 class="font-bold text-blue-900 mb-1 text-sm uppercase tracking-wider">Quality Score</h3>
                <div class="text-4xl font-bold text-blue-600 mb-1">{{ analysisResult.score }}/100</div>
                <div class="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div class="bg-blue-600 h-2 rounded-full transition-all duration-1000" :style="{ width: `${analysisResult.score}%` }"></div>
                </div>
              </div>
            </div>

            <!-- Analysis Grid -->
            <div class="grid md:grid-cols-2 gap-8">
              <!-- Good Points -->
              <div v-if="analysisResult.goodPoints?.length">
                <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 class="w-5 h-5 text-green-600" />
                  Good Points
                </h3>
                <ul class="space-y-3">
                  <li v-for="(point, i) in analysisResult.goodPoints" :key="i" class="flex items-start gap-3 text-gray-700 bg-white p-3 rounded border border-gray-100 shadow-sm">
                    <div class="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></div>
                    <span class="leading-relaxed">{{ point }}</span>
                  </li>
                </ul>
              </div>

              <!-- Missing Points -->
              <div v-if="analysisResult.missingPoints?.length">
                <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle class="w-5 h-5 text-red-500" />
                  Missing Information
                </h3>
                <ul class="space-y-3">
                  <li v-for="(point, i) in analysisResult.missingPoints" :key="i" class="flex items-start gap-3 text-gray-700 bg-white p-3 rounded border border-gray-100 shadow-sm">
                    <div class="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0"></div>
                    <span class="leading-relaxed">{{ point }}</span>
                  </li>
                </ul>
              </div>

              <!-- Mismatches -->
              <div v-if="analysisResult.mismatches?.length" class="md:col-span-2">
                <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle class="w-5 h-5 text-orange-500" />
                  Contradictions & Mismatches
                </h3>
                <ul class="space-y-3">
                  <li v-for="(point, i) in analysisResult.mismatches" :key="i" class="flex items-start gap-3 text-gray-700 bg-white p-3 rounded border border-gray-100 shadow-sm">
                    <div class="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0"></div>
                    <span class="leading-relaxed">{{ point }}</span>
                  </li>
                </ul>
              </div>

              <!-- UI Suggestions -->
              <div v-if="analysisResult.uiSuggestions?.length">
                <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles class="w-5 h-5 text-purple-500" />
                  UI/UX Suggestions
                </h3>
                <ul class="space-y-3">
                  <li v-for="(s, i) in analysisResult.uiSuggestions" :key="i" class="flex items-start gap-3 text-gray-700 bg-white p-3 rounded border border-gray-100 shadow-sm">
                    <div class="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></div>
                    <span class="leading-relaxed">{{ s }}</span>
                  </li>
                </ul>
              </div>

              <!-- Technical Suggestions -->
              <div v-if="analysisResult.technicalSuggestions?.length">
                <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag class="w-5 h-5 text-blue-500" />
                  Technical Suggestions
                </h3>
                <ul class="space-y-3">
                  <li v-for="(s, i) in analysisResult.technicalSuggestions" :key="i" class="flex items-start gap-3 text-gray-700 bg-white p-3 rounded border border-gray-100 shadow-sm">
                    <div class="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                    <span class="leading-relaxed">{{ s }}</span>
                  </li>
                </ul>
              </div>

              <!-- ACs -->
              <div class="md:col-span-2">
                <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 class="w-5 h-5 text-green-600" />
                  Refined Acceptance Criteria
                </h3>
                <ul class="space-y-3">
                  <li v-for="(ac, i) in analysisResult.acceptanceCriteria" :key="i" class="flex items-start gap-3 text-gray-700 bg-white p-3 rounded border border-gray-100 shadow-sm">
                    <div class="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></div>
                    <span class="leading-relaxed">{{ ac }}</span>
                  </li>
                </ul>
              </div>

              <!-- Clarifying Questions -->
              <div v-if="analysisResult.questions?.length" class="md:col-span-2">
                <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageCircle class="w-5 h-5 text-cyan-500" />
                  Clarifying Questions
                </h3>
                <ul class="space-y-3">
                  <li v-for="(q, i) in analysisResult.questions" :key="i" class="flex items-start gap-3 text-gray-700 bg-white p-3 rounded border border-gray-100 shadow-sm">
                    <div class="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 shrink-0"></div>
                    <span class="leading-relaxed">{{ q }}</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <!-- Story Points -->
             <div v-if="analysisResult.storyPoints" class="flex items-center justify-between bg-gray-900 text-white p-4 rounded-lg shadow-lg">
              <div class="flex items-center gap-3">
                <div class="bg-white/20 p-2 rounded">
                  <Tag class="w-5 h-5" />
                </div>
                <div>
                  <p class="text-xs text-gray-400 uppercase tracking-wider font-bold">Estimated Effort</p>
                  <p class="font-medium">Story Points</p>
                </div>
              </div>
              <div class="text-3xl font-bold font-mono">{{ analysisResult.storyPoints }}</div>
            </div>
          </div>
        </div>
      </BasicDialog>
    </div>
  </div>
</template>
