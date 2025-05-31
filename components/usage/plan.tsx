"use client"

import { useQuery } from '@tanstack/react-query'
import React from 'react'

const ActivePlan = () => {
  const { data, isFetching } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const res = await fetch('/api/subscription')
      return res.json()
    }
  })

  if (isFetching) return <div>
    <div className="flex gap-4">
      <div className="bg-card/50 space-y-4 grow h-screen/2 p-4 rounded-md">
        <div className="h-20 w-full bg-card/50 animate-pulse"></div>
        <div className="h-80 w-full bg-card/50 animate-pulse"></div>
        <div className="h-20 w-full bg-card/50 animate-pulse"></div>
        <div className="h-60 w-full bg-card/50 animate-pulse"></div>

      </div>
      <div className="bg-card/50 w-1/4 h-screen p-4 rounded-md space-y-4">
        <div className="h-20 w-full bg-card/50 animate-pulse"></div>
        <div className="h-48 w-full bg-card/50 animate-pulse"></div>
      </div>
    </div>
  </div>
  
  return (
    <div className='bg-background rounded-lg px-3 py-2 flex justify-between items-center'>
      <div>
        <h4 className='text-xs font-medium text-muted-foreground'>Active Plan</h4>
        <h2 className='text-lsm font-semibold'>{data?.plan?.name}</h2>
      </div>
      <div className='text-xs bg-card p-2 -mr-1 rounded-md'>
        Storage: <span className='text-sm font-semibold'>{data?.plan?.storageLimitMB} MB</span>
        <br />
        AI Tokens: <span className='text-sm font-semibold'>{data?.plan?.aiTokensPerMonth} Tokens</span>
      </div>
    </div>
  )
}

export default ActivePlan
