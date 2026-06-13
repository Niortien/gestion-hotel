// lib/hooks/useAnimatedSearch.ts
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { animateSearchFocus, animateSearchBlur, animateResultsIn, animateResultsOut } from '@/lib/animations/searchAnimations'

export function useAnimatedSearch<T>(
  data: T[],
  filterFn: (item: T, query: string) => boolean,
  debounceMs = 300
) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<T[]>([])
  const [showResults, setShowResults] = useState(false)

  const lineRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLElement>(null)
  const labelRef = useRef<HTMLElement>(null)
  const cursorRef = useRef<HTMLElement>(null)
  const resultsContainerRef = useRef<HTMLDivElement>(null)

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    if (query) {
      setIsSearching(true)
      debounceTimer.current = setTimeout(() => {
        setDebouncedQuery(query)
        setIsSearching(false)
      }, debounceMs)
    } else {
      setDebouncedQuery('')
      setIsSearching(false)
    }
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current) }
  }, [query, debounceMs])

  const filterFnRef = useRef(filterFn)
  useEffect(() => { filterFnRef.current = filterFn })

  const dataRef = useRef(data)
  useEffect(() => { dataRef.current = data })

  // Filter
  useEffect(() => {
    if (debouncedQuery) {
      const filtered = dataRef.current.filter((item) => filterFnRef.current(item, debouncedQuery))
      setResults(filtered)
      setShowResults(true)
    } else {
      setResults([])
      setShowResults(false)
    }
  }, [debouncedQuery])

  // Animate results
  useEffect(() => {
    const container = resultsContainerRef.current
    if (!container) return
    if (showResults && results.length > 0) {
      animateResultsIn(container)
    } else if (!showResults) {
      animateResultsOut(container)
    }
  }, [showResults, results])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    animateSearchFocus(lineRef, bgRef, labelRef, cursorRef)
  }, [])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    animateSearchBlur(lineRef, bgRef, labelRef, cursorRef, query.length > 0)
    setTimeout(() => setShowResults(false), 200)
  }, [query])

  const handleChange = useCallback((val: string) => {
    setQuery(val)
  }, [])

  const clearSearch = useCallback(() => {
    setQuery('')
    setDebouncedQuery('')
    setResults([])
    setShowResults(false)
  }, [])

  return {
    query,
    results,
    isFocused,
    isSearching,
    showResults,
    lineRef,
    bgRef,
    labelRef,
    cursorRef,
    resultsContainerRef,
    handleFocus,
    handleBlur,
    handleChange,
    clearSearch,
  }
}
