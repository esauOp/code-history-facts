"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { setupCloseTabListener } from "@/lib/browser-utils"
import { useBrowserDetection } from "@/hooks/use-browser-detection"
import { useEphemeris } from "@/hooks/use-ephemeris"
import { useEphemerisGenerator } from "@/hooks/use-ephemeris-generator"
import type { Ephemeris } from "@/lib/supabase"



export default function ProgrammingEphemeris() {
  const [currentTime, setCurrentTime] = useState("")
  const [todayEphemeris, setTodayEphemeris] = useState<Ephemeris | null>(null)
  const [bootSequence, setBootSequence] = useState(0)
  const [programOutput, setProgramOutput] = useState("")
  const [isExecuting, setIsExecuting] = useState(false)
  const [userInput, setUserInput] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Hook para detección del explorador
  const { isClient, closeTabShortcut } = useBrowserDetection()
  
  // Hook para efemérides desde Supabase
  const { 
    ephemerides, 
    loading: ephemeridesLoading, 
    error: ephemeridesError,
    getTodayEphemeris,
    getRandomEphemeris,
    fetchEphemerides
  } = useEphemeris()
  
  // Hook para generación de efemérides
  const {
    generating,
    error: generationError,
    success: generationSuccess,
    generateTomorrowEphemeris,
    clearMessages
  } = useEphemerisGenerator()

  useEffect(() => {
    const bootMessages = [
      "NOSTROMO MAINFRAME v2.1.7",
      "Initializing system...",
      "Loading ephemeris database...",
      "Connecting to historical archives...",
      "System ready.",
      "",
    ]

    bootMessages.forEach((message, index) => {
      setTimeout(() => {
        setBootSequence(index + 1)
      }, index * 800)
    })

    setTimeout(() => {
      setIsExecuting(true)
    }, bootMessages.length * 800)
  }, [])

  useEffect(() => {
    const timeInterval = setInterval(() => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString("es-ES", {
          hour12: false,
          timeZone: "Europe/Madrid",
        }),
      )
    }, 1000)

    return () => clearInterval(timeInterval)
  }, [])

  // Actualizar efeméride del día cuando se cargan los datos
  useEffect(() => {
    if (!ephemeridesLoading && ephemerides.length > 0) {
      const todayEphemeris = getTodayEphemeris()
      if (todayEphemeris) {
        setTodayEphemeris(todayEphemeris)
      } else {
        // Si no hay efeméride para hoy, usar una aleatoria
        const randomEphemeris = getRandomEphemeris()
        setTodayEphemeris(randomEphemeris)
      }
    }
  }, [ephemeridesLoading, ephemerides, getTodayEphemeris, getRandomEphemeris])

  useEffect(() => {
    if (isExecuting && todayEphemeris) {
      const executionSteps = [
        "$ ./ephemeris_query --date=today",
        "Querying database...",
        "Found entry:",
        "",
        `DATE: ${todayEphemeris.day}/${todayEphemeris.month}/${todayEphemeris.year}`,
        `EVENT: ${todayEphemeris.event}`,
        "",
        `DISPLAY DATE:`,
        todayEphemeris.display_date,
        "",
        "Query completed successfully.",
        "",
      ]

      let stepIndex = 0
      const executeStep = () => {
        if (stepIndex < executionSteps.length) {
          setProgramOutput((prev) => prev + (prev ? "\n" : "") + executionSteps[stepIndex])
          stepIndex++
          setTimeout(executeStep, stepIndex === 1 ? 1500 : stepIndex === 2 ? 1000 : 300)
        }
      }

      executeStep()
    }
  }, [isExecuting, todayEphemeris])

  // Configurar listener para cerrar pestaña con atajo de teclado
  useEffect(() => {
    if (isClient) {
      const cleanup = setupCloseTabListener()
      return cleanup
    }
  }, [isClient])

  const handleCommand = (command: string) => {
    const cmd = command.toLowerCase().trim()
    setCommandHistory((prev) => [...prev, `$ ${command}`])

    switch (cmd) {
      case "clear":
        setProgramOutput("")
        setCommandHistory([])
        break
      case "help":
        setCommandHistory((prev) => [...prev, "Available commands: clear, help, date, reload, refresh-db"])
        break
      case "date":
        setCommandHistory((prev) => [...prev, new Date().toString()])
        break
      case "reload":
        window.location.reload()
        break
      case "refresh-db":
        setCommandHistory((prev) => [...prev, "Refreshing ephemeris database..."])
        fetchEphemerides()
        setCommandHistory((prev) => [...prev, "Database refreshed successfully"])
        break
      default:
        setCommandHistory((prev) => [...prev, `Command not found: ${command}`])
    }

    setUserInput("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCommand(userInput)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-mono relative overflow-hidden terminal-flicker">
      <div className="scan-line"></div>

      <div className="p-6 max-w-4xl mx-auto">
        {bootSequence > 0 && (
          <div className="mb-6">
            {bootSequence >= 1 && <div className="boot-text mb-2 text-accent">NOSTROMO MAINFRAME v2.1.7</div>}
            {bootSequence >= 2 && <div className="boot-text mb-1 text-muted-foreground">Initializing system...</div>}
            {bootSequence >= 3 && (
              <div className="boot-text mb-1 text-muted-foreground">Loading ephemeris database...</div>
            )}
            {bootSequence >= 4 && (
              <div className="boot-text mb-1 text-muted-foreground">Connecting to historical archives...</div>
            )}
            {bootSequence >= 5 && <div className="boot-text mb-2 text-primary terminal-glow">System ready.</div>}
          </div>
        )}

        {/* Indicador de carga de efemérides */}
        {ephemeridesLoading && (
          <div className="mb-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Cargando efemérides desde la base de datos...</span>
            </div>
          </div>
        )}

        {/* Error de carga */}
        {ephemeridesError && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
            <div className="text-sm text-destructive">
              <strong>Error al cargar efemérides:</strong> {ephemeridesError}
            </div>
          </div>
        )}

        {/* Controles de generación */}
        {bootSequence >= 5 && (
          <div className="mb-6 p-4 bg-muted/20 border border-muted/30 rounded-md">
            <div className="flex flex-col space-y-3">
              <div className="text-sm font-medium text-foreground">
                🚀 Generación Automática de Efemérides
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={generateTomorrowEphemeris}
                  disabled={generating}
                  className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-xs hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? 'Generando...' : 'Generar para mañana'}
                </button>
                
                <button
                  onClick={clearMessages}
                  className="px-3 py-2 bg-muted text-muted-foreground rounded-md text-xs hover:bg-muted/80"
                >
                  Limpiar mensajes
                </button>
              </div>

              {/* Mensajes de estado */}
              {generationError && (
                <div className="text-sm text-destructive">
                  ❌ {generationError}
                </div>
              )}
              
              {generationSuccess && (
                <div className="text-sm text-green-600">
                  {generationSuccess}
                </div>
              )}
            </div>
          </div>
        )}

        {isExecuting && (
          <div className="mb-6">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">{programOutput}</pre>
          </div>
        )}

        {commandHistory.length > 0 && (
          <div className="mb-4">
            {commandHistory.map((line, index) => (
              <div key={index} className="text-sm text-muted-foreground">
                {line}
              </div>
            ))}
          </div>
        )}

        {bootSequence >= 5 && (
          <div className="flex items-center text-sm">
            <span className="text-accent terminal-glow">nostromo@ephemeris:~$ </span>
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="prompt-input flex-1 ml-2"
              autoFocus
              spellCheck={false}
            />
            <span className="terminal-cursor">█</span>
          </div>
        )}

        {bootSequence >= 5 && (
          <div className="mt-8 pt-4 border-t border-muted/30 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>EPHEMERIS MODULE ACTIVE</span>
              <span>{currentTime}</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 pt-4 border-t border-muted/30 text-xs text-muted-foreground">
          <div className="flex flex-col items-center space-y-2">
            <div className="text-center">
              Pulsa <kbd className="px-1 py-0.5 bg-muted rounded text-xs">{closeTabShortcut.description}</kbd> para salir
            </div>
            <div className="text-center">
              © 2025{" "}
              <a 
                href="https://esauortega.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 underline transition-colors"
              >
                Esau Ortega
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
