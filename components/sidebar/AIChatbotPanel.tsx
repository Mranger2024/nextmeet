'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Mic, StopCircle, Info } from 'lucide-react'
import dynamic from 'next/dynamic'
// Removed unused imports: supabase and toast

const loadingAnimation = '/animations/loading-animation.json'

const LottieWrapper = dynamic(() => import('../animations/LottieWrapper'), { ssr: false })

const idleAnimation = '/animations/bot-animation.json'
// Removed unused variable: typingAnimation
const welcomeAnimation = '/animations/welcome-animation.json'
import { websiteKnowledge } from '@/lib/services/websiteKnowledge'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const AIChatbotPanel = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isAnimationsLoaded, setIsAnimationsLoaded] = useState(false)
  // Using setAnimationState but not reading animationState directly
  const [, setAnimationState] = useState<'welcome' | 'idle' | 'typing' | 'listening' | 'error'>('welcome')

  useEffect(() => {
    setIsAnimationsLoaded(true)
  }, [])


  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3
  const [currentModel, setCurrentModel] = useState<string>("google/gemini-2.0-pro-exp-02-05:free")
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [isKnowledgeBaseInitialized, setIsKnowledgeBaseInitialized] = useState(false)
  
  // Define fallback models to try if the primary model fails
  const models = [
    "google/gemini-2.0-pro-exp-02-05:free",
    "anthropic/claude-3-haiku-20240307:free",
    "openai/gpt-3.5-turbo:free"
  ]
  
  const recognition = useRef<SpeechRecognition | null>(null)
  const messageEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognition.current = new SpeechRecognition()
      recognition.current.continuous = true
      recognition.current.interimResults = true

      recognition.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0] as SpeechRecognitionAlternative)
          .map(result => result.transcript)
          .join('')
        setInput(transcript)
        setRetryCount(0) // Reset retry count on successful recognition
      }

      recognition.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error)
        
        if (event.error === 'network') {
          setError('Network connection issue. Please check your internet connection.')
          if (retryCount < maxRetries) {
            setRetryCount(prev => prev + 1)
            // Attempt to restart recognition after a delay
            setTimeout(() => {
              if (recognition.current && isListening) {
                recognition.current.stop()
                recognition.current.start()
              }
            }, 2000 * (retryCount + 1)) // Exponential backoff
          } else {
            setError('Speech recognition failed after multiple attempts. Please try again later.')
            setIsListening(false)
          }
        } else {
          setError(`Speech recognition failed: ${event.error}`)
          setIsListening(false)
        }
      }

      recognition.current.onend = () => {
        // Only restart if still listening and not due to max retries
        if (isListening && retryCount < maxRetries) {
          recognition.current?.start()
        }
      }
    }
  }, [isListening, retryCount])

  // Initialize website knowledge base
  useEffect(() => {
    const initializeKnowledgeBase = async () => {
      try {
        await websiteKnowledge.initialize();
        setIsKnowledgeBaseInitialized(true);
        console.log('Website knowledge base initialized');
      } catch (error) {
        console.error('Failed to initialize knowledge base:', error);
        setError('Failed to initialize website knowledge. Some features may be limited.');
      }
    };
    
    initializeKnowledgeBase();
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const toggleListening = () => {
    if (!recognition.current) {
      setError('Speech recognition is not supported in your browser')
      return
    }

    if (isListening) {
      recognition.current.stop()
      setIsListening(false)
      setRetryCount(0) // Reset retry count when stopping
    } else {
      setError(null)
      setRetryCount(0) // Reset retry count when starting
      recognition.current.start()
      setIsListening(true)
    }
  }

  const cancelRequest = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
    setAnimationState('idle');
      setError('Request cancelled');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    setAnimationState('typing');
  
    const userMessage = { role: "user", content: input.trim() } as Message;
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);
    
    // Reset retry count when sending a new message
    setRetryCount(0);
    
    // Create a new AbortController for this request
    const controller = new AbortController();
    setAbortController(controller);
    
    // Try to send the message with exponential backoff
    await sendMessageWithRetry(userMessage, controller);
  };
  
  // Function to enhance user query with website knowledge
  const enhanceWithWebsiteKnowledge = async (query: string): Promise<string | null> => {
    if (!isKnowledgeBaseInitialized) return null;
    
    try {
      // Search for relevant content based on user query
      const searchResults = await websiteKnowledge.searchContent(query);
      
      if (searchResults.length === 0) return null;
      
      // Format the top 3 most relevant results
      const topResults = searchResults.slice(0, 3);
      let contextInfo = 'Here is some information from our website that might help answer this query:\n\n';
      
      topResults.forEach((result, index) => {
        contextInfo += `${index + 1}. ${result.content.title}:\n${result.content.content}\n\n`;
      });
      
      return contextInfo;
    } catch (error) {
      console.error('Error enhancing query with website knowledge:', error);
      return null;
    }
  };

  const sendMessageWithRetry = async (userMessage: Message, controller: AbortController) => {
    try {
      // If we've tried all models and still failing, give up
      if (retryCount >= models.length * maxRetries) {
        throw new Error("All available AI models are currently at capacity. Please try again later.");
      }
      
      // Select model based on retry count
      const modelIndex = Math.floor(retryCount / maxRetries);
      const modelToUse = models[modelIndex] || models[0];
      
      if (modelToUse !== currentModel) {
        setCurrentModel(modelToUse);
        console.log(`Switching to fallback model: ${modelToUse}`);
      }
      
      // Enhance user query with website knowledge if possible
      const websiteContext = await enhanceWithWebsiteKnowledge(userMessage.content);
      
      // Prepare messages array with system instructions and context
      const messagePayload = [...messages];
      
      // Add system message with website context if available
      if (websiteContext) {
        messagePayload.push({
          role: 'system',
          content: `You are an AI assistant for our subscription platform. Use the following information from our website to help answer the user's question: ${websiteContext}`
        } as Message);
      } else {
        // Add a default system message if no specific context is available
        messagePayload.push({
          role: 'system',
          content: 'You are an AI assistant for our subscription platform. You help users with questions about our video chat, messaging, and other features.'
        } as Message);
      }
      
      // Add the user message
      messagePayload.push(userMessage);
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: new Headers({
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "",
          "X-Title": process.env.NEXT_PUBLIC_SITE_NAME || "",
          "Content-Type": "application/json",
        }),
        signal: controller.signal,
        body: JSON.stringify({
          model: modelToUse,
          messages: messagePayload.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });
  
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        const errorData = JSON.parse(errorText);
        console.log("API Error:", errorData);
        
        // Check if it's a rate limit error (429)
        if (response.status === 429) {
          // Increment retry count and try again with exponential backoff
          setRetryCount(prev => prev + 1);
          
          // Calculate backoff time (exponential with jitter)
          const baseDelay = 1000; // 1 second
          const maxDelay = 10000; // 10 seconds
          const retryAttempt = retryCount % maxRetries;
          const exponentialDelay = Math.min(maxDelay, baseDelay * Math.pow(2, retryAttempt));
          const jitter = Math.random() * 0.3 * exponentialDelay; // Add up to 30% jitter
          const delay = exponentialDelay + jitter;
          
          // Show user-friendly message about retrying
          setError(`AI service is busy. Trying again in ${Math.round(delay/1000)} seconds...`);
          
          // Wait and retry
          setTimeout(() => {
            if (!controller.signal.aborted) {
              sendMessageWithRetry(userMessage, controller);
            }
          }, delay);
          return;
        }
        
        // Handle other API errors
        if (errorData?.error?.message) {
          throw new Error(`AI service error: ${errorData.error.message}`);
        } else {
          throw new Error(`Failed to get response from AI: ${errorText}`);
        }
      }
  
      const data = await response.json();
      console.log("API Response:", data);
  
      // Check for error response
      if (data.error) {
        throw new Error(data.error.message || 'API Error');
      }

      // Handle successful response
      if (!data.choices?.[0]?.message?.content) {
        console.error('Unexpected API response format:', JSON.stringify(data));
        throw new Error('Received invalid or empty response from AI');
      }

      const content = data.choices[0].message.content;
      const assistantMessage = {
        role: 'assistant',
        content: typeof content === 'string' ? content : content[0]?.text || 'No response from AI'
      } as Message;
  
      setMessages((prev) => [...prev, assistantMessage]);
      setRetryCount(0); // Reset retry count on success
      setIsLoading(false);
    setAnimationState('idle'); // Reset loading state after successful response
      setAbortController(null); // Clear the abort controller
    } catch (err: unknown) {
      console.error("Error:", err);
      
      // Check if the request was aborted
      if ((err as Error).name === 'AbortError') {
        console.log('Request was cancelled');
        setIsLoading(false);
    setAnimationState('idle'); // Ensure loading state is reset when request is cancelled
        return;
      }
      
      // If we haven't exhausted all retries for all models
      if (retryCount < models.length * maxRetries) {
        setRetryCount(prev => prev + 1);
        
        // Calculate backoff time
        const baseDelay = 500;
        const maxDelay = 10000;
        const retryAttempt = retryCount % maxRetries;
        const delay = Math.min(maxDelay, baseDelay * Math.pow(2, retryAttempt));
        
        // Show user-friendly message
        const modelIndex = Math.floor((retryCount + 1) / maxRetries);
        const nextModel = models[modelIndex];
        
        if (nextModel && nextModel !== currentModel) {
          setError(`Trying alternative AI model in ${Math.round(delay/1000)} seconds...`);
        } else {
          setError(`Please Wait a minute ${Math.round(delay/500)} seconds...`);
        }
        
        // Wait and retry
        setTimeout(() => {
          if (!controller.signal.aborted) {
            sendMessageWithRetry(userMessage, controller);
          } else {
            setIsLoading(false);
    setAnimationState('idle'); // Reset loading state if aborted during timeout
          }
        }, delay);
      } else {
        // We've exhausted all retries, show a friendly error
        setError(
          "All AI services are currently at capacity. Please try again later. " +
          "This is typically a temporary issue due to high demand."
        );
        setIsLoading(false);
    setAnimationState('idle');
        setAbortController(null); // Clear the abort controller
      }
    } finally {
      // Always reset loading state if we've exhausted all retries
      if (retryCount >= models.length * maxRetries) {
        setIsLoading(false);
    setAnimationState('idle');
        setAbortController(null);
      }
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-blue900 backdrop-blur-2xl text-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Welcome Message with Bot Animation */}
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 space-y-6 animate-fadeIn">
          <div className="w-48 h-48 relative">
            <div className="absolute inset-0 rounded-full blur-xl" />
            {isAnimationsLoaded && <LottieWrapper animationPath={idleAnimation} />}
          </div>
          <h2 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient">
            Welcome to AI Assistant
          </h2>
          <p className="text-gray-400 text-center max-w-md leading-relaxed">
            I&apos;m your personal AI assistant, ready to help with any questions about our platform.
            I&apos;m knowledgeable about our features, pricing, and how to use our services.
          </p>
          <div className="flex items-center gap-2 text-blue-400 text-sm mt-2">
            <Info size={16} />
            <span>Try asking about our video chat, messaging features, or subscription plans!</span>
          </div>
        </div>
      )}
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideIn`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 mr-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                <div className="w-6 h-6">
                  <LottieWrapper animationPath={welcomeAnimation} />
                </div>
              </div>
            )}
            <div
              className={`max-w-[100%] p-4 rounded-2xl shadow-lg ${message.role === 'user'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm'
                : 'bg-gradient-to-r from-gray-800 to-gray-900 text-gray-200 text-sm'
              } backdrop-blur-sm`}
            >
              <p className="leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-slideIn">
            <div className="w-8 h-8 mr-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
              <div className="w-6 h-6">
                <LottieWrapper animationPath={loadingAnimation} />
              </div>
            </div>
            <div className="max-w-[80%] p-4 rounded-2xl bg-gradient-to-r from-gray-800 to-gray-900 text-gray-200 shadow-lg backdrop-blur-sm">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                  </div>
                  <button
                    onClick={cancelRequest}
                    className="ml-4 px-2 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors"
                    aria-label="Cancel request"
                  >
                    X
                  </button>
                </div>
                {error && (
                  <p className="text-sm text-grey-800">{error}</p>
                )}
                {currentModel !== models[0] && (
                  <p className="text-xs text-gray-400">Using alternative AI model: {currentModel.split('/')[0]}</p>
                )}
              </div>
            </div>
          </div>
        )}
        {!isLoading && error && (
          <div className="flex justify-center my-2">
            <div className="px-4 py-2 bg-grey-800/50 text-grey-400 rounded-lg text-sm">
              {error}
              <button 
                onClick={() => setError(null)} 
                className="ml-2 text-grey-500 hover:text-grey-500"
                aria-label="Dismiss error"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        <div ref={messageEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800/50 bg-gray-900/50 backdrop-blur-md">
        <div className="relative flex items-end space-x-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-2 border border-gray-700/50 shadow-lg">
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              e.target.style.height = '24px'
              e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-transparent text-white p-3 resize-none focus:outline-none min-h-[24px] max-h-[96px] placeholder-gray-500 overflow-y-auto"
            style={{ height: '24px' }}
            disabled={isLoading}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-2">
            <button
              onClick={toggleListening}
              className={`p-2 rounded-lg transition-all transform hover:scale-105 ${isListening
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
              } shadow-lg`}
              disabled={isLoading}
            >
              {isListening ? <StopCircle size={20} /> : <Mic size={20} />}
            </button>
            <button
              onClick={sendMessage}
              className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              disabled={!input.trim() || isLoading}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIChatbotPanel