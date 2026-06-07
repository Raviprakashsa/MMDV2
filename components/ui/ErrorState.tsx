'use client'
import React from 'react'

export default function ErrorState({ message }: { message?: string }) {
  return <div style={{ color: 'red' }}>{message ?? 'An error occurred.'}</div>
}
