
import { useState, useRef, useEffect } from 'react'
import api from '../lib/api'
import { Send, X, Bot, User as UserIcon, Loader2, AlertCircle } from 'lucide-react'
// import ReactMarkdown from 'react-markdown' // Temporarily disabled for stability

interface Message {
  role: 'user' | 'assistant'
  text: string
}

interface ChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ChatWidget = ({ isOpen, onToggle }: ChatWidgetProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Hi! I am your **ResQMeals AI Support**. How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) scrollToBottom()
  }, [messages, isOpen])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMessage }])
    setIsLoading(true)

    try {
        const res = await api.post('/chat/message', {
            message: userMessage,
            history: messages
        })
        setMessages(prev => [...prev, { role: 'assistant', text: res.data.reply }])
    } catch (err) {
        console.error('Chat error:', err)
        setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error. Please try again later.' }])
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <div className={`fixed bottom-24 right-6 z-50 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95 pointer-events-none'}`}>
      <div className="w-80 sm:w-[400px] h-[550px] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden ring-1 ring-slate-900/5">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-xl">
                 <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                 <p className="font-bold text-sm leading-none mb-1">ResQ Support AI</p>
                 <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Online 24/7</p>
                 </div>
              </div>
           </div>
           <button 
             onClick={onToggle}
             className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
           >
              <X className="w-5 h-5" />
           </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scrollbar-hide bg-slate-50/50">
           {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                 <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-orange-100 text-orange-600' : 'bg-slate-900 text-white'}`}>
                       {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${msg.role === 'user' ? 'bg-orange-500 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                       {msg.role === 'user' ? (
                           msg.text
                       ) : (
                           <div className="markdown-content whitespace-pre-wrap leading-relaxed">
                               {msg.text.split('\n').map((line, i) => (
                                   <p key={i} className="mb-2 last:mb-0">
                                       {line.split('**').map((part, j) => 
                                           j % 2 === 1 ? <strong key={j} className="font-bold text-orange-600">{part}</strong> : part
                                       )}
                                   </p>
                               ))}
                           </div>
                       )}
                    </div>
                 </div>
              </div>
           ))}
           {isLoading && (
              <div className="flex justify-start animate-in fade-in duration-300">
                 <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center">
                       <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm rounded-tl-none">
                       <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    </div>
                 </div>
              </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
           <div className="relative group">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="w-full pl-4 pr-12 py-3 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-orange-500 transition-all outline-none text-sm"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1.5 p-1.5 bg-slate-900 text-white rounded-xl hover:bg-orange-500 disabled:bg-slate-200 transition-all shadow-lg active:scale-95"
              >
                 <Send className="w-4 h-4" />
              </button>
           </div>
        </form>
      </div>
    </div>
  )
}

export default ChatWidget

