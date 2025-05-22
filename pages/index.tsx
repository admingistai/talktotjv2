import { useState, useRef, useEffect } from 'react';


export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null); // ⬅️ this creates the scroll anchor

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]); // ⬅️ this triggers auto-scroll whenever messages update

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages }),
    });

    const data = await res.json();
    setMessages([...newMessages, data.choices[0].message]);
  }
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 py-6">
      {/* Header */}
      <h1 className="text-4xl font-bold mb-4">Talk to TJ</h1>
      <img
        src="/tjanimated.jpg"
        alt="TJ avatar"
        className="w-24 h-24 object-cover rounded-full border-4 border-blue-600 shadow-blue-500/40 shadow-lg mb-2"
      />
      <p className="text-sm text-gray-400 mb-6 text-center">
        Real talk, anytime. Just ask TJ.
      </p>
  
      {/* Chat container */}
      <div className="w-full max-w-xl bg-gray-800 rounded-xl flex flex-col overflow-hidden shadow-lg flex-grow max-h-[70vh]">
        
        {/* Scrollable message box */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-3 rounded-2xl max-w-[75%] ${
                m.role === 'user'
                  ? 'bg-blue-600 self-end ml-auto text-right'
                  : 'bg-gray-700 self-start mr-auto text-left'
              }`}
            >
              <p className="text-sm opacity-60 mb-1">{m.role === 'user' ? 'You' : 'TJ'}</p>
              <p className="text-base">{m.content}</p>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
  
        {/* Chat input at bottom */}
        <form
          onSubmit={handleSubmit}
          className="w-full flex items-center p-4 border-t border-gray-700 bg-gray-900 space-x-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-grow p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}