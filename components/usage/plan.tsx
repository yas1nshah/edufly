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
