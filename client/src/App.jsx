import React from 'react'
import { QueryBuilder } from './components/QueryBuilder'

function App() {
  return (
    <div className="container mx-auto min-h-screen bg-background text-foreground">
      <QueryBuilder />
      
      <div className="text-center mt-8 pb-4">
        <a 
          href="https://iterating.gith" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-zinc-400 hover:text-zinc-300 text-sm"
        >
          Designed and Built by Jonathan Young (iterating) |
        </a> 
        <a 
          href="https://tableaucleaner.vercel.app"
          target="_blank" 
          rel="noopener noreferrer"
          className="text-zinc-400 hover:text-zinc-300 text-sm mr-2"
        >
          | Tableau Data Cleaner App
        </a>
      </div>
    </div>
  )
}

export default App
