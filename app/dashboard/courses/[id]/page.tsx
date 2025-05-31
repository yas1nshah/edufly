
import CourceView from '@/components/course-new/course-view'
import { SiteHeader } from '@/components/site-header'
import React from 'react'

const CourceVieworEditPage = async ({params}: {params: Promise<{id: string}>}) => {
 const id = (await params).id
 


  return (
    <div>
        <SiteHeader title="Viewing Course" />
        <CourceView id={id} />
    </div>
  )
}

export default CourceVieworEditPage
