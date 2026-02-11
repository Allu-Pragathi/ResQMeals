

const faqMessages = [
  { sender: 'system', text: 'Hi! I am the AI Assistant (Planned Feature).' },
  { sender: 'system', text: 'Ask about donation steps, NGO matching, or pickups.' },
  { sender: 'user', text: 'How do donors schedule a pickup?' },
  { sender: 'system', text: 'They submit a form with time window and location.' },
]

interface ChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ChatWidget = ({ isOpen, onToggle }: ChatWidgetProps) => {
  return (
    <div className={`fixed bottom-20 right-4 z-40 transition-all duration-300 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
      <div className="mb-3 w-80 rounded-2xl bg-white shadow-2xl border border-slate/10">
        <div className="flex items-center justify-between border-b border-slate/10 px-4 py-3 bg-primary/5 rounded-t-2xl">
          <div>
            <p className="text-sm font-semibold text-slate">AI Assistant</p>
            <p className="text-xs text-slate/60">Ask me anything about ResQMeals</p>
          </div>
          <button
            type="button"
            className="text-slate/60 hover:text-slate"
            onClick={onToggle}
            aria-label="Close chat widget"
          >
            ✕
          </button>
        </div>
        <div className="max-h-64 space-y-3 overflow-y-auto px-4 py-3 text-sm">
          {faqMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
            >
              <span
                className={`rounded-2xl px-3 py-2 ${msg.sender === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-soft text-slate'
                  }`}
              >
                {msg.text}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-slate/10 px-4 py-3 text-xs text-slate/60 bg-slate-50 rounded-b-2xl">
          AI responses coming soon.
        </div>
      </div>
    </div>
  )
}

export default ChatWidget
